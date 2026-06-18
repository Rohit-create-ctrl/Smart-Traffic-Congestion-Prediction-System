import { useEffect, useState } from 'react'

const RADIUS = 54
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function getGaugeColor(score) {
  if (score <= 40) return { stroke: '#34d399', glow: 'rgba(52,211,153,0.5)', label: 'LOW', bg: 'rgba(52,211,153,0.08)' }
  if (score <= 70) return { stroke: '#fbbf24', glow: 'rgba(251,191,36,0.5)', label: 'MODERATE', bg: 'rgba(251,191,36,0.08)' }
  return { stroke: '#f87171', glow: 'rgba(248,113,113,0.5)', label: 'HIGH', bg: 'rgba(248,113,113,0.08)' }
}

export default function CongestionGauge({ score = 0 }) {
  const [animatedScore, setAnimatedScore] = useState(0)

  useEffect(() => {
    setAnimatedScore(0)
    const timeout = setTimeout(() => {
      let current = 0
      const step = score / 40
      const interval = setInterval(() => {
        current = Math.min(current + step, score)
        setAnimatedScore(Math.round(current))
        if (current >= score) clearInterval(interval)
      }, 16)
      return () => clearInterval(interval)
    }, 100)
    return () => clearTimeout(timeout)
  }, [score])

  const { stroke, glow, label, bg } = getGaugeColor(score)
  const progress = (animatedScore / 100) * CIRCUMFERENCE
  const dashOffset = CIRCUMFERENCE - progress

  // Tick marks
  const ticks = Array.from({ length: 20 }, (_, i) => i)

  return (
    <div className="flex flex-col items-center justify-center py-2">
      <div className="relative" style={{ width: 148, height: 148 }}>
        <svg width="148" height="148" viewBox="0 0 148 148">
          <defs>
            <filter id="gauge-glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="gauge-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={stroke} stopOpacity="0.6" />
              <stop offset="100%" stopColor={stroke} stopOpacity="1" />
            </linearGradient>
          </defs>

          {/* Tick marks */}
          {ticks.map((i) => {
            const angle = (i / 20) * 360 - 90
            const rad = (angle * Math.PI) / 180
            const x1 = 74 + 65 * Math.cos(rad)
            const y1 = 74 + 65 * Math.sin(rad)
            const x2 = 74 + 58 * Math.cos(rad)
            const y2 = 74 + 58 * Math.sin(rad)
            const isActive = (i / 20) * 100 <= animatedScore
            return (
              <line
                key={i}
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={isActive ? stroke : 'rgba(255,255,255,0.08)'}
                strokeWidth={i % 5 === 0 ? 2 : 1}
                strokeLinecap="round"
              />
            )
          })}

          {/* Track background */}
          <circle
            cx="74" cy="74" r={RADIUS}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="10"
          />

          {/* Background glow ring */}
          <circle
            cx="74" cy="74" r={RADIUS}
            fill="none"
            stroke={stroke}
            strokeWidth="10"
            strokeOpacity="0.06"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset="0"
          />

          {/* Progress arc */}
          <circle
            cx="74" cy="74" r={RADIUS}
            fill="none"
            stroke="url(#gauge-gradient)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 74 74)"
            filter="url(#gauge-glow)"
            style={{ transition: 'stroke-dashoffset 0.05s linear, stroke 0.4s ease' }}
          />

          {/* Inner circle */}
          <circle cx="74" cy="74" r="40" fill={bg} />

          {/* Score text */}
          <text
            x="74" y="69"
            textAnchor="middle"
            dominantBaseline="middle"
            fill={stroke}
            fontSize="26"
            fontWeight="800"
            fontFamily="'JetBrains Mono', monospace"
          >
            {animatedScore}
          </text>
          <text
            x="74" y="89"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="rgba(255,255,255,0.35)"
            fontSize="9"
            fontFamily="'JetBrains Mono', monospace"
            letterSpacing="2"
          >
            / 100
          </text>
        </svg>

        {/* Glow pulse overlay */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(circle at center, ${glow} 0%, transparent 70%)`,
            opacity: 0.15,
          }}
        />
      </div>

      {/* Label badge */}
      <div
        className="mt-2 px-4 py-1 rounded-full text-[10px] font-bold tracking-widest font-mono"
        style={{ color: stroke, background: bg, border: `1px solid ${stroke}30` }}
      >
        {label} CONGESTION
      </div>
    </div>
  )
}
