import type { FocusEffect } from './types'

export interface NarrationWord {
  word: string
  startMs: number
  endMs: number
  confidence: number
}

export interface NarrationSegment {
  id: string
  text: string
  startMs: number
  endMs: number
  focusTargetId?: string
  effect?: FocusEffect
}

export interface SlideTimelineKeyframe {
  slideIndex: number
  keyframeId: string
  startMs: number
  endMs: number
  target: string
  property: string
  from: number | string | boolean
  to: number | string | boolean
  easing?: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut'
}

export interface NarrationSlideTrack {
  slideIndex: number
  audioSrc: string
  durationMs: number
  scriptText: string
  scriptHash?: string
  audioHash?: string
  modelUsed?: string
  voiceUsed?: string
  promptVersion?: string
  segments: NarrationSegment[]
  words: NarrationWord[]
  alignmentMode?: 'forced' | 'fallback' | string
  // Legacy compatibility for older manifests.
  cues?: Array<{
    id: string
    startMs: number
    endMs: number
    subtitle: string
    focusTargetId?: string
    effect?: FocusEffect
  }>
}

export interface NarrationManifest {
  version: number
  generatedAt: string
  voice: string
  tts?: {
    provider: string
    model: string
    requestedVoice: string
    fallbackVoice: string
    resolvedVoice: string
    promptVersion: string
    scriptStyleVersion: string
    hashPolicy: string
  }
  slides: NarrationSlideTrack[]
}

export interface NarrationTimelineState {
  timelineMs: number
  activeSegmentId: string | null
  keyframeState: Record<string, number | string | boolean>
}

export interface KeyframeConfig {
  version: number
  slides: Record<string, SlideTimelineKeyframe[]>
}
