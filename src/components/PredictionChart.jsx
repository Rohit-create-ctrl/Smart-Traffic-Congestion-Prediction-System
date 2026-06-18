import { useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'

function getColor(score) {
  if (score <= 40) return '#34d399'
  if (score <= 70) return '#fbbf24'
  return '#f87171'
}

function generateForecast(baseScore, prediction) {
  const now = new Date()
  const data = []

  // Current moment
  data.push({ time: 'Now', congestion: baseScore, label: 'Now' })

  // Generate realistic intermediate points between now → 15 min
  const target15 = prediction.next15min
  for (let i = 1; i <= 4; i++) {
    const t = (i / 5)
    const minutes = Math.round(i * 3)
    const base = baseScore + (target15 - baseScore) * t
    // Add small random flutter ±4
    const flutter = (Math.random() - 0.5) * 8
    data.push({
      time: `+${minutes}m`,
      congestion: Math.max(0, Math.min(100, Math.round(base + flutter))),
    })
  }

  // 15 min mark
  data.push({ time: '+15m', congestion: target15, label: '15m' })

  // Bridge to 30 min with flutter
  const target30 = prediction.next30min
  for (let i = 1; i <= 2; i++) {
    const t = i / 3
    const base = target15 + (target30 - target15) * t
    const flutter = (Math.random() - 0.5) * 6
    data.push({
      time: `+${15 + Math.round(i * 5)}m`,
      congestion: Math.max(0, Math.min(100, Math.round(base + flutter))),
    })
  }

  // 30 min
  data.push({ time: '+30m', congestion: target30, label: '30m' })

  // Bridge to 60 min
  const target60 = prediction.next60min
  for (let i = 1; i <= 2; i++) {
    const t = i / 3
    const base = target30 + (target60 - target30) * t
    const flutter = (Math.random() - 0.5) * 5
    data.push({
      time: `+${30 + Math.round(i * 10)}m`,
      congestion: Math.max(0, Math.min(100, Math.round(base + flutter))),
    })
  }

  // 60 min
  data.push({ time: '+60m', congestion: target60, label: '60m' })

  return data
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  const val = payload[0].value
  const color = getColor(val)
  return (
    <div
      style={{
        background: 'rgba(13,17,23,0.95)',
        border: `1px solid ${color}40`,
        borderRadius: 8,
        padding: '6px 12px',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, fontFamily: 'JetBrains Mono, monospace', marginBottom: 2 }}>
        {label}
      </div>
      <div style={{ color, fontSize: 16, fontWeight: 800, fontFamily: 'JetBrains Mono, monospace' }}>
        {val}
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginLeft: 4 }}>/ 100</span>
      </div>
    </div>
  )
}

export default function PredictionChart({ road }) {
  const data = useMemo(() => {
    if (!road) return []
    return generateForecast(road.congestionScore, road.prediction)
  }, [road?.id, road?.congestionScore])

  if (!road) return null

  const primaryColor = getColor(road.congestionScore)
  const gradientId = `grad-${road.id}`

  return (
    <div style={{ width: '100%', height: 160 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={primaryColor} stopOpacity={0.3} />
              <stop offset="95%" stopColor={primaryColor} stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.04)"
            vertical={false}
          />

          {/* Zone reference lines */}
          <ReferenceLine y={40} stroke="#34d399" strokeDasharray="3 3" strokeOpacity={0.25} />
          <ReferenceLine y={70} stroke="#fbbf24" strokeDasharray="3 3" strokeOpacity={0.25} />

          <XAxis
            dataKey="time"
            tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9, fontFamily: 'JetBrains Mono, monospace' }}
            axisLine={false}
            tickLine={false}
            interval={2}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9, fontFamily: 'JetBrains Mono, monospace' }}
            axisLine={false}
            tickLine={false}
            ticks={[0, 40, 70, 100]}
          />

          <Tooltip content={<CustomTooltip />} cursor={{ stroke: primaryColor, strokeWidth: 1, strokeOpacity: 0.3 }} />

          <Area
            type="monotone"
            dataKey="congestion"
            stroke={primaryColor}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={{ r: 4, fill: primaryColor, stroke: 'rgba(13,17,23,0.8)', strokeWidth: 2 }}
            isAnimationActive={true}
            animationDuration={800}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
