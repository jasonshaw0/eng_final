/**
 * Narration scripts for TTS — written as natural spoken narration
 * for a technical writing class presentation.
 * Each slide has segments (sentences) for read-along tracking.
 */

export interface NarrationSegment {
  text: string
}

export interface SlideNarration {
  slideIndex: number
  segments: NarrationSegment[]
  /** Full text for TTS generation (all segments joined) */
  fullText: string
}

function makeNarration(slideIndex: number, segments: string[]): SlideNarration {
  return {
    slideIndex,
    segments: segments.map((text) => ({ text })),
    fullText: segments.join(' '),
  }
}

export const narrations: SlideNarration[] = [
  // Slide 0 — Cover
  makeNarration(0, [
    "This presentation tackles a question that sounds simple but hides real engineering complexity.",
    "Why is renewable energy harder than just adding solar?",
  ]),

  // Slide 1 — Real-Time Balance
  makeNarration(1, [
    "The electrical grid must balance supply and demand every single second.",
    "There's no buffer. If a plant trips offline or a cloud covers a solar farm, something else must instantly compensate.",
    "This chart shows supply and demand over twenty-four hours. Watch the gaps closely.",
    "Traditional plants ramp on command. Solar and wind produce only when nature allows.",
    "That mismatch is the core tension of renewable integration.",
  ]),

  // Slide 2 — Nameplate vs Reality
  makeNarration(2, [
    "When a solar farm is rated at a hundred megawatts, that's its peak under perfect conditions.",
    "In practice, weather, clouds, and sun angle push actual output to about twenty to thirty percent of that rating.",
    "This visualization shows the gap in real time — output fluctuating throughout the day.",
    "So a hundred-megawatt farm actually behaves more like a twenty to thirty megawatt plant on average.",
  ]),

  // Slide 3 — Duck Curve
  makeNarration(3, [
    "The duck curve shows what happens to net load as solar grows on a grid.",
    "At midday, solar floods the system and drives net load way down — that's the belly.",
    "Then at sunset, solar drops off just as demand peaks. People come home, turn on lights, cook dinner.",
    "That creates a massive ramp — the neck — that operators must fill fast.",
    "Notice how the duck shape gets more extreme as solar penetration increases.",
  ]),

  // Slide 4 — Grid Stability
  makeNarration(4, [
    "The North American grid runs at exactly sixty hertz, held within tight tolerances.",
    "Traditional generators store kinetic energy in spinning rotors, providing inertia that resists sudden frequency drops.",
    "Solar and wind connected through inverters provide zero natural inertia.",
    "Watch the gauge — a demand spike causes frequency to dip, then controllers bring it back.",
    "As we replace conventional generators, we lose that inertia safety net and must build synthetic alternatives.",
  ]),

  // Slide 5 — Storage Scale
  makeNarration(5, [
    "Four hours of storage handles an evening peak. That's the easy, cheapest part.",
    "Twelve hours for overnight costs roughly triple. Twenty-four hours — about six times as much.",
    "Seventy-two hours for a multi-day weather event? Roughly eighteen times the cost of a four-hour battery.",
    "Duration is the hidden variable that separates demos from real grid-scale solutions.",
  ]),

  // Slide 6 — Transmission
  makeNarration(6, [
    "The best renewable resources are far from cities. Wind in the Plains, solar in the Southwest.",
    "Moving that power requires high-voltage lines that take a decade to permit and build.",
    "This network shows what happens as demand rises. Lines congest, creating bottlenecks.",
    "When transmission is full, operators must curtail — waste — perfectly good renewable energy.",
  ]),

  // Slide 7 — Seek Help & Solutions
  makeNarration(7, [
    "So what can individuals and businesses actually do?",
    "If bills are rising, outages are frequent, or you're considering solar or an EV — seek professional guidance.",
    "The process follows a clear pipeline: audit, load profiling, rate review, efficiency first, then solar and storage sizing, permits, and ongoing monitoring.",
    "Each step builds on the last. Skipping ahead often leads to oversized, underperforming systems.",
  ]),

  // Slide 8 — References
  makeNarration(8, [
    "This slide lists all references cited throughout the presentation.",
    "All visualizations were original, created programmatically. No stock images or chart libraries were used.",
    "Thank you for watching.",
  ]),
]
