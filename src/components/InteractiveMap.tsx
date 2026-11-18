import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Destination, CategoryType } from '../types/destination';
import {
  Search,
  Crosshair,
  Compass,
  Play,
  Pause,
  SkipForward,
  Layers,
  Tag,
  Navigation,
  ArrowRight,
  X,
  Sparkles,
  LocateFixed,
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { buildGoogleMapsDirectionsUrl } from '../utils/maps';

interface InteractiveMapProps {
  destinations: Destination[];
  selectedRadius: number;
  onRadiusChange?: (radius: number) => void;
  onSelectDestination: (dest: Destination) => void;
  userLocation: { lat: number; lng: number } | null;
  onUserLocationChange?: (loc: { lat: number; lng: number }) => void;
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
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, HERE, Garmin, OpenStreetMap contributors',
    maxZoom: 19,
  },
  satellite: {
    label: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    overlayUrl:
      'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics',
    maxZoom: 19,
  },
  terrain: {
    label: 'Terrain',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Esri, USGS, NOAA',
    maxZoom: 19,
  },
  osm: {
    label: 'Streets',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  },
};

const SHIVAMOGGA_COORDS: [number, number] = [13.9299, 75.5681];
const RADIUS_PRESETS = [25, 50, 75, 100, 125, 150];

const CATEGORY_ICONS: Record<CategoryType, string> = {
  Waterfalls: '💧',
  'Mountains & Hills': '⛰️',
  Nature: '🌿',
  Wildlife: '🐘',
  Trekking: '🥾',
  Temples: '🛕',
  'Historical Places': '🏛️',
  Forts: '🏰',
  Viewpoints: '🏞️',
  Adventure: '🚣',
  Beaches: '🌊',
  Forests: '🌳',
  Camping: '🏕️',
  'Coffee Plantations': '☕',
  'Dams & Reservoirs': '🏗️',
  'Heritage & Culture': '🏘️',
};

const CATEGORY_COLORS: Record<CategoryType, string> = {
  Waterfalls: '#0284C7',
  'Mountains & Hills': '#059669',
  Nature: '#16A34A',
  Wildlife: '#D97706',
  Trekking: '#0D9488',
  Temples: '#EAB308',
  'Historical Places': '#92400E',
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

function createCurvedArcPoints(
  from: [number, number],
  to: [number, number],
  steps = 36
): [number, number][] {
  const [lat1, lng1] = from;
  const [lat2, lng2] = to;
  const dLat = lat2 - lat1;
  const dLng = lng2 - lng1;
  const dist = Math.hypot(dLat, dLng);

  if (dist < 0.0005) {
    return [from, to];
  }

  // Perpendicular offset biased slightly northward for graceful arc trajectories
  let perpLat = -dLng;
  let perpLng = dLat;
  if (perpLat < 0) {
    perpLat = -perpLat;
    perpLng = -perpLng;
  }

  const curveScale = Math.min(0.24, Math.max(0.14, dist * 0.16));
  const ctrlLat = (lat1 + lat2) / 2 + (perpLat / dist) * dist * curveScale;
  const ctrlLng = (lng1 + lng2) / 2 + (perpLng / dist) * dist * curveScale;

  const points: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const inv = 1 - t;
    const lat = inv * inv * lat1 + 2 * inv * t * ctrlLat + t * t * lat2;
    const lng = inv * inv * lng1 + 2 * inv * t * ctrlLng + t * t * lng2;
    points.push([lat, lng]);
  }
  return points;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  destinations,
  selectedRadius,
  onRadiusChange,
  onSelectDestination,
  userLocation,
  onUserLocationChange,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayersRef = useRef<L.TileLayer[]>([]);
  const radiusLayersRef = useRef<L.LayerGroup | null>(null);
  const routeLayersRef = useRef<L.LayerGroup | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const markersByIdRef = useRef<globalThis.Map<string, L.Marker>>(new globalThis.Map());
  const userMarkerRef = useRef<L.Marker | null>(null);
  const hasFittedInitialRadiusRef = useRef<boolean>(false);
  const onSelectRef = useRef(onSelectDestination);
  const userLocationRef = useRef(userLocation);

  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [districtFilter, setDistrictFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [mapStyle, setMapStyle] = useState<MapStyleId>('map');
  const [showAllLabels, setShowAllLabels] = useState<boolean>(false);
  const [currentZoom, setCurrentZoom] = useState<number>(9);
  const [activeDestId, setActiveDestId] = useState<string | null>(null);
  const [hoveredDestId, setHoveredDestId] = useState<string | null>(null);
  const [isTourPlaying, setIsTourPlaying] = useState<boolean>(false);
  const [locatingUser, setLocatingUser] = useState<boolean>(false);

  const activeDestIdRef = useRef<string | null>(null);
  const isTourPlayingRef = useRef<boolean>(false);

  useEffect(() => {
    onSelectRef.current = onSelectDestination;
  }, [onSelectDestination]);

  useEffect(() => {
    userLocationRef.current = userLocation;
  }, [userLocation]);

  useEffect(() => {
    activeDestIdRef.current = activeDestId;
  }, [activeDestId]);

  useEffect(() => {
    isTourPlayingRef.current = isTourPlaying;
  }, [isTourPlaying]);

  const displayedDestinations = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return destinations.filter((dest) => {
      const withinRadius = dest.distanceFromShivamogga <= selectedRadius;
      const matchesCategory = categoryFilter === 'All' || dest.category === categoryFilter;
      const matchesDistrict = districtFilter === 'All' || dest.district === districtFilter;
      const matchesSearch =
        q === '' ||
        dest.name.toLowerCase().includes(q) ||
        dest.district.toLowerCase().includes(q) ||
        dest.category.toLowerCase().includes(q) ||
        dest.tags.some((t) => t.toLowerCase().includes(q));

      return withinRadius && matchesCategory && matchesDistrict && matchesSearch;
    });
  }, [destinations, selectedRadius, categoryFilter, districtFilter, searchQuery]);

  const activeDestination = useMemo(
    () => displayedDestinations.find((d) => d.id === activeDestId) ?? null,
    [displayedDestinations, activeDestId]
  );

  const hoveredDestination = useMemo(
    () => displayedDestinations.find((d) => d.id === hoveredDestId) ?? null,
    [displayedDestinations, hoveredDestId]
  );

  const shouldShowLabels =
    showAllLabels || currentZoom >= 10 || displayedDestinations.length <= 10;

  // Initialize Leaflet map once
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container || mapInstanceRef.current) return;

    const map = L.map(container, {
      center: SHIVAMOGGA_COORDS,
      zoom: 9,
      zoomControl: false,
      scrollWheelZoom: true,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const radiusGroup = L.layerGroup().addTo(map);
    const routeGroup = L.layerGroup().addTo(map);
    const markersGroup = L.layerGroup().addTo(map);

    radiusLayersRef.current = radiusGroup;
    routeLayersRef.current = routeGroup;
    markersLayerRef.current = markersGroup;

    // Central Shivamogga Hub Marker with animated radar rings & rotating sweep
    const hubIcon = L.divIcon({
      className: 'shivamogga-hub-marker',
      html: `
        <div class="shivamogga-hub-shell">
          <div class="shivamogga-hub-ring"></div>
          <div class="shivamogga-hub-ring ring-delay"></div>
          <div class="shivamogga-hub-sweep"></div>
          <div class="shivamogga-hub-badge">
            <span class="hub-icon">👑</span>
          </div>
        </div>
      `,
      iconSize: [56, 56],
      iconAnchor: [28, 28],
    });

    const hubMarker = L.marker(SHIVAMOGGA_COORDS, { icon: hubIcon, zIndexOffset: 500 })
      .addTo(map)
      .bindTooltip(
        '<b>SHIVAMOGGA CENTER HUB</b><br/>Radial Reference (13.9299° N, 75.5681° E)',
        {
          permanent: false,
          direction: 'top',
          offset: [0, -24],
        }
      );

    hubMarker.on('click', () => {
      setIsTourPlaying(false);
      setActiveDestId(null);
      if (radiusLayersRef.current) {
        const outer = radiusLayersRef.current.getLayers().find((l) => l instanceof L.Circle) as
          | L.Circle
          | undefined;
        if (outer) {
          map.flyToBounds(outer.getBounds(), { padding: [36, 36], duration: 1.1 });
        }
      }
    });

    map.on('zoomend', () => {
      setCurrentZoom(map.getZoom());
    });

    mapInstanceRef.current = map;

    // Ensure Leaflet renders tiles properly after LoadingScreen & layout transitions
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize({ pan: false });
    });
    resizeObserver.observe(container);

    const t1 = window.setTimeout(() => map.invalidateSize({ pan: false }), 150);
    const t2 = window.setTimeout(() => map.invalidateSize({ pan: false }), 800);
    const t3 = window.setTimeout(() => map.invalidateSize({ pan: false }), 2400);

    const markersById = markersByIdRef.current;

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
      tileLayersRef.current = [];
      radiusLayersRef.current = null;
      routeLayersRef.current = null;
      markersLayerRef.current = null;
      markersById.clear();
    };
  }, []);

  // Switch Map Tile Style smoothly
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    tileLayersRef.current.forEach((layer) => map.removeLayer(layer));
    tileLayersRef.current = [];

    const cfg = TILE_LAYERS[mapStyle];
    const baseLayer = L.tileLayer(cfg.url, {
      attribution: cfg.attribution,
      maxZoom: cfg.maxZoom,
      ...(cfg.subdomains ? { subdomains: cfg.subdomains } : {}),
    }).addTo(map);
    baseLayer.bringToBack();
    tileLayersRef.current.push(baseLayer);

    if (cfg.overlayUrl) {
      const labelLayer = L.tileLayer(cfg.overlayUrl, {
        maxZoom: cfg.maxZoom,
      }).addTo(map);
      tileLayersRef.current.push(labelLayer);
    }
  }, [mapStyle]);

  // Draw concentric radar boundary rings for selectedRadius
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = radiusLayersRef.current;
    if (!map || !group) return;

    group.clearLayers();

    // Subtle intermediate reference rings (50 KM, 100 KM)
    [50, 100].forEach((stepKm) => {
      if (stepKm < selectedRadius) {
        L.circle(SHIVAMOGGA_COORDS, {
          radius: stepKm * 1000,
          color: '#0F766E',
          weight: 1.25,
          opacity: 0.4,
          dashArray: '4, 8',
          fill: false,
          interactive: false,
        }).addTo(group);
      }
    });

    const outerCircle = L.circle(SHIVAMOGGA_COORDS, {
      radius: selectedRadius * 1000,
      color: '#0F766E',
      weight: 2.5,
      opacity: 0.88,
      dashArray: '8, 8',
      fillColor: '#10B981',
      fillOpacity: 0.06,
      className: 'map-radius-ring',
      interactive: false,
    }).addTo(group);

    // Distance label badge at top edge of the radius ring
    const northLat = outerCircle.getBounds().getNorth();
    const badgeIcon = L.divIcon({
      className: 'custom-map-marker',
      html: `<div style="transform: translate(-50%, -50%); padding: 3px 10px; border-radius: 9999px; background: rgba(15, 23, 42, 0.9); border: 1.5px solid #14B8A6; color: #FDE68A; font-size: 10px; font-weight: 800; font-family: monospace; white-space: nowrap; box-shadow: 0 4px 12px rgba(0,0,0,0.35);">${selectedRadius} KM ZONE</div>`,
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    });
    L.marker([northLat, SHIVAMOGGA_COORDS[1]], { icon: badgeIcon, interactive: false }).addTo(group);

    if (!hasFittedInitialRadiusRef.current) {
      hasFittedInitialRadiusRef.current = true;
      map.fitBounds(outerCircle.getBounds(), { padding: [36, 36] });
    } else if (!isTourPlayingRef.current) {
      map.flyToBounds(outerCircle.getBounds(), { padding: [36, 36], duration: 1.0 });
    }
  }, [selectedRadius]);

  // Draw animated curved route arc & ground ripple when hovering/selecting a destination
  useEffect(() => {
    const group = routeLayersRef.current;
    if (!group) return;

    group.clearLayers();
    const targetDest = hoveredDestination ?? activeDestination;
    if (!targetDest) return;

    const origin: [number, number] = userLocation
      ? [userLocation.lat, userLocation.lng]
      : SHIVAMOGGA_COORDS;
    const destCoords: [number, number] = [targetDest.latitude, targetDest.longitude];
    const arcPoints = createCurvedArcPoints(origin, destCoords);

    // Google-Maps-inspired outer glow along trajectory
    L.polyline(arcPoints, {
      color: '#1D4ED8',
      weight: 7,
      opacity: 0.25,
      lineCap: 'round',
      interactive: false,
    }).addTo(group);

    // Animated dashed route beam flowing toward destination
    L.polyline(arcPoints, {
      color: '#1A73E8',
      weight: 3,
      opacity: 0.95,
      dashArray: '9, 9',
      lineCap: 'round',
      className: 'map-route-arc',
      interactive: false,
    }).addTo(group);

    // Expanding ground target beacon ripple
    const rippleIcon = L.divIcon({
      className: 'map-target-beacon',
      html: '<div class="map-target-ripple"></div>',
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    });
    L.marker(destCoords, { icon: rippleIcon, interactive: false, zIndexOffset: -50 }).addTo(group);
  }, [activeDestination, hoveredDestination, userLocation]);

  // Render markers ONLY when displayedDestinations changes (never wipe on hover/select)
  useEffect(() => {
    const markersGroup = markersLayerRef.current;
    const map = mapInstanceRef.current;
    if (!markersGroup || !map) return;

    markersGroup.clearLayers();
    markersByIdRef.current.clear();

    displayedDestinations.forEach((dest, idx) => {
      const categoryIcon = CATEGORY_ICONS[dest.category] || '📍';
      const color = CATEGORY_COLORS[dest.category] || '#52A389';
      const safeName = escapeHtml(dest.name);
      const safeCategory = escapeHtml(dest.category);
      const safeDistrict = escapeHtml(dest.district);
      const safeDesc = escapeHtml(dest.shortDescription);
      const safeImg = escapeHtml(dest.images[0] || '');
      const delayMs = Math.min(idx * 24, 520);

      const customIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div class="map-pin-anchor" style="--pin-delay: ${delayMs}ms;">
            <div class="map-pin-card" style="--pin-color: ${color};">
              <span class="map-pin-pulse"></span>
              <span class="map-pin-emoji">${categoryIcon}</span>
              <span class="map-pin-label">${safeName}</span>
              <span class="map-pin-dist">${dest.distanceFromShivamogga}km</span>
            </div>
            <div class="map-pin-stem" style="--pin-color: ${color};"></div>
            <div class="map-pin-dot"></div>
          </div>
        `,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      const popupHtml = `
        <div class="map-popup-card" style="width: 276px; font-family: inherit; overflow: hidden; border-radius: 18px;">
          <div style="overflow: hidden; height: 138px; position: relative;">
            <img class="map-popup-image" src="${safeImg}" alt="${safeName}" style="width: 100%; height: 100%; object-fit: cover;" />
            <div style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(14,20,18,0.9) 0%, transparent 65%); pointer-events: none;"></div>
            <div style="position: absolute; bottom: 8px; left: 12px; right: 12px; display: flex; align-items: center; justify-content: space-between;">
              <span style="font-size: 10px; background: rgba(20, 61, 48, 0.85); border: 1px solid rgba(122, 196, 171, 0.35); color: #A9E0CD; padding: 2px 8px; border-radius: 99px; font-weight: 700; backdrop-filter: blur(6px);">
                ${categoryIcon} ${safeCategory}
              </span>
              <span style="font-size: 11px; font-weight: 800; color: #F2C94C; text-shadow: 0 1px 4px rgba(0,0,0,0.8);">
                ${dest.distanceFromShivamogga} km
              </span>
            </div>
          </div>
          <div style="padding: 12px 14px 14px;">
            <div style="font-size: 10px; color: #7AC4AB; font-family: monospace; text-transform: uppercase; letter-spacing: 0.06em;">
              ${safeDistrict} • ${escapeHtml(dest.estimatedTravelTime)}
            </div>
            <h4 style="margin: 3px 0 5px; font-size: 15px; font-weight: 800; color: #FFF; letter-spacing: -0.2px;">${safeName}</h4>
            <p style="margin: 0 0 12px; font-size: 11px; color: #D6DDD8; line-height: 1.45; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
              ${safeDesc}
            </p>
            <div style="display: flex; gap: 8px; align-items: center;">
              <button type="button" data-explore-btn="true" class="map-btn-explore" style="
                flex: 1;
                background: linear-gradient(135deg, #1E4D3E 0%, #143D30 100%);
                border: 1px solid #D4AF37;
                color: #F4F6F4;
                font-weight: 800;
                font-size: 11px;
                padding: 9px 8px;
                border-radius: 10px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                letter-spacing: 0.5px;
              ">
                EXPLORE →
              </button>
              <a href="${buildGoogleMapsDirectionsUrl(dest, userLocationRef.current)}" data-navigate-btn="true" target="_blank" rel="noopener noreferrer" class="map-btn-navigate" style="
                flex: 1;
                background: linear-gradient(135deg, #1D4ED8 0%, #1E40AF 100%);
                border: 1px solid #60A5FA;
                color: #FFFFFF;
                font-weight: 800;
                font-size: 11px;
                padding: 9px 8px;
                border-radius: 10px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                text-decoration: none;
                letter-spacing: 0.5px;
              ">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
                NAVIGATE
              </a>
            </div>
          </div>
        </div>
      `;

      const marker = L.marker([dest.latitude, dest.longitude], { icon: customIcon })
        .addTo(markersGroup)
        .bindPopup(popupHtml, { offset: [0, -34], closeButton: true });

      marker.on('mouseover', () => {
        setHoveredDestId(dest.id);
        marker.setZIndexOffset(1000);
      });

      marker.on('mouseout', () => {
        setHoveredDestId((prev) => (prev === dest.id ? null : prev));
        marker.setZIndexOffset(dest.id === activeDestIdRef.current ? 900 : 0);
      });

      marker.on('click', () => {
        setIsTourPlaying(false);
        setActiveDestId(dest.id);
      });

      marker.on('popupopen', (e) => {
        const popupEl = e.popup.getElement();
        if (!popupEl) return;
        const exploreBtn = popupEl.querySelector('[data-explore-btn="true"]');
        if (exploreBtn instanceof HTMLButtonElement) {
          exploreBtn.onclick = (evt) => {
            evt.stopPropagation();
            onSelectRef.current(dest);
          };
        }
        const navBtn = popupEl.querySelector('[data-navigate-btn="true"]');
        if (navBtn instanceof HTMLAnchorElement) {
          navBtn.href = buildGoogleMapsDirectionsUrl(dest, userLocationRef.current);
        }
      });

      markersByIdRef.current.set(dest.id, marker);
    });
  }, [displayedDestinations]);

  // Synchronize marker visual classes (.is-active / .show-label) in-place without destroying markers
  useEffect(() => {
    markersByIdRef.current.forEach((marker, id) => {
      const el = marker.getElement();
      if (!el) return;
      const card = el.querySelector('.map-pin-card');
      if (!card) return;

      const isActive = id === activeDestId;
      card.classList.toggle('is-active', isActive);
      card.classList.toggle('show-label', shouldShowLabels);
      marker.setZIndexOffset(isActive ? 900 : 0);
    });
  }, [activeDestId, shouldShowLabels, displayedDestinations]);

  // User GPS location marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !userLocation) return;

    if (userMarkerRef.current) {
      map.removeLayer(userMarkerRef.current);
    }

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

    const userMarker = L.marker([userLocation.lat, userLocation.lng], {
      icon: userIcon,
      zIndexOffset: 600,
    })
      .addTo(map)
      .bindPopup('<b>YOUR CURRENT LOCATION</b>');

    userMarkerRef.current = userMarker;
    map.flyTo([userLocation.lat, userLocation.lng], 10, { duration: 1.3 });
  }, [userLocation]);

  const focusDestination = useCallback((dest: Destination, openPopup = false) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    setActiveDestId(dest.id);
    const targetZoom = Math.max(map.getZoom(), 10.5);
    map.flyTo([dest.latitude, dest.longitude], targetZoom, {
      duration: 1.15,
      easeLinearity: 0.25,
    });

    if (openPopup) {
      const marker = markersByIdRef.current.get(dest.id);
      if (marker) {
        map.once('moveend', () => {
          marker.openPopup();
        });
      }
    }
  }, []);

  // Scenic Flyover Auto-Tour loop
  useEffect(() => {
    if (!isTourPlaying || displayedDestinations.length === 0) return;

    const currentIdx = displayedDestinations.findIndex((d) => d.id === activeDestIdRef.current);
    if (currentIdx === -1) {
      focusDestination(displayedDestinations[0], false);
    }

    const timer = window.setInterval(() => {
      const idx = displayedDestinations.findIndex((d) => d.id === activeDestIdRef.current);
      const nextIdx = idx === -1 ? 0 : (idx + 1) % displayedDestinations.length;
      const nextDest = displayedDestinations[nextIdx];
      if (!nextDest) return;
      const map = mapInstanceRef.current;
      if (map) {
        map.closePopup();
      }
      focusDestination(nextDest, false);
    }, 3600);

    return () => window.clearInterval(timer);
  }, [isTourPlaying, displayedDestinations, focusDestination]);

  const handleToggleTour = () => {
    if (displayedDestinations.length === 0) return;
    if (isTourPlaying) {
      setIsTourPlaying(false);
    } else {
      const map = mapInstanceRef.current;
      if (map) map.closePopup();
      const first = activeDestination ?? displayedDestinations[0];
      setIsTourPlaying(true);
      focusDestination(first, false);
    }
  };

  const handleStepTour = () => {
    if (displayedDestinations.length === 0) return;
    const idx = displayedDestinations.findIndex((d) => d.id === activeDestId);
    const next = displayedDestinations[(idx + 1) % displayedDestinations.length];
    focusDestination(next, false);
  };

  const resetMapView = () => {
    setIsTourPlaying(false);
    setActiveDestId(null);
    const map = mapInstanceRef.current;
    const group = radiusLayersRef.current;
    if (!map || !group) return;
    map.closePopup();
    const outer = group.getLayers().find((l) => l instanceof L.Circle) as L.Circle | undefined;
    if (outer) {
      map.flyToBounds(outer.getBounds(), { padding: [36, 36], duration: 1.1 });
    } else {
      map.flyTo(SHIVAMOGGA_COORDS, 9, { duration: 1.1 });
    }
  };

  const categories: string[] = [
    'All',
    'Waterfalls',
    'Mountains & Hills',
    'Nature',
    'Wildlife',
    'Trekking',
    'Temples',
    'Historical Places',
    'Forts',
    'Viewpoints',
    'Adventure',
    'Beaches',
    'Forests',
    'Dams & Reservoirs',
    'Heritage & Culture',
  ];

  const districts: string[] = [
    'All',
    'Shivamogga',
    'Chikkamagaluru',
    'Udupi',
    'Uttara Kannada',
    'Dakshina Kannada',
    'Davanagere',
    'Haveri',
  ];

  const hasFilters = categoryFilter !== 'All' || districtFilter !== 'All' || searchQuery !== '';

  return (
    <section id="map" className="py-16 bg-charcoal-950 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col lg:flex-row lg:items-end justify-between mb-6 gap-4"
        >
          <div>
            <span className="text-xs font-mono tracking-widest text-gold-400 uppercase flex items-center gap-2">
              <Compass className="w-4 h-4 animate-spin" style={{ animationDuration: '14s' }} />
              Central Reference Spatial Navigation
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-cream-100 mt-1">
              Interactive 150 KM Regional Map
            </h2>
            <p className="text-sm text-forest-300 mt-1">
              Shivamogga City as center hub • Showing{' '}
              <span className="text-gold-300 font-semibold">{displayedDestinations.length}</span>{' '}
              markers inside <span className="text-gold-300 font-semibold">{selectedRadius} KM</span>{' '}
              radius ring
            </p>
          </div>

          {/* Action Buttons & Quick Radius Selector */}
          <div className="flex flex-wrap items-center gap-2.5">
            {onRadiusChange && (
              <div className="flex items-center gap-1 p-1 rounded-xl bg-charcoal-900/90 border border-forest-800/80">
                {RADIUS_PRESETS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => onRadiusChange(r)}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-mono font-bold transition-all ${
                      selectedRadius === r
                        ? 'bg-gold-400 text-charcoal-950 shadow'
                        : 'text-cream-300 hover:text-white hover:bg-forest-900/60'
                    }`}
                  >
                    {r}km
                  </button>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={handleToggleTour}
              disabled={displayedDestinations.length === 0}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold shadow transition-all disabled:opacity-40 ${
                isTourPlaying
                  ? 'bg-gold-400 text-charcoal-950 hover:bg-gold-300 shadow-gold-500/30'
                  : 'bg-gradient-to-r from-forest-700 to-forest-800 hover:from-forest-600 hover:to-forest-700 border border-gold-500/40 text-gold-200'
              }`}
            >
              {isTourPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {isTourPlaying ? 'Pause Flyover' : 'Scenic Flyover'}
            </button>

            {onUserLocationChange && (
              <button
                type="button"
                onClick={() => {
                  if (!navigator.geolocation) return;
                  setLocatingUser(true);
                  navigator.geolocation.getCurrentPosition(
                    (pos) => {
                      onUserLocationChange({
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude,
                      });
                      setLocatingUser(false);
                    },
                    () => {
                      setLocatingUser(false);
                    },
                    { enableHighAccuracy: true, timeout: 10000 }
                  );
                }}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold shadow transition-all ${
                  userLocation
                    ? 'bg-sky-900/70 border-sky-400/60 text-sky-200 hover:bg-sky-800/80'
                    : 'bg-charcoal-900/90 border-forest-700/80 text-cream-200 hover:border-sky-400/50 hover:text-sky-200'
                }`}
              >
                <LocateFixed className={`w-3.5 h-3.5 ${locatingUser ? 'animate-spin' : ''}`} />
                {locatingUser ? 'Locating...' : userLocation ? 'GPS Active' : 'My GPS'}
              </button>
            )}

            <button
              type="button"
              onClick={resetMapView}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-forest-900/80 hover:bg-forest-800 border border-gold-500/30 text-gold-300 text-xs font-semibold shadow transition-all"
            >
              <Crosshair className="w-4 h-4" />
              Recenter Hub
            </button>
          </div>
        </motion.div>

        {/* Map Container Wrapper */}
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.99 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-3xl overflow-hidden border border-forest-700/50 shadow-2xl bg-charcoal-900"
        >
          {/* Top-Left Floating Filter Bar */}
          <div className="absolute top-3.5 left-3.5 right-3.5 sm:right-auto z-[1000] flex flex-wrap sm:flex-nowrap items-center gap-2 pointer-events-none">
            <div className="relative pointer-events-auto flex-1 sm:flex-none">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-forest-300" />
              <input
                type="text"
                placeholder="Search map spots..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-48 pl-8 pr-3 py-2 rounded-xl bg-charcoal-950/90 border border-forest-800 text-xs text-cream-100 placeholder-forest-400 backdrop-blur-md focus:outline-none focus:border-gold-400 shadow-lg"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="pointer-events-auto pl-2.5 pr-6 py-2 rounded-xl bg-charcoal-950/90 border border-forest-800 text-xs text-gold-300 font-semibold backdrop-blur-md focus:outline-none focus:border-gold-400 shadow-lg cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat} className="bg-charcoal-900 text-cream-100">
                  {cat === 'All'
                    ? 'All Categories'
                    : `${CATEGORY_ICONS[cat as CategoryType] || ''} ${cat}`}
                </option>
              ))}
            </select>

            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="pointer-events-auto pl-2.5 pr-6 py-2 rounded-xl bg-charcoal-950/90 border border-gold-500/40 text-xs text-gold-300 font-bold backdrop-blur-md focus:outline-none focus:border-gold-400 shadow-lg cursor-pointer"
            >
              {districts.map((dist) => (
                <option key={dist} value={dist} className="bg-charcoal-900 text-cream-100">
                  {dist === 'All' ? 'All Districts' : `${dist}`}
                </option>
              ))}
            </select>

            {hasFilters && (
              <button
                type="button"
                onClick={() => {
                  setCategoryFilter('All');
                  setDistrictFilter('All');
                  setSearchQuery('');
                }}
                className="pointer-events-auto inline-flex items-center gap-1 px-2.5 py-2 rounded-xl bg-charcoal-950/90 border border-forest-700 text-xs text-cream-200 hover:text-gold-300 backdrop-blur-md shadow-lg"
              >
                <X className="w-3.5 h-3.5" />
                Reset
              </button>
            )}
          </div>

          {/* Top-Right Map Style & Labels Controls */}
          <div className="absolute top-16 sm:top-3.5 right-3.5 z-[1000] flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAllLabels((prev) => !prev)}
              title="Toggle marker names"
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold backdrop-blur-md border shadow-lg transition-all ${
                showAllLabels
                  ? 'bg-forest-800/95 border-gold-400/70 text-gold-300'
                  : 'bg-charcoal-950/90 border-forest-800 text-cream-200 hover:border-gold-500/40'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Labels</span>
            </button>

            <div className="flex items-center gap-1 p-1 rounded-xl bg-charcoal-950/90 border border-forest-800 backdrop-blur-md shadow-lg">
              <Layers className="w-3.5 h-3.5 text-gold-400 ml-1.5 mr-0.5 hidden sm:block" />
              {(Object.keys(TILE_LAYERS) as MapStyleId[]).map((styleId) => (
                <button
                  key={styleId}
                  type="button"
                  onClick={() => setMapStyle(styleId)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                    mapStyle === styleId
                      ? 'bg-forest-700 text-gold-300 border border-gold-500/40 shadow'
                      : 'text-cream-300 hover:text-white'
                  }`}
                >
                  {TILE_LAYERS[styleId].label}
                </button>
              ))}
            </div>
          </div>

          {/* Leaflet Map Canvas */}
          <div ref={mapContainerRef} className="w-full h-[520px] sm:h-[600px] z-10" />

          {/* Active Spotlight / Flyover Tour HUD Card */}
          <AnimatePresence>
            {activeDestination && (
              <motion.div
                key={activeDestination.id}
                initial={{ opacity: 0, y: 20, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.96 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="absolute bottom-4 left-4 z-[1000] w-[calc(100%-5.5rem)] max-w-sm rounded-2xl bg-charcoal-950/92 border border-gold-500/40 backdrop-blur-xl p-3.5 shadow-2xl"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={activeDestination.images[0]}
                    alt={activeDestination.name}
                    className="w-16 h-16 rounded-xl object-cover border border-forest-700 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-gold-400">
                        <Sparkles className="w-3 h-3" />
                        {isTourPlaying ? 'Scenic Flyover' : 'Selected Spot'}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsTourPlaying(false);
                          setActiveDestId(null);
                        }}
                        className="text-forest-300 hover:text-white p-0.5"
                        aria-label="Close spotlight"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <h4 className="text-sm font-serif font-bold text-cream-100 truncate">
                      {activeDestination.name}
                    </h4>
                    <p className="text-[11px] text-forest-300 font-mono">
                      {activeDestination.distanceFromShivamogga} km • {activeDestination.estimatedTravelTime}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectDestination(activeDestination)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-forest-700 hover:bg-forest-600 border border-gold-500/40 text-cream-50 text-xs font-bold transition-all"
                  >
                    <span>Explore Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <a
                    href={buildGoogleMapsDirectionsUrl(activeDestination, userLocation)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-600 border border-blue-400/50 text-white text-xs font-bold transition-all"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Route</span>
                  </a>

                  {isTourPlaying && (
                    <button
                      type="button"
                      onClick={handleStepTour}
                      title="Next destination"
                      className="p-1.5 rounded-xl bg-charcoal-900 hover:bg-forest-800 border border-forest-700 text-gold-300 transition-all"
                    >
                      <SkipForward className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Compact Map Legend (bottom-center/right beside zoom controls) */}
          <div className="hidden lg:flex absolute bottom-4 right-14 z-[1000] items-center gap-3 px-3.5 py-2 rounded-xl bg-charcoal-950/90 border border-forest-800/80 backdrop-blur-md text-[11px] text-cream-200 shadow-xl">
            <span className="flex items-center gap-1 font-semibold text-gold-400">
              👑 Shivamogga Hub
            </span>
            <span className="w-px h-3 bg-forest-800" />
            <span className="flex items-center gap-1">💧 Waterfalls</span>
            <span className="flex items-center gap-1">🐘 Wildlife</span>
            <span className="flex items-center gap-1">🥾 Trekking</span>
            <span className="flex items-center gap-1">🛕 Temples</span>
            <span className="flex items-center gap-1">🌊 Beaches</span>
          </div>
        </motion.div>

        {/* Quick-Fly Destination Strip */}
        {displayedDestinations.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-[11px] font-mono uppercase tracking-widest text-forest-300">
                Quick-Fly Destinations ({displayedDestinations.length}) — Click any card to glide on map
              </span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {displayedDestinations.map((dest) => {
                const isSelected = dest.id === activeDestId;
                return (
                  <motion.button
                    key={dest.id}
                    type="button"
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      setIsTourPlaying(false);
                      focusDestination(dest, true);
                    }}
                    onMouseEnter={() => setHoveredDestId(dest.id)}
                    onMouseLeave={() => setHoveredDestId((prev) => (prev === dest.id ? null : prev))}
                    className={`shrink-0 flex items-center gap-2.5 p-2 pr-3.5 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'bg-forest-900/90 border-gold-400 shadow-lg shadow-gold-500/15'
                        : 'bg-charcoal-900/80 border-forest-800/70 hover:border-gold-500/40'
                    }`}
                  >
                    <img
                      src={dest.images[0]}
                      alt={dest.name}
                      className="w-10 h-10 rounded-xl object-cover border border-forest-700/60"
                    />
                    <div>
                      <div className="text-xs font-bold text-cream-100 max-w-[140px] truncate">
                        {CATEGORY_ICONS[dest.category]} {dest.name}
                      </div>
                      <div className="text-[10px] font-mono text-gold-400">
                        {dest.distanceFromShivamogga} km • {dest.district}
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
