import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import type { Destination } from '../types/destination';
import {
  Layers,
  LocateFixed,
  RotateCcw,
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { buildGoogleMapsDirectionsUrl } from '../utils/maps';

interface InteractiveMapProps {
  destinations: Destination[];
  selectedRadius: number;
  onRadiusChange?: (radius: number) => void;
  onSelectDestination: (dest: Destination) => void;
  selectedDestinationId?: string | null;
  onMarkerClick?: (dest: Destination) => void;
  userLocation: { lat: number; lng: number } | null;
  onUserLocationChange?: (loc: { lat: number; lng: number }) => void;
  activeCategory?: string;
  isCompact?: boolean;
}

type MapStyleId = 'map' | 'satellite' | 'terrain' | 'osm';

interface TileLayerConfig {
  label: string;
  url: string;
  overlayUrl?: string;
  attribution: string;
  subdomains?: string;
  maxZoom: number;
}

const TILE_LAYERS: Record<MapStyleId, TileLayerConfig> = {
  map: {
    label: 'Map',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Street Map',
    maxZoom: 19,
  },
  satellite: {
    label: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    overlayUrl:
      'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Satellite',
    maxZoom: 19,
  },
  terrain: {
    label: 'Terrain',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Topo',
    maxZoom: 19,
  },
  osm: {
    label: 'Streets',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19,
  },
};

export const SHIVAMOGGA_COORDS: [number, number] = [13.9299, 75.5681];
export const SHIVAMOGGA_BOUNDS_150KM: [[number, number], [number, number]] = [
  [12.6, 74.2],
  [15.3, 76.9],
];

const CATEGORY_ICONS: Record<string, string> = {
  Waterfalls: '💧',
  'Mountains & Hills': '⛰️',
  Nature: '🌿',
  Wildlife: '🐘',
  Trekking: '🥾',
  Temples: '🛕',
  'Historical Places': '🏛️',
  Forts: '🏰',
  Viewpoints: '🏞️',
  Adventure: '🧗',
  Beaches: '🌊',
  Forests: '🌳',
  Camping: '🏕️',
  'Coffee Plantations': '☕',
  'Dams & Reservoirs': '🏗️',
  'Heritage & Culture': '🏘️',
};

const CATEGORY_COLORS: Record<string, string> = {
  Waterfalls: '#0284C7',
  'Mountains & Hills': '#059669',
  Nature: '#16A34A',
  Wildlife: '#D97706',
  Trekking: '#0D9488',
  Temples: '#EAB308',
  'Historical Places': '#B45309',
  Forts: '#B45309',
  Viewpoints: '#EA580C',
  Adventure: '#DC2626',
  Beaches: '#0EA5E9',
  Forests: '#15803D',
  Camping: '#65A30D',
  'Coffee Plantations': '#78350F',
  'Dams & Reservoirs': '#2563EB',
  'Heritage & Culture': '#CA8A04',
};

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  destinations,
  selectedRadius,
  onRadiusChange: _onRadiusChange,
  onSelectDestination,
  selectedDestinationId,
  onMarkerClick,
  userLocation,
  onUserLocationChange,
  activeCategory = 'All',
  isCompact: _isCompact = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayersRef = useRef<L.TileLayer[]>([]);
  const radiusGroupRef = useRef<L.LayerGroup | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const markersByIdRef = useRef<globalThis.Map<string, L.Marker>>(new globalThis.Map());
  const userMarkerRef = useRef<L.Marker | null>(null);

  const [mapStyle, setMapStyle] = useState<MapStyleId>('map');
  const [currentZoom, setCurrentZoom] = useState<number>(9);
  const [isInteractingMobile, setIsInteractingMobile] = useState<boolean>(false);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [isLayerMenuOpen, setIsLayerMenuOpen] = useState<boolean>(false);

  // Global modal opener for Leaflet HTML popups
  useEffect(() => {
    (window as any).__openDestModal = (destId: string) => {
      const dest = destinations.find((d) => d.id === destId);
      if (dest) {
        onSelectDestination(dest);
      }
    };
    return () => {
      delete (window as any).__openDestModal;
    };
  }, [destinations, onSelectDestination]);

  // Filter destinations by radius and category
  const filteredDestinations = useMemo(() => {
    return destinations.filter((dest) => {
      const withinRadius = dest.distanceFromShivamogga <= selectedRadius;
      const matchesCategory =
        activeCategory === 'All' ||
        dest.category === activeCategory ||
        (activeCategory === 'Hills' && (dest.category === 'Mountains & Hills' || dest.category === 'Trekking')) ||
        (activeCategory === 'History' && (dest.category === 'Historical Places' || dest.category === 'Forts'));
      return withinRadius && matchesCategory;
    });
  }, [destinations, selectedRadius, activeCategory]);

  // Initialize Map Once
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container || mapInstanceRef.current) return;

    const map = L.map(container, {
      center: SHIVAMOGGA_COORDS,
      zoom: 9,
      minZoom: 7,
      maxZoom: 18,
      zoomControl: false,
      scrollWheelZoom: false, // Prevents scroll hijacking on desktop
    });

    // Custom Zoom Control at bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const radiusGroup = L.layerGroup().addTo(map);
    const markersGroup = L.layerGroup().addTo(map);

    radiusGroupRef.current = radiusGroup;
    markersGroupRef.current = markersGroup;

    // Shivamogga Hub Center Marker
    const hubIcon = L.divIcon({
      className: 'shivamogga-hub-marker',
      html: `
        <div class="shivamogga-hub-shell" title="Shivamogga Center Hub (150 KM Reference)">
          <div class="shivamogga-hub-ring"></div>
          <div class="shivamogga-hub-ring ring-delay"></div>
          <div class="shivamogga-hub-sweep"></div>
          <div class="shivamogga-hub-badge">
            <span class="hub-icon">👑</span>
          </div>
        </div>
      `,
      iconSize: [52, 52],
      iconAnchor: [26, 26],
    });

    const hubMarker = L.marker(SHIVAMOGGA_COORDS, {
      icon: hubIcon,
      zIndexOffset: 1000,
    }).addTo(map);

    hubMarker.bindTooltip(
      `<b>SHIVAMOGGA CENTER HUB</b><br/><span style="font-size: 11px; color: #D4AF37;">13.9299° N, 75.5681° E &bull; 150 KM Center</span>`,
      {
        permanent: false,
        direction: 'top',
        offset: [0, -22],
        className: 'hub-tooltip',
      }
    );

    hubMarker.on('click', () => {
      map.flyTo(SHIVAMOGGA_COORDS, 9, { duration: 1 });
    });

    map.on('zoomend', () => {
      setCurrentZoom(map.getZoom());
    });

    mapInstanceRef.current = map;

    // ResizeObserver to ensure tiles never render grey or broken
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize({ pan: false });
    });
    resizeObserver.observe(container);

    const handleWindowResize = () => {
      map.invalidateSize({ pan: false });
    };
    window.addEventListener('resize', handleWindowResize);

    // Initial size invalidation
    const timer = setTimeout(() => {
      map.invalidateSize({ pan: false });
    }, 150);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleWindowResize);
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Layers when mapStyle changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    tileLayersRef.current.forEach((layer) => {
      map.removeLayer(layer);
    });
    tileLayersRef.current = [];

    const config = TILE_LAYERS[mapStyle];
    const baseLayer = L.tileLayer(config.url, {
      attribution: config.attribution,
      maxZoom: config.maxZoom,
      subdomains: config.subdomains || 'abc',
    }).addTo(map);

    tileLayersRef.current.push(baseLayer);

    if (config.overlayUrl) {
      const overlayLayer = L.tileLayer(config.overlayUrl, {
        maxZoom: config.maxZoom,
        subdomains: config.subdomains || 'abc',
      }).addTo(map);
      tileLayersRef.current.push(overlayLayer);
    }
  }, [mapStyle]);

  // Draw 150 KM Radius Boundary & Reference Rings
  useEffect(() => {
    const group = radiusGroupRef.current;
    if (!group) return;

    group.clearLayers();

    // 150 KM Outer Limit Circle (Faint Golden Dashed Circle)
    L.circle(SHIVAMOGGA_COORDS, {
      radius: 150000,
      color: 'rgba(212, 175, 55, 0.45)',
      weight: 1.5,
      dashArray: '6, 8',
      fillColor: 'rgba(20, 61, 48, 0.08)',
      fillOpacity: 0.15,
      interactive: false,
      className: 'map-radius-ring',
    }).addTo(group);

    // 100 KM Inner Reference Ring
    L.circle(SHIVAMOGGA_COORDS, {
      radius: 100000,
      color: 'rgba(56, 131, 108, 0.28)',
      weight: 1,
      dashArray: '4, 6',
      fill: false,
      interactive: false,
    }).addTo(group);

    // 50 KM Core Reference Ring
    L.circle(SHIVAMOGGA_COORDS, {
      radius: 50000,
      color: 'rgba(56, 131, 108, 0.22)',
      weight: 1,
      dashArray: '3, 5',
      fill: false,
      interactive: false,
    }).addTo(group);

    // Dynamic Selected Radius Boundary Ring if different from 150
    if (selectedRadius < 150) {
      L.circle(SHIVAMOGGA_COORDS, {
        radius: selectedRadius * 1000,
        color: '#D4AF37',
        weight: 2,
        dashArray: '8, 8',
        fillColor: '#D4AF37',
        fillOpacity: 0.05,
        interactive: false,
      }).addTo(group);
    }
  }, [selectedRadius]);

  // User GPS Location Marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (userMarkerRef.current) {
      map.removeLayer(userMarkerRef.current);
      userMarkerRef.current = null;
    }

    if (userLocation) {
      const userIcon = L.divIcon({
        className: 'user-gps-marker',
        html: `
          <div class="user-gps-shell">
            <div class="user-gps-ring"></div>
            <div class="user-gps-dot"></div>
          </div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });

      const marker = L.marker([userLocation.lat, userLocation.lng], {
        icon: userIcon,
        zIndexOffset: 900,
      }).addTo(map);

      marker.bindTooltip('<b>Your Current Location</b>', {
        permanent: false,
        direction: 'top',
        offset: [0, -12],
      });

      userMarkerRef.current = marker;
    }
  }, [userLocation]);

  // Build Marker Popup HTML
  const createPopupHtml = useCallback(
    (dest: Destination) => {
      const directionsUrl = buildGoogleMapsDirectionsUrl(dest, userLocation);
      const icon = CATEGORY_ICONS[dest.category] || '📍';
      const color = CATEGORY_COLORS[dest.category] || '#059669';

      return `
        <div class="map-popup-card">
          <div class="map-popup-image-wrap">
            <img src="${escapeHtml(dest.images[0])}" alt="${escapeHtml(dest.name)}" class="map-popup-image" loading="lazy" />
            <div class="map-popup-image-overlay"></div>
            <span class="map-popup-category-badge" style="background: ${color};">
              <span>${icon}</span>
              <span>${escapeHtml(dest.category)}</span>
            </span>
            <span class="map-popup-dist-badge">
              📍 ${dest.distanceFromShivamogga} KM from Shivamogga
            </span>
          </div>
          <div class="map-popup-body">
            <h4 class="map-popup-title">${escapeHtml(dest.name)}</h4>
            <div class="map-popup-meta">
              <span class="map-popup-meta-item">🗓️ ${escapeHtml(dest.bestTimeToVisit)}</span>
              <span class="map-popup-meta-item">🏛️ ${escapeHtml(dest.district)} District</span>
            </div>
            <p class="map-popup-snippet">${escapeHtml(dest.shortDescription)}</p>
            <div class="map-popup-actions">
              <a href="${directionsUrl}" target="_blank" rel="noopener noreferrer" class="map-popup-btn map-btn-navigate" title="Open Google Maps Driving Directions">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
                </svg>
                <span>Navigate</span>
              </a>
              <button onclick="window.__openDestModal('${dest.id}')" class="map-popup-btn map-btn-explore" title="View complete details, photo gallery, travel guide">
                <span>Explore</span>
                <span>&rarr;</span>
              </button>
            </div>
          </div>
        </div>
      `;
    },
    [userLocation]
  );

  // Render Destination Markers with Clustering & Drop Animation
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = markersGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();
    markersByIdRef.current.clear();

    const isZoomedOut = currentZoom < 10 && filteredDestinations.length > 12;

    // Clustering calculation for low zoom
    if (isZoomedOut) {
      const clusterThreshold = 0.085; // ~9km
      const clusters: {
        centerLat: number;
        centerLng: number;
        items: Destination[];
      }[] = [];

      filteredDestinations.forEach((dest) => {
        let added = false;
        for (const cl of clusters) {
          const d = Math.hypot(dest.latitude - cl.centerLat, dest.longitude - cl.centerLng);
          if (d < clusterThreshold) {
            cl.items.push(dest);
            // Re-average center
            cl.centerLat = cl.items.reduce((sum, i) => sum + i.latitude, 0) / cl.items.length;
            cl.centerLng = cl.items.reduce((sum, i) => sum + i.longitude, 0) / cl.items.length;
            added = true;
            break;
          }
        }
        if (!added) {
          clusters.push({
            centerLat: dest.latitude,
            centerLng: dest.longitude,
            items: [dest],
          });
        }
      });

      clusters.forEach((cl) => {
        if (cl.items.length === 1) {
          const dest = cl.items[0];
          addSingleMarker(dest);
        } else {
          // Render Cluster Badge
          const clusterIcon = L.divIcon({
            className: 'dest-cluster-marker',
            html: `
              <div class="dest-cluster-pin" title="Cluster of ${cl.items.length} destinations. Click to zoom in.">
                <span>${cl.items.length}</span>
                <span style="font-size: 8px; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.85;">spots</span>
              </div>
            `,
            iconSize: [46, 46],
            iconAnchor: [23, 23],
          });

          const clusterMarker = L.marker([cl.centerLat, cl.centerLng], {
            icon: clusterIcon,
          }).addTo(group);

          clusterMarker.on('click', () => {
            const bounds = L.latLngBounds(cl.items.map((i) => [i.latitude, i.longitude]));
            map.flyToBounds(bounds, { padding: [40, 40], duration: 0.8 });
          });
        }
      });
    } else {
      // Normal Individual Markers
      filteredDestinations.forEach((dest, index) => {
        addSingleMarker(dest, index * 25);
      });
    }

    function addSingleMarker(dest: Destination, delayMs = 0) {
      const isSelected = selectedDestinationId === dest.id;
      const color = CATEGORY_COLORS[dest.category] || '#059669';
      const icon = CATEGORY_ICONS[dest.category] || '📍';

      const customIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div class="map-pin-anchor" data-dest-id="${dest.id}">
            <div class="map-pin-card ${isSelected ? 'is-active' : ''} ${currentZoom >= 11 ? 'show-label' : ''}" style="--pin-color: ${color}; --pin-delay: ${delayMs}ms;">
              <span class="map-pin-emoji">${icon}</span>
              <span class="map-pin-label">${escapeHtml(dest.name)}</span>
              <span class="map-pin-dist">${dest.distanceFromShivamogga}km</span>
              <div class="map-pin-pulse"></div>
            </div>
            <div class="map-pin-stem" style="--pin-color: ${color};"></div>
            <div class="map-pin-dot" style="--pin-color: ${color};"></div>
          </div>
        `,
        iconSize: [32, 42],
        iconAnchor: [16, 42],
        popupAnchor: [0, -42],
      });

      const marker = L.marker([dest.latitude, dest.longitude], {
        icon: customIcon,
        zIndexOffset: isSelected ? 800 : 100,
      }).addTo(group!);

      marker.bindPopup(createPopupHtml(dest), {
        maxWidth: 320,
        minWidth: 260,
        className: 'dest-leaflet-popup',
        autoPan: true,
        autoPanPadding: [30, 30],
      });

      marker.on('click', () => {
        onMarkerClick?.(dest);
        onSelectDestination(dest);
      });

      markersByIdRef.current.set(dest.id, marker);
    }
  }, [
    filteredDestinations,
    currentZoom,
    selectedDestinationId,
    createPopupHtml,
    onMarkerClick,
    onSelectDestination,
  ]);

  // Synchronize Map View when selectedDestinationId changes externally
  useEffect(() => {
    if (!selectedDestinationId || !mapInstanceRef.current) return;
    const dest = destinations.find((d) => d.id === selectedDestinationId);
    if (!dest) return;

    const map = mapInstanceRef.current;
    map.flyTo([dest.latitude, dest.longitude], Math.max(map.getZoom(), 11), {
      duration: 1.1,
      easeLinearity: 0.3,
    });

    const marker = markersByIdRef.current.get(dest.id);
    if (marker) {
      setTimeout(() => {
        marker.openPopup();
      }, 400);
    }
  }, [selectedDestinationId, destinations]);

  // Reset View to Shivamogga Hub
  const handleResetView = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.closePopup();
    map.flyTo(SHIVAMOGGA_COORDS, 9, { duration: 1 });
  };

  // Locate User GPS
  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        onUserLocationChange?.(loc);
        mapInstanceRef.current?.flyTo([loc.lat, loc.lng], 12, { duration: 1.2 });
      },
      () => {
        setIsLocating(false);
        alert('Could not retrieve your location. Please check browser permissions.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="relative w-full h-full min-h-[380px] bg-charcoal-900 overflow-hidden select-none">
      {/* Map Leaflet Canvas Container */}
      <div ref={mapContainerRef} className="w-full h-full" tabIndex={0} />

      {/* Mobile Scroll Intercept Overlay (Prevents hijacking vertical page scroll) */}
      {!isInteractingMobile && (
        <div
          onClick={() => {
            setIsInteractingMobile(true);
            mapInstanceRef.current?.scrollWheelZoom.enable();
          }}
          className="lg:hidden absolute inset-0 z-[400] bg-charcoal-950/30 backdrop-blur-[1px] flex items-center justify-center cursor-pointer transition-opacity duration-300"
        >
          <div className="px-4 py-2.5 rounded-full bg-charcoal-950/90 border border-gold-500/40 text-gold-300 text-xs font-mono shadow-2xl flex items-center gap-2">
            <span>👆 Tap to interact with map</span>
          </div>
        </div>
      )}

      {/* Mobile Lock button to return to smooth page scroll */}
      {isInteractingMobile && (
        <button
          onClick={() => {
            setIsInteractingMobile(false);
            mapInstanceRef.current?.scrollWheelZoom.disable();
          }}
          className="lg:hidden absolute top-4 left-4 z-[500] px-3 py-1.5 rounded-full bg-charcoal-950/90 border border-forest-600/50 text-cream-200 text-xs font-mono shadow-lg hover:text-gold-300"
        >
          ✕ Lock Map Scroll
        </button>
      )}

      {/* Floating Map Utility Bar (Top Right) */}
      <div className="absolute top-4 right-4 z-[400] flex items-center gap-2">
        {/* Reset View Button */}
        <button
          onClick={handleResetView}
          className="px-3 py-2 rounded-xl bg-charcoal-950/90 hover:bg-forest-900 border border-forest-700/60 text-gold-300 text-xs font-mono flex items-center gap-2 shadow-xl backdrop-blur-md transition-all hover:scale-105 active:scale-95"
          title="Reset map view to Shivamogga 150 KM center"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset View</span>
        </button>

        {/* Locate User Button */}
        <button
          onClick={handleLocateUser}
          className={`p-2 rounded-xl bg-charcoal-950/90 hover:bg-forest-900 border border-forest-700/60 shadow-xl backdrop-blur-md transition-all hover:scale-105 active:scale-95 ${
            isLocating ? 'text-gold-400 animate-spin' : userLocation ? 'text-blue-400' : 'text-cream-200'
          }`}
          title="Find my current GPS location"
        >
          <LocateFixed className="w-4 h-4" />
        </button>

        {/* Map Layers Dropdown Button */}
        <div className="relative">
          <button
            onClick={() => setIsLayerMenuOpen(!isLayerMenuOpen)}
            className="p-2 rounded-xl bg-charcoal-950/90 hover:bg-forest-900 border border-forest-700/60 text-cream-200 hover:text-gold-300 shadow-xl backdrop-blur-md transition-all"
            title="Change map style"
          >
            <Layers className="w-4 h-4" />
          </button>

          {isLayerMenuOpen && (
            <div className="absolute right-0 mt-2 w-36 rounded-2xl bg-charcoal-950/95 border border-forest-700/70 shadow-2xl backdrop-blur-xl p-1.5 flex flex-col gap-1 z-50">
              {(Object.keys(TILE_LAYERS) as MapStyleId[]).map((id) => (
                <button
                  key={id}
                  onClick={() => {
                    setMapStyle(id);
                    setIsLayerMenuOpen(false);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-left text-xs font-mono transition-all flex items-center justify-between ${
                    mapStyle === id
                      ? 'bg-forest-800 text-gold-300 font-bold border border-gold-500/30'
                      : 'text-cream-200 hover:bg-forest-900/60 hover:text-white'
                  }`}
                >
                  <span>{TILE_LAYERS[id].label}</span>
                  {mapStyle === id && <span className="text-gold-400">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating Center Badge (Top Left on Desktop) */}
      <div className="hidden sm:flex absolute top-4 left-4 z-[400] items-center gap-2 px-3 py-1.5 rounded-full bg-charcoal-950/85 border border-forest-700/50 backdrop-blur-md text-[11px] font-mono text-cream-200 shadow-lg pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-gold-400 animate-ping"></span>
        <span>Shivamogga Hub &bull; 150 KM Boundary</span>
      </div>

      {/* Radius Legend (Bottom Left) */}
      <div className="absolute bottom-3 left-3 z-[400] flex items-center gap-2 pointer-events-none">
        <div className="px-2.5 py-1 rounded-lg bg-charcoal-950/80 backdrop-blur-md border border-forest-800/40 text-[10px] font-mono text-forest-300">
          Showing {filteredDestinations.length} spots
        </div>
      </div>
    </div>
  );
};
