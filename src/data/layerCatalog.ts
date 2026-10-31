import type { MapLayerConfig } from '../types/mars';

export const LAYER_CATALOG: MapLayerConfig[] = [
  // A. BASE MAPS
  {
    id: 'visual-imagery',
    name: 'Visual Imagery',
    subtitle: 'Viking Global Mosaic',
    group: 'base',
    category: 'imagery',
    provider: 'NASA Mars Trek',
    serviceType: 'wmts',
    status: 'connected',
    resolution: '232 m/pixel',
    description: 'Viking Orbiter Mars Digital Image Mosaic version 2.1. True-color calibrated equatorial and polar coverage.',
    layerIdentifier: 'Mars_Viking_MDIM21_ClrMosaic_global_232m',
    wmtsTemplate: 'https://trek.nasa.gov/tiles/Mars/EQ/Mars_Viking_MDIM21_ClrMosaic_global_232m/1.0.0/default/default028mm/{TileMatrix}/{TileRow}/{TileCol}.jpg',
    legendNotes: 'Viking visual optical spectrum mosaic'
  },
  {
    id: 'elevation-mola',
    name: 'Elevation / Topography',
    subtitle: 'MOLA Colorized',
    group: 'base',
    category: 'elevation',
    provider: 'NASA Mars Trek',
    serviceType: 'wmts',
    status: 'connected',
    resolution: '463 m/pixel',
    description: 'Mars Global Surveyor Laser Altimeter color-coded topographic relief merged with shaded relief model.',
    layerIdentifier: 'Mars_MGS_MOLA_ClrShade_merge_global_463m',
    wmtsTemplate: 'https://trek.nasa.gov/tiles/Mars/EQ/Mars_MGS_MOLA_ClrShade_merge_global_463m/1.0.0/default/default028mm/{TileMatrix}/{TileRow}/{TileCol}.jpg',
    legendNotes: 'Elevation scale: -8,200 m (Blue/Purple) to +21,287 m (White/Red)'
  },
  {
    id: 'hillshade-mola',
    name: 'Hillshade',
    subtitle: 'MOLA Shaded Relief',
    group: 'base',
    category: 'elevation',
    provider: 'USGS Astrogeology',
    serviceType: 'wms',
    status: 'connected',
    resolution: '463 m/pixel',
    description: 'Synthetic hillshade generated from MOLA Megdr 128 pixel-per-degree digital elevation model.',
    layerIdentifier: 'MOLA_bw',
    endpointUrl: 'https://planetarymaps.usgs.gov/cgi-bin/mapserv?map=/maps/mars/mars_simp_cyl.map',
    legendNotes: 'Monochromatic illumination at 45 degree solar elevation'
  },

  // B. SCIENTIFIC MAPS
  {
    id: 'themis-day',
    name: 'Thermal IR — Day',
    subtitle: 'THEMIS Daytime',
    group: 'scientific',
    category: 'imagery',
    provider: 'USGS Astrogeology',
    serviceType: 'wms',
    status: 'connected',
    resolution: '100 m/pixel',
    description: 'Mars Odyssey Thermal Emission Imaging System (THEMIS) 100m daytime infrared global mosaic.',
    layerIdentifier: 'THEMIS',
    endpointUrl: 'https://planetarymaps.usgs.gov/cgi-bin/mapserv?map=/maps/mars/mars_simp_cyl.map',
    legendNotes: 'Thermal inertia and surface temperature differentiation'
  },
  {
    id: 'themis-night',
    name: 'Thermal IR — Night',
    subtitle: 'THEMIS Nighttime',
    group: 'scientific',
    category: 'imagery',
    provider: 'USGS Astrogeology',
    serviceType: 'wms',
    status: 'connected',
    resolution: '100 m/pixel',
    description: 'Mars Odyssey THEMIS nighttime infrared radiance mosaic, highlighting bedrock thermal inertia.',
    layerIdentifier: 'THEMIS_night',
    endpointUrl: 'https://planetarymaps.usgs.gov/cgi-bin/mapserv?map=/maps/mars/mars_simp_cyl.map',
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
    group: 'highres',
    category: 'imagery',
    provider: 'USGS Astrogeology',
    serviceType: 'wms',
    status: 'connected',
    resolution: '5.0 m/pixel',
    description: 'High-resolution Context Camera global mosaic covering detailed Martian surface geomorphology.',
    layerIdentifier: 'MDIM21',
    endpointUrl: 'https://planetarymaps.usgs.gov/cgi-bin/mapserv?map=/maps/mars/mars_simp_cyl.map',
    legendNotes: 'High-resolution surface geomorphology'
  },
  {
    id: 'hirise-regional',
    name: 'HiRISE (Regional)',
    subtitle: 'High Resolution',
    group: 'highres',
    category: 'imagery',
    provider: 'USGS Astrogeology',
    serviceType: 'wms',
    status: 'connected',
    resolution: '0.25 m/pixel',
    description: 'High Resolution Imaging Science Experiment surface strips targeting Jezero Crater, Gale Crater, and key scientific sites.',
    layerIdentifier: 'MDIM21',
    endpointUrl: 'https://planetarymaps.usgs.gov/cgi-bin/mapserv?map=/maps/mars/mars_simp_cyl.map',
    legendNotes: 'Footprint catalog accessible for Jezero, Gale and Mawrth target zones'
  }
];
