import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Polyline, Tooltip, useMap } from 'react-leaflet'
import trafficData from '../data/trafficData.json'

const CONGESTION_COLORS = {
  high: '#f87171',
  moderate: '#fbbf24',
  low: '#34d399',
}

const CONGESTION_GLOW = {
  high: 'rgba(248,113,113,0.35)',
  moderate: 'rgba(251,191,36,0.35)',
  low: 'rgba(52,211,153,0.35)',
}

function ZoomToSelected({ road }) {
  const map = useMap()
  useEffect(() => {
    if (road && road.coordinates?.length > 0) {
      const lats = road.coordinates.map(c => c[0])
      const lngs = road.coordinates.map(c => c[1])
      const bounds = [
        [Math.min(...lats) - 0.005, Math.min(...lngs) - 0.005],
        [Math.max(...lats) + 0.005, Math.max(...lngs) + 0.005],
      ]
      map.fitBounds(bounds, { animate: true, duration: 0.8 })
    }
  }, [road, map])
  return null
}

function CongestionLegend() {
  return (
    <div className="absolute bottom-6 left-4 z-[1000] glass-card border border-white/[0.08] rounded-xl p-3 shadow-xl">
      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 font-mono">
        Congestion Level
      </div>
      {[
        { label: 'High (>70)', level: 'high', range: '70-100' },
        { label: 'Moderate (40-70)', level: 'moderate', range: '40-70' },
        { label: 'Low (<40)', level: 'low', range: '0-40' },
      ].map(({ label, level }) => (
        <div key={level} className="flex items-center gap-2 mb-1.5 last:mb-0">
          <div
            className="w-8 h-1.5 rounded-full"
            style={{ backgroundColor: CONGESTION_COLORS[level], boxShadow: `0 0 6px ${CONGESTION_GLOW[level]}` }}
          />
          <span className="text-[11px] text-gray-300 font-mono">{label}</span>
        </div>
      ))}
      <div className="mt-2 pt-2 border-t border-white/[0.06]">
        <div className="text-[9px] text-gray-600 font-mono">Click roads to inspect</div>
      </div>
    </div>
  )
}

function RoadPolyline({ road, isSelected, onSelect }) {
  const color = CONGESTION_COLORS[road.congestionLevel]
  const weight = isSelected ? 7 : road.congestionLevel === 'high' ? 5 : 4
  const opacity = isSelected ? 1 : 0.82

  const midIdx = Math.floor(road.coordinates.length / 2)
  const midCoord = road.coordinates[midIdx]

  return (
    <>
      {/* Shadow/glow underneath for high congestion */}
      {road.congestionLevel === 'high' && (
        <Polyline
          positions={road.coordinates}
          pathOptions={{
            color: CONGESTION_GLOW.high,
            weight: 14,
            opacity: 0.4,
            lineCap: 'round',
            lineJoin: 'round',
          }}
        />
      )}

      <Polyline
        positions={road.coordinates}
        pathOptions={{
          color,
          weight,
          opacity,
          lineCap: 'round',
          lineJoin: 'round',
          dashArray: isSelected ? null : null,
        }}
        eventHandlers={{
          click: () => onSelect(road),
          mouseover: (e) => {
            e.target.setStyle({ weight: weight + 2, opacity: 1 })
          },
          mouseout: (e) => {
            e.target.setStyle({ weight, opacity })
          },
        }}
      >
        <Tooltip
          permanent
          direction="center"
          className="road-label"
          offset={[0, 0]}
        >
          {road.congestionLevel === 'high' ? '🔴' : road.congestionLevel === 'moderate' ? '🟡' : '🟢'}{' '}
          {road.name.split(' - ')[0]}
        </Tooltip>
      </Polyline>

      {/* Selected highlight ring */}
      {isSelected && (
        <Polyline
          positions={road.coordinates}
          pathOptions={{
            color: '#ffffff',
            weight: weight + 4,
            opacity: 0.15,
            lineCap: 'round',
            lineJoin: 'round',
          }}
        />
      )}
    </>
  )
}

export default function TrafficMap({ selectedRoad, onRoadSelect, roadsData = [] }) {
  const center = [12.9716, 77.5946] // Bengaluru center
  const displayRoads = roadsData.length > 0 ? roadsData : trafficData.roads

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-white/[0.06] shadow-2xl">
      {/* Map header overlay */}
      <div className="absolute top-0 left-0 right-0 z-[1000] flex items-center justify-between px-4 py-2.5 bg-gradient-to-b from-gray-950/80 to-transparent pointer-events-none">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 status-blink"></div>
          <span className="text-[11px] font-mono text-gray-400 font-semibold">
            LIVE — Bengaluru City Network
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="px-2 py-0.5 rounded-md bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[10px] font-mono">
            OSM + Leaflet
          </span>
          <span className="px-2 py-0.5 rounded-md bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[10px] font-mono">
            {displayRoads.length} segments
          </span>
        </div>
      </div>

      <MapContainer
        center={center}
        zoom={12}
        className="w-full h-full"
        zoomControl={true}
        attributionControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {displayRoads.map((road) => (
          <RoadPolyline
            key={road.id}
            road={road}
            isSelected={selectedRoad?.id === road.id}
            onSelect={onRoadSelect}
          />
        ))}

        <ZoomToSelected road={selectedRoad} />
      </MapContainer>

      {/* Legend */}
      <CongestionLegend />

      {/* Selected road badge */}
      {selectedRoad && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-[1000] fade-in-up">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-sky-500/30 shadow-lg">
            <span className="text-[10px] text-gray-500 font-mono uppercase">Selected:</span>
            <span className="text-xs font-semibold text-sky-300 font-mono">{selectedRoad.name}</span>
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded font-mono"
              style={{ color: CONGESTION_COLORS[selectedRoad.congestionLevel], backgroundColor: `${CONGESTION_COLORS[selectedRoad.congestionLevel]}20` }}
            >
              {selectedRoad.congestionScore}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
