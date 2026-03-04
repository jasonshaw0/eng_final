import type { FocusEffect } from '../narration/types'
import type { NarrationTimelineState } from '../narration/manifestTypes'

export interface VisualFocusProps {
  focusTargetId?: string | null
  focusEffect?: FocusEffect | null
}

export interface VisualRuntimeProps {
  timelineMs?: number
  activeSegmentId?: string | null
  keyframeState?: NarrationTimelineState['keyframeState']
  autoplayActive?: boolean
}
