import { useState } from 'react'
import TrafficMap from '../components/TrafficMap'
import RoadDetailsPanel from '../components/RoadDetailsPanel'

const CONGESTION_COLORS = {
  high: { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/25', bar: 'bg-red-400', label: 'HIGH' },
  moderate: { text: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/25', bar: 'bg-yellow-400', label: 'MODERATE' },
  low: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/25', bar: 'bg-emerald-400', label: 'LOW' },
}

export default function Explorer({
  roadsData,
  selectedRoad,
  setSelectedRoad,
  onRoadSelect,
}) {
  const sortedRoads = [...roadsData].sort((a, b) => b.congestionScore - a.congestionScore)

  // Get active incidents across all roads
  const allIncidents = roadsData.flatMap((r) =>
    (r.incidents || []).map((inc) => ({
      id: `${r.id}-${inc}`,
      road: r.name,
      roadObj: r,
      incident: inc,
      level: r.congestionLevel,
      congestionScore: r.congestionScore,
      speed: r.speed,
      vehicleCount: r.vehicleCount,
    }))
  )

  return (
    <div className="flex-1 flex gap-4 min-h-0 relative h-full">
      {/* Map Segment - 70% */}
      <div className="flex-[7] min-h-0 min-w-0 h-full relative">
        <TrafficMap
          selectedRoad={selectedRoad}
          onRoadSelect={onRoadSelect}
          roadsData={roadsData}
        />
      </div>

      {/* Detail / Feed Panel - 30% */}
      <div className="flex-[3] min-h-0 overflow-y-auto pr-1 flex flex-col h-full gap-4">
        {selectedRoad ? (
          <div className="relative flex-1 flex flex-col min-h-0">
            {/* Deselect / Back button */}
            <button
              onClick={() => setSelectedRoad(null)}
              className="absolute top-3 right-4 z-10 px-2 py-1 rounded bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-[10px] font-mono text-gray-400 transition-colors hover:text-white"
            >
              ✕ Close
            </button>
            <RoadDetailsPanel selectedRoad={selectedRoad} />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Welcome System Card */}
            <div className="glass-card border border-white/[0.06] rounded-xl p-4">
              <div className="text-sm font-bold text-white mb-1">Astraea Traffic Center</div>
              <div className="text-[11px] text-gray-400 font-mono leading-relaxed">
                Bengaluru traffic management node. Click a road segment on the map or select from the list below to view real-time indicators.
              </div>
            </div>

            {/* Active Incidents Feed */}
            {allIncidents.length > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 status-blink"></div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">
                    Active Incidents ({allIncidents.length})
                  </span>
                </div>
                <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
                  {allIncidents.map((item, index) => {
                    const colors = CONGESTION_COLORS[item.level]
                    return (
                      <div
                        key={item.id}
                        onClick={() => onRoadSelect(item.roadObj)}
                        className={`p-3 rounded-lg border ${colors.border} ${colors.bg} hover:border-opacity-60 transition-all duration-200 cursor-pointer hover:scale-[1.01]`}
                        style={{ animationDelay: `${index * 40}ms` }}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${colors.border} ${colors.text} font-mono tracking-wider`}>
                            {colors.label}
                          </span>
                          <span className="text-[9px] text-gray-500 font-mono">
                            {item.speed} km/h
                          </span>
                        </div>
                        <p className="text-xs text-gray-200 font-semibold mb-0.5 leading-snug">
                          {item.incident}
                        </p>
                        <p className="text-[9px] text-gray-500 font-mono truncate">{item.road}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="glass-card border border-emerald-500/10 rounded-xl p-4 text-center">
                <div className="text-xl mb-1">🟢</div>
                <div className="text-xs font-semibold text-emerald-400">All Corridors Clear</div>
                <div className="text-[10px] text-gray-600 font-mono mt-1">No active incidents reported in the network.</div>
              </div>
            )}

            {/* Road List sorted by congestion */}
            <div className="space-y-2">
              <div className="px-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">
                  All Roads by Congestion
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {sortedRoads.map((road, index) => {
                  const colors = CONGESTION_COLORS[road.congestionLevel]
                  const isSelected = selectedRoad?.id === road.id
                  return (
                    <button
                      key={road.id}
                      onClick={() => onRoadSelect(road)}
                      className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                        isSelected
                          ? `${colors.bg} border-sky-500/40 shadow-lg`
                          : 'bg-gray-900/40 border-white/[0.04] hover:border-white/[0.1] hover:bg-gray-800/30'
                      }`}
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-semibold text-gray-200 truncate pr-2 leading-tight">
                          {road.name}
                        </span>
                        <span className={`shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded font-mono ${colors.text} ${colors.bg} border ${colors.border}`}>
                          {road.congestionScore}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-gray-500 font-mono mb-1.5">
                        <span>🚗 {road.vehicleCount}</span>
                        <span>⚡ {road.speed} km/h</span>
                        {road.incidents.length > 0 && (
                          <span className="text-red-400">⚠️ {road.incidents.length}</span>
                        )}
                      </div>
                      <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${colors.bar} rounded-full`}
                          style={{ width: `${road.congestionScore}%` }}
                        />
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
