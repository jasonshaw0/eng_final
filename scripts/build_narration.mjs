#!/usr/bin/env node
/**
 * Offline narration builder for GitHub Pages.
 * - Reads public/narration/manifest.json
 * - Generates missing slide WAV files with Gemini TTS
 * - Aligns words/segments to real audio time with scripts/align_narration.py
 * - Falls back to deterministic heuristic timings if alignment tooling is unavailable
 * - Updates manifest in place
 *
 * Usage:
 *   GEMINI_API_KEY=... node scripts/build_narration.mjs
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import { createHash } from 'node:crypto'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

const ROOT = process.cwd()
const MANIFEST_PATH = path.join(ROOT, 'public', 'narration', 'manifest.json')
const OUT_DIR = path.join(ROOT, 'public', 'narration')
const ALIGN_SCRIPT = path.join(ROOT, 'scripts', 'align_narration.py')

const API_KEY = process.env.GEMINI_API_KEY || ''
const MODEL = process.env.GEMINI_TTS_MODEL || 'gemini-2.5-pro-preview-tts'
const REQUESTED_VOICE = process.env.GEMINI_TTS_VOICE || 'Alnilam'
const FALLBACK_VOICE = 'Charon'
const PROVIDER = 'gemini'
const PROMPT_VERSION = 'v2-conversational-professor'
const SCRIPT_STYLE_VERSION = 'spoken-conversational-v1'
const HASH_POLICY = 'model|resolvedVoice|promptVersion|scriptText'
const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'

function hashText(text) {
  return createHash('sha256').update(text).digest('hex').slice(0, 10)
}

function hashAudio(buffer) {
  return createHash('sha256').update(buffer).digest('hex').slice(0, 10)
}

function buildAudioKey(text, voiceName) {
  return hashText(`${MODEL}|${voiceName}|${PROMPT_VERSION}|${text}`)
}

function canonicalWordsText(words) {
  return normalizeForCompare((words || []).map((word) => word.word).join(' '))
}

function isVoiceSelectionError(error) {
  const message = error instanceof Error ? error.message : String(error)
  return /voice|prebuiltvoiceconfig|voicename|unsupported|invalid/i.test(message)
}

function splitSentences(text) {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

function cueWeight(text) {
  const words = text.trim().split(/\s+/).filter(Boolean).length
  const punctuationBoost = (text.match(/[,:;]/g) || []).length * 0.3 + (text.match(/[.!?]/g) || []).length * 0.6
  return Math.max(1, words + punctuationBoost)
}

function fallbackSegments(scriptText, durationMs, seedSegments = []) {
  const sentences = splitSentences(scriptText)
  if (sentences.length === 0) return []
  const padStart = 250
  const padEnd = 150
  const timeline = Math.max(800, durationMs - padStart - padEnd)
  const weights = sentences.map((s) => cueWeight(s))
  const totalWeight = weights.reduce((sum, value) => sum + value, 0)
  let cursor = padStart

  return sentences.map((sentence, idx) => {
    const share = idx === sentences.length - 1
      ? durationMs - padEnd - cursor
      : Math.round((weights[idx] / totalWeight) * timeline)
    const startMs = cursor
    const endMs = idx === sentences.length - 1 ? durationMs - padEnd : Math.min(durationMs - padEnd, cursor + share)
    cursor = endMs
    const seed = seedSegments[idx] || seedSegments[seedSegments.length - 1] || {}
    return {
      id: `s-${idx + 1}`,
      text: sentence,
      startMs,
      endMs: Math.max(startMs + 320, endMs),
      focusTargetId: seed.focusTargetId,
      effect: seed.effect,
    }
  })
}

function fallbackWords(scriptText, durationMs) {
  const words = scriptText.split(/\s+/).filter(Boolean)
  if (words.length === 0) return []
  const span = Math.max(600, durationMs - 400)
  const step = span / words.length
  return words.map((word, idx) => {
    const startMs = Math.round(200 + idx * step)
    const endMs = Math.round(Math.min(durationMs - 100, startMs + step * 0.9))
    return {
      word,
      startMs,
      endMs: Math.max(startMs + 80, endMs),
      confidence: 0.35,
    }
  })
}

function normalizeForCompare(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizeWords(words, durationMs) {
  if (!Array.isArray(words) || words.length === 0) return []
  const maxEnd = Math.max(1, durationMs - 20)
  const sorted = [...words].sort((a, b) => a.startMs - b.startMs)
  let cursor = 0

  return sorted.map((word) => {
    const startRaw = Number.isFinite(word.startMs) ? Math.round(word.startMs) : cursor
    const endRaw = Number.isFinite(word.endMs) ? Math.round(word.endMs) : startRaw + 120
    const startMs = Math.min(maxEnd - 40, Math.max(cursor, startRaw))
    const endMs = Math.min(maxEnd, Math.max(startMs + 40, endRaw))
    cursor = endMs
    return {
      word: String(word.word || '').trim(),
      startMs,
      endMs,
      confidence: Number.isFinite(word.confidence) ? Math.max(0, Math.min(1, Number(word.confidence))) : 0.3,
    }
  }).filter((word) => word.word.length > 0)
}

function normalizeSegments(segments, durationMs, scriptText) {
  if (!Array.isArray(segments) || segments.length === 0) {
    return fallbackSegments(scriptText, durationMs)
  }
  const maxEnd = Math.max(400, durationMs - 20)
  const sorted = [...segments].sort((a, b) => a.startMs - b.startMs)
  let cursor = 0

  return sorted.map((segment, idx) => {
    const startRaw = Number.isFinite(segment.startMs) ? Math.round(segment.startMs) : cursor
    const endRaw = Number.isFinite(segment.endMs) ? Math.round(segment.endMs) : startRaw + 300
    const startMs = Math.min(maxEnd - 120, Math.max(cursor, startRaw))
    const endMs = Math.min(maxEnd, Math.max(startMs + 120, endRaw))
    cursor = endMs
    return {
      ...segment,
      id: segment.id || `s-${idx + 1}`,
      text: String(segment.text || '').trim(),
      startMs,
      endMs,
    }
  }).filter((segment) => segment.text.length > 0)
}

function validateTrack(track) {
  const issues = []
  if (!track.audioSrc) {
    issues.push('missing audioSrc')
  }
  if (!Array.isArray(track.segments) || track.segments.length === 0) {
    issues.push('missing segments')
  }
  if (!Array.isArray(track.words) || track.words.length === 0) {
    issues.push('missing words')
  }

  for (let i = 0; i < track.segments.length; i++) {
    const current = track.segments[i]
    if (current.endMs <= current.startMs) {
      issues.push(`segment ${i + 1} has non-positive duration`)
    }
    if (i > 0 && current.startMs < track.segments[i - 1].endMs) {
      issues.push(`segment ${i + 1} overlaps previous segment`)
    }
  }

  const joinedSegments = normalizeForCompare(track.segments.map((segment) => segment.text).join(' '))
  const scriptCanonical = normalizeForCompare(track.scriptText)
  if (joinedSegments && scriptCanonical && joinedSegments !== scriptCanonical) {
    issues.push('segment text differs from scriptText')
  }
  const joinedWords = canonicalWordsText(track.words)
  if (joinedWords && scriptCanonical && joinedWords !== scriptCanonical) {
    issues.push('word text differs from scriptText')
  }

  return issues
}

function wrapPCMInWav(pcmBuffer, sampleRate = 24000, numChannels = 1, bitsPerSample = 16) {
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8)
  const blockAlign = numChannels * (bitsPerSample / 8)
  const dataSize = pcmBuffer.length
  const headerSize = 44
  const out = Buffer.alloc(headerSize + dataSize)

  out.write('RIFF', 0)
  out.writeUInt32LE(36 + dataSize, 4)
  out.write('WAVE', 8)
  out.write('fmt ', 12)
  out.writeUInt32LE(16, 16)
  out.writeUInt16LE(1, 20)
  out.writeUInt16LE(numChannels, 22)
  out.writeUInt32LE(sampleRate, 24)
  out.writeUInt32LE(byteRate, 28)
  out.writeUInt16LE(blockAlign, 32)
  out.writeUInt16LE(bitsPerSample, 34)
  out.write('data', 36)
  out.writeUInt32LE(dataSize, 40)
  pcmBuffer.copy(out, headerSize)

  return out
}

function getWavDurationMs(wav) {
  if (wav.length < 44) return 0
  const sampleRate = wav.readUInt32LE(24)
  const channels = wav.readUInt16LE(22)
  const bitsPerSample = wav.readUInt16LE(34)
  const dataSize = wav.readUInt32LE(40)
  const bytesPerSample = Math.max(1, (bitsPerSample / 8) * channels)
  const samples = dataSize / bytesPerSample
  return Math.max(0, Math.round((samples / sampleRate) * 1000))
}

async function generateGeminiWave(text, voiceName) {
  if (!API_KEY) {
    throw new Error('GEMINI_API_KEY is required.')
  }

  const url = `${API_BASE}/${MODEL}:generateContent?key=${API_KEY}`
  const body = {
    contents: [
      {
        parts: [
          {
            text: `Voice Affect: Warm, clear professor-style narration.
Tone: Conversational, confident, plain-spoken.
Pacing: Moderate and steady, with short pauses between key ideas.
Emotion: Calm and helpful, never dramatic.
Emphasis: Stress transitions and practical takeaways.
Delivery: Sound like you are walking through a diagram in real time.

Narration text:
${text}`,
          },
        ],
      },
    ],
    generationConfig: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName,
          },
        },
      },
    },
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Gemini TTS failed (${response.status}): ${errorText}`)
  }

  const data = await response.json()
  const inlineData = data?.candidates?.[0]?.content?.parts?.[0]?.inlineData
  if (!inlineData?.data) {
    throw new Error('Gemini response did not include inline audio data.')
  }

  const mimeType = inlineData.mimeType || 'audio/wav'
  const rawBytes = Buffer.from(inlineData.data, 'base64')
  if (mimeType.includes('pcm') || mimeType.includes('L16') || mimeType === 'audio/raw') {
    return wrapPCMInWav(rawBytes)
  }
  return rawBytes
}

async function runAlignment(audioPath, scriptText) {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'eng-final-align-'))
  const scriptPath = path.join(tmpDir, 'script.txt')
  const outputPath = path.join(tmpDir, 'alignment.json')
  await fs.writeFile(scriptPath, scriptText, 'utf8')

  try {
    await execFileAsync('python', [
      ALIGN_SCRIPT,
      '--audio',
      audioPath,
      '--script-file',
      scriptPath,
      '--output',
      outputPath,
    ], { cwd: ROOT })
    const raw = await fs.readFile(outputPath, 'utf8')
    return JSON.parse(raw)
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true })
  }
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true })
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

async function run() {
  await ensureDir(OUT_DIR)
  const manifestRaw = await fs.readFile(MANIFEST_PATH, 'utf8')
  const manifest = JSON.parse(manifestRaw)
  let resolvedVoice = REQUESTED_VOICE
  const report = {
    forced: 0,
    fallback: 0,
    issues: [],
    voiceFallbackUsed: false,
  }

  const nonEmptySlides = manifest.slides.filter((slide) => (slide.scriptText || '').trim().length > 0)
  const missingRequestedAudio = []
  for (const slide of nonEmptySlides) {
    const key = buildAudioKey(slide.scriptText, REQUESTED_VOICE)
    const fileName = `slide-${String(slide.slideIndex).padStart(2, '0')}-${key}.wav`
    const outFile = path.join(OUT_DIR, fileName)
    if (!(await fileExists(outFile))) {
      missingRequestedAudio.push(slide.slideIndex)
    }
  }

  if (missingRequestedAudio.length > 0 && API_KEY) {
    try {
      await generateGeminiWave('Voice capability check.', REQUESTED_VOICE)
    } catch (voiceErr) {
      if (isVoiceSelectionError(voiceErr)) {
        resolvedVoice = FALLBACK_VOICE
        report.voiceFallbackUsed = true
        console.warn(`Requested voice "${REQUESTED_VOICE}" unavailable. Falling back to "${FALLBACK_VOICE}".`)
      } else {
        throw voiceErr
      }
    }
  }

  for (const slide of manifest.slides) {
    const text = slide.scriptText || ''
    if (!text.trim()) {
      slide.durationMs = Math.max(slide.durationMs || 0, 1)
      slide.segments = []
      slide.words = []
      continue
    }

    let voiceForSlide = resolvedVoice
    let key = buildAudioKey(text, voiceForSlide)
    let fileName = `slide-${String(slide.slideIndex).padStart(2, '0')}-${key}.wav`
    let outFile = path.join(OUT_DIR, fileName)
    const scriptHash = hashText(text)

    let audioBuffer
    try {
      audioBuffer = await fs.readFile(outFile)
      console.log(`Using cached audio for slide ${slide.slideIndex}: ${fileName}`)
    } catch {
      console.log(`Generating audio for slide ${slide.slideIndex}...`)
      try {
        audioBuffer = await generateGeminiWave(text, voiceForSlide)
        await fs.writeFile(outFile, audioBuffer)
        console.log(`Saved: ${fileName}`)
      } catch (ttsErr) {
        if (voiceForSlide !== FALLBACK_VOICE && isVoiceSelectionError(ttsErr)) {
          resolvedVoice = FALLBACK_VOICE
          report.voiceFallbackUsed = true
          voiceForSlide = resolvedVoice
          key = buildAudioKey(text, voiceForSlide)
          fileName = `slide-${String(slide.slideIndex).padStart(2, '0')}-${key}.wav`
          outFile = path.join(OUT_DIR, fileName)
          console.warn(`Voice error on slide ${slide.slideIndex}. Retrying with "${voiceForSlide}".`)
          if (await fileExists(outFile)) {
            audioBuffer = await fs.readFile(outFile)
            console.log(`Using cached fallback audio for slide ${slide.slideIndex}: ${fileName}`)
          } else {
            audioBuffer = await generateGeminiWave(text, voiceForSlide)
            await fs.writeFile(outFile, audioBuffer)
            console.log(`Saved fallback audio: ${fileName}`)
          }
        } else {
          throw ttsErr
        }
      }
    }

    const durationMs = getWavDurationMs(audioBuffer)
    slide.audioSrc = `narration/${fileName}`
    slide.durationMs = durationMs > 0 ? durationMs : slide.durationMs
    slide.scriptHash = scriptHash
    slide.audioHash = hashAudio(audioBuffer)
    slide.modelUsed = MODEL
    slide.voiceUsed = voiceForSlide
    slide.promptVersion = PROMPT_VERSION

    const seedSegments = (slide.segments || slide.cues || []).map((s) => ({
      focusTargetId: s.focusTargetId,
      effect: s.effect,
    }))

    try {
      const aligned = await runAlignment(outFile, text)
      const alignedSegments = Array.isArray(aligned.segments) ? aligned.segments : []
      const alignedWords = Array.isArray(aligned.words) ? aligned.words : []

      const mappedSegments = alignedSegments.map((segment, idx) => {
        const seed = seedSegments[idx] || seedSegments[seedSegments.length - 1] || {}
        return {
          id: segment.id || `s-${idx + 1}`,
          text: segment.text,
          startMs: segment.startMs,
          endMs: segment.endMs,
          focusTargetId: seed.focusTargetId,
          effect: seed.effect,
        }
      })
      slide.segments = normalizeSegments(mappedSegments, slide.durationMs, text)
      slide.words = normalizeWords(alignedWords, slide.durationMs)
      slide.alignmentMode = aligned.mode || 'forced'
      if (slide.alignmentMode === 'forced') {
        report.forced += 1
      } else {
        report.fallback += 1
      }
    } catch (alignErr) {
      console.warn(`Alignment failed for slide ${slide.slideIndex}, using fallback timings.`, alignErr instanceof Error ? alignErr.message : String(alignErr))
      slide.segments = normalizeSegments(fallbackSegments(text, slide.durationMs, seedSegments), slide.durationMs, text)
      slide.words = normalizeWords(fallbackWords(text, slide.durationMs), slide.durationMs)
      slide.alignmentMode = 'fallback'
      report.fallback += 1
    }

    // Preserve backward compatibility but ensure active path uses segments/words.
    delete slide.cues

    const issues = validateTrack(slide)
    if (issues.length > 0) {
      report.issues.push({ slideIndex: slide.slideIndex, issues })
    }
  }

  manifest.version = (manifest.version || 0) + 1
  manifest.generatedAt = new Date().toISOString()
  manifest.voice = resolvedVoice
  manifest.tts = {
    provider: PROVIDER,
    model: MODEL,
    requestedVoice: REQUESTED_VOICE,
    fallbackVoice: FALLBACK_VOICE,
    resolvedVoice,
    promptVersion: PROMPT_VERSION,
    scriptStyleVersion: SCRIPT_STYLE_VERSION,
    hashPolicy: HASH_POLICY,
  }

  await fs.writeFile(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`)
  console.log('Updated manifest:', MANIFEST_PATH)
  console.log('Narration validation report:')
  console.log(`- Slides: ${manifest.slides.length}`)
  console.log(`- Forced alignment: ${report.forced}`)
  console.log(`- Fallback alignment: ${report.fallback}`)
  console.log(`- Voice: ${resolvedVoice}${report.voiceFallbackUsed ? ` (fallback from ${REQUESTED_VOICE})` : ''}`)
  if (report.issues.length === 0) {
    console.log('- Validation: OK')
  } else {
    console.log(`- Validation issues: ${report.issues.length} slide(s)`)
    for (const item of report.issues) {
      console.log(`  - Slide ${item.slideIndex}: ${item.issues.join('; ')}`)
    }
  }
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
