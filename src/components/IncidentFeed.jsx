import trafficData from '../data/trafficData.json'

const CONGESTION_COLORS = {
  high: { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/25', bar: 'bg-red-400', label: 'HIGH' },
  moderate: { text: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/25', bar: 'bg-yellow-400', label: 'MODERATE' },
  low: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/25', bar: 'bg-emerald-400', label: 'LOW' },
}

const ALL_INCIDENTS = trafficData.roads.flatMap(r =>
  r.incidents.map(inc => ({
    id: `${r.id}-${inc}`,
    road: r.name,
    incident: inc,
    level: r.congestionLevel,
    congestionScore: r.congestionScore,
    speed: r.speed,
    vehicleCount: r.vehicleCount,
  }))
)

function IncidentItem({ item, index }) {
  const colors = CONGESTION_COLORS[item.level]

  return (
    <div
      className={`
        p-3 rounded-lg border ${colors.border} ${colors.bg}
        hover:border-opacity-60 transition-all duration-200 cursor-default
        fade-in-up
      `}
      style={{ animationDelay: `${index * 60}ms` }}
      id={`incident-${item.id}`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${colors.border} ${colors.text} font-mono tracking-widest`}>
          {colors.label}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-gray-500 font-mono">{item.vehicleCount} veh</span>
          <span className="text-gray-700">·</span>
          <span className="text-[10px] text-gray-500 font-mono">{item.speed} km/h</span>
        </div>
      </div>

      <p className="text-xs text-gray-200 font-semibold mb-1 leading-snug">{item.incident}</p>
      <p className="text-[10px] text-gray-500 font-mono truncate">{item.road}</p>

      <div className="mt-2 flex items-center gap-2">
        <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-full ${colors.bar} rounded-full transition-all duration-700`}
            style={{ width: `${item.congestionScore}%` }}
          />
        </div>
        <span className={`text-[10px] font-mono font-bold ${colors.text} tabular-nums`}>
          {item.congestionScore}%
        </span>
      </div>
    </div>
  )
}

function RoadListItem({ road, isSelected, onClick, index }) {
  const colors = CONGESTION_COLORS[road.congestionLevel]

  return (
    <button
      id={`road-item-${road.id}`}
      onClick={() => onClick(road)}
      className={`
        w-full text-left p-3 rounded-lg border transition-all duration-200
        ${isSelected
          ? `${colors.bg} border-sky-500/40 shadow-lg shadow-sky-500/10`
          : `bg-gray-900/50 border-white/[0.05] hover:border-white/[0.10] hover:bg-gray-800/40`
        }
        fade-in-up
      `}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-semibold text-gray-200 truncate pr-2 leading-tight">
          {road.name}
        </span>
        <span className={`shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded font-mono ${colors.text} ${colors.bg} border ${colors.border}`}>
          {road.congestionScore}
        </span>
      </div>

      <div className="flex items-center gap-3 mb-1.5">
        <span className="text-[10px] text-gray-500 font-mono">🚗 {road.vehicleCount}</span>
        <span className="text-[10px] text-gray-500 font-mono">⚡ {road.speed} km/h</span>
        {road.incidents.length > 0 && (
          <span className="text-[10px] text-red-400 font-mono">⚠ {road.incidents.length}</span>
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
}

export default function IncidentFeed({ selectedRoad, onRoadSelect }) {
  const sortedRoads = [...trafficData.roads].sort((a, b) => b.congestionScore - a.congestionScore)

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Selected Road Detail Panel */}
      {selectedRoad ? (
        <div className="glass-card border border-sky-500/25 rounded-xl p-4 fade-in-up">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="text-[10px] text-sky-400 font-mono font-bold uppercase tracking-widest mb-1">
                Selected Road
              </div>
              <h3 className="text-sm font-bold text-white leading-tight">{selectedRoad.name}</h3>
            </div>
            <span
              className={`
                text-sm font-black font-mono px-2 py-1 rounded-lg
                ${CONGESTION_COLORS[selectedRoad.congestionLevel].text}
                ${CONGESTION_COLORS[selectedRoad.congestionLevel].bg}
                border ${CONGESTION_COLORS[selectedRoad.congestionLevel].border}
              `}
            >
              {selectedRoad.congestionScore}%
            </span>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            {[
              { label: 'Speed', val: `${selectedRoad.speed} km/h`, icon: '⚡' },
              { label: 'Vehicles', val: selectedRoad.vehicleCount, icon: '🚗' },
              { label: '15min Pred', val: `${selectedRoad.prediction.next15min}%`, icon: '📈' },
              { label: '30min Pred', val: `${selectedRoad.prediction.next30min}%`, icon: '📊' },
            ].map(({ label, val, icon }) => (
              <div key={label} className="bg-gray-800/50 rounded-lg p-2">
                <div className="text-[9px] text-gray-500 font-mono uppercase">{icon} {label}</div>
                <div className="text-xs font-bold text-gray-200 font-mono">{val}</div>
              </div>
            ))}
          </div>

          {/* Prediction bar */}
          <div className="mb-3">
            <div className="flex justify-between text-[9px] text-gray-500 font-mono mb-1">
              <span>15 min</span><span>30 min</span><span>60 min</span>
            </div>
            <div className="flex gap-1">
              {[selectedRoad.prediction.next15min, selectedRoad.prediction.next30min, selectedRoad.prediction.next60min].map((val, i) => {
                const lvl = val >= 70 ? 'high' : val >= 40 ? 'moderate' : 'low'
                return (
                  <div key={i} className="flex-1 bg-gray-800 rounded h-2 overflow-hidden">
                    <div
                      className={`h-full ${CONGESTION_COLORS[lvl].bar} rounded`}
                      style={{ width: `${val}%` }}
                    />
                  </div>
                )
              })}
            </div>
          </div>

          {/* Signal recommendation */}
          <div className="bg-sky-500/8 border border-sky-500/20 rounded-lg p-2.5 mb-2">
            <div className="text-[9px] text-sky-400 font-mono font-bold uppercase mb-1">🚦 Signal Recommendation</div>
            <p className="text-[11px] text-gray-300 leading-snug">{selectedRoad.signalRecommendation}</p>
          </div>

          {/* Alternate route */}
          <div className="bg-emerald-500/8 border border-emerald-500/20 rounded-lg p-2.5">
            <div className="text-[9px] text-emerald-400 font-mono font-bold uppercase mb-1">🔀 Alternate Route</div>
            <p className="text-[11px] text-gray-300 leading-snug">{selectedRoad.alternateRoute}</p>
          </div>
        </div>
      ) : (
        <div className="glass-card border border-white/[0.06] rounded-xl p-4 text-center">
          <div className="text-3xl mb-2">🗺️</div>
          <div className="text-xs font-semibold text-gray-400 mb-1">No road selected</div>
          <div className="text-[10px] text-gray-600 font-mono">Click any road on the map to see details</div>
        </div>
      )}

      {/* Active Incidents */}
      {ALL_INCIDENTS.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-red-400 status-blink"></div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest font-mono">
              Active Incidents ({ALL_INCIDENTS.length})
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {ALL_INCIDENTS.map((item, i) => (
              <IncidentItem key={item.id} item={item} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* Road List */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest font-mono">
            All Roads — by Congestion
          </span>
        </div>
        <div className="flex flex-col gap-1.5">
          {sortedRoads.map((road, i) => (
            <RoadListItem
              key={road.id}
              road={road}
              isSelected={selectedRoad?.id === road.id}
              onClick={onRoadSelect}
              index={i}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
