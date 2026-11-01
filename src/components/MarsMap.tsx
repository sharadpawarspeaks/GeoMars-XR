import { useEffect, useRef, useState, useCallback } from 'react';
import type { FC } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import ImageLayer from 'ol/layer/Image';
import TileWMS from 'ol/source/TileWMS';
import ImageStatic from 'ol/source/ImageStatic';
import WMTS from 'ol/source/WMTS';
import WMTSTileGrid from 'ol/tilegrid/WMTS';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import LineString from 'ol/geom/LineString';
import { Style, Stroke, Fill, Circle as CircleStyle, Text } from 'ol/style';
import { defaults as defaultControls } from 'ol/control';
import type { MapBrowserEvent } from 'ol';

import type { MapLayerConfig, MarsCoordinate, MarsSite, MissionRoutePlan, MapOverlaysConfig } from '../types/mars';
import { MARS_SITES } from '../data/marsSites';
import { formatElevation, intermediateMarsPoint } from '../utils/marsMath';
import {
  ZoomIn,
  ZoomOut,
  Crosshair,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  Loader2,
  X,
  Maximize2
} from 'lucide-react';

interface MarsMapProps {
  activeLayer: MapLayerConfig;
  selectedCoordinate: MarsCoordinate | null;
  selectedSite: MarsSite | null;
  missionRoute: MissionRoutePlan;
  overlays: MapOverlaysConfig;
  layerOpacity: number;
  viewMode: '2d' | '3d';
  onChangeViewMode: (mode: '2d' | '3d') => void;
  onSelectCoordinate: (coord: MarsCoordinate) => void;
  onSelectSite: (site: MarsSite | null) => void;
  onLoadingChange: (loading: boolean) => void;
}

export const MarsMap: FC<MarsMapProps> = ({
  activeLayer,
  selectedCoordinate,
  selectedSite,
  missionRoute,
  overlays,
  layerOpacity,
  viewMode,
  onChangeViewMode,
  onSelectCoordinate,
  onSelectSite,
  onLoadingChange
}) => {
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const bgImageLayerRef = useRef<ImageLayer<ImageStatic> | null>(null);
  const baseTileLayerRef = useRef<TileLayer<WMTS | TileWMS> | null>(null);
  const vectorSourceRef = useRef<VectorSource>(new VectorSource());
  const routeSourceRef = useRef<VectorSource>(new VectorSource());

  const getLayerTexture = (layerId: string): string => {
    switch (layerId) {
      case 'elevation-mola':
        return '/textures/mars_mola_color.jpg';
      case 'hillshade-mola':
        return '/textures/mars_hillshade.jpg';
      case 'themis-day':
        return '/textures/mars_themis_day.jpg';
      case 'themis-night':
        return '/textures/mars_themis_night.jpg';
      case 'false-color-mineral':
        return '/textures/mars_false_color.jpg';
      case 'slope-map':
      case 'terrain-roughness':
        return '/textures/mars_roughness.jpg';
      case 'regional-imagery':
      case 'ctx-mosaic':
        return '/textures/mars_ctx.jpg';
      case 'hirise-regional':
        return '/textures/mars_hirise.jpg';
      case 'visual-imagery':
      default:
        return '/textures/mars_surface_2k.jpg';
    }
  };

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [hoveredCoordinate, setHoveredCoordinate] = useState<MarsCoordinate | null>(null);
  const [isMarsDropdownOpen, setIsMarsDropdownOpen] = useState(false);

  // Helper: create WMTS source for NASA Mars Trek
  const createNasaWmtsSource = useCallback((layerConfig: MapLayerConfig) => {
    const resolutions: number[] = [];
    const matrixIds: string[] = [];

    for (let z = 0; z <= 8; z++) {
      matrixIds.push(z.toString());
      resolutions.push(0.703125 / Math.pow(2, z));
    }

    const tileGrid = new WMTSTileGrid({
      origin: [-180, 90],
      resolutions,
      matrixIds,
      tileSize: [256, 256]
    });

    const layerId = layerConfig.layerIdentifier || 'Mars_Viking_MDIM21_ClrMosaic_global_232m';
    const wmtsUrl =
      layerConfig.wmtsTemplate ||
      `https://trek.nasa.gov/tiles/Mars/EQ/${layerId}/1.0.0/default/default028mm/{TileMatrix}/{TileRow}/{TileCol}.jpg`;

    const source = new WMTS({
      url: wmtsUrl,
      layer: layerId,
      matrixSet: 'default028mm',
      format: 'image/jpeg',
      projection: 'EPSG:4326',
      tileGrid,
      style: 'default',
      wrapX: true,
      crossOrigin: 'anonymous',
      requestEncoding: 'REST'
    });

    source.on('tileloadstart', () => {
      setIsLoading(true);
      onLoadingChange(true);
    });

    source.on('tileloadend', () => {
      setIsLoading(false);
      onLoadingChange(false);
      setLoadError(null);
    });

    source.on('tileloaderror', () => {
      setIsLoading(false);
      onLoadingChange(false);
      setLoadError('Some NASA Mars Trek tiles experienced a network timeout. Retrying in background...');
    });

    return source;
  }, [onLoadingChange]);

  // Helper: create WMS source for USGS Astrogeology
  const createUsgsWmsSource = useCallback((layerConfig: MapLayerConfig) => {
    const source = new TileWMS({
      url: layerConfig.endpointUrl || 'https://planetarymaps.usgs.gov/cgi-bin/mapserv?map=/maps/mars/mars_simp_cyl.map',
      params: {
        LAYERS: layerConfig.layerIdentifier || 'MDIM21_color',
        TILED: true,
        VERSION: '1.1.1',
        STYLES: '',
        FORMAT: 'image/jpeg'
      },
      projection: 'EPSG:4326',
      crossOrigin: 'anonymous'
    });

    source.on('tileloadstart', () => {
      setIsLoading(true);
      onLoadingChange(true);
    });

    source.on('tileloadend', () => {
      setIsLoading(false);
      onLoadingChange(false);
      setLoadError(null);
    });

    source.on('tileloaderror', () => {
      setIsLoading(false);
      onLoadingChange(false);
      setLoadError('USGS Astrogeology tile service unavailable. Please check connection or switch layer.');
    });

    return source;
  }, [onLoadingChange]);

  // Initialize OpenLayers Map once
  useEffect(() => {
    if (!mapElementRef.current || mapRef.current) return;

    const initialSource =
      activeLayer.serviceType === 'wms'
        ? createUsgsWmsSource(activeLayer)
        : createNasaWmtsSource(activeLayer);

    const normOpacity = Math.max(0.1, Math.min(1, layerOpacity / 100));

    // Local 2K raster foundation layer
    const bgImageSource = new ImageStatic({
      url: getLayerTexture(activeLayer.id),
      imageExtent: [-180, -90, 180, 90],
      projection: 'EPSG:4326'
    });
    const bgImageLayer = new ImageLayer({
      source: bgImageSource,
      zIndex: 1,
      opacity: normOpacity
    });
    bgImageLayerRef.current = bgImageLayer;

    // Live NASA WMTS / USGS WMS tile layer
    const baseLayer = new TileLayer({
      source: initialSource,
      zIndex: 2,
      opacity: normOpacity
    });
    baseTileLayerRef.current = baseLayer;

    const vectorLayer = new VectorLayer({
      source: vectorSourceRef.current,
      zIndex: 20
    });

    const routeLayer = new VectorLayer({
      source: routeSourceRef.current,
      zIndex: 30
    });

    // Create View in EPSG:4326 (Centered around Jezero Crater & Valles Marineris)
    const view = new View({
      projection: 'EPSG:4326',
      center: [20, 5],
      zoom: 2.2,
      minZoom: 1.5,
      maxZoom: 8,
      extent: [-200, -90, 200, 90]
    });

    const map = new Map({
      target: mapElementRef.current,
      layers: [bgImageLayer, baseLayer, vectorLayer, routeLayer],
      view,
      controls: defaultControls({ zoom: false, rotate: false, attribution: false })
    });

    mapRef.current = map;

    // Pointer move listener
    map.on('pointermove', (evt: MapBrowserEvent<PointerEvent>) => {
      if (evt.dragging) return;
      const coordinate = evt.coordinate;
      if (coordinate && coordinate.length >= 2) {
        setHoveredCoordinate({
          lng: coordinate[0],
          lat: coordinate[1]
        });
      }
    });

    // Map click listener
    map.on('singleclick', (evt: MapBrowserEvent<PointerEvent>) => {
      const coordinate = evt.coordinate;
      if (!coordinate || coordinate.length < 2) return;

      const lng = coordinate[0];
      const lat = coordinate[1];

      let clickedSite: MarsSite | null = null;
      map.forEachFeatureAtPixel(evt.pixel, (feature) => {
        const siteData = feature.get('siteData') as MarsSite | undefined;
        if (siteData) {
          clickedSite = siteData;
          return true;
        }
      });

      if (clickedSite) {
        onSelectSite(clickedSite);
        onSelectCoordinate({
          lat: (clickedSite as MarsSite).lat,
          lng: (clickedSite as MarsSite).lng,
          elevationMeters: (clickedSite as MarsSite).elevationMeters
        });
      } else {
        onSelectSite(null);
        onSelectCoordinate({
          lat: parseFloat(lat.toFixed(2)),
          lng: parseFloat(lng.toFixed(2))
        });
      }
    });

    return () => {
      map.setTarget(undefined);
      mapRef.current = null;
    };
  }, [createNasaWmtsSource, createUsgsWmsSource, onSelectCoordinate, onSelectSite]);

  // Update Base Layer Source & Opacity dynamically
  useEffect(() => {
    const normOpacity = Math.max(0.1, Math.min(1, layerOpacity / 100));

    // Update local background static image
    if (bgImageLayerRef.current) {
      bgImageLayerRef.current.setOpacity(normOpacity);
      bgImageLayerRef.current.setSource(
        new ImageStatic({
          url: getLayerTexture(activeLayer.id),
          imageExtent: [-180, -90, 180, 90],
          projection: 'EPSG:4326'
        })
      );
    }

    if (baseTileLayerRef.current) {
      baseTileLayerRef.current.setOpacity(normOpacity);

      try {
        const newSource =
          activeLayer.serviceType === 'wms'
            ? createUsgsWmsSource(activeLayer)
            : createNasaWmtsSource(activeLayer);

        baseTileLayerRef.current.setSource(newSource);
        setLoadError(null);
      } catch (err) {
        console.error('Error switching tile layer:', err);
        setLoadError('Failed to initialize selected Mars tile service.');
      }
    }

    // Zoom into high-detail regional imagery when HiRISE is activated
    if (activeLayer.id === 'hirise-regional' && mapRef.current) {
      const view = mapRef.current.getView();
      view.animate({
        center: [77.45, 18.44],
        zoom: 4.5,
        duration: 700
      });
    }
  }, [activeLayer, layerOpacity, createNasaWmtsSource, createUsgsWmsSource]);

  // Update Mars Landmarks Features in Vector Layer based on Overlays
  useEffect(() => {
    const source = vectorSourceRef.current;
    source.clear();

    MARS_SITES.forEach((site) => {
      // Filter based on overlay switches
      if (site.category === 'rover' && !overlays.roverLandingSites) return;
      if (site.category === 'lander' && !overlays.missionLocations) return;
      if ((site.category === 'volcano' || site.category === 'canyon' || site.category === 'basin') && !overlays.pointsOfInterest) {
        return;
      }

      const feature = new Feature({
        geometry: new Point([site.lng, site.lat]),
        siteData: site
      });

      const isSelected = selectedSite?.id === site.id;

      // Color based on category
      const color =
        site.category === 'rover'
          ? '#338BFF' // Blue pin for Jezero / Curiosity rovers matching reference
          : site.category === 'volcano'
          ? '#FFFFFF'
          : site.category === 'canyon'
          ? '#A7B8C8'
          : '#FF6B35';

      feature.setStyle(
        new Style({
          image: new CircleStyle({
            radius: isSelected ? 7 : 4.5,
            fill: new Fill({ color }),
            stroke: new Stroke({
              color: '#FFFFFF',
              width: isSelected ? 2.5 : 1.5
            })
          }),
          text: new Text({
            text: site.name.split(' (')[0],
            offsetY: isSelected ? -16 : -12,
            font: isSelected
              ? 'bold 12px Inter, sans-serif'
              : '500 11px Inter, sans-serif',
            fill: new Fill({ color: isSelected ? '#FFFFFF' : '#F4F7FA' }),
            stroke: new Stroke({ color: '#020A10', width: 3 }),
            backgroundFill: isSelected ? new Fill({ color: 'rgba(4, 18, 27, 0.85)' }) : undefined,
            padding: isSelected ? [2, 6, 2, 6] : undefined
          })
        })
      );

      source.addFeature(feature);
    });
  }, [selectedSite, overlays]);

  // Update Selected Pin & Route Line
  useEffect(() => {
    const routeSource = routeSourceRef.current;
    routeSource.clear();

    if (overlays.plannedRoute && missionRoute.start && missionRoute.destination) {
      const startLng = 'lng' in missionRoute.start ? missionRoute.start.lng : 0;
      const startLat = 'lat' in missionRoute.start ? missionRoute.start.lat : 0;
      const destLng = 'lng' in missionRoute.destination ? missionRoute.destination.lng : 0;
      const destLat = 'lat' in missionRoute.destination ? missionRoute.destination.lat : 0;

      // Geodesic curve interpolation for planetary map
      const lineCoords: [number, number][] = [];
      const steps = 32;
      for (let i = 0; i <= steps; i++) {
        const frac = i / steps;
        const pt = intermediateMarsPoint(startLat, startLng, destLat, destLng, frac);
        lineCoords.push([pt.lng, pt.lat]);
      }

      const lineFeature = new Feature({
        geometry: new LineString(lineCoords)
      });

      lineFeature.setStyle(
        new Style({
          stroke: new Stroke({
            color: '#FF6B35',
            width: 3,
            lineDash: [8, 5]
          })
        })
      );
      routeSource.addFeature(lineFeature);

      // Add Start & End Waypoint indicators
      const startFeature = new Feature({
        geometry: new Point([startLng, startLat])
      });
      startFeature.setStyle(
        new Style({
          image: new CircleStyle({
            radius: 8,
            fill: new Fill({ color: 'rgba(255, 107, 53, 0.4)' }),
            stroke: new Stroke({ color: '#FF6B35', width: 2.5 })
          })
        })
      );

      const destFeature = new Feature({
        geometry: new Point([destLng, destLat])
      });
      destFeature.setStyle(
        new Style({
          image: new CircleStyle({
            radius: 8,
            fill: new Fill({ color: 'rgba(51, 139, 255, 0.4)' }),
            stroke: new Stroke({ color: '#338BFF', width: 2.5 })
          })
        })
      );

      routeSource.addFeature(startFeature);
      routeSource.addFeature(destFeature);
    }
  }, [overlays.plannedRoute, missionRoute]);

  // Fly/Pan to specific location when selectedSite changes
  useEffect(() => {
    if (!selectedSite || !mapRef.current) return;
    const view = mapRef.current.getView();
    view.animate({
      center: [selectedSite.lng, selectedSite.lat],
      zoom: Math.max(view.getZoom() || 2, 3.8),
      duration: 650
    });
  }, [selectedSite]);

  const handleZoomIn = () => {
    if (!mapRef.current) return;
    const view = mapRef.current.getView();
    view.animate({ zoom: (view.getZoom() || 2) + 0.8, duration: 200 });
  };

  const handleZoomOut = () => {
    if (!mapRef.current) return;
    const view = mapRef.current.getView();
    view.animate({ zoom: (view.getZoom() || 2) - 0.8, duration: 200 });
  };

  const handleResetOrientation = () => {
    if (!mapRef.current) return;
    const view = mapRef.current.getView();
    view.animate({ center: [20, 5], zoom: 2.2, duration: 400 });
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      mapElementRef.current?.parentElement?.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const activeLat = hoveredCoordinate?.lat ?? selectedCoordinate?.lat ?? (selectedSite ? selectedSite.lat : 18.44);
  const activeLng = hoveredCoordinate?.lng ?? selectedCoordinate?.lng ?? (selectedSite ? selectedSite.lng : 77.45);
  const activeElev = selectedCoordinate?.elevationMeters ?? (selectedSite ? selectedSite.elevationMeters : -2536);

  return (
    <div className="relative w-full h-full bg-[#080B12] overflow-hidden select-none">
      {/* Map Canvas */}
      <div
        ref={mapElementRef}
        id="mars-openlayers-viewport"
        className="w-full h-full focus:outline-none"
      />

      {/* 1. Upper-Left: Compact Planet Selector (Mars ▾) */}
      <div className="absolute top-4 left-4 z-10">
        <div className="relative">
          <button
            onClick={() => setIsMarsDropdownOpen(!isMarsDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111824]/90 border border-[#273244] hover:border-[#FF6B35]/60 shadow-xl backdrop-blur-md transition-all text-xs cursor-pointer"
          >
            <img src="/geomars-logo.png" alt="Mars" className="w-4 h-4 object-contain shrink-0" />
            <span className="font-bold text-[#F5F7FA]">Mars</span>
            <ChevronDown className="w-3 h-3 text-[#94A3B8]" />
          </button>

          {isMarsDropdownOpen && (
            <div className="absolute top-9 left-0 bg-[#111824] border border-[#273244] rounded-xl shadow-2xl p-1 z-30 min-w-[130px] text-xs">
              <div className="px-2.5 py-1.5 text-[11px] font-semibold text-[#FF6B35] bg-[#0D121C] rounded-lg">
                Mars (Selected)
              </div>
              <div className="px-2.5 py-1.5 text-[11px] text-[#94A3B8] cursor-not-allowed">
                Phobos (Planned)
              </div>
              <div className="px-2.5 py-1.5 text-[11px] text-[#94A3B8] cursor-not-allowed">
                Deimos (Planned)
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Upper-Right: Segmented View Selector [ 2D | 3D ] */}
      <div className="absolute top-4 right-4 z-10">
        <div className="flex items-center gap-1 bg-[#111824]/90 border border-[#273244] p-1 rounded-xl shadow-xl backdrop-blur-md">
          <button
            onClick={() => onChangeViewMode('2d')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === '2d'
                ? 'bg-[#FF6B35] text-white shadow-md'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            2D
          </button>
          <button
            onClick={() => onChangeViewMode('3d')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === '3d'
                ? 'bg-[#FF6B35] text-white shadow-md'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            3D
          </button>
        </div>
      </div>

      {/* 3. Floating Callout Card for Selected Landmark */}
      {selectedSite && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 pointer-events-auto">
          <div className="bg-[#111824]/95 border border-[#273244] rounded-xl px-3.5 py-2 shadow-2xl backdrop-blur-md flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-[#338BFF] animate-pulse shrink-0" />
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-[#F5F7FA] leading-tight">
                {selectedSite.name.split(' (')[0]}
              </span>
              <span className="text-[10px] text-[#94A3B8]">
                {selectedSite.mission || (selectedSite.category === 'rover' ? 'Perseverance Rover' : 'Landmark Site')}
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-[#94A3B8]" />
          </div>
        </div>
      )}

      {/* 4. Right Vertical Map Controls Toolbar */}
      <div className="absolute top-1/2 -translate-y-1/2 right-4 z-10 flex flex-col gap-2">
        <div className="flex flex-col bg-[#111824]/90 border border-[#273244] rounded-xl overflow-hidden shadow-2xl backdrop-blur-md">
          {/* North Compass Reset */}
          <button
            onClick={handleResetOrientation}
            title="Reset North Orientation"
            className="p-2.5 text-[#F5F7FA] hover:bg-[#0D121C] border-b border-[#273244] flex items-center justify-center transition-colors cursor-pointer"
          >
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold text-[#FF6B35] leading-none mb-0.5">N</span>
              <div className="w-0 h-0 border-x-4 border-x-transparent border-b-6 border-b-[#FF6B35]" />
            </div>
          </button>

          {/* Zoom In */}
          <button
            onClick={handleZoomIn}
            title="Zoom In"
            className="p-2.5 text-[#F5F7FA] hover:bg-[#0D121C] border-b border-[#273244] transition-colors flex items-center justify-center cursor-pointer"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          {/* Zoom Out */}
          <button
            onClick={handleZoomOut}
            title="Zoom Out"
            className="p-2.5 text-[#F5F7FA] hover:bg-[#0D121C] border-b border-[#273244] transition-colors flex items-center justify-center cursor-pointer"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          {/* Recenter */}
          <button
            onClick={handleResetOrientation}
            title="Recenter Map"
            className="p-2.5 text-[#F5F7FA] hover:bg-[#0D121C] border-b border-[#273244] transition-colors flex items-center justify-center cursor-pointer"
          >
            <Crosshair className="w-4 h-4" />
          </button>

          {/* Full-Screen Map Toggle */}
          <button
            onClick={handleToggleFullscreen}
            title="Full-Screen Map View"
            className="p-2.5 text-[#F5F7FA] hover:bg-[#0D121C] transition-colors flex items-center justify-center cursor-pointer"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 5. Lower-Left: Geographic Scale Bar */}
      <div className="absolute bottom-4 left-4 z-10 pointer-events-none">
        <div className="bg-[#111824]/85 border border-[#273244] px-3 py-1.5 rounded-lg shadow-lg backdrop-blur-md flex flex-col gap-0.5">
          <div className="flex justify-between text-[9px] text-[#94A3B8] font-mono w-40">
            <span>0</span>
            <span>500</span>
            <span>1,000 km</span>
          </div>
          <div className="w-40 h-1.5 border-b-2 border-l-2 border-r-2 border-[#FF6B35] relative">
            <div className="absolute left-1/2 top-0 w-0.5 h-1.5 bg-[#FF6B35]" />
          </div>
        </div>
      </div>

      {/* 6. Lower-Right: Comprehensive Map Information Strip */}
      <div className="absolute bottom-4 right-4 z-10 pointer-events-none">
        <div className="bg-[#111824]/90 border border-[#273244] rounded-lg px-3 py-1.5 shadow-xl backdrop-blur-md flex items-center gap-3 font-mono text-[11px] text-[#94A3B8]">
          <span>
            Coords: <strong className="text-[#F5F7FA]">{activeLat.toFixed(2)}° {activeLat >= 0 ? 'N' : 'S'}, {activeLng.toFixed(2)}° {activeLng >= 0 ? 'E' : 'W'}</strong>
          </span>
          <span className="text-[#273244]">|</span>
          <span>
            Elev: <strong className="text-[#F5F7FA]">{formatElevation(activeElev)}</strong>
          </span>
          <span className="text-[#273244]">|</span>
          <span className="truncate max-w-[180px]">
            Layer: <strong className="text-[#FF6B35]">{activeLayer.name}</strong>
          </span>
          <span className="text-[#273244]">|</span>
          <span>
            Res: <strong className="text-[#F5F7FA]">{activeLayer.resolution}</strong>
          </span>
          <span className="text-[#273244]">|</span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#35C98A]" />
            <strong className="text-[#35C98A]">ONLINE</strong>
          </span>
        </div>
      </div>

      {/* Loading Indicator Toast */}
      {isLoading && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <div className="flex items-center gap-2 bg-[#111824]/95 border border-[#273244] text-[#94A3B8] text-xs px-3.5 py-1.5 rounded-full shadow-lg backdrop-blur-md">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FF6B35]" />
            <span className="text-[11px]">Streaming NASA planetary tiles...</span>
          </div>
        </div>
      )}

      {/* Service Warning Toast */}
      {loadError && (
        <div className="absolute top-16 right-4 z-20 max-w-sm animate-in fade-in">
          <div className="bg-[#111824]/95 border border-[#FF6B35]/40 text-[#94A3B8] text-xs p-3 rounded-xl shadow-2xl backdrop-blur-md flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-[#FF6B35] shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-medium text-[#FF6B35] text-xs mb-0.5">Planetary Service Notice</div>
              <p className="text-[11px] leading-relaxed text-[#94A3B8]">{loadError}</p>
            </div>
            <button
              onClick={() => setLoadError(null)}
              className="text-[#94A3B8] hover:text-[#F5F7FA] p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
