export interface ScienceLabTopic {
  id: string;
  title: string;
  shortTitle: string;
  category:
    | 'atmosphere'
    | 'temperature'
    | 'gravity'
    | 'soil'
    | 'water-ice'
    | 'geology'
    | 'missions'
    | 'discoveries';
  headlineMetric: string;
  summary: string;
  keyFacts: string[];
  modelId: 'mars-interior' | 'atmosphere-shell' | 'perseverance-rover' | 'subsurface-ice';
  modelExplanation: string;
  sourceAttribution: string;
}

export interface ScienceModelDescriptor {
  id: 'mars-interior' | 'atmosphere-shell' | 'perseverance-rover' | 'subsurface-ice';
  name: string;
  subtitle: string;
  topicId: string;
  description: string;
  attribution: string;
}

export const SCIENCE_MODELS: ScienceModelDescriptor[] = [
  {
    id: 'mars-interior',
    name: 'Mars Interior Structure Cutaway',
    subtitle: 'Crust • Mantle • Liquid Core',
    topicId: 'gravity',
    description:
      'Interactive 3D cutaway showing Mars ~24–72 km crust, silicate mantle, and ~1,830 km liquid iron-alloy core constrained by NASA InSight SEIS marsquake seismology.',
    attribution: 'NASA / JPL-Caltech InSight SEIS Mission'
  },
  {
    id: 'atmosphere-shell',
    name: 'Martian Atmospheric & Dust Shell',
    subtitle: '95.3% CO₂ • 6.1 mbar Mean Pressure',
    topicId: 'atmosphere',
    description:
      'Visualizes Mars tenuous carbon dioxide envelope, 11.1 km scale height, high-altitude water-ice clouds, and seasonal polar CO₂ condensation.',
    attribution: 'NASA MAVEN / Mars Reconnaissance Orbiter'
  },
  {
    id: 'perseverance-rover',
    name: 'Perseverance Exploration Rover',
    subtitle: '6-Wheel Rocker-Bogie • MMRTG • Mastcam-Z',
    topicId: 'missions',
    description:
      'Simplified interactive 3D engineering model of a Mars 2020 class rover featuring rocker-bogie suspension, remote sensing mast, robotic sample arm, and MMRTG power source.',
    attribution: 'NASA / JPL-Caltech Mars 2020'
  },
  {
    id: 'subsurface-ice',
    name: 'Subsurface Water Ice Stratigraphy',
    subtitle: 'Regolith Mantle • Pure Ice Sheet',
    topicId: 'water-ice',
    description:
      'Layered block illustrating dry ferric dust/regolith overburden shielding buried mid-latitude and arctic water ice sheets discovered by Phoenix and MRO SHARAD radar.',
    attribution: 'NASA Phoenix Lander / MRO SHARAD'
  }
];

export const SCIENCE_LAB_TOPICS: ScienceLabTopic[] = [
  {
    id: 'atmosphere',
    title: 'Mars Atmosphere & Pressure Dynamics',
    shortTitle: 'Atmosphere',
    category: 'atmosphere',
    headlineMetric: '95.3% CO₂ • ~6.1 mbar',
    summary:
      'Mars has a thin carbon dioxide-dominated atmosphere less than 1% as dense as Earth at sea level. Roughly 25–30% of the atmosphere freezes out onto the winter polar cap every Martian year.',
    keyFacts: [
      'Composition: 95.3% CO₂, 2.6% N₂, 1.9% Ar, plus trace O₂ (0.16%) and CO.',
      'Mean surface pressure at the 0 m MOLA datum is ~6.1 mbar (610 Pa), ranging from <0.7 mbar atop Olympus Mons to ~12.4 mbar in Hellas Basin.',
      'No global dipole magnetic field; solar wind slowly strips upper atmospheric ions (measured by NASA MAVEN).',
      'Perihelion solar heating triggers regional and planet-encircling dust storms lofting fine iron-oxide dust kilometers high.'
    ],
    modelId: 'atmosphere-shell',
    modelExplanation:
      '3D model highlights the thin blue-amber atmospheric boundary layer and suspended dust veil over the Martian globe.',
    sourceAttribution: 'NASA MAVEN / Viking / MSL REMS Public Datasets'
  },
  {
    id: 'temperature',
    title: 'Surface Temperature & Diurnal Swings',
    shortTitle: 'Temperature',
    category: 'temperature',
    headlineMetric: '-63°C Mean (-140°C to +20°C)',
    summary:
      'Because Mars sits at ~1.52 AU from the Sun and lacks a thick greenhouse blanket or liquid oceans, surface temperatures plunge violently every night.',
    keyFacts: [
      'Global annual mean surface temperature is roughly -63°C (210 K).',
      'Equatorial summer noon can briefly reach +20°C in sunlit dark basalt, dropping below -73°C before dawn.',
      'Winter polar caps reach -140°C, cold enough for atmospheric CO₂ gas to freeze into dry-ice snow.',
      'THEMIS thermal infrared imaging distinguishes warm-retaining exposed bedrock from rapidly cooling fine dust.'
    ],
    modelId: 'atmosphere-shell',
    modelExplanation:
      'Diurnal solar heating drives strong convective dust devils and thermal gradients visible in Mars Odyssey THEMIS infrared maps.',
    sourceAttribution: 'NASA Mars Odyssey THEMIS / MSL REMS / Viking Meteorology'
  },
  {
    id: 'gravity',
    title: 'Planetary Gravity & Interior Structure',
    shortTitle: 'Gravity',
    category: 'gravity',
    headlineMetric: '3.72 m/s² (0.38 g)',
    summary:
      'Mars surface gravity is about 38% of Earth’s, shaping everything from towering 21 km volcanoes to lower atmospheric escape energy and human physiology.',
    keyFacts: [
      'Mean equatorial/surface gravity: 3.721 m/s² (vs. 9.807 m/s² on Earth).',
      'Mean volumetric radius: 3,389.5 km (~53% of Earth’s radius); mass is ~10.7% of Earth’s.',
      'Lower gravity and stagnant single-plate lithosphere allowed Olympus Mons to grow 2.5× taller than Mount Everest without collapsing its crust.',
      'NASA InSight SEIS seismology measured a liquid iron-alloy core (~1,830 km radius) beneath a ~24–72 km crust.'
    ],
    modelId: 'mars-interior',
    modelExplanation:
      '3D interior cutaway separates the rigid basaltic crust, silicate mantle, and molten metallic core detected via seismic P/S-wave reflections.',
    sourceAttribution: 'NASA InSight SEIS Science Team / MGS Gravity & MOLA'
  },
  {
    id: 'soil',
    title: 'Soil Chemistry & Mineral Composition',
    shortTitle: 'Soil Composition',
    category: 'soil',
    headlineMetric: 'Fe₂O₃ Dust • Basalt • Clays',
    summary:
      'Martian regolith is crushed volcanic basalt coated in oxidized nanophase iron oxides (rust), mixed with sulfates, clays, and reactive perchlorate salts.',
    keyFacts: [
      'Nanophase ferric oxide (Fe₂O₃) dust gives Mars its signature rusty red-ochre surface albedo.',
      'Underlying bedrock is dominantly mafic basalt (plagioclase feldspar, pyroxene, olivine).',
      'Phoenix and Curiosity detected 0.5–1.0 wt% calcium/magnesium perchlorate salts—important for both astronaut toxicity mitigation and ISRU oxygen extraction.',
      'Orbital CRISM/OMEGA spectrometers mapped Noachian phyllosilicate clays (Jezero, Mawrth Vallis, Nili Fossae) indicating ancient neutral-pH liquid water.'
    ],
    modelId: 'perseverance-rover',
    modelExplanation:
      'Rover contact instruments (PIXL, SHERLOC, APXS, CheMin) analyze bedrock elemental chemistry and crystal mineralogy at millimeter scale.',
    sourceAttribution: 'NASA MSL CheMin & SAM / Mars 2020 PIXL / Phoenix MECA'
  },
  {
    id: 'water-ice',
    title: 'Water Ice Reservoirs & Cryosphere',
    shortTitle: 'Water Ice',
    category: 'water-ice',
    headlineMetric: '>5 Million km³ Ice Est.',
    summary:
      'While liquid water is unstable at today’s low pressure on most of Mars, vast reservoirs of frozen water ice exist in polar caps and buried mid-latitude glaciers.',
    keyFacts: [
      'Polar Layered Deposits hold millions of cubic kilometers of water ice capped seasonally by thin CO₂ frost.',
      'In 2008, NASA’s Phoenix lander scooped into arctic soil at 68.2°N and uncovered pure water ice just centimeters below the surface.',
      'MRO SHARAD radar detected an underground water-ice sheet in Utopia Planitia holding roughly the volume of Lake Superior.',
      'Subsurface ice is the prime In-Situ Resource Utilization (ISRU) feedstock for astronaut drinking water, oxygen, and methane rocket propellant.'
    ],
    modelId: 'subsurface-ice',
    modelExplanation:
      '3D stratigraphy block demonstrates how an insulating regolith dust lag prevents buried Pleistocene/Amazonian ice sheets from sublimating.',
    sourceAttribution: 'NASA Phoenix Archive / MRO SHARAD / ESA Mars Express MARSIS'
  },
  {
    id: 'geology',
    title: 'Global Geological Formations',
    shortTitle: 'Geology',
    category: 'geology',
    headlineMetric: '29.5 km Total Relief',
    summary:
      'Mars spans a dramatic crustal dichotomy between ancient heavily cratered southern highlands and smooth northern lowlands, punctuated by extreme volcanic and rift provinces.',
    keyFacts: [
      'Crustal Dichotomy: Southern highlands sit +1 to +3 km above datum with ~58 km thick crust; northern lowlands sit -3.5 to -4.5 km with ~32 km crust.',
      'Olympus Mons rises +21,287 m above MOLA datum; Hellas Basin plunges to -7,152 m (nearly 30 km total planetary relief).',
      'Valles Marineris stretches >4,000 km along the Tharsis margin, exposing kilometers of layered volcanic and sedimentary strata.',
      'Delta fans in Jezero Crater and Eberswalde preserve ancient river-to-lake sediment structures.'
    ],
    modelId: 'mars-interior',
    modelExplanation:
      'Compare global topography on the 3D Mars globe by switching to the MOLA Elevation and Hillshade datasets.',
    sourceAttribution: 'USGS Astrogeology Science Center / NASA MOLA Team'
  },
  {
    id: 'missions',
    title: 'Robotic Rover & Lander Mission History',
    shortTitle: 'Rover History',
    category: 'missions',
    headlineMetric: '10 Successful Landings',
    summary:
      'From Viking 1’s historic 1976 touchdown to Perseverance and Ingenuity’s ongoing Jezero expedition, robotic explorers have transformed Mars from telescopic mystery into mapped terrain.',
    keyFacts: [
      '1976: Viking 1 (Chryse Planitia) & Viking 2 (Utopia Planitia) returned the first long-duration color surface imagery and weather logs.',
      '1997 & 2004: Mars Pathfinder/Sojourner pioneered wheeled mobility; Spirit & Opportunity logged 45.16 km proving ancient surface water.',
      '2012–Present: Curiosity has climbed >5 km up Gale Crater’s Mount Sharp, confirming ancient habitable lakes.',
      '2021–Present: Perseverance caches biosignature core tubes in Jezero Crater; Ingenuity completed 72 powered flights in thin Martian air.'
    ],
    modelId: 'perseverance-rover',
    modelExplanation:
      'Interact with the 3D rover model—6-wheel rocker-bogie suspension climbs obstacles up to wheel-diameter height while keeping the chassis stable.',
    sourceAttribution: 'NASA/JPL-Caltech / CNSA Tianwen-1'
  },
  {
    id: 'discoveries',
    title: 'Breakthrough Scientific Discoveries',
    shortTitle: 'Discoveries',
    category: 'discoveries',
    headlineMetric: 'Habitable Past Confirmed',
    summary:
      'Combining orbital spectroscopy with in-situ drilling has confirmed that ancient Mars hosted sustained liquid water, diverse organic molecules, and active interior heat.',
    keyFacts: [
      'Ancient Habitability: Curiosity proved Yellowknife Bay in Gale Crater held neutral-pH freshwater lakes with key chemical energy sources.',
      'Organic Carbon: SAM detected refractory organic macromolecules in 3.5-billion-year-old mudstones; SHERLOC mapped aromatic/organic signals in Jezero.',
      'Atmospheric O₂ Generation: Perseverance’s MOXIE experiment repeatedly split Martian CO₂ into breathable oxygen, proving ISRU viability.',
      'Active Seismology: InSight recorded >1,300 marsquakes and meteorite impacts, mapping crust, mantle, and molten core boundaries.'
    ],
    modelId: 'perseverance-rover',
    modelExplanation:
      'Select Jezero Crater, Gale Crater, or Elysium Planitia on the 3D globe to inspect each discovery directly at its coordinates.',
    sourceAttribution: 'Science / JGR Planets / NASA PDS Mission Dossiers'
  }
];

