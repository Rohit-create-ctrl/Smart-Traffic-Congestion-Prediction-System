import { useState } from 'react'
import StatsCards from '../components/StatsCards'
import TrafficMap from '../components/TrafficMap'
import IncidentFeed from '../components/IncidentFeed'

export default function Dashboard() {
  const [selectedRoad, setSelectedRoad] = useState(null)

  const handleRoadSelect = (road) => {
    setSelectedRoad(prev => prev?.id === road.id ? null : road)
  }

  return (
    <main className="flex-1 flex flex-col gap-4 p-4 min-h-0 overflow-auto">
      {/* Stats Cards Row */}
      <section aria-label="Traffic Statistics">
        <StatsCards selectedRoad={selectedRoad} />
      </section>

      {/* Main Content: Map + Sidebar */}
      <section
        aria-label="Traffic Map and Incident Feed"
        className="flex-1 flex gap-4 min-h-0"
        style={{ height: 'calc(100vh - 220px)' }}
      >
        {/* Map — 70% */}
        <div className="flex-[7] min-h-0 min-w-0">
          <TrafficMap
            selectedRoad={selectedRoad}
            onRoadSelect={handleRoadSelect}
          />
        </div>

        {/* Sidebar — 30% */}
        <div className="flex-[3] min-h-0 overflow-y-auto pr-1">
          <IncidentFeed
            selectedRoad={selectedRoad}
            onRoadSelect={handleRoadSelect}
          />
        </div>
      </section>
    </main>
  )
}
