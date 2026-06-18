import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  AreaChart,
  Area,
} from 'recharts'

export default function Analytics({ roadsData = [], stats = {} }) {
  // 1. Data for Congestion comparison
  const congestionData = useMemo(() => {
    return [...roadsData]
      .sort((a, b) => b.congestionScore - a.congestionScore)
      .map((r) => ({
        name: r.name.split(' - ')[0],
        score: r.congestionScore,
        speed: r.speed,
        vehicles: r.vehicleCount,
      }))
  }, [roadsData])

  // 2. Data for Pie chart: levels distribution
  const levelDistribution = useMemo(() => {
    const counts = { high: 0, moderate: 0, low: 0 }
    roadsData.forEach((r) => {
      counts[r.congestionLevel]++
    })
    return [
      { name: 'Critical (>70)', value: counts.high, color: '#f87171' },
      { name: 'Moderate (40-70)', value: counts.moderate, color: '#fbbf24' },
      { name: 'Optimal (<40)', value: counts.low, color: '#34d399' },
    ]
  }, [roadsData])

  // 3. Data for speed vs density relationship
  const flowData = useMemo(() => {
    return [...roadsData]
      .sort((a, b) => a.vehicleCount - b.vehicleCount)
      .map((r) => ({
        vehicles: r.vehicleCount,
        speed: r.speed,
        name: r.name.split(' - ')[0],
      }))
  }, [roadsData])

  // Calculate deep metrics
  const analysisMetrics = useMemo(() => {
    if (roadsData.length === 0) return {}
    const totalVehicles = roadsData.reduce((sum, r) => sum + r.vehicleCount, 0)
    const avgSpeed = Math.round(roadsData.reduce((sum, r) => sum + r.speed, 0) / roadsData.length)
    const congestedPercent = Math.round(
      (roadsData.filter((r) => r.congestionLevel === 'high').length / roadsData.length) * 100
    )

    return {
      totalVehicles,
      avgSpeed,
      congestedPercent,
      networkEfficiency: 100 - congestedPercent,
    }
  }, [roadsData])

  return (
    <div className="flex-1 overflow-y-auto pr-1 h-full select-none text-gray-200 space-y-4 pb-6">
      {/* Overview stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Active Fleet', val: analysisMetrics.totalVehicles, desc: 'Total vehicles tracked', icon: '🚗', color: 'text-sky-400', border: 'border-sky-500/20' },
          { label: 'Average Speed', val: `${analysisMetrics.avgSpeed} km/h`, desc: 'Average flow velocity', icon: '⚡', color: 'text-yellow-400', border: 'border-yellow-500/20' },
          { label: 'Network Congested', val: `${analysisMetrics.congestedPercent}%`, desc: 'High congestion ratio', icon: '⚠️', color: 'text-red-400', border: 'border-red-500/20' },
          { label: 'Traffic Efficiency', val: `${analysisMetrics.networkEfficiency}%`, desc: 'Optimized flow index', icon: '🌱', color: 'text-emerald-400', border: 'border-emerald-500/20' },
        ].map((m, i) => (
          <div key={i} className={`glass-card border ${m.border} rounded-xl p-4 flex flex-col justify-between hover:scale-[1.01] transition-transform`}>
            <div className="flex justify-between items-start mb-2">
              <span className="text-xl">{m.icon}</span>
              <span className={`text-xl font-bold font-mono ${m.color}`}>{m.val}</span>
            </div>
            <div>
              <div className="text-xs font-bold text-gray-200">{m.label}</div>
              <div className="text-[9px] text-gray-500 font-mono">{m.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Row 2: Congestion Bar Chart (Full Width) */}
      <div className="glass-card border border-white/[0.06] rounded-xl p-4">
        <h3 className="text-xs font-bold font-mono uppercase text-gray-400 tracking-wider mb-4 flex items-center gap-2">
          <span>📈</span> Network Congestion Score Comparison
        </h3>
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={congestionData} margin={{ top: 10, right: 10, left: -25, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 9, fontFamily: 'JetBrains Mono, monospace' }}
                axisLine={false}
                tickLine={false}
                angle={-25}
                textAnchor="end"
                height={50}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 9, fontFamily: 'JetBrains Mono, monospace' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{ background: '#090d16', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                itemStyle={{ color: '#38bdf8' }}
                labelStyle={{ color: '#9ca3af', fontFamily: 'JetBrains Mono, monospace', fontSize: 10 }}
              />
              <Bar dataKey="score" fill="#38bdf8" radius={[4, 4, 0, 0]}>
                {congestionData.map((entry, index) => {
                  const color = entry.score > 70 ? '#f87171' : entry.score > 40 ? '#fbbf24' : '#34d399'
                  return <Cell key={`cell-${index}`} fill={color} />
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 3: Two Column Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Speed vs Vehicle Density Composed Chart */}
        <div className="glass-card border border-white/[0.06] rounded-xl p-4">
          <h3 className="text-xs font-bold font-mono uppercase text-gray-400 tracking-wider mb-4 flex items-center gap-2">
            <span>🔀</span> Velocity vs Vehicle Density
          </h3>
          <div className="w-full h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={flowData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSpeed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f87171" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f87171" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis
                  dataKey="vehicles"
                  tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 9, fontFamily: 'JetBrains Mono, monospace' }}
                  axisLine={false}
                  tickLine={false}
                  label={{ value: 'Vehicles Tracked', position: 'insideBottom', offset: -5, fill: 'rgba(255,255,255,0.3)', fontSize: 9 }}
                />
                <YAxis
                  tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 9, fontFamily: 'JetBrains Mono, monospace' }}
                  axisLine={false}
                  tickLine={false}
                  label={{ value: 'Speed (km/h)', angle: -90, position: 'insideLeft', offset: 10, fill: 'rgba(255,255,255,0.3)', fontSize: 9 }}
                />
                <Tooltip
                  contentStyle={{ background: '#090d16', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                  labelFormatter={(v) => `${v} vehicles in transit`}
                />
                <Area type="monotone" dataKey="speed" stroke="#fbbf24" fillOpacity={1} fill="url(#colorSpeed)" strokeWidth={2} name="Flow Speed" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Level Distribution Pie Chart */}
        <div className="glass-card border border-white/[0.06] rounded-xl p-4 flex flex-col">
          <h3 className="text-xs font-bold font-mono uppercase text-gray-400 tracking-wider mb-4 flex items-center gap-2">
            <span>📊</span> Network Congestion Ratio
          </h3>
          <div className="flex-1 flex items-center justify-center min-h-[224px]">
            <div className="w-1/2 h-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={levelDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {levelDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#090d16', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                    itemStyle={{ fontSize: 11 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Custom Pie Legend */}
            <div className="w-1/2 space-y-3">
              {levelDistribution.map((item, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <div>
                    <div className="text-xs font-bold text-gray-200 leading-none mb-0.5">{item.name}</div>
                    <div className="text-[10px] text-gray-500 font-mono leading-none">
                      {item.value} road{item.value !== 1 ? 's' : ''} (
                      {Math.round((item.value / roadsData.length) * 100)}%)
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
