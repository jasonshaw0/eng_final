export interface SlideData {
  id: number
  path: string
  title: string
  shortTitle: string
  hero: string
  bullets: string[]
  deeper: { text: string; katex?: string }[]
  notes: string
}

export interface ReferenceData {
  id: number
  citation: string
  url: string
}

export interface VisualCreditData {
  id: number
  asset: string
  source: string
  method: string
  author: string
}

export const references: ReferenceData[] = [
  {
    id: 1,
    citation:
      'U.S. Energy Information Administration. (2026, February 20). New electric generating capacity expected in 2026 includes mostly solar and batteries.',
    url: 'https://www.eia.gov/todayinenergy/detail.php?id=65744',
  },
  {
    id: 2,
    citation:
      'U.S. Energy Information Administration. (2025, January 9). Utility-scale battery storage capacity continued to grow in 2024.',
    url: 'https://www.eia.gov/todayinenergy/detail.php?id=64204',
  },
  {
    id: 3,
    citation:
      'California ISO. (2024). Managing oversupply and renewable curtailment.',
    url: 'https://www.caiso.com/informed/Pages/ManagingOversupply.aspx',
  },
  {
    id: 4,
    citation:
      'Berkeley Lab. (2025). Interconnection queue data and trends.',
    url: 'https://emp.lbl.gov/queues',
  },
  {
    id: 5,
    citation:
      'U.S. Energy Information Administration. (2024). Electricity explained: delivery from generation to consumers.',
    url: 'https://www.eia.gov/energyexplained/electricity/delivery-to-consumers.php',
  },
]

export const visualCredits: VisualCreditData[] = [
  {
    id: 1,
    asset:
      'Core technical diagrams (supply-demand, capacity reality, duck curve, frequency, storage, transmission, and solutions pipeline).',
    source: 'eng_final/src/visuals/*.tsx',
    method:
      'Hand-authored React + SVG animation components with project-specific logic and styling.',
    author: 'Jason Shaw',
  },
  {
    id: 2,
    asset: 'Concept scene studies for generation, grid, and thermal context.',
    source:
      'universal_assets/solar_wind.html, universal_assets/power_lines.html, universal_assets/power_plant.html',
    method: 'Hand-authored HTML/CSS compositions and motion studies.',
    author: 'Jason Shaw',
  },
  {
    id: 3,
    asset: 'Narration and presenter-note artifacts.',
    source: 'eng_final/src/narration/*, eng_final/src/components/PrintView.tsx',
    method: 'Project-authored scripts, timing metadata, and print-note layout.',
    author: 'Jason Shaw',
  },
]

export const slides: SlideData[] = [
  {
    id: 0,
    path: '/',
    title: 'Why Renewable Energy Is Harder Than "Just Add Solar"',
    shortTitle: 'Cover',
    hero: 'A clear, visual explanation of where the real constraints are.',
    bullets: [
      'Start AI autoplay from this slide with one click.',
      'Use arrow keys (← →), spacebar, or bottom controls any time.',
      'Open “Go Deeper” on each slide for optional technical context.',
    ],
    deeper: [],
    notes:
      'Open by framing the misconception: people often think this is only a panel-count problem. Explain the presentation goal: translate grid complexity into practical language without losing accuracy.',
  },
  {
    id: 1,
    path: '/slide/1',
    title: 'The Grid Is a Live Balancing System',
    shortTitle: 'Balance',
    hero: 'Electricity must be produced at the same moment it is used.',
    bullets: [
      'Supply and demand must stay matched every second.',
      'When they drift apart, frequency moves and reliability drops.',
      'Flexible resources are critical, not just more total megawatts.',
    ],
    deeper: [
      {
        text: 'A compact view of frequency response links power imbalance to system stability:',
        katex: '\\Delta f \\propto \\frac{\\Delta P}{2H}',
      },
      {
        text: 'Operators use layered controls (fast automatic response + slower economic dispatch) to restore balance.',
      },
    ],
    notes:
      'Emphasize intuition over jargon: the grid behaves like a live system, not a warehouse. Point to the reserve response in the visual when demand rises.',
  },
  {
    id: 2,
    path: '/slide/2',
    title: 'Nameplate Capacity Is Not Daily Reality',
    shortTitle: 'Capacity',
    hero: 'Peak rating tells you maximum output, not expected output.',
    bullets: [
      'Solar and wind output varies with weather and time of day.',
      'Planning should use expected generation profiles, not best case.',
      'Capacity factor helps compare real-world performance across technologies.',
    ],
    deeper: [
      {
        text: 'Capacity factor compares actual energy to the ideal full-time maximum:',
        katex: 'CF = \\frac{E_{actual}}{P_{rated} \\cdot T}',
      },
      {
        text: 'This is why replacing firm generation often needs more than a one-to-one nameplate swap.',
      },
    ],
    notes:
      'Keep this practical: the core point is not “solar is bad,” it is “planning must use realistic output, not label values.”',
  },
  {
    id: 3,
    path: '/slide/3',
    title: 'The Duck Curve Creates an Evening Ramp',
    shortTitle: 'Duck Curve',
    hero: 'Solar lowers midday net demand, then drops quickly near sunset.',
    bullets: [
      'Midday can have surplus conditions in high-solar regions.',
      'Evening brings the steepest balancing challenge.',
      'Ramping capability, storage, and demand flexibility all matter.',
    ],
    deeper: [
      {
        text: 'As solar penetration rises, midday net load “belly” deepens and the evening “neck” steepens.',
      },
      {
        text: 'This pattern is a scheduling and flexibility challenge as much as a generation challenge.',
      },
    ],
    notes:
      'Use the visual timeline from noon to evening. Explicitly connect this slide to the next one: fast ramps also stress system stability.',
  },
  {
    id: 4,
    path: '/slide/4',
    title: 'Stability Depends on Fast, Reliable Frequency Support',
    shortTitle: 'Stability',
    hero: 'The system must hold close to 60 Hz during disturbances.',
    bullets: [
      'Rotating machines naturally resist sudden speed changes.',
      'Inverter-based resources can respond quickly with the right controls.',
      'As resource mix changes, control strategy becomes more important.',
    ],
    deeper: [
      {
        text: 'Stored rotational energy is commonly represented by inertia constant H:',
        katex: 'H = \\frac{\\frac{1}{2}J\\omega^2}{S_{rated}}',
      },
      {
        text: 'Modern grids increasingly combine physical inertia and synthetic support from power electronics.',
      },
    ],
    notes:
      'Avoid over-explaining machinery details. Keep the message: different resource types stabilize the grid differently, so controls and planning must adapt.',
  },
  {
    id: 5,
    path: '/slide/5',
    title: 'Storage Solves Different Problems at Different Durations',
    shortTitle: 'Storage',
    hero: 'Short-duration storage is common; multi-day backup is still expensive.',
    bullets: [
      'Four-hour batteries are useful for daily peak shifting.',
      'Longer duration needs much more energy capacity and cost.',
      'Duration choice should match the risk you are solving for.',
    ],
    deeper: [
      {
        text: 'Storage economics often scale with both power and duration:',
        katex: 'C \\approx C_{power} + C_{energy} \\times hours',
      },
      {
        text: 'Today’s buildout is strong in short duration, while long-duration options continue to mature.',
      },
    ],
    notes:
      'Frame storage as “right tool for the right timescale.” This keeps the tone balanced and practical.',
  },
  {
    id: 6,
    path: '/slide/6',
    title: 'Transmission Connects Remote Resources to Cities',
    shortTitle: 'Transmission',
    hero: 'Generation can be available and still not reach demand if lines are constrained.',
    bullets: [
      'Best wind and solar sites are often far from population centers.',
      'Power flows through corridors and substations before local delivery.',
      'Congestion can force curtailment even when clean energy is available.',
    ],
    deeper: [
      {
        text: 'Interconnection queue data shows large volumes of proposed generation waiting for network upgrades and approvals.',
      },
      {
        text: 'Delivery bottlenecks can be an infrastructure timeline issue, not a generation availability issue.',
      },
    ],
    notes:
      'This is the flagship visual slide. Walk left to right: generation, corridor, substation, city load. Then show what changes during congestion.',
  },
  {
    id: 7,
    path: '/slide/7',
    title: 'When to Seek Help and What the Process Looks Like',
    shortTitle: 'Take Action',
    hero: 'A good sequence improves outcomes and avoids expensive mistakes.',
    bullets: [
      'Seek help when bills climb, outages increase, or major upgrades are planned.',
      'Start with audit and efficiency before solar, storage, or EV charging design.',
      'Use incentives and rate plans strategically, not as the first step.',
    ],
    deeper: [
      {
        text: 'For many homes, demand profile and tariff structure can change project economics as much as equipment selection.',
      },
      {
        text: 'A staged process reduces oversizing risk and improves long-term performance tracking.',
      },
    ],
    notes:
      'This slide aligns to assignment requirements about when to seek treatment and what treatment entails, adapted to energy decisions.',
  },
]
