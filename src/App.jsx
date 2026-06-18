import { useState, useEffect, useMemo } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Explorer from './pages/Explorer'
import RoutePlanner from './pages/RoutePlanner'
import Analytics from './pages/Analytics'
import IncidentCenter from './pages/IncidentCenter'
import SignalOptimization from './pages/SignalOptimization'
import trafficData from './data/trafficData.json'

export default function App() {
  const [activePage, setActivePage] = useState('explorer')
  const [selectedRoad, setSelectedRoad] = useState(null)
  const [recentRoads, setRecentRoads] = useState([])
  const [roadsData, setRoadsData] = useState(trafficData.roads)
  const [simulationActive, setSimulationActive] = useState(false)

  // Track recent searches/clicks
  const handleRoadSelect = (road) => {
    if (!road) {
      setSelectedRoad(null)
      return
    }

    setSelectedRoad(prev => prev?.id === road.id ? null : road)

    setRecentRoads((prev) => {
      // Filter out if already exists, then push to front
      const filtered = prev.filter((r) => r.id !== road.id)
      return [road, ...filtered].slice(0, 5)
    })
  }

  // Derive current selected road to sync with simulation updates
  const currentSelectedRoad = useMemo(() => {
    if (!selectedRoad) return null
    return roadsData.find((r) => r.id === selectedRoad.id) || selectedRoad
  }, [selectedRoad, roadsData])

  // Derive dynamic stats based on active roadsData
  const dynamicStats = useMemo(() => {
    const totalRoads = roadsData.length
    const congestedRoads = roadsData.filter((r) => r.congestionLevel === 'high').length
    const averageCongestion = parseFloat(
      (roadsData.reduce((sum, r) => sum + r.congestionScore, 0) / totalRoads).toFixed(1)
    )
    const activeIncidents = roadsData.reduce((sum, r) => sum + r.incidents.length, 0)

    return {
      totalRoads,
      congestedRoads,
      averageCongestion,
      activeIncidents,
      lastUpdated: new Date().toISOString(),
    }
  }, [roadsData])

  // Simulation effect loop
  useEffect(() => {
    if (!simulationActive) return

    const interval = setInterval(() => {
      setRoadsData((prevRoads) => {
        // Randomly select 2 roads to change
        const index1 = Math.floor(Math.random() * prevRoads.length)
        let index2 = Math.floor(Math.random() * prevRoads.length)
        while (index1 === index2) {
          index2 = Math.floor(Math.random() * prevRoads.length)
        }

        return prevRoads.map((road, idx) => {
          if (idx !== index1 && idx !== index2) return road

          // Congestion shift: +/- 10
          const deltaScore = Math.floor(Math.random() * 21) - 10
          const newScore = Math.max(5, Math.min(100, road.congestionScore + deltaScore))

          // Speed shift (inverse to congestion)
          const deltaSpeed = Math.floor(Math.random() * 11) - 5
          let newSpeed = Math.max(5, Math.min(80, road.speed - Math.round(deltaScore * 0.6) + deltaSpeed))

          const newLevel = newScore > 70 ? 'high' : newScore > 40 ? 'moderate' : 'low'

          // Randomly trigger minor incidents for highly congested roads
          let incidents = [...road.incidents]
          if (newScore > 85 && incidents.length === 0 && Math.random() > 0.5) {
            const mockIncidents = [
              'Heavy vehicle backup near intersection',
              'Slowdown due to merging traffic bottlenecks',
              'High vehicle volume queue building up',
            ]
            incidents.push(mockIncidents[Math.floor(Math.random() * mockIncidents.length)])
          }

          return {
            ...road,
            congestionScore: newScore,
            speed: newSpeed,
            congestionLevel: newLevel,
            incidents,
            lastUpdated: new Date().toISOString(),
          }
        })
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [simulationActive])

  // Keyboard shortcut listener: Ctrl+R to open Route Planner
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'r') {
        e.preventDefault()
        setActivePage('route-planner')
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="flex h-screen w-screen bg-gray-950 overflow-hidden font-sans">
      {/* 1. persistent left navigation sidebar */}
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        selectedRoad={currentSelectedRoad}
        setSelectedRoad={setSelectedRoad}
        recentRoads={recentRoads}
        roadsData={roadsData}
        simulationActive={simulationActive}
        setSimulationActive={setSimulationActive}
      />

      {/* 2. right content workspace */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* Sync Header with dynamic ticker states */}
        <Header roadsData={roadsData} activePage={activePage} />

        {/* Dynamic active page views */}
        <main className="flex-1 p-4 min-h-0 relative bg-gray-950/20">
          {activePage === 'explorer' && (
            <Explorer
              roadsData={roadsData}
              selectedRoad={currentSelectedRoad}
              setSelectedRoad={setSelectedRoad}
              onRoadSelect={handleRoadSelect}
            />
          )}

          {activePage === 'route-planner' && (
            <RoutePlanner
              roadsData={roadsData}
              onRoadSelect={handleRoadSelect}
            />
          )}

          {activePage === 'analytics' && (
            <Analytics
              roadsData={roadsData}
              stats={dynamicStats}
            />
          )}

          {activePage === 'incidents' && (
            <IncidentCenter
              roadsData={roadsData}
              setRoadsData={setRoadsData}
            />
          )}

          {activePage === 'signals' && (
            <SignalOptimization
              roadsData={roadsData}
              setRoadsData={setRoadsData}
            />
          )}
        </main>
      </div>
    </div>
  )
}
