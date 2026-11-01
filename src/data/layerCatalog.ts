import type { MapLayerConfig } from '../types/mars';

export const LAYER_CATALOG: MapLayerConfig[] = [
<<<<<<< HEAD
  // 1. IMAGERY
=======
  // A. BASE MAPS
>>>>>>> origin/main
  {
    id: 'visual-imagery',
    name: 'Visual Imagery',
    subtitle: 'Viking Global Mosaic',
<<<<<<< HEAD
    group: 'imagery',
=======
    group: 'base',
>>>>>>> origin/main
    category: 'imagery',
    provider: 'NASA Mars Trek',
    serviceType: 'wmts',
    status: 'connected',
    resolution: '232 m/pixel',
    description: 'Viking Orbiter Mars Digital Image Mosaic version 2.1. True-color calibrated equatorial and polar coverage.',
    layerIdentifier: 'Mars_Viking_MDIM21_ClrMosaic_global_232m',
    wmtsTemplate: 'https://trek.nasa.gov/tiles/Mars/EQ/Mars_Viking_MDIM21_ClrMosaic_global_232m/1.0.0/default/default028mm/{TileMatrix}/{TileRow}/{TileCol}.jpg',
<<<<<<< HEAD
    legendNotes: 'Viking visual optical spectrum mosaic',
    texturePath: '/textures/mars_surface_2k.jpg'
  },
  {
    id: 'regional-imagery',
    name: 'Regional Imagery',
    subtitle: 'Targeted Science Mosaics',
    group: 'imagery',
    category: 'imagery',
    provider: 'USGS Astrogeology',
    serviceType: 'wms',
    status: 'connected',
    resolution: '6.0 m/pixel',
    description: 'Targeted regional context camera strips focused on candidate exploration zones and landing sites.',
    layerIdentifier: 'MDIM21',
    endpointUrl: 'https://planetarymaps.usgs.gov/cgi-bin/mapserv?map=/maps/mars/mars_simp_cyl.map',
    legendNotes: 'Targeted regional coverage for exploration zones',
    texturePath: '/textures/mars_ctx.jpg'
  },

  // 2. TOPOGRAPHY
  {
    id: 'elevation-mola',
    name: 'MOLA Elevation',
    subtitle: 'Colorized Hypsometry',
    group: 'topography',
=======
    legendNotes: 'Viking visual optical spectrum mosaic'
  },
  {
    id: 'elevation-mola',
    name: 'Elevation / Topography',
    subtitle: 'MOLA Colorized',
    group: 'base',
>>>>>>> origin/main
    category: 'elevation',
    provider: 'NASA Mars Trek',
    serviceType: 'wmts',
    status: 'connected',
    resolution: '463 m/pixel',
    description: 'Mars Global Surveyor Laser Altimeter color-coded topographic relief merged with shaded relief model.',
    layerIdentifier: 'Mars_MGS_MOLA_ClrShade_merge_global_463m',
    wmtsTemplate: 'https://trek.nasa.gov/tiles/Mars/EQ/Mars_MGS_MOLA_ClrShade_merge_global_463m/1.0.0/default/default028mm/{TileMatrix}/{TileRow}/{TileCol}.jpg',
<<<<<<< HEAD
    legendNotes: 'Elevation scale: -8,200 m (Blue/Purple) to +21,287 m (White/Red)',
    texturePath: '/textures/mars_mola_color.jpg'
=======
    legendNotes: 'Elevation scale: -8,200 m (Blue/Purple) to +21,287 m (White/Red)'
>>>>>>> origin/main
  },
  {
    id: 'hillshade-mola',
    name: 'Hillshade',
    subtitle: 'MOLA Shaded Relief',
<<<<<<< HEAD
    group: 'topography',
=======
    group: 'base',
>>>>>>> origin/main
    category: 'elevation',
    provider: 'USGS Astrogeology',
    serviceType: 'wms',
    status: 'connected',
    resolution: '463 m/pixel',
    description: 'Synthetic hillshade generated from MOLA Megdr 128 pixel-per-degree digital elevation model.',
    layerIdentifier: 'MOLA_bw',
    endpointUrl: 'https://planetarymaps.usgs.gov/cgi-bin/mapserv?map=/maps/mars/mars_simp_cyl.map',
<<<<<<< HEAD
    legendNotes: 'Monochromatic illumination at 45 degree solar elevation',
    texturePath: '/textures/mars_hillshade.jpg'
  },
  {
    id: 'slope-map',
    name: 'Slope Map',
    subtitle: 'MOLA Gradient',
    group: 'topography',
    category: 'elevation',
    provider: 'USGS Astrogeology',
    serviceType: 'wms',
    status: 'connected',
    resolution: '463 m/pixel',
    description: 'Topographic slope gradient derived from MOLA elevation differentials to evaluate mobility hazards.',
    layerIdentifier: 'HRSC_MOLA_Blend_Hillshade',
    endpointUrl: 'https://planetarymaps.usgs.gov/cgi-bin/mapserv?map=/maps/mars/mars_simp_cyl.map',
    legendNotes: 'Slope angles 0° (flat green) to >25° (severe red)',
    texturePath: '/textures/mars_roughness.jpg'
  },
  {
    id: 'terrain-roughness',
    name: 'Terrain Roughness',
    subtitle: 'MOLA Roughness',
    group: 'topography',
    category: 'roughness',
    provider: 'USGS Astrogeology',
    serviceType: 'wms',
    status: 'connected',
    resolution: '0.6 - 2.4 km pulse width',
    description: 'HRSC & MOLA blend measuring surface slope roughness, bedrock exposure, and relief variances.',
    layerIdentifier: 'HRSC_MOLA_Blend_Hillshade',
    endpointUrl: 'https://planetarymaps.usgs.gov/cgi-bin/mapserv?map=/maps/mars/mars_simp_cyl.map',
    legendNotes: 'High-resolution slope roughness and topographic variances',
    texturePath: '/textures/mars_roughness.jpg'
  },

  // 3. THERMAL
  {
    id: 'themis-day',
    name: 'THEMIS Daytime Infrared',
    subtitle: 'Thermal IR — Day',
    group: 'thermal',
=======
    legendNotes: 'Monochromatic illumination at 45 degree solar elevation'
  },

  // B. SCIENTIFIC MAPS
  {
    id: 'themis-day',
    name: 'Thermal IR — Day',
    subtitle: 'THEMIS Daytime',
    group: 'scientific',
>>>>>>> origin/main
    category: 'imagery',
    provider: 'USGS Astrogeology',
    serviceType: 'wms',
    status: 'connected',
    resolution: '100 m/pixel',
    description: 'Mars Odyssey Thermal Emission Imaging System (THEMIS) 100m daytime infrared global mosaic.',
    layerIdentifier: 'THEMIS',
    endpointUrl: 'https://planetarymaps.usgs.gov/cgi-bin/mapserv?map=/maps/mars/mars_simp_cyl.map',
<<<<<<< HEAD
    legendNotes: 'Thermal inertia and surface temperature differentiation',
    texturePath: '/textures/mars_themis_day.jpg'
  },
  {
    id: 'themis-night',
    name: 'THEMIS Nighttime Infrared',
    subtitle: 'Thermal IR — Night',
    group: 'thermal',
=======
    legendNotes: 'Thermal inertia and surface temperature differentiation'
  },
  {
    id: 'themis-night',
    name: 'Thermal IR — Night',
    subtitle: 'THEMIS Nighttime',
    group: 'scientific',
>>>>>>> origin/main
    category: 'imagery',
    provider: 'USGS Astrogeology',
    serviceType: 'wms',
    status: 'connected',
    resolution: '100 m/pixel',
    description: 'Mars Odyssey THEMIS nighttime infrared radiance mosaic, highlighting bedrock thermal inertia.',
    layerIdentifier: 'THEMIS_night',
    endpointUrl: 'https://planetarymaps.usgs.gov/cgi-bin/mapserv?map=/maps/mars/mars_simp_cyl.map',
<<<<<<< HEAD
    legendNotes: 'Nighttime thermal signatures and fine regolith vs exposed rock',
    texturePath: '/textures/mars_themis_night.jpg'
  },

  // 4. HIGH-RESOLUTION DATA
  {
    id: 'ctx-mosaic',
    name: 'CTX Imagery',
    subtitle: 'Context Camera 6m Mosaic',
=======
    legendNotes: 'Nighttime thermal signatures and fine regolith vs exposed rock'
  },
  {
    id: 'false-color-mineral',
    name: 'False Color',
    subtitle: 'Mineral Composition',
    group: 'scientific',
    category: 'scientific',
    provider: 'USGS Astrogeology',
    serviceType: 'wms',
    status: 'connected',
    resolution: '12.5 - 25 m/pixel',
    description: 'MOLA & THEMIS spectral blend mapping phyllosilicates, hydrated minerals, and iron oxides.',
    layerIdentifier: 'MOLA_THEMIS_blend',
    endpointUrl: 'https://planetarymaps.usgs.gov/cgi-bin/mapserv?map=/maps/mars/mars_simp_cyl.map',
    legendNotes: 'Multispectral mineralogy indicators'
  },
  {
    id: 'terrain-roughness',
    name: 'Terrain Roughness',
    subtitle: 'MOLA Roughness',
    group: 'scientific',
    category: 'roughness',
    provider: 'USGS Astrogeology',
    serviceType: 'wms',
    status: 'connected',
    resolution: '0.6 - 2.4 km pulse width',
    description: 'HRSC & MOLA blend measuring surface slope roughness, bedrock exposure, and relief variances.',
    layerIdentifier: 'HRSC_MOLA_Blend_Hillshade',
    endpointUrl: 'https://planetarymaps.usgs.gov/cgi-bin/mapserv?map=/maps/mars/mars_simp_cyl.map',
    legendNotes: 'High-resolution slope roughness and topographic variances'
  },

  // C. HIGH-RES IMAGERY
  {
    id: 'ctx-mosaic',
    name: 'CTX Mosaic',
    subtitle: 'Context Camera',
>>>>>>> origin/main
    group: 'highres',
    category: 'imagery',
    provider: 'USGS Astrogeology',
    serviceType: 'wms',
    status: 'connected',
    resolution: '5.0 m/pixel',
    description: 'High-resolution Context Camera global mosaic covering detailed Martian surface geomorphology.',
    layerIdentifier: 'MDIM21',
    endpointUrl: 'https://planetarymaps.usgs.gov/cgi-bin/mapserv?map=/maps/mars/mars_simp_cyl.map',
<<<<<<< HEAD
    legendNotes: 'High-resolution surface geomorphology',
    texturePath: '/textures/mars_ctx.jpg'
  },
  {
    id: 'hirise-regional',
    name: 'HiRISE Imagery',
    subtitle: 'High Resolution Targeted Strips',
=======
    legendNotes: 'High-resolution surface geomorphology'
  },
  {
    id: 'hirise-regional',
    name: 'HiRISE (Regional)',
    subtitle: 'High Resolution',
>>>>>>> origin/main
    group: 'highres',
    category: 'imagery',
    provider: 'USGS Astrogeology',
    serviceType: 'wms',
    status: 'connected',
    resolution: '0.25 m/pixel',
    description: 'High Resolution Imaging Science Experiment surface strips targeting Jezero Crater, Gale Crater, and key scientific sites.',
    layerIdentifier: 'MDIM21',
    endpointUrl: 'https://planetarymaps.usgs.gov/cgi-bin/mapserv?map=/maps/mars/mars_simp_cyl.map',
<<<<<<< HEAD
    legendNotes: 'Footprint catalog accessible for Jezero, Gale and Mawrth target zones',
    texturePath: '/textures/mars_hirise.jpg'
=======
    legendNotes: 'Footprint catalog accessible for Jezero, Gale and Mawrth target zones'
>>>>>>> origin/main
  }
];
