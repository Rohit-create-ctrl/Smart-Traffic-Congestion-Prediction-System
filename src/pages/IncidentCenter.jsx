import { useState, useMemo } from 'react'

const INCIDENT_ICONS = {
  accident: { icon: '💥', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', label: 'Accident' },
  breakdown: { icon: '🚗', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', label: 'Vehicle Breakdown' },
  malfunction: { icon: '⚠️', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', label: 'Signal Malfunction' },
  road: { icon: '🚧', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', label: 'Road Work' },
  waterlogging: { icon: '💧', color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/20', label: 'Waterlogging' },
  congestion: { icon: '🚦', color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20', label: 'Heavy Congestion' },
  school: { icon: '🏫', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', label: 'School Zone' },
  market: { icon: '🏪', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', label: 'Market Area' },
  default: { icon: '📍', color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/20', label: 'General Incident' },
}

function getIncidentClass(text = '') {
  const t = text.toLowerCase()
  if (t.includes('accident')) return INCIDENT_ICONS.accident
  if (t.includes('breakdown')) return INCIDENT_ICONS.breakdown
  if (t.includes('malfunction') || t.includes('signal')) return INCIDENT_ICONS.malfunction
  if (t.includes('road work') || t.includes('construction') || t.includes('work')) return INCIDENT_ICONS.road
  if (t.includes('waterlogg') || t.includes('flood') || t.includes('water')) return INCIDENT_ICONS.waterlogging
  if (t.includes('school')) return INCIDENT_ICONS.school
  if (t.includes('market')) return INCIDENT_ICONS.market
  if (t.includes('congestion') || t.includes('heavy')) return INCIDENT_ICONS.congestion
  return INCIDENT_ICONS.default
}

export default function IncidentCenter({ roadsData = [], setRoadsData }) {
  const [roadId, setRoadId] = useState('')
  const [incidentType, setIncidentType] = useState('accident')
  const [description, setDescription] = useState('')
  const [impactSeverity, setImpactSeverity] = useState('moderate') // low, moderate, high
  const [notification, setNotification] = useState(null)

  // Memoize incidents list from the dynamic roadsData
  const activeIncidents = useMemo(() => {
    return roadsData.flatMap((r) =>
      (r.incidents || []).map((inc, index) => ({
        id: `${r.id}-${index}-${inc.slice(0, 10)}`,
        roadId: r.id,
        roadName: r.name,
        description: inc,
        cls: getIncidentClass(inc),
        speed: r.speed,
        congestionScore: r.congestionScore,
      }))
    )
  }, [roadsData])

  const handleRemoveIncident = (roadId, desc) => {
    setRoadsData((prevRoads) =>
      prevRoads.map((r) => {
        if (r.id !== roadId) return r

        // Remove the incident from array
        const updatedIncidents = r.incidents.filter((inc) => inc !== desc)

        // Alleviate congestion slightly if incident is cleared
        const newScore = Math.max(15, r.congestionScore - 20)
        const newSpeed = Math.min(80, r.speed + 15)
        const newLevel = newScore > 70 ? 'high' : newScore > 40 ? 'moderate' : 'low'

        return {
          ...r,
          incidents: updatedIncidents,
          congestionScore: newScore,
          speed: newSpeed,
          congestionLevel: newLevel,
          lastUpdated: new Date().toISOString(),
        }
      })
    )

    setNotification({
      type: 'success',
      text: 'Incident marked as CLEARED. Congestion levels alleviated.',
    })
    setTimeout(() => setNotification(null), 3500)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!roadId || !description) return

    // Find the affected road name
    const affectedRoad = roadsData.find((r) => r.id === roadId)
    if (!affectedRoad) return

    // Calculate score & speed impact based on severity
    let congestionBump = 15
    let speedDrop = 8

    if (impactSeverity === 'low') {
      congestionBump = 10
      speedDrop = 5
    } else if (impactSeverity === 'high') {
      congestionBump = 30
      speedDrop = 15
    }

    // Format description to include incident type if not present
    const formattedDesc = `${getIncidentClass(incidentType).label}: ${description}`

    setRoadsData((prevRoads) =>
      prevRoads.map((r) => {
        if (r.id !== roadId) return r

        const newScore = Math.min(100, r.congestionScore + congestionBump)
        const newSpeed = Math.max(5, r.speed - speedDrop)
        const newLevel = newScore > 70 ? 'high' : newScore > 40 ? 'moderate' : 'low'

        return {
          ...r,
          incidents: [...r.incidents, formattedDesc],
          congestionScore: newScore,
          speed: newSpeed,
          congestionLevel: newLevel,
          lastUpdated: new Date().toISOString(),
        }
      })
    )

    // Trigger Notification UI
    setNotification({
      type: 'added',
      text: `LIVE FEED UPDATED: Active incident reported on ${affectedRoad.name.split(' - ')[0]}.`,
    })
    setTimeout(() => setNotification(null), 4000)

    // Reset Form
    setDescription('')
    setRoadId('')
  }

  return (
    <div className="flex-1 flex gap-4 h-full min-h-0 select-none text-gray-200">
      {/* Active Incident List (Left pane - 60%) */}
      <div className="flex-[6] flex flex-col gap-3 min-h-0">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 status-blink"></span>
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 font-mono">
              Live Incident Feed ({activeIncidents.length})
            </h2>
          </div>
          <span className="text-[10px] text-gray-500 font-mono">Real-time emergency dispatching</span>
        </div>

        {/* Dynamic Success Notification */}
        {notification && (
          <div
            className={`px-4 py-2.5 rounded-lg border text-xs font-mono font-bold flex justify-between items-center fade-in-up ${
              notification.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}
          >
            <span>🚨 {notification.text}</span>
            <button onClick={() => setNotification(null)} className="opacity-75 hover:opacity-100">
              ✕
            </button>
          </div>
        )}

        {/* Scrollable Incidents List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1" style={{ scrollbarWidth: 'thin' }}>
          {activeIncidents.length > 0 ? (
            activeIncidents.map((incident) => (
              <div
                key={incident.id}
                className={`flex gap-3.5 p-4 rounded-xl border ${incident.cls.border} ${incident.cls.bg} relative group hover:scale-[1.01] transition-transform`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border ${incident.cls.border} bg-white/[0.02]`}
                >
                  <span className="text-xl">{incident.cls.icon}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[10px] font-bold font-mono uppercase tracking-wider ${incident.cls.color}`}>
                      {incident.cls.label}
                    </span>
                    <span className="text-[9px] text-gray-500 font-mono">{incident.roadId}</span>
                  </div>

                  <p className="text-sm font-bold text-gray-100 leading-snug mb-1">
                    {incident.description}
                  </p>

                  <div className="flex items-center gap-3 text-[10px] text-gray-500 font-mono">
                    <span>Segment: <strong className="text-gray-300">{incident.roadName}</strong></span>
                    <span>•</span>
                    <span className="text-red-400">Congestion: {incident.congestionScore}%</span>
                    <span>•</span>
                    <span>Speed: {incident.speed} km/h</span>
                  </div>
                </div>

                {/* Dispatch Clear Command */}
                <button
                  onClick={() => handleRemoveIncident(incident.roadId, incident.description)}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold font-mono opacity-0 group-hover:opacity-100 transition-opacity self-center shrink-0"
                >
                  ✓ Dispatch Clear
                </button>
              </div>
            ))
          ) : (
            <div className="glass-card border border-white/[0.04] rounded-xl p-12 text-center text-gray-500 h-full flex flex-col justify-center items-center">
              <span className="text-4xl block mb-2">🎉</span>
              <span className="text-xs font-semibold block mb-1">No Active Blockages</span>
              <span className="text-[10px] text-gray-600 font-mono">
                The entire smart city corridor is running without physical breakdowns or active reports.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Report Form Pane (Right pane - 40%) */}
      <div className="flex-[4] flex flex-col">
        <div className="glass-card border border-red-500/20 bg-red-500/2.5 rounded-xl p-5 shadow-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🚨</span>
            <h2 className="text-sm font-bold text-white leading-tight">Report New Incident</h2>
          </div>
          <p className="text-[10px] text-gray-500 font-mono leading-relaxed mb-4">
            Broadcast emergency alerts directly into the live AI routing feed. Impacted corridors will adjust automatically.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Choose Road */}
            <div>
              <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest font-mono mb-1.5">
                Select Road Corridor
              </label>
              <select
                required
                value={roadId}
                onChange={(e) => setRoadId(e.target.value)}
                className="w-full bg-gray-950 border border-white/[0.08] rounded-lg p-2.5 text-xs text-gray-200 focus:outline-none focus:border-red-500/50"
              >
                <option value="">-- Choose Corridor --</option>
                {roadsData.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Choose Type */}
            <div>
              <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest font-mono mb-1.5">
                Incident Category
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'accident', label: '💥 Accident' },
                  { id: 'breakdown', label: '🚗 Breakdown' },
                  { id: 'waterlogging', label: '💧 Flooding' },
                  { id: 'malfunction', label: '⚠️ Signal Out' },
                  { id: 'road', label: '🚧 Road Work' },
                  { id: 'congestion', label: '🚦 Heavy Flow' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setIncidentType(t.id)}
                    className={`p-2 rounded-lg text-[10px] font-semibold text-left border transition-all ${
                      incidentType === t.id
                        ? 'bg-red-500/10 border-red-500/40 text-red-300 font-bold'
                        : 'bg-gray-950 border-white/[0.04] text-gray-400 hover:border-white/[0.1] hover:text-gray-200'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Impact Severity */}
            <div>
              <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest font-mono mb-1.5">
                Impact / Delay Severity
              </label>
              <div className="flex rounded-lg border border-white/[0.06] overflow-hidden">
                {[
                  { id: 'low', label: 'Low delay', color: 'hover:bg-emerald-500/10 active:bg-emerald-500/20', activeBg: 'bg-emerald-500/10 text-emerald-400 border-r border-white/[0.06]' },
                  { id: 'moderate', label: 'Moderate', color: 'hover:bg-yellow-500/10 active:bg-yellow-500/20', activeBg: 'bg-yellow-500/10 text-yellow-400 border-x border-white/[0.06]' },
                  { id: 'high', label: 'Critical', color: 'hover:bg-red-500/10 active:bg-red-500/20', activeBg: 'bg-red-500/10 text-red-400 border-l border-white/[0.06]' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setImpactSeverity(s.id)}
                    className={`flex-1 py-1.5 text-[10px] font-semibold text-center transition-colors ${
                      impactSeverity === s.id
                        ? s.activeBg
                        : `bg-gray-950 text-gray-400 ${s.color}`
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Incident Details */}
            <div>
              <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest font-mono mb-1.5">
                Emergency Details / Description
              </label>
              <textarea
                required
                rows="3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Minor two-vehicle collision blocking left lane on flyover entrance."
                className="w-full bg-gray-950 border border-white/[0.08] rounded-lg p-2.5 text-xs text-gray-200 focus:outline-none focus:border-red-500/50 placeholder-gray-600 resize-none"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white rounded-lg text-xs font-bold font-mono tracking-wide shadow-lg shadow-red-500/10 hover:shadow-red-500/20 transition-all flex items-center justify-center gap-2"
            >
              <span>📢</span>
              <span>Broadcast Incident Alert</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
