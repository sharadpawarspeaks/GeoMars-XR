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
    description: 'Landing site of NASA Perseverance rover & Ingenuity helicopter. Ancient lake-delta system preserving rich astrobiological records.',
    mission: 'Mars 2020 / Perseverance',
    missionStatus: 'Active',
    agency: 'NASA / JPL',
    year: 2021,
    geology: 'Fan-delta sediments, igneous floor rocks, phyllosilicates, and olivine-bearing carbonate units.',
    scienceHighlights: [
      'Discovered igneous bottom rocks of crater floor',
      'Collected core samples of ancient delta front sediments',
      'Ingenuity performed 72 flights exceeding operational bounds'
    ],
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
    description: 'Explored by NASA Curiosity rover since 2012. Features Mount Sharp (Aeolis Mons), a 5.5 km central mound of layered sedimentary rock.',
    mission: 'Mars Science Laboratory (MSL)',
    missionStatus: 'Active',
    agency: 'NASA / JPL',
    year: 2012,
    geology: 'Mudstones, lacustrine clay-rich strata, hematite ridges, sulfate-bearing layered deposits.',
    scienceHighlights: [
      'Confirmed ancient freshwater lake environment with habitable conditions',
      'Detected diverse organic molecules in 3.5-billion-year-old mudstone',
      'Traversed over 32 km climbing the sulfate-bearing unit of Mt Sharp'
    ],
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
    description: 'The largest planetary shield volcano in the Solar System. Stands nearly 2.5 times Mount Everest height above Martian datum.',
    missionStatus: 'Natural Feature',
    geology: 'Basaltic shield volcano with multiple collapse calderas and peripheral scarp up to 8 km high.',
    scienceHighlights: [
      'Summit caldera network spanning 80 km across',
      'Very gentle average flank slope of only 5 degrees',
      'Lava flows show ages ranging from 115 million down to 2 million years'
    ],
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
    description: 'A vast tectonic canyon system extending over 4,000 km, up to 200 km wide and 7 km deep across the Martian equator.',
    missionStatus: 'Natural Feature',
    geology: 'Tectonic rift system in the Tharsis rise with massive landslide deposits and interior layered sulfates.',
    scienceHighlights: [
      'Over 4 times deeper and 10 times longer than Earth’s Grand Canyon',
      'Hosts recurring slope lineae (RSL) and hydrated minerals along steep walls',
      'Subsurface hydrogen enrichment detected in Candor Chasma'
    ],
    featured: true
  },
  {
    id: 'meridiani-planum',
    name: 'Meridiani Planum (Opportunity)',
    category: 'rover',
    lat: -1.95,
    lng: -5.53,
    elevationMeters: -1400,
    description: 'Landing zone of NASA Opportunity rover. Characterized by hematite concretions ("blueberries") revealing ancient water history.',
    mission: 'Mars Exploration Rover (MER-B)',
    missionStatus: 'Completed',
    agency: 'NASA / JPL',
    year: 2004,
    geology: 'Sulfate-rich sandstone, gray hematite spherules, and layered aeolian/evaporitic bedrock.',
    scienceHighlights: [
      'First definitive evidence of past liquid acidic water on Mars surface',
      'Operated for 14.5 years (planned 90 sols), traveling 45.16 km',
      'Explored Eagle, Endurance, Victoria, and Endeavour craters'
    ],
    featured: true
  },
  {
    id: 'gusev-crater',
    name: 'Gusev Crater (Spirit)',
    category: 'rover',
    lat: -14.57,
    lng: 175.47,
    elevationMeters: -1950,
    diameterKm: 166,
    description: 'Landing site of NASA Spirit rover at the outlet of Ma’adim Vallis. Uncovered ancient hydrothermal silica deposits at Home Plate.',
    mission: 'Mars Exploration Rover (MER-A)',
    missionStatus: 'Completed',
    agency: 'NASA / JPL',
    year: 2004,
    geology: 'Basaltic rubble covered floor with explosive volcanism and fumarolic hydrothermal silica.',
    scienceHighlights: [
      'Discovered 90% pure opaline silica formed by hot springs or fumaroles',
      'Climbed the Columbia Hills to the summit of Husband Hill',
      'Confirmed localized ancient volcanic hydrothermal systems'
    ],
    featured: false
  },
  {
    id: 'elysium-planitia',
    name: 'Elysium Planitia (InSight)',
    category: 'lander',
    lat: 4.50,
    lng: 135.62,
    elevationMeters: -2610,
    description: 'Smooth volcanic plain selected for NASA InSight lander to place the SEIS seismometer directly onto the Martian regolith.',
    mission: 'InSight Geophysical Observatory',
    missionStatus: 'Completed',
    agency: 'NASA / JPL / CNES',
    year: 2018,
    geology: 'Smooth young basaltic volcanic plains with impact regolith breccia.',
    scienceHighlights: [
      'Detected over 1,300 marsquakes revealing crustal thickness and liquid core radius',
      'Measured active subsurface magma plume beneath Cerberus Fossae',
      'Recorded sounds of Martian dust devils and surface winds'
    ],
    featured: true
  },
  {
    id: 'chryse-planitia',
    name: 'Chryse Planitia (Viking 1)',
    category: 'lander',
    lat: 22.48,
    lng: -47.97,
    elevationMeters: -3700,
    description: 'Historic landing site of Viking 1 in 1976. The first spacecraft to operate successfully on the surface of Mars.',
    mission: 'Viking 1 Lander',
    missionStatus: 'Completed',
    agency: 'NASA / Langley',
    year: 1976,
    geology: 'Alluvial plain formed by catastrophic outflow channels (Kasei, Ares, and Tiu Valles).',
    scienceHighlights: [
      'Returned the first color photographs from the surface of Mars',
      'Conducted first biology and organic synthesis experiments',
      'Monitored Martian weather and seasonal pressure cycles for 6 years'
    ],
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
    description: 'Vast northern plains impact basin. Site of Viking 2 (1976) and China CNSA Zhurong rover (2021).',
    mission: 'Tianwen-1 / Zhurong & Viking 2',
    missionStatus: 'Completed',
    agency: 'CNSA / NASA',
    year: 2021,
    geology: 'Sedimentary/volcanic deposits overlaying massive buried water ice sheets.',
    scienceHighlights: [
      'SHARAD radar confirmed vast underground ice sheet containing as much water as Lake Superior',
      'Zhurong ground-penetrating radar identified palaeo-flooding sedimentary layers',
      'Documented hydrated sulfate minerals indicating late-stage surface water activity'
    ],
    featured: false
  },
  {
    id: 'phoenix-lander',
    name: 'Phoenix (2008)',
    category: 'lander',
    lat: 68.22,
    lng: -125.75,
    elevationMeters: -4130,
    description: 'NASA robotic spacecraft in Vastitas Borealis near the north polar ice cap. Used robotic scoop arm to uncover pure water ice directly beneath the surface soil.',
    mission: 'Phoenix Mars Lander',
    missionStatus: 'Completed',
    agency: 'NASA / University of Arizona',
    year: 2008,
    geology: 'Polygonal patterned ground in periglacial arctic plains with shallow subsurface water ice table.',
    scienceHighlights: [
      'Directly excavated and verified water ice in trenches',
      'Identified perchlorate chemistry in arctic soil',
      'Observed falling snow from high-altitude cirrus clouds'
    ],
    featured: true
  },
  {
    id: 'viking-2-lander',
    name: 'Viking 2 (1976)',
    category: 'lander',
    lat: 48.27,
    lng: 134.00,
    elevationMeters: -4230,
    description: 'Sister mission to Viking 1. Touched down in Utopia Planitia in 1976, operating for over 3.5 years and providing vital seismology and meteorology data.',
    mission: 'Viking 2 Lander',
    missionStatus: 'Completed',
    agency: 'NASA / Langley',
    year: 1976,
    geology: 'Boulder-strewn plain in the northern lowlands covered by thin seasonal frost coats.',
    scienceHighlights: [
      'Operated seismometer recording atmospheric vibrations and wind loads',
      'Photographed winter water ice frost accumulation on surface rocks',
      'Analyzed chemical composition of northern soil samples'
    ],
    featured: true
  },
  {
    id: 'hellas-planitia',
    name: 'Hellas Planitia (Impact Basin)',
    category: 'basin',
    lat: -42.4,
    lng: 70.5,
    elevationMeters: -7152,
    diameterKm: 2300,
    description: 'The deepest impact structure on Mars and one of the largest craters in the Solar System. Highest atmospheric pressure on Mars (~12.4 mbar).',
    missionStatus: 'Natural Feature',
    geology: 'Giant impact basin with eroded rings, glacial lobate debris aprons, and seasonal dust storm generation.',
    scienceHighlights: [
      'Surface pressure high enough to theoretically allow liquid water briefly at lowest floor depths',
      'Radar detected pure water ice glaciers protected beneath rocky debris aprons',
      'Primary source region for planet-encircling global dust storms'
    ],
    featured: false
  },
  {
    id: 'mawrth-vallis',
    name: 'Mawrth Vallis (Clay Valley)',
    category: 'delta',
    lat: 23.99,
    lng: -18.96,
    elevationMeters: -2240,
    diameterKm: 636,
    description: 'One of the oldest outflow channels on Mars. Displays exceptionally thick, stratified sequences of diverse phyllosilicate (clay) minerals.',
    missionStatus: 'Natural Feature',
    geology: 'Stratified smectite and kaolinite clays formed during the Noachian aqueous era.',
    scienceHighlights: [
      'Spectral signature of aluminum-rich and iron/magnesium-rich clay layers',
      'Candidate landing site for multiple future astrobiology missions',
      'Preserves rocks from the transition between Mars warm/wet and cold/dry eras'
    ],
    featured: false
  }
];
