/**
 * Gemini TTS API caller.
 * Uses gemini-2.5-flash-preview-tts with AUDIO response modality.
 */

import { getCachedAudio, setCachedAudio } from './audioCache'

const MODEL = 'gemini-2.5-pro-preview-tts'
const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'

export interface TTSResult {
  blob: Blob
  fromCache: boolean
}

/**
 * Wraps raw PCM16 data in a WAV header so browsers can play it.
 * Gemini TTS often returns raw PCM at 24kHz, mono, 16-bit.
 */
function wrapPCMInWAV(pcmData: Uint8Array, sampleRate = 24000, numChannels = 1, bitsPerSample = 16): Uint8Array {
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8)
  const blockAlign = numChannels * (bitsPerSample / 8)
  const dataSize = pcmData.length
  const headerSize = 44
  const buffer = new ArrayBuffer(headerSize + dataSize)
  const view = new DataView(buffer)

  // RIFF header
  writeString(view, 0, 'RIFF')
  view.setUint32(4, 36 + dataSize, true)
  writeString(view, 8, 'WAVE')

  // fmt chunk
  writeString(view, 12, 'fmt ')
  view.setUint32(16, 16, true) // chunk size
  view.setUint16(20, 1, true) // PCM format
  view.setUint16(22, numChannels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, byteRate, true)
  view.setUint16(32, blockAlign, true)
  view.setUint16(34, bitsPerSample, true)

  // data chunk
  writeString(view, 36, 'data')
  view.setUint32(40, dataSize, true)

  // PCM data
  const wavArray = new Uint8Array(buffer)
  wavArray.set(pcmData, headerSize)

  return wavArray
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i))
  }
}

export async function generateTTS(
  text: string,
  apiKey: string,
  voiceName: string = 'Rasalgethi',
): Promise<TTSResult> {
  // Check cache first
  const cached = await getCachedAudio(text)
  if (cached) {
    return { blob: cached, fromCache: true }
  }

  // Call Gemini API
  const url = `${API_BASE}/${MODEL}:generateContent?key=${apiKey}`

  const body = {
    contents: [
      {
        parts: [
          {
            text: `Read this narration for a university presentation in a clear, professional, and engaging tone. Speak at a moderate pace suitable for a classroom audience:\n\n${text}`,
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
    const err = await response.text()
    throw new Error(`Gemini TTS error (${response.status}): ${err}`)
  }

  const data = await response.json()

  // Extract audio from response
  const candidate = data.candidates?.[0]
  const part = candidate?.content?.parts?.[0]

  if (!part?.inlineData?.data) {
    throw new Error('No audio data in Gemini response')
  }

  const mimeType: string = part.inlineData.mimeType || 'audio/wav'
  const base64: string = part.inlineData.data

  // Convert base64 to Uint8Array
  const byteChars = atob(base64)
  const byteArray = new Uint8Array(byteChars.length)
  for (let i = 0; i < byteChars.length; i++) {
    byteArray[i] = byteChars.charCodeAt(i)
  }

  // If it's raw PCM (no container), wrap in WAV headers
  let audioBlob: Blob
  if (mimeType.includes('pcm') || mimeType.includes('L16') || mimeType === 'audio/raw') {
    const wavData = wrapPCMInWAV(byteArray)
    audioBlob = new Blob([wavData.buffer as ArrayBuffer], { type: 'audio/wav' })
  } else {
    audioBlob = new Blob([byteArray.buffer as ArrayBuffer], { type: mimeType })
  }

  // Cache it
  await setCachedAudio(text, audioBlob)

  return { blob: audioBlob, fromCache: false }
}

/** Get the API key from localStorage */
export function getApiKey(): string {
  return localStorage.getItem('gemini_api_key') || ''
}

/** Save the API key to localStorage */
export function setApiKey(key: string): void {
  localStorage.setItem('gemini_api_key', key)
}
