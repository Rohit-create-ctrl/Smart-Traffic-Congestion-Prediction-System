import { useState, useEffect } from 'react'
import CongestionGauge from './CongestionGauge'
import PredictionChart from './PredictionChart'

// ─── helpers ──────────────────────────────────────────────────────────────────

function getCongestionColor(score) {
  if (score <= 40) return { text: '#34d399', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.25)' }
  if (score <= 70) return { text: '#fbbf24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.25)' }
  return { text: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.25)' }
}

function getSpeedColor(speed) {
  if (speed >= 50) return '#34d399'
  if (speed >= 25) return '#fbbf24'
  return '#f87171'
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
}

// Parse signal recommendation into structured badges
function parseSignalRec(rec) {
  if (!rec) return []
  const lower = rec.toLowerCase()
  // Try to extract meaningful actions
  const actions = []

  if (lower.includes('extend green')) {
    const m = rec.match(/(\d+)s/)
    actions.push({ type: 'extend', label: m ? `+${m[1]}s Green Phase` : 'Extend Green Phase', color: '#34d399', bg: 'rgba(52,211,153,0.12)', icon: '🟢' })
  }
  if (lower.includes('reduce red')) {
    const m = rec.match(/(\d+)s/)
    actions.push({ type: 'reduce', label: m ? `-${m[1]}s Red Phase` : 'Reduce Red Phase', color: '#f87171', bg: 'rgba(248,113,113,0.12)', icon: '🔴' })
  }
  if (lower.includes('tidal')) {
    actions.push({ type: 'tidal', label: 'Tidal Flow Active', color: '#818cf8', bg: 'rgba(129,140,248,0.12)', icon: '🔀' })
  }
  if (lower.includes('dynamic lane')) {
    actions.push({ type: 'lane', label: 'Dynamic Lane Open', color: '#38bdf8', bg: 'rgba(56,189,248,0.12)', icon: '🛣️' })
  }
  if (lower.includes('personnel') || lower.includes('deploy')) {
    actions.push({ type: 'deploy', label: 'Deploy Traffic Personnel', color: '#fbbf24', bg: 'rgba(251,191,36,0.12)', icon: '👮' })
  }
  if (lower.includes('synchronize') || lower.includes('green wave')) {
    actions.push({ type: 'sync', label: 'Green Wave Sync', color: '#34d399', bg: 'rgba(52,211,153,0.12)', icon: '🌊' })
  }
  if (lower.includes('increase green')) {
    const m = rec.match(/(\d+)s/)
    actions.push({ type: 'increase', label: m ? `+${m[1]}s Green Time` : 'Increase Green Time', color: '#34d399', bg: 'rgba(52,211,153,0.12)', icon: '⬆️' })
  }
  if (lower.includes('cycle time') || lower.includes('reduce cycle')) {
    actions.push({ type: 'cycle', label: 'Reduce Signal Cycle', color: '#fbbf24', bg: 'rgba(251,191,36,0.12)', icon: '⏱️' })
  }
  if (lower.includes('northbound')) {
    actions.push({ type: 'north', label: 'Prioritize Northbound', color: '#38bdf8', bg: 'rgba(56,189,248,0.12)', icon: '⬆️' })
  }
  if (lower.includes('optimize merge') || lower.includes('coordinate')) {
    actions.push({ type: 'opt', label: 'Optimize Merge/Corridor', color: '#818cf8', bg: 'rgba(129,140,248,0.12)', icon: '🔄' })
  }
  // Fallback: show the entire rec as one badge
  if (actions.length === 0) {
    actions.push({ type: 'info', label: rec.length > 42 ? rec.slice(0, 42) + '…' : rec, color: '#9ca3af', bg: 'rgba(156,163,175,0.1)', icon: '💡' })
  }
  return actions
}

// Derive route status from congestion score
function getRouteStatus(score) {
  if (score <= 40) return { label: 'CLEAR', color: '#34d399', bg: 'rgba(52,211,153,0.1)' }
  if (score <= 70) return { label: 'MODERATE', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)' }
  return { label: 'CONGESTED', color: '#f87171', bg: 'rgba(248,113,113,0.1)' }
}

function estimateTimeSaved(congestionScore) {
  if (congestionScore >= 80) return '18-24 min'
  if (congestionScore >= 60) return '10-15 min'
  if (congestionScore >= 40) return '5-8 min'
  return '1-3 min'
}

// ─── Section card wrapper ──────────────────────────────────────────────────────

function Card({ children, className = '', style = {} }) {
  return (
    <div
      className={`rounded-xl border border-white/[0.06] transition-all duration-300 hover:border-white/[0.12] ${className}`}
      style={{
        background: 'rgba(17,24,39,0.75)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

function CardHeader({ icon, title, badge }) {
  return (
    <div className="flex items-center justify-between px-4 pt-3 pb-2">
      <div className="flex items-center gap-2">
        <span className="text-sm">{icon}</span>
        <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400 font-mono">{title}</span>
      </div>
      {badge && (
        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full font-mono"
          style={{ color: badge.color, background: badge.bg, border: `1px solid ${badge.color}30` }}>
          {badge.label}
        </span>
      )}
    </div>
  )
}

// ─── Road Information Card ─────────────────────────────────────────────────────

function RoadInfoCard({ road }) {
  const cc = getCongestionColor(road.congestionScore)
  const sc = getSpeedColor(road.speed)

  const stats = [
    {
      label: 'Congestion',
      value: road.congestionScore,
      unit: '/ 100',
      color: cc.text,
    },
    {
      label: 'Avg Speed',
      value: road.speed,
      unit: 'km/h',
      color: sc,
    },
    {
      label: 'Vehicles',
      value: road.vehicleCount,
      unit: 'active',
      color: '#38bdf8',
    },
  ]

  return (
    <Card>
      <CardHeader
        icon="🛣️"
        title="Road Info"
        badge={{ label: road.id, color: '#38bdf8', bg: 'rgba(56,189,248,0.08)' }}
      />
      <div className="px-4 pb-3">
        <div
          className="text-sm font-bold text-white mb-3 leading-snug"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {road.name}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {stats.map(({ label, value, unit, color }) => (
            <div
              key={label}
              className="rounded-lg p-2.5 flex flex-col items-center gap-0.5 transition-all duration-200 hover:scale-105"
              style={{ background: `${color}0d`, border: `1px solid ${color}20` }}
            >
              <span
                className="text-xl font-extrabold font-mono leading-none"
                style={{ color }}
              >
                {value}
              </span>
              <span className="text-[9px] text-gray-500 font-mono">{unit}</span>
              <span className="text-[9px] text-gray-600 font-mono uppercase tracking-wider">{label}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 status-blink" />
          <span className="text-[9px] text-gray-600 font-mono">
            Updated {formatTime(road.lastUpdated)}
          </span>
        </div>
      </div>
    </Card>
  )
}

// ─── Gauge Card ───────────────────────────────────────────────────────────────

function GaugeCard({ road }) {
  return (
    <Card>
      <CardHeader icon="📊" title="Congestion Index" />
      <CongestionGauge score={road.congestionScore} />
      {/* Mini forecast preview */}
      <div className="px-4 pb-3 grid grid-cols-3 gap-2">
        {[
          { label: '15 min', val: road.prediction.next15min },
          { label: '30 min', val: road.prediction.next30min },
          { label: '60 min', val: road.prediction.next60min },
        ].map(({ label, val }) => {
          const c = getCongestionColor(val)
          return (
            <div key={label} className="text-center">
              <div className="text-[11px] font-bold font-mono" style={{ color: c.text }}>{val}</div>
              <div className="text-[9px] text-gray-600 font-mono">{label}</div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

// ─── Prediction Chart Card ────────────────────────────────────────────────────

function PredictionCard({ road }) {
  return (
    <Card>
      <CardHeader
        icon="📈"
        title="60-Min Forecast"
        badge={{ label: 'AI Predicted', color: '#818cf8', bg: 'rgba(129,140,248,0.08)' }}
      />
      <div className="px-3 pb-3">
        <PredictionChart road={road} />
        <div className="flex items-center gap-3 mt-2 px-1">
          {[
            { color: '#34d399', label: 'Low (0-40)' },
            { color: '#fbbf24', label: 'Mod (41-70)' },
            { color: '#f87171', label: 'High (71+)' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1">
              <div className="w-5 h-0.5 rounded-full" style={{ background: color, opacity: 0.6 }} />
              <span className="text-[8px] text-gray-600 font-mono">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

// ─── Signal Recommendation Card ──────────────────────────────────────────────

function SignalCard({ road }) {
  const actions = parseSignalRec(road.signalRecommendation)

  return (
    <Card>
      <CardHeader
        icon="🚦"
        title="Signal Recommendation"
        badge={{ label: 'ACTIVE', color: '#34d399', bg: 'rgba(52,211,153,0.08)' }}
      />
      <div className="px-4 pb-4">
        <div className="text-[10px] text-gray-500 font-mono mb-3 leading-relaxed">
          {road.signalRecommendation}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {actions.map((a, i) => (
            <div
              key={i}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold font-mono transition-all duration-200 hover:scale-105 cursor-default"
              style={{ color: a.color, background: a.bg, border: `1px solid ${a.color}30` }}
            >
              <span className="text-xs">{a.icon}</span>
              {a.label}
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

// ─── Alternate Route Card ─────────────────────────────────────────────────────

function AlternateRouteCard({ road }) {
  const status = getRouteStatus(road.congestionScore)
  const timeSaved = estimateTimeSaved(road.congestionScore)

  return (
    <Card>
      <CardHeader icon="🗺️" title="Alternate Route" />
      <div className="px-4 pb-4">
        <div
          className="rounded-lg p-3 mb-3"
          style={{ background: 'rgba(56,189,248,0.05)', border: '1px solid rgba(56,189,248,0.12)' }}
        >
          <div className="flex items-start gap-2">
            <span className="text-base mt-0.5">↗️</span>
            <div>
              <div className="text-[11px] font-semibold text-sky-300 leading-snug mb-1">
                {road.alternateRoute}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="text-[9px] font-bold px-2 py-0.5 rounded-full font-mono"
                  style={{ color: '#34d399', background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.25)' }}
                >
                  ⏱ Saves {timeSaved}
                </span>
                <span
                  className="text-[9px] font-bold px-2 py-0.5 rounded-full font-mono"
                  style={{ color: status.color, background: status.bg, border: `1px solid ${status.color}30` }}
                >
                  {status.label}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[9px] text-gray-600 font-mono">
          <span>Current road:</span>
          <span
            className="px-1.5 py-0.5 rounded font-bold"
            style={{ color: status.color, background: status.bg }}
          >
            {status.label}
          </span>
          <span>— rerouting recommended</span>
        </div>
      </div>
    </Card>
  )
}

// ─── Incident Card ────────────────────────────────────────────────────────────

const INCIDENT_ICONS = {
  accident: { icon: '💥', color: '#f87171', label: 'Accident' },
  breakdown: { icon: '🚗', color: '#fbbf24', label: 'Breakdown' },
  malfunction: { icon: '⚠️', color: '#fbbf24', label: 'Malfunction' },
  road: { icon: '🚧', color: '#fb923c', label: 'Road Work' },
  waterlogging: { icon: '💧', color: '#38bdf8', label: 'Waterlogging' },
  congestion: { icon: '🚦', color: '#c084fc', label: 'Congestion' },
  school: { icon: '🏫', color: '#fbbf24', label: 'School Zone' },
  market: { icon: '🏪', color: '#fb923c', label: 'Market Area' },
  default: { icon: '📍', color: '#9ca3af', label: 'Incident' },
}

function classifyIncident(text) {
  const t = text.toLowerCase()
  if (t.includes('accident')) return INCIDENT_ICONS.accident
  if (t.includes('breakdown')) return INCIDENT_ICONS.breakdown
  if (t.includes('malfunction') || t.includes('signal')) return INCIDENT_ICONS.malfunction
  if (t.includes('road work') || t.includes('construction')) return INCIDENT_ICONS.road
  if (t.includes('waterlogg')) return INCIDENT_ICONS.waterlogging
  if (t.includes('school')) return INCIDENT_ICONS.school
  if (t.includes('market')) return INCIDENT_ICONS.market
  if (t.includes('congestion') || t.includes('heavy')) return INCIDENT_ICONS.congestion
  return INCIDENT_ICONS.default
}

function IncidentCard({ road }) {
  const incidents = road.incidents || []

  return (
    <Card>
      <CardHeader
        icon="⚠️"
        title="Active Incidents"
        badge={
          incidents.length > 0
            ? { label: `${incidents.length} Active`, color: '#f87171', bg: 'rgba(248,113,113,0.1)' }
            : { label: 'All Clear', color: '#34d399', bg: 'rgba(52,211,153,0.1)' }
        }
      />
      <div className="px-4 pb-4">
        {incidents.length === 0 ? (
          <div className="flex items-center gap-3 py-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)' }}
            >
              <span className="text-lg">✅</span>
            </div>
            <div>
              <div className="text-[11px] font-semibold text-emerald-400">No active incidents</div>
              <div className="text-[9px] text-gray-600 font-mono">Road segment clear</div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {incidents.map((incident, i) => {
              const cls = classifyIncident(incident)
              return (
                <div
                  key={i}
                  className="flex items-start gap-2.5 p-2.5 rounded-lg transition-all duration-200 hover:scale-[1.02]"
                  style={{ background: `${cls.color}0a`, border: `1px solid ${cls.color}20` }}
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: `${cls.color}15` }}
                  >
                    <span className="text-sm">{cls.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-[9px] font-bold font-mono uppercase tracking-wider mb-0.5"
                      style={{ color: cls.color }}
                    >
                      {cls.label}
                    </div>
                    <div className="text-[10px] text-gray-300 leading-snug">{incident}</div>
                  </div>
                  <div
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1 status-blink"
                    style={{ background: cls.color }}
                  />
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Card>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[300px] gap-4 px-6">
      {/* Animated radar circle */}
      <div className="relative w-20 h-20 flex items-center justify-center">
        <div
          className="absolute inset-0 rounded-full animate-ping"
          style={{ background: 'rgba(56,189,248,0.08)', animationDuration: '2s' }}
        />
        <div
          className="absolute inset-2 rounded-full"
          style={{ background: 'rgba(56,189,248,0.05)', border: '1px solid rgba(56,189,248,0.15)' }}
        />
        <span className="text-2xl relative z-10">🗺️</span>
      </div>

      <div className="text-center">
        <div className="text-sm font-semibold text-gray-400 mb-1">No Road Selected</div>
        <div className="text-[11px] text-gray-600 font-mono leading-relaxed text-center max-w-[200px]">
          Click any road segment on the map to view detailed analytics
        </div>
      </div>

      <div className="flex flex-col gap-1.5 w-full max-w-[220px]">
        {[
          { icon: '📊', label: 'Congestion Gauge' },
          { icon: '📈', label: '60-Min Forecast' },
          { icon: '🚦', label: 'Signal Recommendations' },
          { icon: '🗺️', label: 'Alternate Routes' },
        ].map(({ icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
          >
            <span className="text-sm">{icon}</span>
            <span className="text-[10px] text-gray-600 font-mono">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main Details Panel ─────────────────────────────────────────────────────────────

export default function RoadDetailsPanel({ selectedRoad }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (selectedRoad) {
      setVisible(false)
      const t = setTimeout(() => setVisible(true), 50)
      return () => clearTimeout(t)
    } else {
      setVisible(false)
    }
  }, [selectedRoad?.id])

  return (
    <div className="flex flex-col h-full">
      {/* Panel header */}
      <div
        className="flex-shrink-0 flex items-center justify-between px-4 py-3 rounded-xl mb-3"
        style={{
          background: 'rgba(17,24,39,0.75)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.2)' }}
          >
            <span className="text-sm">🔍</span>
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-widest text-gray-400 font-mono">Road Analytics</div>
            <div className="text-[9px] text-gray-600 font-mono">Smart City AI System</div>
          </div>
        </div>
        {selectedRoad ? (
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 status-blink" />
            <span className="text-[9px] text-emerald-400 font-mono font-bold">LIVE</span>
          </div>
        ) : (
          <span className="text-[9px] text-gray-600 font-mono">IDLE</span>
        )}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto min-h-0 pr-0.5" style={{ scrollbarWidth: 'thin' }}>
        {!selectedRoad ? (
          <EmptyState />
        ) : (
          <div
            className="flex flex-col gap-3"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(8px)',
              transition: 'opacity 0.35s ease, transform 0.35s ease',
            }}
          >
            {/* 1. Road Info */}
            <RoadInfoCard road={selectedRoad} />

            {/* 2. Gauge */}
            <GaugeCard road={selectedRoad} />

            {/* 3. Prediction Chart */}
            <PredictionCard road={selectedRoad} />

            {/* 4. Signal Recommendations */}
            <SignalCard road={selectedRoad} />

            {/* 5. Alternate Route */}
            <AlternateRouteCard road={selectedRoad} />

            {/* 6. Incidents */}
            <IncidentCard road={selectedRoad} />

            {/* Bottom padding */}
            <div className="h-2" />
          </div>
        )}
      </div>
    </div>
  )
}
