import type {
  MarsSite,
  MarsCoordinate,
  MapLayerConfig,
  MissionRoutePlan,
  AiChatMessage
} from '../types/mars';
import {
  formatMarsCoordinate,
  formatElevation,
  estimateMolaElevation,
  estimateLocalSlopeDeg
} from './marsMath';

export interface AssistantContext {
  selectedSite: MarsSite | null;
  selectedCoordinate: MarsCoordinate | null;
  activeLayer: MapLayerConfig;
  missionRoute?: MissionRoutePlan;
}

const PLANETARY_KNOWLEDGE_BASE: Record<
  string,
  {
    geology: string;
    significance: string;
    atmosphereOrAqueous: string;
    missions: string;
    citations: string[];
  }
> = {
  'jezero-crater': {
    geology:
      'Jezero Crater is a 45 km impact basin on the western edge of Isidis Planitia. It preserves an intact fan-delta deposit where an ancient river (Neretva Vallis) breached the western crater rim during the Noachian-Hesperian transition (~3.5–3.8 Ga).',
    significance:
      'Primary landing site of NASA Perseverance rover. Fine-grained mudstones, smectite clays, and margin carbonates are ideal environments on Earth for preserving ancient microbial biosignatures.',
    atmosphereOrAqueous:
      'Orbital CRISM spectroscopy and rover PIXL/SHERLOC scans identified magnesium carbonates and clay minerals precipitated in a neutral-to-alkaline paleolake.',
    missions: 'NASA Mars 2020 Perseverance Rover & Ingenuity Helicopter (2021–Present)',
    citations: [
      'Farley et al., Science 377 (2022) — Mars 2020 Initial Traverse',
      'Grotzinger et al., Science 343 (2014)',
      'NASA PDS Jezero Crater Cartographic Dossier'
    ]
  },
  'gale-crater': {
    geology:
      'Gale Crater is a 154 km diameter impact basin featuring Aeolis Mons (Mount Sharp), a 5.5 km central sedimentary mountain recording hundreds of millions of years of Martian climate evolution.',
    significance:
      'Explored by NASA Curiosity rover since 2012. Documents the shift from ancient habitable freshwater lakes (clay-bearing mudstones) to arid sulfate evaporites.',
    atmosphereOrAqueous:
      'Curiosity detected endogenous organic molecules in 3.5-billion-year-old mudstone and seasonal variations in trace atmospheric methane.',
    missions: 'NASA Mars Science Laboratory (MSL) Curiosity (2012–Present)',
    citations: [
      'Vasavada et al., JGR Planets 119 (2014)',
      'Eigenbrode et al., Science 360 (2018) — Organic Matter in Gale Crater',
      'USGS Astrogeology Gale Crater Archive'
    ]
  },
  'olympus-mons': {
    geology:
      'Olympus Mons is a colossal basaltic shield volcano rising +21,287 m above the MOLA datum, spanning ~624 km across and ringed by an up to 8 km tall peripheral cliff scarp.',
    significance:
      'Largest known volcano in the Solar System. Its scale results from Mars lacking mobile plate tectonics, allowing a stationary crust to accumulate lava over a long-lived mantle plume.',
    atmosphereOrAqueous:
      'Summit atmospheric pressure drops below ~0.7 mbar (near-vacuum conditions), while seasonal water-ice orographic clouds frequently form on its upper flanks.',
    missions: 'Orbital surveys by Mariner 9, Viking, Mars Global Surveyor, Mars Express, and MRO',
    citations: [
      'Smith et al., Science 284 (1999) — MOLA Global Topography',
      'ESA Mars Express HRSC Mosaic Catalog'
    ]
  },
  'valles-marineris': {
    geology:
      'Valles Marineris is a 4,000 km tectonic rift system up to 200 km wide and >7,000 m deep formed by lithospheric stretching during uplift of the Tharsis volcanic rise.',
    significance:
      'Exposes kilometers of ancient layered Martian crust and interior sulfate deposits, offering natural vertical geological cross-sections and deep pressure basins.',
    atmosphereOrAqueous:
      'ESA ExoMars TGO FREND neutron spectrometer detected elevated subsurface hydrogen in Candor Chaos, consistent with extensive hydrated minerals or buried water ice.',
    missions: 'Viking Orbiters, MRO HiRISE, Mars Express HRSC/OMEGA, ExoMars TGO',
    citations: [
      'Malakhov et al., Icarus 374 (2022) — TGO FREND Subsurface Hydrogen',
      'USGS Astrogeology Mars Cartography'
    ]
  },
  'elysium-planitia': {
    geology:
      'Smooth Amazonian volcanic plain resurfaced by flood basalts and impact-gardened regolith south of Elysium Mons and west of Cerberus Fossae.',
    significance:
      'Selected for NASA InSight because its flat, boulder-sparse terrain ensured safe landing and coupling of the SEIS seismometer to Martian ground.',
    atmosphereOrAqueous:
      'InSight recorded >1,300 marsquakes, revealing crust thickness (24–72 km), a molten core (~1,830 km radius), and seismic activity along Cerberus Fossae.',
    missions: 'NASA InSight Geophysical Observatory (2018–2022)',
    citations: [
      'Banerdt et al., Nature Geoscience (2020) — InSight Seismology',
      'Stähler et al., Science 373 (2021) — Liquid Core Detection'
    ]
  },
  'nili-fossae': {
    geology:
      'Concentric system of ancient tectonic graben troughs northwest of Isidis Planitia exposing Noachian Fe/Mg-smectite clays, olivine-rich units, and magnesium carbonates.',
    significance:
      'One of the richest mineralogical regions on Mars and a top astrobiology target immediately northwest of Jezero Crater.',
    atmosphereOrAqueous:
      'Hydrothermal alteration and carbonate mineralization indicate prolonged ancient water-rock interaction potentially capable of sustaining chemotrophic microbes.',
    missions: 'Orbital surveys by MRO CRISM/HiRISE, Mars Odyssey THEMIS, Mars Express OMEGA',
    citations: [
      'Ehlmann et al., Science 322 (2008) — Orbital Identification of Carbonates',
      'NASA MRO CRISM Spectral Library'
    ]
  },
  'mawrth-vallis': {
    geology:
      'Ancient outflow channel cutting through Noachian highlands, exposing >150 m thick stratified sequences of aluminum clays overlying iron/magnesium smectites.',
    significance:
      'Top finalist landing site for both Curiosity (MSL) and ExoMars Rosalind Franklin due to exceptional organic-preservation potential in layered clays.',
    atmosphereOrAqueous:
      'Preserves a planetary-scale geochemical transition from intense Noachian weathering to late-stage drying.',
    missions: 'ESA ExoMars Candidate / MRO HiRISE & CRISM / Mars Express OMEGA',
    citations: [
      'Loizeau et al., JGR Planets (2007) — Phyllosilicates at Mawrth Vallis',
      'ESA ExoMars Landing Site Selection Dossier'
    ]
  }
};

/**
 * Queries an optional server-side AI endpoint if configured (no API keys in frontend code),
 * and seamlessly falls back to the deterministic, NASA-grounded planetary science engine.
 */
export async function queryAiScienceAssistant(
  userQuery: string,
  context: AssistantContext
): Promise<AiChatMessage> {
  const queryLower = userQuery.toLowerCase().trim();
  const proxyUrl = (import.meta.env.VITE_AI_API_ENDPOINT as string | undefined)?.trim();

  // Optional secure server-side AI integration (never embeds secret keys in client code)
  if (proxyUrl) {
    try {
      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: userQuery,
          context: {
            siteName: context.selectedSite?.name ?? null,
            siteId: context.selectedSite?.id ?? null,
            coordinates: context.selectedCoordinate,
            activeLayer: {
              id: context.activeLayer.id,
              name: context.activeLayer.name,
              provider: context.activeLayer.provider,
              resolution: context.activeLayer.resolution
            },
            missionRoute: context.missionRoute
              ? {
                  startLabel: context.missionRoute.startLabel,
                  destinationLabel: context.missionRoute.destinationLabel,
                  distanceKm: context.missionRoute.distanceKm,
                  estimatedSolDays: context.missionRoute.estimatedSolDays,
                  difficultyScore: context.missionRoute.difficultyScore
                }
              : null
          }
        })
      });

      if (response.ok) {
        const data = (await response.json()) as {
          content?: string;
          citations?: string[];
        };
        if (data.content) {
          return {
            id: `ai-${Date.now()}`,
            role: 'assistant',
            content: `${data.content}\n\n*Epistemic Note: Generated via configured server-side AI proxy grounded in current GeoMars telemetry; verify critical claims against NASA PDS primary sources.*`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            citations: data.citations ?? ['NASA Planetary Data System (PDS)', 'USGS Astrogeology'],
            mode: 'server-ai'
          };
        }
      }
    } catch {
      // Gracefully fall back to deterministic local science engine
    }
  }

  let content = '';
  let citations: string[] = [
    'NASA Planetary Data System (PDS)',
    'USGS Astrogeology Science Center'
  ];

  // 1. "Why is Mars red?"
  if (queryLower.includes('why is mars red') || (queryLower.includes('red') && queryLower.includes('mars'))) {
    content =
      `### Why Mars Appears Red\n\n` +
      `**Verified Scientific Fact:**\n` +
      `- **Iron Oxide Dust:** Martian surface rocks contain abundant iron-bearing basaltic minerals (olivine, pyroxene). Over billions of years, oxidation of iron produced fine **nanophase ferric oxide (Fe₂O₃ / hematite & ferrihydrite)** dust covering most of the planet.\n` +
      `- **Atmospheric Scattering:** Fine iron-oxide dust stays suspended in the thin CO₂ atmosphere, scattering reddish-amber wavelengths across both surface panoramas and orbital views.\n` +
      `- **Beneath the Dust:** Where rovers brush or abrade fresh bedrock (e.g. Jezero and Gale craters), underlying unweathered basalt often looks dark charcoal-gray rather than red.\n\n` +
      `*Source Attribution: NASA Mars Exploration Program, Viking / MER Mössbauer Spectrometer Data.*`;
    citations = ['NASA Mars Exploration Program', 'MER Mössbauer & APXS Teams'];
  }
  // 2. "Could humans survive on Mars?"
  else if (queryLower.includes('human') || queryLower.includes('survive') || queryLower.includes('astronaut')) {
    content =
      `### Human Survival Assessment on Mars\n\n` +
      `**Verified Environmental Constraints (NASA/ESA Measurements):**\n` +
      `- **Unbreathable Near-Vacuum Air:** Surface pressure averages **~6.1 mbar** (<1% of Earth sea level) and is **95.3% CO₂**—human blood would boil at body temperature without a pressurized suit or habitat.\n` +
      `- **Extreme Cold:** Mean temperature is **-63°C**, plunging to **-140°C** during polar nights.\n` +
      `- **Ionizing Radiation:** Without a thick atmosphere or global magnetosphere, surface astronauts experience galactic cosmic rays and solar particle events (~200–300 mSv/yr vs ~2–3 mSv/yr on Earth).\n` +
      `- **Toxic Soil Perchlorates:** Regolith contains ~0.5–1% perchlorate salts requiring dust filtration and washing.\n\n` +
      `**AI / Engineering Interpretation (Mission Architecture):**\n` +
      `Humans *could* survive inside pressurized, radiation-shielded habitats using **In-Situ Resource Utilization (ISRU)**—for example, extracting subsurface water ice (proven by Phoenix & MRO SHARAD) and generating oxygen from CO₂ (demonstrated at small scale by Perseverance’s **MOXIE**).\n\n` +
      `*Notice: Survival strategies are engineering syntheses based on measured planetary constraints.*`;
    citations = ['NASA MSL RAD Radiation Data', 'Mars 2020 MOXIE Team', 'NASA Phoenix Soil Chemistry'];
  }
  // 3. "What did Perseverance discover?"
  else if (queryLower.includes('perseverance') || queryLower.includes('ingenuity')) {
    content =
      `### Key Discoveries by NASA Perseverance & Ingenuity (Jezero Crater)\n\n` +
      `**Verified Mission Findings:**\n` +
      `- **Igneous Crater Floor:** Beneath ancient lake sediments, Perseverance discovered unexpected olivine-cumulate and basaltic igneous rocks (Séítah & Máaz formations), enabling future radiometric age-dating of Jezero.\n` +
      `- **Ancient River Delta & Organic Molecules:** Climbing the western fan-delta (Hogwallow Flats, Bright Angel), PIXL & SHERLOC detected fine-grained mudstones, sulfates, and carbon/organic signatures formed in liquid water.\n` +
      `- **Mars Sample Return Caching:** Over 24 hermetically sealed titanium tubes containing diverse rock, regolith, and atmospheric samples have been cored.\n` +
      `- **MOXIE & Ingenuity Milestones:** MOXIE produced breathable oxygen from Martian CO₂ 16 times; Ingenuity achieved **72 powered flights**, proving aerodynamic flight in ~1% Earth air density.\n\n` +
      `*Currently Selected Target Context:* ${context.selectedSite ? context.selectedSite.name : 'Global Orbit'}.`;
    citations = [
      'Farley et al., Science 377 (2022)',
      'NASA/JPL-Caltech Mars 2020 Science Team'
    ];
  }
  // 4. "Where is the best location for scientific exploration?"
  else if (
    queryLower.includes('best location') ||
    queryLower.includes('where should') ||
    queryLower.includes('explore') ||
    queryLower.includes('best site')
  ) {
    content =
      `### Top Scientific Exploration Targets on Mars\n\n` +
      `**Verified Candidate & Active Sites:**\n` +
      `1. **Jezero Crater (18.38° N, 77.58° E):** Active NASA Perseverance site; preserves an ancient lake-delta with clay & carbonate biosignature traps.\n` +
      `2. **Nili Fossae (21.00° N, 74.50° E):** Exposed Noachian olivine-carbonate troughs adjacent to Jezero with intense ancient water-rock alteration.\n` +
      `3. **Mawrth Vallis (23.99° N, 18.96° W):** >150 m thick stratified Al/Fe/Mg phyllosilicate clay beds; top ExoMars & MSL finalist.\n` +
      `4. **Valles Marineris (14.00° S, 59.20° W):** Unmatched 7 km deep vertical exposure of Martian crust & hydrated sulfates.\n` +
      `5. **Gale Crater (4.59° S, 137.44° E):** Active Curiosity site exposing 5.5 km of layered lake-to-desert history.\n\n` +
      `**Simulated Mission Synthesis:** For astrobiology and biosignature preservation, **Jezero Crater**, **Mawrth Vallis**, and **Nili Fossae** rank highest due to abundant smectite clays and carbonates at safe low elevations (< -1,800 m MOLA).`;
    citations = ['NASA Landing Site Workshop Reports', 'ESA ExoMars Candidate Dossier', 'MRO CRISM'];
  }
  // 5. "Explain the selected Martian terrain" or site-specific inquiry
  else if (
    queryLower.includes('selected') ||
    queryLower.includes('this terrain') ||
    queryLower.includes('this location') ||
    queryLower.includes('jezero') ||
    queryLower.includes('olympus') ||
    queryLower.includes('valles') ||
    queryLower.includes('gale') ||
    queryLower.includes('elysium') ||
    queryLower.includes('nili') ||
    queryLower.includes('mawrth') ||
    queryLower.includes('geology') ||
    queryLower.includes('important') ||
    queryLower.includes('significance')
  ) {
    // Check if query explicitly names another site, else fall back to selectedSite
    const matchedSiteKey = Object.keys(PLANETARY_KNOWLEDGE_BASE).find((id) =>
      queryLower.includes(id.split('-')[0])
    );
    const siteId = matchedSiteKey || context.selectedSite?.id;
    const known = siteId ? PLANETARY_KNOWLEDGE_BASE[siteId] : undefined;

    if (known) {
      const siteLabel =
        matchedSiteKey && matchedSiteKey !== context.selectedSite?.id
          ? matchedSiteKey.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase())
          : context.selectedSite?.name || 'Selected Martian Region';

      content =
        `### Planetary Site Intelligence: **${siteLabel}**\n\n` +
        `**Verified Scientific Observations:**\n` +
        `- **Geological Context:** ${known.geology}\n` +
        `- **Scientific Importance:** ${known.significance}\n` +
        `- **Water & Mineral Record:** ${known.atmosphereOrAqueous}\n` +
        `- **Mission History:** ${known.missions}\n\n` +
        `**Local Telemetry Readout (Simulated Analytical MOLA Model):**\n` +
        `- **Coordinates:** ${
          context.selectedCoordinate
            ? formatMarsCoordinate(context.selectedCoordinate.lat, context.selectedCoordinate.lng)
            : '18.38° N, 77.58° E'
        }\n` +
        `- **Estimated Elevation / Slope:** ${formatElevation(
          context.selectedCoordinate?.elevationMeters ?? context.selectedSite?.elevationMeters
        )} • ~${
          context.selectedCoordinate
            ? estimateLocalSlopeDeg(context.selectedCoordinate.lat, context.selectedCoordinate.lng).toFixed(1)
            : '2.4'
        }° regional slope`;
      citations = known.citations;
    } else if (context.selectedCoordinate) {
      const { lat, lng } = context.selectedCoordinate;
      const elev = context.selectedCoordinate.elevationMeters ?? estimateMolaElevation(lat, lng);
      const slope = estimateLocalSlopeDeg(lat, lng);
      const pressureMbar = (6.1 * Math.exp(-elev / 11100)).toFixed(2);
      const province =
        lat > 25
          ? 'Northern Lowlands (Vastitas Borealis / Sedimentary Plains)'
          : elev > 4000
          ? 'Tharsis Volcanic Plateau Province'
          : 'Noachian / Hesperian Highland-Cratered Margin';

      content =
        `### Terrain Analysis at **${formatMarsCoordinate(lat, lng)}**\n\n` +
        `- **Geological Province:** ${province}\n` +
        `- **Active Orbital Dataset:** ${context.activeLayer.name} (${context.activeLayer.provider}, ${context.activeLayer.resolution})\n\n` +
        `**Simulated Topographic & Barometric Estimates:**\n` +
        `- **Estimated MOLA Elevation:** ${formatElevation(elev)}\n` +
        `- **Estimated Regional Slope (1 km baseline):** ${slope.toFixed(1)}° (${
          slope > 15 ? 'Steep — Caution for wheeled rovers' : 'Nominal mobility gradient'
        })\n` +
        `- **Estimated Surface Pressure:** ~${pressureMbar} mbar CO₂ column\n\n` +
        `*Note: Point values outside benchmark landing sites are computed from GeoMars’s analytical MOLA approximation model and are not flight-certified terrain measurements.*`;
      citations = ['NASA MGS MOLA Areoid Datum', 'USGS Mars Cartographic Reference'];
    }
  }
  // 6. Layer explanation
  else if (
    queryLower.includes('layer') ||
    queryLower.includes('dataset') ||
    queryLower.includes('mola') ||
    queryLower.includes('themis') ||
    queryLower.includes('hirise') ||
    queryLower.includes('ctx')
  ) {
    const layer = context.activeLayer;
    content =
      `### Active Remote Sensing Dataset: **${layer.name}**\n\n` +
      `- **Instrument / Provider:** ${layer.provider} (${layer.serviceType.toUpperCase()})\n` +
      `- **Resolution:** ${layer.resolution}\n` +
      `- **Scientific Purpose:** ${layer.description}\n` +
      `- **Interpretation Guide:** ${layer.legendNotes || 'Calibrated planetary raster product'}\n\n` +
      `*If external NASA/USGS tile servers are unreachable, GeoMars displays the corresponding local offline NASA/USGS scientific texture.*`;
    citations = [layer.provider, 'NASA Planetary Data System'];
  }
  // 7. Route & Rover traverse
  else if (
    queryLower.includes('route') ||
    queryLower.includes('rover') ||
    queryLower.includes('traverse') ||
    queryLower.includes('hazard') ||
    queryLower.includes('sol') ||
    queryLower.includes('distance')
  ) {
    if (context.missionRoute && context.missionRoute.distanceKm > 0) {
      const r = context.missionRoute;
      const active = r.activeCandidateRoute;
      content =
        `### Rover Traverse Simulation Analysis\n\n` +
        `- **Corridor:** **${r.startLabel}** → **${r.destinationLabel}**\n` +
        `- **Planned Route Distance:** ${r.distanceKm.toFixed(1)} km\n` +
        `- **Estimated Duration:** ~**${r.estimatedSolDays} Sols** (~${active?.estimatedTravelHours ?? r.estimatedSolDays * 2.5} drive hours at nominal rover speed)\n` +
        `- **Max / Avg Slope:** ${active ? `${active.maxSlopeDeg}° max / ${active.avgSlopeDeg}° avg` : r.difficultyScore}\n` +
        `- **Simulated Hazard Exposure:** ${
          active
            ? `${active.hazardsCrossed.length} hazard zone(s) intersected, ${active.hazardsAvoided} avoided • Simulated confidence: ${active.routeConfidencePct}%`
            : `Difficulty: ${r.difficultyScore}`
        }\n\n` +
        `*Important Disclaimer: Distance, travel time, hazard zones, and route confidence are **simulated deterministic estimates** from our A* planner—never certified safe for real spacecraft operations.*`;
    } else {
      content =
        `### Rover Mission Planning Guide\n\n` +
        `Select any **Start** and **Destination** landmark or surface coordinate in the **Rover Mission Control** panel (or on the 3D Mars globe) to compute a deterministic A* route, elevation cross-section, and hazard clearance estimate.`;
    }
    citations = ['NASA/JPL Mars 2020 Mobility Specs', 'MOLA Altimetry Model'];
  }
  // 8. Comparison
  else if (queryLower.includes('compare') || queryLower.includes('versus') || queryLower.includes('difference')) {
    content =
      `### Martian Landmark Comparison\n\n` +
      `- **Jezero Crater (-2,560 m):** Ancient lake-delta basin with clays and carbonates; active Perseverance sample-caching site.\n` +
      `- **Gale Crater (-4,450 m):** Deep basin holding 5.5 km Mount Sharp; active Curiosity site tracking lake-to-desert transition.\n` +
      `- **Olympus Mons (+21,287 m):** Giant shield volcano with near-vacuum summit pressure (<0.7 mbar) and 8 km peripheral scarp.\n` +
      `- **Valles Marineris (-7,000 m):** 4,000 km tectonic rift system with exposed deep crust and hydrated sulfates.\n` +
      `- **Nili Fossae (-1,850 m) & Mawrth Vallis (-2,240 m):** High-value ancient phyllosilicate clay & carbonate astrobiology provinces.`;
    citations = ['NASA PDS', 'USGS Astrogeology', 'ESA Mars Express'];
  }
  // 9. Default contextual answer
  else {
    const coord = context.selectedCoordinate;
    const siteName = context.selectedSite?.name || 'Martian Global Orbit';
    content =
      `### GeoMars XR Science Assistant\n\n` +
      `In response to **"${userQuery}"** while inspecting **${siteName}**:\n\n` +
      `**Verified Planetary Facts:**\n` +
      `- Mars mean radius is **3,389.5 km**, gravity is **3.72 m/s² (0.38 g)**, solar day (Sol) is **24h 39m 35s**, and mean surface pressure is **6.1 mbar CO₂ (95.3%)**.\n` +
      `- **Active Telemetry Context:** ${
        coord ? formatMarsCoordinate(coord.lat, coord.lng) : '18.38° N, 77.58° E'
      } • Layer: **${context.activeLayer.name}** (${context.activeLayer.resolution}).\n\n` +
      `Try asking: *"Why is Mars red?"*, *"Could humans survive on Mars?"*, *"What did Perseverance discover?"*, *"Where is the best location for scientific exploration?"*, or *"Explain the selected Martian terrain."*`;
  }

  return {
    id: `ai-${Date.now()}`,
    role: 'assistant',
    content,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    citations,
    mode: 'verified-corpus'
  };
}
