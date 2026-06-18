import { useState } from 'react'

export default function Sidebar({
  activePage,
  setActivePage,
  selectedRoad,
  setSelectedRoad,
  recentRoads = [],
  roadsData = [],
  simulationActive,
  setSimulationActive,
}) {
  // Select pinned items from our data
  // Koramangala - Silk Board (R003), MG Road (R001), Hebbal Flyover (R005), Bannerghatta Road (R008)
  const pinnedIds = ['R003', 'R001', 'R005', 'R008']
  const pinnedRoads = roadsData.filter((r) => pinnedIds.includes(r.id))

  const getStatusColor = (level) => {
    if (level === 'high') return 'bg-red-400'
    if (level === 'moderate') return 'bg-yellow-400'
    return 'bg-emerald-400'
  }

  const handleRoadClick = (road) => {
    setSelectedRoad(road)
    setActivePage('explorer')
  }

  const menuItems = [
    { id: 'explorer', label: 'Map Explorer', icon: '🗺️', desc: 'Live traffic tracking' },
    { id: 'route-planner', label: 'Route Planner', icon: '🔍', desc: 'Congestion-free paths' },
    { id: 'analytics', label: 'Network Analytics', icon: '📊', desc: 'Congestion & speed charts' },
    { id: 'incidents', label: 'Incidents Center', icon: '⚠️', desc: 'Report & view breakdowns' },
    { id: 'signals', label: 'AI Signal Control', icon: '🚦', desc: 'Optimize traffic signals' },
  ]

  return (
    <aside
      className="w-[260px] h-full flex flex-col bg-gray-950 border-r border-white/[0.06] select-none text-gray-200"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Upper Logo / Brand */}
      <div className="p-4 flex items-center justify-between border-b border-white/[0.04]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/10">
            <svg viewBox="0 0 24 24" className="w-4.5 h-4.5 text-white" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="currentColor" />
            </svg>
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-sky-400 font-mono leading-none">
              Astraea AI
            </div>
            <div className="text-[9px] text-gray-500 font-mono">Smart Traffic Node</div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <span className={`w-1.5 h-1.5 rounded-full ${simulationActive ? 'bg-emerald-400 status-blink' : 'bg-gray-600'}`} />
          <span className="text-[8px] text-gray-500 font-mono uppercase">
            {simulationActive ? 'SIM' : 'STATIC'}
          </span>
        </div>
      </div>

      {/* New Search Action Button */}
      <div className="p-3">
        <button
          onClick={() => setActivePage('route-planner')}
          className="w-full py-2.5 px-3 rounded-lg border border-dashed border-sky-500/20 bg-sky-500/5 hover:bg-sky-500/10 hover:border-sky-500/40 text-sky-300 text-xs font-semibold font-mono flex items-center justify-between transition-all duration-200 group"
        >
          <span className="flex items-center gap-2">
            <span>➕</span>
            <span>Plan New Route</span>
          </span>
          <kbd className="text-[9px] bg-sky-500/15 border border-sky-500/20 px-1.5 py-0.5 rounded text-sky-300 leading-none group-hover:bg-sky-500/20">
            Ctrl R
          </kbd>
        </button>
      </div>

      {/* Scrollable Navigation section */}
      <div className="flex-1 overflow-y-auto px-2 space-y-4 py-2" style={{ scrollbarWidth: 'none' }}>
        {/* Navigation List */}
        <div className="space-y-0.5">
          {menuItems.map((item) => {
            const isActive = activePage === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-150 ${
                  isActive
                    ? 'bg-white/[0.06] text-white border border-white/[0.04]'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.02] border border-transparent'
                }`}
              >
                <span className="text-sm shrink-0">{item.icon}</span>
                <div className="min-w-0">
                  <div className="text-xs font-semibold truncate leading-none mb-0.5">{item.label}</div>
                  <div className="text-[9px] text-gray-500 font-mono truncate leading-none">{item.desc}</div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Pinned Roads Section */}
        {pinnedRoads.length > 0 && (
          <div className="pt-2">
            <div className="px-3 text-[9px] font-bold text-gray-500 uppercase tracking-widest font-mono mb-2">
              📌 Pinned
            </div>
            <div className="space-y-0.5">
              {pinnedRoads.map((road) => (
                <button
                  key={road.id}
                  onClick={() => handleRoadClick(road)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-md text-left text-xs text-gray-400 hover:text-gray-200 hover:bg-white/[0.02] transition-all duration-150 truncate border border-transparent ${
                    selectedRoad?.id === road.id && activePage === 'explorer' ? 'bg-white/[0.03] text-sky-400' : ''
                  }`}
                >
                  <span className="truncate pr-2 font-medium">{road.name.split(' - ')[0]}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[9px] font-mono text-gray-600">{road.congestionScore}%</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${getStatusColor(road.congestionLevel)}`} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Recent Searches Section */}
        {recentRoads.length > 0 && (
          <div className="pt-2">
            <div className="px-3 text-[9px] font-bold text-gray-500 uppercase tracking-widest font-mono mb-2">
              🕒 Recents
            </div>
            <div className="space-y-0.5">
              {recentRoads.map((road) => (
                <button
                  key={road.id}
                  onClick={() => handleRoadClick(road)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-md text-left text-xs text-gray-400 hover:text-gray-200 hover:bg-white/[0.02] transition-all duration-150 truncate border border-transparent ${
                    selectedRoad?.id === road.id && activePage === 'explorer' ? 'bg-white/[0.03] text-sky-400' : ''
                  }`}
                >
                  <span className="truncate pr-2 font-medium">💬 {road.name.split(' - ')[0]}</span>
                  <span className="text-[8px] font-mono text-gray-600 shrink-0">{road.id}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Operator Info & Simulation */}
      <div className="p-3 border-t border-white/[0.05] bg-gray-950/60 space-y-3">
        {/* Simulator Toggle */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold font-mono text-gray-400 leading-tight">Live Simulator</span>
            <span className="text-[8px] font-mono text-gray-500 leading-none">Simulate live traffic feed</span>
          </div>
          <button
            onClick={() => setSimulationActive((prev) => !prev)}
            className={`w-9 h-5 rounded-full relative transition-colors duration-200 focus:outline-none ${
              simulationActive ? 'bg-sky-500' : 'bg-gray-800'
            }`}
          >
            <div
              className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform duration-200 shadow-sm ${
                simulationActive ? 'translate-x-4.5' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Profile Card */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-full bg-sky-500/15 border border-sky-500/20 text-sky-400 text-xs font-black flex items-center justify-center shrink-0">
              TO
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-gray-200 leading-tight">Traffic Operator</div>
              <div className="text-[9px] text-gray-500 font-mono truncate leading-none">bengaluru_admin</div>
            </div>
          </div>
          <button className="text-gray-500 hover:text-gray-300 p-1.5 rounded-md hover:bg-white/[0.03] transition-colors">
            ⚙️
          </button>
        </div>
      </div>
    </aside>
  )
}
