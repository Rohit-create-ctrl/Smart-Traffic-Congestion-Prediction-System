import { useState, useEffect } from 'react'
import trafficData from '../data/trafficData.json'

const PAGE_TITLES = {
  explorer: 'Map Explorer',
  'route-planner': 'Route Search & Planner',
  analytics: 'Network Metrics & Analytics',
  incidents: 'Emergency Incident Center',
  signals: 'AI Traffic Signal Control',
}

export default function Header({ roadsData = [], activePage = 'explorer' }) {
  const displayRoads = roadsData.length > 0 ? roadsData : trafficData.roads

  const dynamicIncidents = displayRoads
    .flatMap(r => (r.incidents || []).map(inc => ({ road: r.name, incident: inc, level: r.congestionLevel })))

  const tickerItems = dynamicIncidents.length > 0 ? dynamicIncidents : [
    { road: 'System', incident: 'All systems nominal — no active incidents detected', level: 'low' }
  ]

  const repeatedTicker = [...tickerItems, ...tickerItems]

  const getSeverityColor = (level) => {
    if (level === 'high') return 'text-red-400'
    if (level === 'moderate') return 'text-yellow-400'
    return 'text-sky-400'
  }

  const getSeverityIcon = (level) => {
    if (level === 'high') return '🔴'
    if (level === 'moderate') return '🟡'
    return '🔵'
  }

  const activePageTitle = PAGE_TITLES[activePage] || 'Smart Traffic Node'

  return (
    <header className="relative z-50 border-b border-white/[0.06] bg-gray-950/90 backdrop-blur-xl">
      {/* Top bar */}
      <div className="px-6 py-3 flex items-center justify-between gap-4">
        {/* Left: Logo + Title */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-sky-500/20 to-indigo-500/20 border border-sky-500/30 glow-pulse">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 17L7 7L12 14L16 9L21 17" stroke="url(#headerGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 17H21" stroke="url(#headerGrad)" strokeWidth="2" strokeLinecap="round"/>
              <defs>
                <linearGradient id="headerGrad" x1="3" y1="7" x2="21" y2="17" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#38bdf8"/>
                  <stop offset="1" stopColor="#818cf8"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div>
            <h1 className="text-base font-bold leading-tight gradient-text tracking-tight">
              {activePageTitle}
            </h1>
            <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">
              Smart Traffic Congestion Prediction
            </p>
          </div>
        </div>

        {/* Center: System badges */}
        <div className="hidden md:flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 status-blink"></span>
            System Online
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/25 text-sky-400 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 status-blink"></span>
            AI Model Active
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/25 text-violet-400 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 status-blink"></span>
            {displayRoads.length} Roads Monitored
          </span>
        </div>

      </div>

      {/* Incident Ticker */}
      <div className="relative flex items-center gap-0 overflow-hidden border-t border-white/[0.04] bg-gray-950/50 h-8">
        <div className="shrink-0 flex items-center gap-2 px-3 h-full bg-red-500/15 border-r border-red-500/20 z-10">
          <span className="text-red-400 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap font-mono">
            ⚠ LIVE FEED
          </span>
        </div>
        <div className="flex-1 overflow-hidden relative">
          <div className="flex ticker-scroll whitespace-nowrap">
            {repeatedTicker.map((item, i) => (
              <span key={i} className="inline-flex items-center gap-2 px-6 text-[11px] font-mono">
                <span className="text-base">{getSeverityIcon(item.level)}</span>
                <span className="text-gray-400 font-semibold">[{item.road.split(' - ')[0]}]</span>
                <span className={`${getSeverityColor(item.level)}`}>{item.incident}</span>
                <span className="text-gray-700 mx-2">·</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </header>
  )
}
