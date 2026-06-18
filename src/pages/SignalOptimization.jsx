import { useState, useEffect, useMemo } from 'react'

export default function SignalOptimization({ roadsData = [], setRoadsData }) {
  // Track which signal recommendations have been approved/applied
  const [appliedIntersections, setAppliedIntersections] = useState({})
  // Dynamic countdown timer representing signal phase change
  const [countdown, setCountdown] = useState(45)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 45 : prev - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleApplySignalOverride = (roadId, roadName) => {
    setRoadsData((prevRoads) =>
      prevRoads.map((r) => {
        if (r.id !== roadId) return r

        // Decrease congestion score since signal optimization improves flow!
        const newScore = Math.max(10, r.congestionScore - 15)
        const newSpeed = Math.min(80, r.speed + 8)
        const newLevel = newScore > 70 ? 'high' : newScore > 40 ? 'moderate' : 'low'

        return {
          ...r,
          congestionScore: newScore,
          speed: newSpeed,
          congestionLevel: newLevel,
          signalRecommendation: 'Signal phase optimized. Normal signal cycle restored.',
          lastUpdated: new Date().toISOString(),
        }
      })
    )

    // Mark as applied
    setAppliedIntersections((prev) => ({
      ...prev,
      [roadId]: true,
    }))

    setTimeout(() => {
      // Clear notification styling after a few seconds
      setAppliedIntersections((prev) => {
        const next = { ...prev }
        delete next[roadId]
        return next
      })
    }, 4000)
  }

  // Intersections with signal data
  const intersections = useMemo(() => {
    return roadsData.map((r) => {
      let phaseType = 'standard'
      let phaseTime = '60s'
      let colorClass = 'text-emerald-400'

      if (r.congestionLevel === 'high') {
        phaseType = 'critical green-extend'
        phaseTime = '120s'
        colorClass = 'text-red-400'
      } else if (r.congestionLevel === 'moderate') {
        phaseType = 'moderate adjustments'
        phaseTime = '90s'
        colorClass = 'text-yellow-400'
      }

      return {
        id: r.id,
        name: r.name,
        congestionScore: r.congestionScore,
        congestionLevel: r.congestionLevel,
        recommendation: r.signalRecommendation,
        speed: r.speed,
        phaseType,
        phaseTime,
        colorClass,
      }
    })
  }, [roadsData])

  const activeRecsCount = useMemo(() => {
    return roadsData.filter(
      (r) =>
        r.signalRecommendation &&
        !r.signalRecommendation.toLowerCase().includes('no action') &&
        !r.signalRecommendation.toLowerCase().includes('normal signal')
    ).length
  }, [roadsData])

  return (
    <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-1 h-full select-none text-gray-200 pb-6">
      {/* Top dashboard row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Countdown card */}
        <div className="glass-card border border-white/[0.05] rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[9px] text-gray-500 font-mono uppercase">Global AI Refresher</span>
            <div className="text-xl font-bold font-mono text-white mt-1">
              Next Cycle Sync: <span className="text-sky-400 tabular-nums">{countdown}s</span>
            </div>
            <p className="text-[9px] text-gray-500 font-mono mt-1">Recalculating intersection queues...</p>
          </div>
          <div className="relative w-12 h-12 flex items-center justify-center">
            {/* Animated spinning loader representing AI cycle */}
            <div className="absolute inset-0 rounded-full border-2 border-white/[0.04]" />
            <div
              className="absolute inset-0 rounded-full border-2 border-t-sky-400 animate-spin"
              style={{ animationDuration: '4s' }}
            />
            <span className="text-[10px] font-mono font-bold text-sky-400 tabular-nums">{countdown}</span>
          </div>
        </div>

        {/* Active AI overrides */}
        <div className="glass-card border border-white/[0.05] rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[9px] text-gray-500 font-mono uppercase">Signal Queues Monitored</span>
            <div className="text-xl font-bold font-mono text-white mt-1">
              {intersections.length} Intersections
            </div>
            <p className="text-[9px] text-gray-500 font-mono mt-1">Dynamic timing matrices online</p>
          </div>
          <span className="text-2xl">🚦</span>
        </div>

        {/* Active recommendations */}
        <div className="glass-card border border-amber-500/10 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[9px] text-gray-500 font-mono uppercase">AI Interventions Pending</span>
            <div className="text-xl font-bold font-mono text-amber-400 mt-1">
              {activeRecsCount} Required
            </div>
            <p className="text-[9px] text-gray-500 font-mono mt-1">Critical timing overrides proposed</p>
          </div>
          <span className="text-2xl">⚡</span>
        </div>
      </div>

      {/* Main intersections manager */}
      <div className="glass-card border border-white/[0.06] rounded-xl overflow-hidden flex-1 flex flex-col min-h-[400px]">
        <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between bg-gray-900/30">
          <div>
            <h3 className="text-xs font-bold font-mono uppercase text-gray-300">
              AI Signal Optimization Terminal
            </h3>
            <p className="text-[9px] text-gray-500 font-mono">
              Live timing overrides. Force phase extensions to alleviate congestion bottlenecks.
            </p>
          </div>
          <span className="px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[9px] font-mono">
            Mode: Fully-Automated/Manual
          </span>
        </div>

        {/* Intersections list */}
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.04] bg-white/[0.01] text-[9px] font-bold uppercase tracking-wider text-gray-500 font-mono">
                <th className="px-4 py-3">Intersection Segment</th>
                <th className="px-4 py-3 text-center">Congestion</th>
                <th className="px-4 py-3 text-center">Avg Speed</th>
                <th className="px-4 py-3">Active Cycle</th>
                <th className="px-4 py-3">AI Recommendation / Override Action</th>
                <th className="px-4 py-3 text-right">System Action</th>
              </tr>
            </thead>
            <tbody>
              {intersections.map((node) => {
                const isApplied = appliedIntersections[node.id]
                const isNormal =
                  node.recommendation.toLowerCase().includes('no action') ||
                  node.recommendation.toLowerCase().includes('normal signal')

                return (
                  <tr
                    key={node.id}
                    className="border-b border-white/[0.03] hover:bg-white/[0.01] transition-colors text-xs text-gray-300 align-middle"
                  >
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-gray-200">{node.name}</div>
                      <div className="text-[9px] text-gray-500 font-mono">Node ID: {node.id}</div>
                    </td>
                    <td className="px-4 py-3.5 text-center font-mono font-bold">
                      <span className={`${node.colorClass} px-2 py-0.5 rounded bg-white/[0.02] border border-white/[0.04]`}>
                        {node.congestionScore}%
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center font-mono">{node.speed} km/h</td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded-full bg-gray-900 border border-white/[0.06] text-[10px] font-mono">
                        ⏱️ {node.phaseTime} ({node.phaseType.split(' ')[0]})
                      </span>
                    </td>
                    <td className="px-4 py-3.5 max-w-[280px]">
                      {isApplied ? (
                        <div className="flex items-center gap-1 text-emerald-400 font-mono text-[10px] font-bold status-blink">
                          <span>✅</span>
                          <span>PHASE TIMING APPLIED SUCCESSFULLY</span>
                        </div>
                      ) : (
                        <div className={`font-medium ${isNormal ? 'text-gray-500 font-mono text-[10px]' : 'text-gray-300'}`}>
                          {node.recommendation}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {isNormal ? (
                        <span className="text-[10px] font-mono text-gray-600 px-2.5 py-1.5 cursor-default">
                          Normal Flow
                        </span>
                      ) : isApplied ? (
                        <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1.5 rounded-lg">
                          Applied ✓
                        </span>
                      ) : (
                        <button
                          onClick={() => handleApplySignalOverride(node.id, node.name)}
                          className="px-2.5 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-400 text-[10px] font-bold font-mono transition-all hover:scale-[1.03] active:scale-[0.98]"
                        >
                          ⚡ Force Override
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
