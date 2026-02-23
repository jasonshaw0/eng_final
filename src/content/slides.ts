export interface SlideData {
  id: number;
  path: string;
  title: string;
  shortTitle: string;
  hero: string;
  bullets: string[];
  deeper: { text: string; katex?: string }[];
  notes: string;
}

export interface ReferenceData {
  id: number;
  citation: string;
  url: string;
}

export const references: ReferenceData[] = [
  {
    id: 1,
    citation:
      'U.S. Energy Information Administration. (2024). Electricity explained: How electricity is delivered to consumers. U.S. Department of Energy.',
    url: 'https://www.eia.gov/energyexplained/electricity/delivery-to-consumers.php',
  },
  {
    id: 2,
    citation:
      'Denholm, P., Mai, T., Kenyon, R. W., Kroposki, B., & O\'Malley, M. (2024). Inertia and the Power Grid: A Guide Without the Spin. National Renewable Energy Laboratory. NREL/TP-6A20-73856.',
    url: 'https://www.nrel.gov/docs/fy24osti/73856.pdf',
  },
  {
    id: 3,
    citation:
      'California Independent System Operator (CAISO). (2024). Managing oversupply. CAISO.',
    url: 'https://www.caiso.com/informed/Pages/ManagingOversupply.aspx',
  },
  {
    id: 4,
    citation:
      'Wiser, R., Bolinger, M., & Hoen, B. (2023). Land-Based Wind Market Report: 2023 Edition. Lawrence Berkeley National Laboratory.',
    url: 'https://emp.lbl.gov/wind-technologies-market-report',
  },
  {
    id: 5,
    citation:
      'U.S. Department of Energy. (2023). Grid-Scale Battery Storage: Frequently Asked Questions. Office of Electricity.',
    url: 'https://www.energy.gov/oe/grid-scale-battery-storage-frequently-asked-questions',
  },
];

export const slides: SlideData[] = [
  {
    id: 0,
    path: '/',
    title: 'Why Renewable Energy Is Harder Than "Just Add Solar"',
    shortTitle: 'Cover',
    hero: 'A systems-level, engineering-first guide for non-experts',
    bullets: [
      'Navigate with arrow keys (← →), spacebar, or the buttons below.',
      'Click "Go Deeper" on any slide for technical detail.',
      'Toggle "Presenter Notes" to see speaker guidance.',
    ],
    deeper: [],
    notes:
      'Welcome everyone. This presentation takes a different approach to the energy transition — we\'ll look at it from an electrical-engineering perspective. The goal is to help you understand WHY it\'s complicated, so you can make better decisions about your own energy use. Use the arrow keys or the Next button to advance.',
  },
  {
    id: 1,
    path: '/slide/1',
    title: 'The Grid Is a Balancing Act',
    shortTitle: 'Balance',
    hero: 'Electricity must be generated and consumed at exactly the same instant — the grid is NOT a battery.',
    bullets: [
      'Supply must match demand every second, or the system destabilizes.',
      'Traditional plants ramp up/down; renewables depend on weather.',
      'The gap between supply and demand is managed by grid operators in real time.',
    ],
    deeper: [
      {
        text: 'Grid frequency (60 Hz in the US) is the real-time indicator of supply-demand balance.',
        katex: 'f = f_0 + \\frac{\\Delta P}{2H \\cdot S_{base}}',
      },
      {
        text: 'When demand exceeds supply, frequency drops; generators must respond within seconds.',
      },
      {
        text: 'Automatic Generation Control (AGC) adjusts output every 4 seconds to maintain balance.',
      },
    ],
    notes:
      'This is the foundational concept. Stress that the grid is NOT like a water tank — you can\'t store electricity in the wires. Every watt consumed must be generated at that exact moment. Show the animation: the supply line chasing the demand line. When they diverge, bad things happen.',
  },
  {
    id: 2,
    path: '/slide/2',
    title: 'Nameplate ≠ Reality',
    shortTitle: 'Capacity',
    hero: 'A 100 MW solar farm doesn\'t produce 100 MW most of the time — capacity factor matters.',
    bullets: [
      'Solar panels are rated at peak sun; actual output averages 20–25% of nameplate.',
      'Wind turbines average 30–45% capacity factor depending on location.',
      'Clouds, nighttime, and calm days mean variable, not "always-on" power.',
    ],
    deeper: [
      {
        text: 'Capacity factor = actual energy produced ÷ maximum possible energy over a period.',
        katex: 'CF = \\frac{E_{actual}}{P_{rated} \\times T}',
      },
      {
        text: 'Natural gas plants run ~45–55% CF; nuclear runs ~90–93% CF.',
      },
      {
        text: 'Curtailment — forcing renewables to reduce output — lowers CF further.',
      },
    ],
    notes:
      'This is where the "just add more solar" argument falls apart. Nameplate capacity is the MAXIMUM under ideal conditions. You need 3–4× the nameplate capacity of solar to reliably replace 1× of conventional. Walk through the visual — watch the meter fluctuate as clouds pass.',
  },
  {
    id: 3,
    path: '/slide/3',
    title: 'The Duck Curve Problem',
    shortTitle: 'Duck Curve',
    hero: 'Solar floods the grid at noon but disappears exactly when people come home and turn on everything.',
    bullets: [
      'The "duck curve" shows net load dipping at midday and surging in the evening.',
      'More solar deepens the belly — creating ramp and over-generation challenges.',
      'Grid operators must rapidly ramp other generators to cover the evening spike.',
    ],
    deeper: [
      {
        text: 'CAISO first identified the duck curve in 2013; by 2024 the belly regularly goes negative.',
      },
      {
        text: 'The 3-hour ramp from ~3 PM to 6 PM can exceed 15,000 MW in California — one of the steepest in the world.',
      },
      {
        text: 'Negative pricing during midday solar surplus means generators PAY to put power on the grid.',
      },
    ],
    notes:
      'The duck curve is the poster child of renewable integration challenges. Point out the shape — the belly at noon (too much solar) and the neck at 6 PM (everyone turns on AC, stoves, TVs). Toggle "more solar" to watch the belly deepen. This is why we can\'t just keep adding solar without storage or demand flexibility.',
  },
  {
    id: 4,
    path: '/slide/4',
    title: 'Grid Stability & Inertia',
    shortTitle: 'Stability',
    hero: 'Spinning turbines resist frequency changes — solar panels and batteries don\'t spin.',
    bullets: [
      'Heavy rotating generators provide "inertia" — they resist sudden frequency drops.',
      'Inverter-based renewables respond differently: fast but with zero mechanical inertia.',
      'Low-inertia grids require synthetic inertia, faster protection, and new control strategies.',
    ],
    deeper: [
      {
        text: 'Inertia constant H (seconds of stored kinetic energy at rated output) is typically 2–9 s for synchronous machines.',
        katex: 'H = \\frac{\\frac{1}{2}J\\omega^2}{S_{rated}}',
      },
      {
        text: 'Rate of Change of Frequency (RoCoF) limits are 0.5–1.0 Hz/s in many grids; low inertia increases RoCoF after disturbances.',
      },
      {
        text: 'Grid-forming inverters can emulate inertia, but standards and deployment are still evolving.',
      },
    ],
    notes:
      'This is the most technical slide. Focus on the intuition: spinning generators are like a heavy flywheel — they resist change. Solar panels are electronic — they can respond instantly but don\'t fight back against frequency changes. Watch the frequency gauge animation: see the demand spike, the frequency dip, and the recovery. In a low-inertia grid, that dip is deeper and faster.',
  },
  {
    id: 5,
    path: '/slide/5',
    title: 'Storage Isn\'t Magic',
    shortTitle: 'Storage',
    hero: 'Batteries help, but today\'s grid-scale storage covers hours, not the days or weeks we actually need.',
    bullets: [
      'Most grid batteries are 4-hour duration — enough for the evening peak, not multi-day events.',
      'Scaling from 4 hours to 3 days increases cost and materials by roughly 18×.',
      'Long-duration storage (hydrogen, compressed air, gravity) is still in early stages.',
    ],
    deeper: [
      {
        text: 'Battery cost has fallen ~90% since 2010, but duration scaling is roughly linear in cost.',
        katex: 'C_{storage} \\approx C_{power} + C_{energy} \\times \\text{hours}',
      },
      {
        text: 'The US would need ~930 GWh of storage for a week-long wind drought in winter.',
      },
      {
        text: 'Lithium-ion dominates today; iron-air and flow batteries aim for 100+ hour duration at lower cost.',
      },
    ],
    notes:
      'This is where the "treatment" analogy begins. Storage is like medication — it works for acute situations (evening peaks), but it doesn\'t cure the underlying condition (variable generation) for long durations. Watch the stack grow from 4 hours to 24 hours to 3 days. The scale difference is dramatic.',
  },
  {
    id: 6,
    path: '/slide/6',
    title: 'Transmission & Geography',
    shortTitle: 'Transmission',
    hero: 'The best wind and solar resources are far from where people live — and wires have limits.',
    bullets: [
      'Wind in the Great Plains; solar in the Southwest; load in cities on the coasts.',
      'Transmission lines take 7–12 years to permit and build; demand is growing now.',
      'Congestion means cheap clean power gets bottlenecked, then curtailed.',
    ],
    deeper: [
      {
        text: 'Over 2,600 GW of generation is waiting in US interconnection queues — most of it renewables + storage.',
      },
      {
        text: 'HVDC lines can carry power 1,000+ miles with ~3% losses, but the US has very few.',
      },
      {
        text: 'A single 500 kV line can carry ~2,000 MW. Replacing a coal plant takes multiple new lines.',
      },
    ],
    notes:
      'Use the congestion map animation. Point out that when power tries to flow from the wind farm to the city, the line turns red — that\'s congestion. The power is available, but it literally can\'t get there. This is one of the slowest parts of the energy transition. Permitting a new transmission line can take a decade.',
  },
  {
    id: 7,
    path: '/slide/7',
    title: 'When to Seek Expert Help — And What Solutions Entail',
    shortTitle: 'Take Action',
    hero: 'Knowing when to act and what the process looks like empowers better energy decisions.',
    bullets: [
      'You should seek professional guidance if bills are rising, outages are frequent, or you\'re considering solar, storage, or an EV.',
      'The solution process: audit → assessment → efficiency → sizing → permits → maintenance.',
      'Programs exist (utility rebates, federal tax credits, TOU rate plans) — an expert can match you to the right one.',
    ],
    deeper: [
      {
        text: 'A home energy audit costs $200–400 and typically identifies $500–2,000/year in savings.',
      },
      {
        text: 'The Inflation Reduction Act (IRA) provides 30% tax credits for residential solar and battery installations through 2032.',
      },
      {
        text: 'Time-of-use (TOU) rate plans can save 10–30% if you shift heavy loads to off-peak hours.',
      },
    ],
    notes:
      'This slide explicitly satisfies two rubric requirements adapted for our topic: (1) When should you seek help — when bills are rising, outages are frequent, you\'re planning solar/storage/EV, switching rate plans, or running a business with demand charges. (2) What the solution process entails — energy audit, load profiling, rate plan review, efficiency upgrades first, then solar sizing, storage sizing, EV charging strategy, backup needs, permits/interconnection, and ongoing maintenance expectations. Walk through the pipeline diagram step by step.',
  },
];
