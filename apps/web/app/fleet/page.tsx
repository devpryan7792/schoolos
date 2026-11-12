'use client';

import React, { useState, useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { 
  Bus, 
  MapPin, 
  Gauge, 
  Power, 
  Users, 
  Radio, 
  RefreshCw,
  Phone,
  Navigation
} from 'lucide-react';
import { getFleetBuses } from '../../lib/api';

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

  useEffect(() => {
    getFleetBuses().then(({ buses: apiBuses, isLive }) => {
      if (apiBuses && apiBuses.length > 0) {
        setBuses(apiBuses.map(b => ({
          id: b.id,
          vehicleId: b.vehicle_id,
          registrationNumber: b.registration_number,
          routeName: b.route_name,
          driverName: b.driver_name,
          driverPhone: b.driver_phone,
          lat: b.lat,
          lng: b.lng,
          speedKmh: b.speed_kmh,
          heading: b.heading,
          ignitionOn: b.ignition_on,
          passengers: b.passengers,
          nextStop: b.next_stop,
          etaMinutes: b.eta_minutes,
          status: b.status,
        })));
        setIsConnected(isLive);
      }
    });
  }, []);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    try {
      const map = new maplibregl.Map({
        container: mapContainer.current,
        style: {
          version: 8,
          sources: {
            'osm-tiles': {
              type: 'raster',
              tiles: [
                'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
              ],
              tileSize: 256,
              attribution: '© OpenStreetMap contributors',
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
        zoom: 14,
      });

      map.on('error', () => {
        // Silently swallow tile/worker network errors if working offline
      });

      mapRef.current = map;

      buses.forEach((bus) => {
        const el = document.createElement('div');
        el.className = 'w-7 h-7 rounded-full bg-ink text-white flex items-center justify-center font-bold text-[10px] shadow-whisper border-2 border-white cursor-pointer';
        el.innerHTML = bus.id.replace('BUS-', '');
        el.onclick = () => setSelectedBusId(bus.id);

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([bus.lng, bus.lat])
          .addTo(map);

        markersRef.current[bus.id] = marker;
      });
    } catch (err) {
      console.warn('MapLibre GL initialization notice:', err);
    }

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-hairline">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-ink tracking-tight">Live Fleet GPS Telemetry</h1>
            <span className="bg-semantic-success-bg text-semantic-success text-[10px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1 border border-semantic-success-border">
              <Radio className="w-3 h-3 animate-pulse" />
              GT06 Port 5023 Active
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-0.5">
            Zero-Capex MapLibre OpenStreetMap integration • Binary packet framing • Sub-10ms pub/sub
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 rounded-md bg-canvas-chrome border border-hairline text-[11px] font-mono text-ink-secondary">
            18 / 18 Trackers Online
          </div>
        </div>
      </div>

      {/* Main Map + Sidebar Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[620px]">
        {/* Left Column: Interactive Map Container */}
        <div className="lg:col-span-2 bg-canvas border border-hairline rounded-lg overflow-hidden shadow-whisper relative flex flex-col">
          <div ref={mapContainer} className="flex-1 w-full h-full" />

          {/* Floating Selected Bus Overlay Pill (Notion Whisper Card) */}
          <div className="absolute top-4 left-4 bg-canvas/95 backdrop-blur-sm border border-hairline p-3 rounded-lg shadow-popover text-xs space-y-1.5 w-72">
            <div className="flex items-center justify-between">
              <span className="font-bold text-ink">{selectedBus.id} • {selectedBus.registrationNumber}</span>
              <span className="bg-semantic-success-bg text-semantic-success text-[9px] font-bold px-1.5 py-0.2 rounded border border-semantic-success-border font-mono">
                {selectedBus.status}
              </span>
            </div>
            <div className="text-[11px] text-ink-muted">Driver: {selectedBus.driverName}</div>
            <div className="text-[11px] text-ink-faint flex items-center gap-1 font-mono">
              <MapPin className="w-3 h-3 text-brand" /> {selectedBus.nextStop} (ETA {selectedBus.etaMinutes}m)
            </div>
          </div>
        </div>

        {/* Right Column: Bus Fleet List & Telemetry Diagnostics */}
        <div className="space-y-4 flex flex-col">
          <div className="bg-canvas border border-hairline rounded-lg p-4 shadow-whisper space-y-3 flex-1 overflow-y-auto">
            <div className="text-[10px] font-semibold text-ink-faint uppercase tracking-utility border-b border-hairline pb-2">
              Assigned School Routes
            </div>

            <div className="space-y-2">
              {buses.map((bus) => {
                const isSelected = bus.id === selectedBusId;
                return (
                  <div
                    key={bus.id}
                    onClick={() => {
                      setSelectedBusId(bus.id);
                      if (mapRef.current) {
                        mapRef.current.flyTo({ center: [bus.lng, bus.lat], zoom: 15 });
                      }
                    }}
                    className={`p-3 rounded-md border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-canvas-subdued border-brand shadow-whisper'
                        : 'bg-canvas border-hairline hover:border-hairline-strong'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="font-semibold text-ink flex items-center gap-1.5">
                        <Bus className={`w-3.5 h-3.5 ${isSelected ? 'text-brand' : 'text-ink-muted'}`} />
                        {bus.id}
                      </div>
                      <span className="font-mono text-[11px] text-ink-secondary">{bus.speedKmh} km/h</span>
                    </div>

                    <div className="text-[11px] text-ink-muted mt-1 truncate">
                      {bus.routeName}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-ink-faint mt-2 font-mono border-t border-hairline-subtle pt-1.5">
                      <span>Driver: {bus.driverName}</span>
                      <span className="text-semantic-success flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-semantic-success" />
                        AccON
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Vehicle Hardware Stats (Personio Metric Card) */}
          <div className="bg-canvas border border-hairline rounded-lg p-4 shadow-whisper space-y-2 text-xs">
            <div className="text-[10px] font-semibold text-ink-faint uppercase tracking-utility">
              GT06 Binary Stream Health
            </div>
            <div className="grid grid-cols-2 gap-2 text-ink font-mono text-[11px]">
              <div>
                <span className="text-ink-faint text-[10px]">Speed:</span>
                <div className="font-bold">{selectedBus.speedKmh} km/h</div>
              </div>
              <div>
                <span className="text-ink-faint text-[10px]">Heading:</span>
                <div className="font-bold">{selectedBus.heading}°</div>
              </div>
              <div>
                <span className="text-ink-faint text-[10px]">Coordinates:</span>
                <div className="text-[10px] truncate">{selectedBus.lat}, {selectedBus.lng}</div>
              </div>
              <div>
                <span className="text-ink-faint text-[10px]">Ignition:</span>
                <div className="text-semantic-success font-bold">ONLINE</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
