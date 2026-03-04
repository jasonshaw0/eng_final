#!/usr/bin/env node
/**
 * Strict narration verifier.
 * Fails when script/audio/caption metadata drift is detected.
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import { createHash } from 'node:crypto'

const ROOT = process.cwd()
const MANIFEST_PATH = path.join(ROOT, 'public', 'narration', 'manifest.json')

const DEFAULTS = {
  provider: 'gemini',
  model: process.env.GEMINI_TTS_MODEL || 'gemini-2.5-pro-preview-tts',
  requestedVoice: process.env.GEMINI_TTS_VOICE || 'Alnilam',
  fallbackVoice: 'Charon',
  promptVersion: 'v2-conversational-professor',
  scriptStyleVersion: 'spoken-conversational-v1',
  hashPolicy: 'model|resolvedVoice|promptVersion|scriptText',
}

function hashText(text) {
  return createHash('sha256').update(text).digest('hex').slice(0, 10)
}

function hashAudio(buffer) {
  return createHash('sha256').update(buffer).digest('hex').slice(0, 10)
}

function normalizeForCompare(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function canonicalSegmentsText(track) {
  return normalizeForCompare((track.segments || []).map((segment) => segment.text).join(' '))
}

function canonicalWordsText(track) {
  return normalizeForCompare((track.words || []).map((word) => word.word).join(' '))
}

function parseAudioSuffix(audioSrc) {
  const match = (audioSrc || '').match(/-([a-f0-9]{10})\.wav$/i)
  return match ? match[1].toLowerCase() : null
}

function expectedAudioSuffix(scriptText, modelUsed, voiceUsed, promptVersion) {
  return hashText(`${modelUsed}|${voiceUsed}|${promptVersion}|${scriptText}`)
}

function assertMonotonicTiming(items, slideIndex, itemName, issues) {
  if (!Array.isArray(items) || items.length === 0) return
  for (let i = 0; i < items.length; i += 1) {
    const current = items[i]
    const start = Number(current.startMs)
    const end = Number(current.endMs)
    if (!Number.isFinite(start) || !Number.isFinite(end)) {
      issues.push(`slide ${slideIndex}: ${itemName}[${i}] missing finite start/end`)
      continue
    }
    if (end <= start) {
      issues.push(`slide ${slideIndex}: ${itemName}[${i}] non-positive duration (${start}-${end})`)
    }
    if (i > 0) {
      const prev = items[i - 1]
      const prevEnd = Number(prev.endMs)
      if (start < prevEnd) {
        issues.push(`slide ${slideIndex}: ${itemName}[${i}] overlaps previous (${start} < ${prevEnd})`)
      }
    }
  }
}

function assertRequired(value, label, issues) {
  if (value === undefined || value === null || value === '') {
    issues.push(`missing ${label}`)
  }
}

async function run() {
  const raw = await fs.readFile(MANIFEST_PATH, 'utf8')
  const manifest = JSON.parse(raw)
  const issues = []

  assertRequired(manifest.version, 'manifest.version', issues)
  assertRequired(manifest.generatedAt, 'manifest.generatedAt', issues)
  assertRequired(manifest.voice, 'manifest.voice', issues)

  const tts = manifest.tts || {}
  const provider = tts.provider || DEFAULTS.provider
  const model = tts.model || DEFAULTS.model
  const requestedVoice = tts.requestedVoice || DEFAULTS.requestedVoice
  const fallbackVoice = tts.fallbackVoice || DEFAULTS.fallbackVoice
  const resolvedVoice = tts.resolvedVoice || manifest.voice
  const promptVersion = tts.promptVersion || DEFAULTS.promptVersion
  const scriptStyleVersion = tts.scriptStyleVersion || DEFAULTS.scriptStyleVersion
  const hashPolicy = tts.hashPolicy || DEFAULTS.hashPolicy

  for (const [key, value] of Object.entries({
    'manifest.tts.provider': provider,
    'manifest.tts.model': model,
    'manifest.tts.requestedVoice': requestedVoice,
    'manifest.tts.fallbackVoice': fallbackVoice,
    'manifest.tts.resolvedVoice': resolvedVoice,
    'manifest.tts.promptVersion': promptVersion,
    'manifest.tts.scriptStyleVersion': scriptStyleVersion,
    'manifest.tts.hashPolicy': hashPolicy,
  })) {
    assertRequired(value, key, issues)
  }

  if (hashPolicy !== DEFAULTS.hashPolicy) {
    issues.push(`unexpected hash policy: "${hashPolicy}" (expected "${DEFAULTS.hashPolicy}")`)
  }

  if (!Array.isArray(manifest.slides) || manifest.slides.length === 0) {
    issues.push('manifest.slides is missing or empty')
  } else {
    for (const track of manifest.slides) {
      const slideIndex = track.slideIndex
      const scriptText = track.scriptText || ''
      const scriptCanonical = normalizeForCompare(scriptText)

      for (const field of ['audioSrc', 'scriptText', 'scriptHash', 'audioHash', 'modelUsed', 'voiceUsed', 'promptVersion']) {
        assertRequired(track[field], `slide ${slideIndex}.${field}`, issues)
      }

      if (!scriptCanonical) {
        issues.push(`slide ${slideIndex}: empty scriptText`)
      }

      if (track.scriptHash && track.scriptHash !== hashText(scriptText)) {
        issues.push(`slide ${slideIndex}: scriptHash mismatch`)
      }

      const segmentCanonical = canonicalSegmentsText(track)
      const wordsCanonical = canonicalWordsText(track)
      if (segmentCanonical !== scriptCanonical) {
        issues.push(`slide ${slideIndex}: segments text does not match scriptText`)
      }
      if (wordsCanonical !== scriptCanonical) {
        issues.push(`slide ${slideIndex}: words text does not match scriptText`)
      }

      assertMonotonicTiming(track.segments, slideIndex, 'segments', issues)
      assertMonotonicTiming(track.words, slideIndex, 'words', issues)

      const slideModel = track.modelUsed || model
      const slideVoice = track.voiceUsed || resolvedVoice
      const slidePromptVersion = track.promptVersion || promptVersion
      const expectedSuffix = expectedAudioSuffix(scriptText, slideModel, slideVoice, slidePromptVersion)
      const audioSuffix = parseAudioSuffix(track.audioSrc)
      if (!audioSuffix) {
        issues.push(`slide ${slideIndex}: audioSrc missing hash suffix (${track.audioSrc})`)
      } else if (audioSuffix !== expectedSuffix) {
        issues.push(`slide ${slideIndex}: audioSrc hash mismatch (expected ${expectedSuffix}, got ${audioSuffix})`)
      }

      const audioPath = path.join(ROOT, 'public', track.audioSrc || '')
      let audioBytes
      try {
        audioBytes = await fs.readFile(audioPath)
      } catch {
        issues.push(`slide ${slideIndex}: audio file missing at ${track.audioSrc}`)
        continue
      }

      const computedAudioHash = hashAudio(audioBytes)
      if (track.audioHash && track.audioHash !== computedAudioHash) {
        issues.push(`slide ${slideIndex}: audioHash mismatch`)
      }
    }
  }

  if (issues.length > 0) {
    console.error('Narration verification failed:')
    for (const issue of issues) {
      console.error(`- ${issue}`)
    }
    process.exit(1)
  }

  console.log('Narration verification passed.')
}

run().catch((error) => {
  console.error('Narration verification failed with exception:')
  console.error(error instanceof Error ? error.stack : String(error))
  process.exit(1)
})

