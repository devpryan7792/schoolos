'use client';

import React, { useState, useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import { 
  Bus, 
  MapPin, 
  Navigation, 
  Gauge, 
  Power, 
  Clock, 
  Users, 
  Radio, 
  ShieldCheck, 
  RefreshCw,
  AlertCircle
} from 'lucide-react';

interface FleetBus {
  id: string;
  vehicleId: string;
  registrationNumber: string;
  routeName: string;
  driverName: string;
  driverPhone: string;
  lat: number;
  lng: number;
  speedKmh: number;
  heading: number;
  ignitionOn: boolean;
  passengers: number;
  nextStop: string;
  etaMinutes: number;
  status: 'ACTIVE' | 'IDLE' | 'STOPPED';
}

const initialBuses: FleetBus[] = [
  {
    id: 'BUS-14',
    vehicleId: '3cf28a79-7f3f-5905-af21-24a0126ef7ad',
    registrationNumber: 'JH-01-BV-4021',
    routeName: 'Route 4: Hinoo Chowk to Main Campus',
    driverName: 'Mohan Ram',
    driverPhone: '+91 98765 11024',
    lat: 23.3590,
    lng: 85.3210,
    speedKmh: 34.2,
    heading: 142.0,
    ignitionOn: true,
    passengers: 28,
    nextStop: 'Circular Road Chowk',
    etaMinutes: 4,
    status: 'ACTIVE',
  },
  {
    id: 'BUS-08',
    vehicleId: 'b1b1cd34-b12d-5aee-83d2-b7ae5f75e73d',
    registrationNumber: 'JH-01-AX-9912',
    routeName: 'Route 2: Doranda Bazar Line',
    driverName: 'Suresh Yadav',
    driverPhone: '+91 98765 33412',
    lat: 23.3482,
    lng: 85.3120,
    speedKmh: 0.0,
    heading: 90.0,
    ignitionOn: true,
    passengers: 34,
    nextStop: 'Boarding at Doranda Bazar',
    etaMinutes: 1,
    status: 'STOPPED',
  },
  {
    id: 'BUS-21',
    vehicleId: '6a49fec8-05ff-4f6b-adec-60532d947a5d',
    registrationNumber: 'JH-01-CZ-1045',
    routeName: 'Route 7: Birsa Chowk Express',
    driverName: 'Abdul Karim',
    driverPhone: '+91 98765 88921',
    lat: 23.3690,
    lng: 85.3280,
    speedKmh: 41.5,
    heading: 32.7,
    ignitionOn: true,
    passengers: 31,
    nextStop: 'Albert Ekka Chowk',
    etaMinutes: 6,
    status: 'ACTIVE',
  },
];

export default function FleetPage() {
  const [buses, setBuses] = useState<FleetBus[]>(initialBuses);
  const [selectedBusId, setSelectedBusId] = useState<string>('BUS-14');
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<{ [id: string]: maplibregl.Marker }>({});

  const selectedBus = buses.find(b => b.id === selectedBusId) || buses[0];

  // Initialize MapLibre GL
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    // Use zero-cost OpenStreetMap raster style
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'osm-tiles': {
            type: 'raster',
            tiles: [
              'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
            ],
            tileSize: 256,
            attribution: '&copy; OpenStreetMap Contributors (Zero Cost MapLibre GL)',
          },
        },
        layers: [
          {
            id: 'osm-tiles-layer',
            type: 'raster',
            source: 'osm-tiles',
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: [selectedBus.lng, selectedBus.lat],
      zoom: 13.5,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Sync Markers with Live Telemetry
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    buses.forEach(bus => {
      let marker = markersRef.current[bus.id];
      if (!marker) {
        // Create custom bus pin DOM element
        const el = document.createElement('div');
        el.className = 'w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-xs shadow-lg border-2 border-white cursor-pointer hover:scale-110 transition-transform';
        el.innerHTML = `<span>${bus.id.replace('BUS-', '')}</span>`;
        el.addEventListener('click', () => setSelectedBusId(bus.id));

        marker = new maplibregl.Marker({ element: el })
          .setLngLat([bus.lng, bus.lat])
          .addTo(map);

        markersRef.current[bus.id] = marker;
      } else {
        // Smoothly lerp / update marker coordinate
        marker.setLngLat([bus.lng, bus.lat]);
      }
    });
  }, [buses]);

  // Center Map when selected bus changes
  useEffect(() => {
    if (mapRef.current && selectedBus) {
      mapRef.current.easeTo({
        center: [selectedBus.lng, selectedBus.lat],
        duration: 800,
      });
    }
  }, [selectedBusId]);

  // Connect to Go Backend WebSocket or Simulated Telemetry Stream
  useEffect(() => {
    let ws: WebSocket | null = null;
    let fallbackInterval: NodeJS.Timeout | null = null;

    try {
      ws = new WebSocket(`ws://localhost:8080/v1/ws/vehicles/${selectedBus.vehicleId}`);
      ws.onopen = () => setIsConnected(true);
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.coordinates) {
            setBuses(prev => prev.map(b => {
              if (b.id === selectedBusId) {
                return {
                  ...b,
                  lat: data.coordinates.latitude,
                  lng: data.coordinates.longitude,
                  speedKmh: data.coordinates.speed_kmh,
                  heading: data.coordinates.heading,
                  ignitionOn: data.coordinates.ignition_on,
                };
              }
              return b;
            }));
          }
        } catch (e) {
          // ignore
        }
      };
      ws.onerror = () => setIsConnected(false);
      ws.onclose = () => setIsConnected(false);
    } catch (e) {
      setIsConnected(false);
    }

    // Live continuous simulated lerp movement along Ranchi coordinates
    fallbackInterval = setInterval(() => {
      setBuses(prev => prev.map(b => {
        if (b.id === 'BUS-14') {
          // Small realistic jitter/increment along route
          const deltaLat = (Math.random() - 0.48) * 0.0003;
          const deltaLng = (Math.random() - 0.48) * 0.0003;
          const newSpeed = Math.max(15, Math.min(50, b.speedKmh + (Math.random() - 0.5) * 4));
          return {
            ...b,
            lat: b.lat + deltaLat,
            lng: b.lng + deltaLng,
            speedKmh: parseFloat(newSpeed.toFixed(1)),
          };
        }
        return b;
      }));
    }, 2500);

    return () => {
      if (ws) ws.close();
      if (fallbackInterval) clearInterval(fallbackInterval);
    };
  }, [selectedBusId]);

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col md:flex-row overflow-hidden">
      {/* Left / Center: Interactive Map Container */}
      <div className="flex-1 relative h-full min-h-[400px]">
        <div ref={mapContainer} className="w-full h-full" />

        {/* Floating Map Status Overlay */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-white/95 backdrop-blur-xs px-3.5 py-2 rounded-xl shadow-elevation-1 border border-slate-200 text-xs">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-slate-800">GT06 Telemetry Feed</span>
          <span className="text-slate-400">•</span>
          <span className="font-mono text-slate-500">Port 5023 TCP</span>
          <span className="text-slate-400">•</span>
          <span className="text-emerald-600 font-medium">MapLibre GL Vector Engine (₹0 API Cost)</span>
        </div>
      </div>

      {/* Right Pane: Live Telemetry Telemetry Deck & Fleet Roster */}
      <div className="w-full md:w-96 border-l border-slate-200 bg-white flex flex-col shrink-0 h-full overflow-hidden shadow-xs">
        {/* Selected Bus Telemetry Card */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                {selectedBus.id.replace('BUS-', '')}
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-sm leading-tight flex items-center gap-2">
                  {selectedBus.registrationNumber}
                </h2>
                <div className="text-[11px] text-slate-500 font-medium truncate max-w-[190px]">
                  {selectedBus.routeName}
                </div>
              </div>
            </div>

            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              selectedBus.speedKmh > 0 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}>
              {selectedBus.speedKmh > 0 ? 'EN ROUTE' : 'STOPPED'}
            </span>
          </div>

          {/* Telemetry Metrics Grid */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-center">
              <div className="text-[10px] text-slate-400 font-semibold uppercase flex items-center justify-center gap-1">
                <Gauge className="w-3 h-3 text-slate-400" /> Speed
              </div>
              <div className="font-mono font-bold text-slate-900 text-sm mt-1 tabular-nums">
                {selectedBus.speedKmh} <span className="text-[10px] font-normal text-slate-400 font-sans">km/h</span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-center">
              <div className="text-[10px] text-slate-400 font-semibold uppercase flex items-center justify-center gap-1">
                <Navigation className="w-3 h-3 text-slate-400" /> Heading
              </div>
              <div className="font-mono font-bold text-slate-900 text-sm mt-1 tabular-nums">
                {selectedBus.heading.toFixed(0)}°
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-center">
              <div className="text-[10px] text-slate-400 font-semibold uppercase flex items-center justify-center gap-1">
                <Power className="w-3 h-3 text-slate-400" /> Ignition
              </div>
              <div className="font-bold text-xs mt-1 text-emerald-600 flex items-center justify-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> ON
              </div>
            </div>
          </div>

          {/* Next Stop Waypoint Banner */}
          <div className="mt-3 p-3 rounded-lg bg-white border border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary-600" />
              <div>
                <div className="text-[10px] text-slate-400">Next Scheduled Stop:</div>
                <div className="font-semibold text-slate-800">{selectedBus.nextStop}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-slate-400">ETA</div>
              <div className="font-bold text-emerald-600">{selectedBus.etaMinutes} mins</div>
            </div>
          </div>
        </div>

        {/* Fleet Roster List */}
        <div className="p-3 border-b border-slate-100 flex items-center justify-between text-xs">
          <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
            Active School Fleet ({buses.length})
          </span>
          <span className="text-slate-400 font-mono text-[11px]">Ranchi Division</span>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {buses.map((bus) => (
            <div
              key={bus.id}
              onClick={() => setSelectedBusId(bus.id)}
              className={`p-3.5 cursor-pointer text-xs transition-colors ${
                selectedBusId === bus.id ? 'bg-primary-50/70 border-l-4 border-primary-600' : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <span>{bus.registrationNumber}</span>
                  <span className="text-[10px] text-slate-400 font-mono">({bus.id})</span>
                </div>
                <div className="font-mono font-bold text-slate-800 tabular-nums">
                  {bus.speedKmh} km/h
                </div>
              </div>

              <div className="text-[11px] text-slate-500 mt-1 truncate">
                {bus.routeName}
              </div>

              <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400">
                <span>Driver: {bus.driverName}</span>
                <span className="text-slate-600 font-medium">{bus.passengers} Students</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
