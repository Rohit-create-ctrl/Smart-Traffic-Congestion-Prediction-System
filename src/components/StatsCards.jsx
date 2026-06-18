import { useMemo } from 'react'
import trafficData from '../data/trafficData.json'

const STATS = [
  {
    id: 'total-roads',
    label: 'Total Roads',
    key: 'totalRoads',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    color: 'sky',
    suffix: '',
    description: 'Monitored segments',
    gradient: 'from-sky-500/20 to-blue-500/20',
    border: 'border-sky-500/25',
    text: 'text-sky-400',
    glow: 'shadow-sky-500/20',
    iconBg: 'bg-sky-500/15',
  },
  {
    id: 'congested-roads',
    label: 'Congested Roads',
    key: 'congestedRoads',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 9V13M12 17H12.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    color: 'red',
    suffix: '',
    description: 'High congestion (>70)',
    gradient: 'from-red-500/20 to-rose-500/20',
    border: 'border-red-500/25',
    text: 'text-red-400',
    glow: 'shadow-red-500/20',
    iconBg: 'bg-red-500/15',
  },
  {
    id: 'avg-congestion',
    label: 'Avg Congestion',
    key: 'averageCongestion',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 20V10M12 20V4M6 20V14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    color: 'amber',
    suffix: '%',
    description: 'Network congestion index',
    gradient: 'from-amber-500/20 to-yellow-500/20',
    border: 'border-amber-500/25',
    text: 'text-amber-400',
    glow: 'shadow-amber-500/20',
    iconBg: 'bg-amber-500/15',
  },
  {
    id: 'active-incidents',
    label: 'Active Incidents',
    key: 'activeIncidents',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    color: 'violet',
    suffix: '',
    description: 'Requiring attention',
    gradient: 'from-violet-500/20 to-purple-500/20',
    border: 'border-violet-500/25',
    text: 'text-violet-400',
    glow: 'shadow-violet-500/20',
    iconBg: 'bg-violet-500/15',
  },
]

function MiniSparkline({ color }) {
  const pts = useMemo(() => {
    const heights = Array.from({ length: 20 }, () => 20 + Math.random() * 40)
    return heights
      .map((h, i) => `${(i / 19) * 100},${60 - h}`)
      .join(' ')
  }, [])

  const colorMap = {
    sky: '#38bdf8',
    red: '#f87171',
    amber: '#fbbf24',
    violet: '#a78bfa',
  }

  return (
    <svg viewBox="0 0 100 60" className="w-full h-10 opacity-60" preserveAspectRatio="none">
      <polyline
        points={pts}
        fill="none"
        stroke={colorMap[color]}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function StatsCards({ selectedRoad }) {
  const stats = trafficData.systemStats

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {STATS.map((stat, idx) => {
        const value = stats[stat.key]
        const displayVal = typeof value === 'number' && !Number.isInteger(value)
          ? value.toFixed(1)
          : value

        return (
          <div
            key={stat.id}
            id={`stat-card-${stat.id}`}
            className={`
              relative overflow-hidden rounded-xl glass-card
              border ${stat.border}
              p-4 group cursor-default
              hover:border-opacity-50 transition-all duration-300
              shadow-lg ${stat.glow}
              fade-in-up
            `}
            style={{ animationDelay: `${idx * 80}ms` }}
          >
            {/* Top row */}
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2 rounded-lg ${stat.iconBg} ${stat.text} transition-transform duration-300 group-hover:scale-110`}>
                {stat.icon}
              </div>
              <div className="text-right">
                <div className={`text-2xl font-black tabular-nums ${stat.text} font-mono leading-none`}>
                  {displayVal}<span className="text-sm font-semibold ml-0.5 opacity-75">{stat.suffix}</span>
                </div>
              </div>
            </div>

            {/* Sparkline */}
            <div className="mb-2">
              <MiniSparkline color={stat.color} />
            </div>

            {/* Bottom */}
            <div>
              <div className="text-xs font-semibold text-gray-200 mb-0.5">{stat.label}</div>
              <div className="text-[10px] text-gray-500 font-mono">{stat.description}</div>
            </div>

            {/* Gradient overlay bottom */}
            <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${stat.gradient} opacity-60 group-hover:opacity-100 transition-opacity`}></div>
          </div>
        )
      })}
    </div>
  )
}
