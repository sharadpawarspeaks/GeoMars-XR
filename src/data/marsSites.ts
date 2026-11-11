import type { MarsSite } from '../types/mars';

export const MARS_SITES: MarsSite[] = [
  {
    id: 'jezero-crater',
    name: 'Jezero Crater (Perseverance)',
    category: 'rover',
    lat: 18.38,
    lng: 77.58,
    elevationMeters: -2560,
    diameterKm: 45,
    description:
      'Landing site of NASA Perseverance rover & Ingenuity helicopter. Ancient lake-delta system preserving rich astrobiological records.',
    mission: 'Mars 2020 / Perseverance',
    missionStatus: 'Active',
    agency: 'NASA / JPL',
    year: 2021,
    geology:
      'Fan-delta sediments, igneous floor rocks, phyllosilicates, and olivine-bearing carbonate units.',
    scienceHighlights: [
      'Discovered igneous crater floor rocks beneath ancient lake delta sediments',
      'Collected hermetically sealed rock & regolith core samples for Mars Sample Return',
      'Ingenuity Mars Helicopter completed 72 powered flights across varied terrain',
      'MOXIE instrument generated oxygen from Martian CO₂ atmosphere'
    ],
    interestingFacts: [
      'Named after Jezero, a town in Bosnia & Herzegovina; "jezero" means "lake" in Slavic languages.',
      'Once held a 45 km-wide paleolake fed by Neretva Vallis ~3.5–3.8 billion years ago.'
    ],
    missionRelevance:
      'Prime astrobiology target for biosignature preservation in fine-grained mudstones and margin carbonates, and hub of Mars Sample Return core caching.',
    sourceAttribution: 'NASA/JPL-Caltech, MRO CRISM & HiRISE, USGS Astrogeology',
    featured: true
  },
  {
    id: 'gale-crater',
    name: 'Gale Crater (Curiosity)',
    category: 'rover',
    lat: -4.59,
    lng: 137.44,
    elevationMeters: -4450,
    diameterKm: 154,
    description:
      'Explored by NASA Curiosity rover since 2012. Features Mount Sharp (Aeolis Mons), a 5.5 km central mound of layered sedimentary rock.',
    mission: 'Mars Science Laboratory (MSL)',
    missionStatus: 'Active',
    agency: 'NASA / JPL',
    year: 2012,
    geology:
      'Mudstones, lacustrine clay-rich strata, hematite ridges, and sulfate-bearing layered deposits.',
    scienceHighlights: [
      'Confirmed ancient freshwater lake environment with habitable neutral pH conditions',
      'Detected diverse organic molecules in 3.5-billion-year-old lacustrine mudstone',
      'Traversed over 32 km ascending the clay-to-sulfate climate transition on Mount Sharp'
    ],
    interestingFacts: [
      'Mount Sharp rises higher from Gale Crater floor (~5.5 km) than Mount Rainier rises above its base.',
      'Curiosity recorded seasonal background fluctuations of trace methane near the crater floor.'
    ],
    missionRelevance:
      'Provides a continuous vertical geological timeline documenting Mars transition from a habitable wet planet to an arid sulfate world.',
    sourceAttribution: 'NASA/JPL-Caltech MSL Science Team, USGS Astrogeology',
    featured: true
  },
  {
    id: 'olympus-mons',
    name: 'Olympus Mons',
    category: 'volcano',
    lat: 18.65,
    lng: -133.8,
    elevationMeters: 21287,
    diameterKm: 624,
    description:
      'The largest planetary shield volcano in the Solar System. Stands nearly 2.5 times Mount Everest height above the MOLA Martian datum.',
    missionStatus: 'Natural Feature',
    geology:
      'Basaltic shield volcano with nested summit collapse calderas and a peripheral scarp up to 8 km high.',
    scienceHighlights: [
      'Nested summit caldera complex spanning roughly 80 km across',
      'Gentle average flank slope of ~5 degrees despite 21.3 km summit elevation',
      'Lava flows show crater-count ages ranging from ~115 million down to ~2 million years'
    ],
    interestingFacts: [
      'Its base spans ~600 km, roughly the footprint of Arizona or France.',
      'Summit atmospheric pressure drops below 0.7 mbar—nearly an order of magnitude thinner than the Martian datum average.'
    ],
    missionRelevance:
      'Key laboratory for mantle hotspot volcanism on a single-plate planet and extreme-altitude aerodynamics/barometric modeling.',
    sourceAttribution: 'NASA MGS MOLA Science Team, ESA Mars Express HRSC, USGS',
    featured: true
  },
  {
    id: 'valles-marineris',
    name: 'Valles Marineris (Chasma)',
    category: 'canyon',
    lat: -14.0,
    lng: -59.2,
    elevationMeters: -7000,
    diameterKm: 4000,
    description:
      'A vast tectonic canyon system extending over 4,000 km, up to 200 km wide and 7 km deep across the Martian equatorial belt.',
    missionStatus: 'Natural Feature',
    geology:
      'Tectonic rift system flanking the Tharsis rise with giant landslide aprons and interior layered sulfate deposits.',
    scienceHighlights: [
      'Over 4 times deeper and nearly 10 times longer than Earth’s Grand Canyon',
      'Hosts hydrated sulfate beds and steep canyon wall exposures of ancient crust',
      'ESA ExoMars TGO FREND detected elevated subsurface hydrogen in Candor Chaos'
    ],
    interestingFacts: [
      'Stretches nearly one-fifth of Mars equatorial circumference—spanning coast-to-coast across the continental United States.',
      'Deep chasma floors have significantly higher surface air pressure than surrounding Tharsis plateaus.'
    ],
    missionRelevance:
      'Provides vertical access to kilometers of exposed Martian crustal stratigraphy, potential subsurface water-bearing strata, and natural topographic radiation shielding.',
    sourceAttribution: 'NASA Viking / MRO HiRISE, ESA ExoMars TGO FREND, USGS',
    featured: true
  },
  {
    id: 'elysium-planitia',
    name: 'Elysium Planitia (InSight)',
    category: 'lander',
    lat: 4.5,
    lng: 135.62,
    elevationMeters: -2610,
    description:
      'Smooth equatorial volcanic plain selected for NASA InSight lander to deploy the SEIS seismometer onto Martian regolith.',
    mission: 'InSight Geophysical Observatory',
    missionStatus: 'Completed',
    agency: 'NASA / JPL / CNES',
    year: 2018,
    geology:
      'Smooth Amazonian basaltic volcanic plains overlain by impact-gardened regolith breccia near Cerberus Fossae.',
    scienceHighlights: [
      'Detected over 1,300 marsquakes constraining crustal thickness (24–72 km) and liquid core radius (~1,830 km)',
      'Identified active seismicity along Cerberus Fossae extensional fractures',
      'Recorded infrasound pressure waves from Martian winds and dust devils'
    ],
    interestingFacts: [
      'Selected as a flat "parking lot" plain specifically to minimize boulder and slope hazards during lander touchdown.',
      'InSight seismic data revealed Mars has a wholly molten iron-alloy core enriched with lighter elements.'
    ],
    missionRelevance:
      'Benchmark site for Martian interior geophysics, safe low-relief EDL engineering, and equatorial solar power modeling.',
    sourceAttribution: 'NASA/JPL-Caltech InSight Science Team, CNES SEIS, USGS',
    featured: true
  },
  {
    id: 'nili-fossae',
    name: 'Nili Fossae (Olivine & Carbonate Troughs)',
    category: 'canyon',
    lat: 21.0,
    lng: 74.5,
    elevationMeters: -1850,
    diameterKm: 667,
    description:
      'Curved system of graben troughs northwest of Isidis Planitia and directly adjacent to Jezero Crater, rich in ancient clay and carbonate minerals.',
    missionStatus: 'Natural Feature',
    geology:
      'Noachian bedrock fractured by concentric Isidis basin tectonics, exposing Fe/Mg smectite phyllosilicates, magnesium carbonates, and olivine-rich units.',
    scienceHighlights: [
      'One of the largest contiguous exposures of olivine and magnesium carbonate bedrock on Mars',
      'CRISM spectroscopy revealed hydrothermal alteration signatures and diverse Noachian clay minerals',
      'Former top finalist landing site for Mars Science Laboratory and Mars 2020 missions'
    ],
    interestingFacts: [
      'Earth-based telescopic & orbital observations have repeatedly studied Nili Fossae for localized methane & carbonate links.',
      'Its mineral assemblages closely resemble Earth rock units where serpentinization can fuel microbial ecosystems.'
    ],
    missionRelevance:
      'High-priority astrobiology and Mars-2020-extended-traverse corridor due to exceptional preservation of ancient aqueous alteration minerals.',
    sourceAttribution: 'NASA MRO CRISM / HiRISE, Mars Odyssey THEMIS, USGS Astrogeology',
    featured: true
  },
  {
    id: 'mawrth-vallis',
    name: 'Mawrth Vallis (Clay Valley)',
    category: 'delta',
    lat: 23.99,
    lng: -18.96,
    elevationMeters: -2240,
    diameterKm: 636,
    description:
      'One of the oldest outflow channels on Mars, exposing exceptionally thick, stratified sequences of phyllosilicate clay minerals.',
    missionStatus: 'Natural Feature',
    geology:
      'Stratified aluminum-rich (kaolinite/montmorillonite) capping iron/magnesium-rich smectite clays formed in the Early Noachian.',
    scienceHighlights: [
      'Distinct vertical layering of Al-phyllosilicates over Fe/Mg-smectites recording ancient chemical weathering',
      'Top finalist candidate for both Curiosity (MSL) and ExoMars Rosalind Franklin missions',
      'Preserves rocks spanning the transition from Mars warm/wet era to cold/arid climate'
    ],
    interestingFacts: [
      'Clay-bearing strata reach thicknesses exceeding 150–200 meters across the plateau flanking the valley.',
      'Low elevation (-2.2 km) provides dense enough atmosphere for parachute entry-descent-landing.'
    ],
    missionRelevance:
      'Premier future astrobiology & paleoclimate target where clay minerals protect ancient organic molecules from cosmic radiation.',
    sourceAttribution: 'ESA Mars Express OMEGA / HRSC, NASA MRO CRISM, USGS',
    featured: true
  },
  {
    id: 'meridiani-planum',
    name: 'Meridiani Planum (Opportunity)',
    category: 'rover',
    lat: -1.95,
    lng: -5.53,
    elevationMeters: -1400,
    description:
      'Landing zone of NASA Opportunity rover. Characterized by hematite concretions ("blueberries") revealing ancient groundwater activity.',
    mission: 'Mars Exploration Rover (MER-B)',
    missionStatus: 'Completed',
    agency: 'NASA / JPL',
    year: 2004,
    geology:
      'Sulfate-rich sandstone, gray hematite spherules, and layered aeolian/evaporitic bedrock.',
    scienceHighlights: [
      'First definitive in-situ evidence of past liquid water altering Martian bedrock',
      'Operated for 14.5 years (planned 90 sols), traversing a record 45.16 km',
      'Explored Eagle, Endurance, Victoria, and Endeavour craters'
    ],
    interestingFacts: [
      'Named after the Martian prime meridian (0° longitude), which passes directly through the plain.'
    ],
    missionRelevance:
      'Demonstrated multi-year rover mobility across flat evaporite plains and long-duration solar-powered operations.',
    sourceAttribution: 'NASA/JPL-Caltech MER Science Team, MGS TES',
    featured: false
  },
  {
    id: 'gusev-crater',
    name: 'Gusev Crater (Spirit)',
    category: 'rover',
    lat: -14.57,
    lng: 175.47,
    elevationMeters: -1950,
    diameterKm: 166,
    description:
      'Landing site of NASA Spirit rover at the outlet of Ma’adim Vallis. Uncovered ancient hydrothermal silica deposits at Home Plate.',
    mission: 'Mars Exploration Rover (MER-A)',
    missionStatus: 'Completed',
    agency: 'NASA / JPL',
    year: 2004,
    geology:
      'Basaltic rubble-covered plain with explosive volcanism and fumarolic hydrothermal opaline silica.',
    scienceHighlights: [
      'Discovered ~90% pure opaline silica formed by ancient hot springs or steam vents',
      'Climbed the Columbia Hills to the summit of Husband Hill',
      'Confirmed localized ancient volcanic hydrothermal systems'
    ],
    sourceAttribution: 'NASA/JPL-Caltech MER Science Team',
    featured: false
  },
  {
    id: 'chryse-planitia',
    name: 'Chryse Planitia (Viking 1)',
    category: 'lander',
    lat: 22.48,
    lng: -47.97,
    elevationMeters: -3700,
    description:
      'Historic landing site of Viking 1 in 1976—the first spacecraft to complete a long-duration mission on the Martian surface.',
    mission: 'Viking 1 Lander',
    missionStatus: 'Completed',
    agency: 'NASA / Langley',
    year: 1976,
    geology:
      'Alluvial plain sculpted by catastrophic outflow channels (Kasei, Ares, and Tiu Valles).',
    scienceHighlights: [
      'Returned the first clear color photographs from the Martian surface',
      'Conducted pioneering soil chemistry and biology experiments',
      'Monitored Martian meteorology and seasonal pressure cycles for 6 Earth years'
    ],
    sourceAttribution: 'NASA Viking Mission Archive, USGS Astrogeology',
    featured: false
  },
  {
    id: 'utopia-planitia',
    name: 'Utopia Planitia (Zhurong & Viking 2)',
    category: 'rover',
    lat: 25.07,
    lng: 109.93,
    elevationMeters: -4100,
    diameterKm: 3300,
    description:
      'Vast northern plains impact basin. Site of Viking 2 (1976) and China CNSA Zhurong rover (2021).',
    mission: 'Tianwen-1 / Zhurong & Viking 2',
    missionStatus: 'Completed',
    agency: 'CNSA / NASA',
    year: 2021,
    geology:
      'Sedimentary and volcanic deposits overlaying massive buried mid-latitude water ice sheets.',
    scienceHighlights: [
      'MRO SHARAD radar confirmed a buried water ice sheet holding volume comparable to Lake Superior',
      'Zhurong ground-penetrating radar mapped multi-layered paleo-flooding stratigraphy',
      'Documented hydrated sulfate minerals indicating late-stage water activity'
    ],
    sourceAttribution: 'NASA MRO SHARAD, CNSA Tianwen-1',
    featured: false
  },
  {
    id: 'phoenix-lander',
    name: 'Phoenix Arctic Plains (2008)',
    category: 'lander',
    lat: 68.22,
    lng: -125.75,
    elevationMeters: -4130,
    description:
      'NASA arctic lander in Vastitas Borealis near the north polar cap. Excavated pure water ice just centimeters beneath surface soil.',
    mission: 'Phoenix Mars Lander',
    missionStatus: 'Completed',
    agency: 'NASA / University of Arizona',
    year: 2008,
    geology:
      'Polygonal patterned ground in periglacial arctic plains with shallow subsurface water ice table.',
    scienceHighlights: [
      'Directly excavated and photographed sublimating pure water ice in trenches',
      'Identified perchlorate salts in Martian arctic regolith',
      'Observed water-ice snow falling from high-altitude clouds'
    ],
    sourceAttribution: 'NASA / University of Arizona Phoenix Archive',
    featured: false
  },
  {
    id: 'viking-2-lander',
    name: 'Viking 2 Northern Lowlands (1976)',
    category: 'lander',
    lat: 48.27,
    lng: 134.0,
    elevationMeters: -4230,
    description:
      'Sister mission to Viking 1 in Utopia Planitia, operating for over 3.5 years and photographing winter water-ice frost on boulders.',
    mission: 'Viking 2 Lander',
    missionStatus: 'Completed',
    agency: 'NASA / Langley',
    year: 1976,
    geology:
      'Boulder-strewn plain in the northern lowlands covered by thin seasonal CO₂ and H₂O frost coats.',
    scienceHighlights: [
      'Operated seismometer recording wind-induced lander vibrations',
      'Photographed winter water-ice frost accumulation on surface rocks',
      'Analyzed inorganic composition of northern Martian regolith'
    ],
    sourceAttribution: 'NASA Viking Mission Archive',
    featured: false
  },
  {
    id: 'hellas-planitia',
    name: 'Hellas Planitia (Impact Basin)',
    category: 'basin',
    lat: -42.4,
    lng: 70.5,
    elevationMeters: -7152,
    diameterKm: 2300,
    description:
      'The deepest impact structure on Mars and one of the largest craters in the Solar System, generating the highest surface air pressure on Mars (~12.4 mbar).',
    missionStatus: 'Natural Feature',
    geology:
      'Ancient giant impact basin with eroded concentric rings, glacial lobate debris aprons, and seasonal dust-storm nuclei.',
    scienceHighlights: [
      'Surface atmospheric pressure ~12.4 mbar—highest anywhere on Mars',
      'Orbital radar detected buried water-ice glaciers beneath protective rocky debris aprons',
      'Major dust source region initiating planet-encircling dust storms'
    ],
    sourceAttribution: 'NASA MGS MOLA, MRO SHARAD, USGS Astrogeology',
    featured: false
  }
];
