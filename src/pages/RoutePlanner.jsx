import { useState, useMemo } from 'react'
import { MapContainer, TileLayer, Polyline, Tooltip, useMap } from 'react-leaflet'

function CenterMap({ coords }) {
  const map = useMap()
  useMemo(() => {
    if (coords && coords.length > 0) {
      map.fitBounds(coords, { padding: [30, 30], animate: true, duration: 0.8 })
    }
  }, [coords, map])
  return null
}

export default function RoutePlanner({ roadsData = [], onRoadSelect }) {
  const [startRoadId, setStartRoadId] = useState('')
  const [endRoadId, setEndRoadId] = useState('')

  // Get active selected road objects
  const startRoad = useMemo(() => roadsData.find(r => r.id === startRoadId), [startRoadId, roadsData])
  const endRoad = useMemo(() => roadsData.find(r => r.id === endRoadId), [endRoadId, roadsData])

  // Try to find if alternate road exists in database
  const alternateRoad = useMemo(() => {
    if (!startRoad) return null
    // search road name that matches alternateRoute
    const altName = startRoad.alternateRoute.toLowerCase()
    return roadsData.find(r => {
      const name = r.name.toLowerCase()
      return altName.includes(name) || name.includes(altName)
    })
  }, [startRoad, roadsData])

  // Combined coordinates for centering
  const routeCoordinates = useMemo(() => {
    const coords = []
    if (startRoad?.coordinates) coords.push(...startRoad.coordinates)
    if (endRoad?.coordinates) coords.push(...endRoad.coordinates)
    if (alternateRoad?.coordinates) coords.push(...alternateRoad.coordinates)
    return coords
  }, [startRoad, endRoad, alternateRoad])

  // Calculate mock travel times
  const routeStats = useMemo(() => {
    if (!startRoad || !endRoad) return null

    // Base distance
    const dist = parseFloat((2.5 + Math.random() * 3).toFixed(1)) // in km

    // Speed calculation
    const currentSpeed = Math.round((startRoad.speed + endRoad.speed) / 2)
    const normalSpeed = 45 // km/h

    // Times in minutes
    const normalTime = Math.round((dist / normalSpeed) * 60)
    const currentTime = Math.round((dist / currentSpeed) * 60)
    const delay = Math.max(0, currentTime - normalTime)

    // Alternate times
    const altSpeed = alternateRoad ? alternateRoad.speed : Math.round(currentSpeed * 1.5)
    const altTime = Math.round((dist / altSpeed) * 60)
    const altTimeSaved = Math.max(0, currentTime - altTime)

    return {
      distance: dist,
      normalTime,
      currentTime,
      delay,
      altTime,
      altTimeSaved,
      currentSpeed,
      altSpeed,
    }
  }, [startRoad, endRoad, alternateRoad])

  const getCongestionTextColor = (level) => {
    if (level === 'high') return 'text-red-400'
    if (level === 'moderate') return 'text-yellow-400'
    return 'text-emerald-400'
  }

  const getCongestionBadgeColor = (level) => {
    if (level === 'high') return 'bg-red-500/10 border-red-500/20 text-red-400'
    if (level === 'moderate') return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
    return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
  }

  return (
    <div className="flex-1 flex gap-4 h-full min-h-0 select-none text-gray-200">
      {/* Route Setup & Stats Card (Left Pane - 40%) */}
      <div className="flex-[4] flex flex-col gap-4 overflow-y-auto pr-1">
        <div className="glass-card border border-white/[0.06] rounded-xl p-4">
          <h2 className="text-sm font-bold text-white mb-1">🔍 Smart Route Search</h2>
          <p className="text-[10px] text-gray-500 font-mono leading-tight mb-4">
            Astraea Routing Engine · Real-time Congestion Avoidance
          </p>

          <div className="space-y-3">
            {/* Start Selector */}
            <div>
              <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest font-mono mb-1">
                🟢 Departure Segment
              </label>
              <select
                value={startRoadId}
                onChange={(e) => setStartRoadId(e.target.value)}
                className="w-full bg-gray-900 border border-white/[0.08] rounded-lg p-2.5 text-xs text-gray-200 focus:outline-none focus:border-sky-500/50"
              >
                <option value="">-- Choose Starting Segment --</option>
                {roadsData.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.congestionScore}%)
                  </option>
                ))}
              </select>
            </div>

            {/* End Selector */}
            <div>
              <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest font-mono mb-1">
                🔴 Destination Segment
              </label>
              <select
                value={endRoadId}
                onChange={(e) => setEndRoadId(e.target.value)}
                className="w-full bg-gray-900 border border-white/[0.08] rounded-lg p-2.5 text-xs text-gray-200 focus:outline-none focus:border-sky-500/50"
              >
                <option value="">-- Choose Ending Segment --</option>
                {roadsData.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.congestionScore}%)
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Route Stats */}
        {routeStats ? (
          <div className="space-y-4 fade-in-up">
            {/* KPI grid */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="glass-card border border-white/[0.05] rounded-xl p-3.5 flex flex-col gap-0.5">
                <span className="text-[9px] text-gray-500 font-mono uppercase">Estimated Distance</span>
                <span className="text-xl font-bold font-mono text-white">{routeStats.distance} <span className="text-xs text-gray-500">km</span></span>
              </div>
              <div className="glass-card border border-white/[0.05] rounded-xl p-3.5 flex flex-col gap-0.5">
                <span className="text-[9px] text-gray-500 font-mono uppercase">Congested Delay</span>
                <span className={`text-xl font-bold font-mono ${routeStats.delay > 5 ? 'text-red-400' : 'text-emerald-400'}`}>
                  +{routeStats.delay} <span className="text-xs text-gray-500">min</span>
                </span>
              </div>
              <div className="glass-card border border-white/[0.05] rounded-xl p-3.5 flex flex-col gap-0.5">
                <span className="text-[9px] text-gray-500 font-mono uppercase">Travel Time</span>
                <span className="text-xl font-bold font-mono text-white">{routeStats.currentTime} <span className="text-xs text-gray-500">min</span></span>
              </div>
              <div className="glass-card border border-white/[0.05] rounded-xl p-3.5 flex flex-col gap-0.5">
                <span className="text-[9px] text-gray-500 font-mono uppercase">Avg Speed</span>
                <span className="text-xl font-bold font-mono text-white">{routeStats.currentSpeed} <span className="text-xs text-gray-500">km/h</span></span>
              </div>
            </div>

            {/* Alternate Recommendation Panel */}
            <div className="glass-card border border-emerald-500/20 bg-emerald-500/5 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest font-mono">
                  🌱 Smart Rerouting Recommendation
                </span>
                <span className="text-[9px] font-mono font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
                  Saves {routeStats.altTimeSaved} min
                </span>
              </div>

              <div>
                <div className="text-xs font-semibold text-gray-200 leading-snug">
                  {startRoad.alternateRoute}
                </div>
                <div className="text-[10px] text-gray-400 font-mono mt-1">
                  Alternate path uses segments with optimized flow.
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-emerald-500/10">
                <div>
                  <div className="text-[9px] text-gray-500 font-mono">ALT TRAVEL TIME</div>
                  <div className="text-sm font-bold font-mono text-emerald-400">{routeStats.altTime} min</div>
                </div>
                <div>
                  <div className="text-[9px] text-gray-500 font-mono">ALT AVERAGE SPEED</div>
                  <div className="text-sm font-bold font-mono text-emerald-400">~{routeStats.altSpeed} km/h</div>
                </div>
              </div>
            </div>

            {/* Segment Breakdown */}
            <div className="glass-card border border-white/[0.05] rounded-xl p-4">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono block mb-3">
                🛤️ Segment Congestion Breakdown
              </span>
              <div className="space-y-3">
                {[
                  { label: 'Start', road: startRoad },
                  { label: 'Dest', road: endRoad },
                ].map(({ label, road }) => (
                  <div key={label} className="flex items-start justify-between gap-4 p-2 bg-gray-900/50 rounded-lg">
                    <div className="min-w-0">
                      <span className="text-[8px] font-bold font-mono text-gray-500 uppercase px-1 py-0.5 bg-gray-800 rounded mr-2">
                        {label}
                      </span>
                      <span className="text-xs font-semibold text-gray-200 truncate">{road.name}</span>
                    </div>
                    <span className={`text-xs font-bold font-mono ${getCongestionTextColor(road.congestionLevel)}`}>
                      {road.congestionScore}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-card border border-white/[0.04] rounded-xl p-6 text-center text-gray-500">
            <span className="text-3xl block mb-2">🧭</span>
            <span className="text-xs font-semibold block mb-1">Select routes to begin</span>
            <span className="text-[10px] text-gray-600 font-mono">
              Choose departure and destination nodes to calculate travel speed and delay indicators.
            </span>
          </div>
        )}
      </div>

      {/* Interactive Map Overlay (Right Pane - 60%) */}
      <div className="flex-[6] rounded-xl overflow-hidden border border-white/[0.06] relative h-full">
        {startRoad || endRoad ? (
          <div className="w-full h-full relative">
            <MapContainer
              center={[12.9716, 77.5946]}
              zoom={13}
              className="w-full h-full"
              zoomControl={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Draw start road */}
              {startRoad && (
                <Polyline
                  positions={startRoad.coordinates}
                  pathOptions={{
                    color: '#38bdf8', // sky-400
                    weight: 8,
                    opacity: 0.9,
                  }}
                >
                  <Tooltip permanent direction="top" className="road-label">
                    🟢 Departure: {startRoad.name.split(' - ')[0]}
                  </Tooltip>
                </Polyline>
              )}

              {/* Draw destination road */}
              {endRoad && (
                <Polyline
                  positions={endRoad.coordinates}
                  pathOptions={{
                    color: '#818cf8', // indigo-400
                    weight: 8,
                    opacity: 0.9,
                  }}
                >
                  <Tooltip permanent direction="top" className="road-label">
                    🔴 Destination: {endRoad.name.split(' - ')[0]}
                  </Tooltip>
                </Polyline>
              )}

              {/* Draw alternate road if recommended */}
              {alternateRoad && (
                <Polyline
                  positions={alternateRoad.coordinates}
                  pathOptions={{
                    color: '#34d399', // emerald-400
                    weight: 6,
                    opacity: 0.8,
                    dashArray: '5, 8',
                  }}
                >
                  <Tooltip permanent direction="bottom" className="road-label">
                    🌱 Alternate Avoidance: {alternateRoad.name.split(' - ')[0]}
                  </Tooltip>
                </Polyline>
              )}

              <CenterMap coords={routeCoordinates} />
            </MapContainer>

            {/* Overlay indicators legend */}
            <div className="absolute bottom-4 left-4 z-[1000] glass-card border border-white/[0.08] rounded-xl p-3 shadow-xl">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono block mb-2">
                Route Legend
              </span>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-1 rounded bg-sky-400" />
                  <span className="text-[10px] font-mono text-gray-300">Start Corridor</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-1 rounded bg-indigo-400" />
                  <span className="text-[10px] font-mono text-gray-300">End Corridor</span>
                </div>
                {alternateRoad && (
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-1 rounded border-t-2 border-dashed border-emerald-400" />
                    <span className="text-[10px] font-mono text-gray-300">Congestion-Free Alt</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full h-full bg-gray-900/40 flex items-center justify-center">
            <div className="text-center p-6 max-w-sm">
              <div className="text-4xl mb-3">🗺️</div>
              <div className="text-sm font-semibold text-gray-400 mb-1">Route Map Active</div>
              <div className="text-[11px] text-gray-600 font-mono leading-relaxed">
                Map overlays representing start, end, and recommended alternative paths will render dynamically as choices are selected on the left.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
