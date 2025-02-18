import { MetricsGrid } from "../_components/metrics-grid"
import GettingStarted from "../_components/gettingStarted"

export default function Page() {
  return (
    <div >
      <main className="flex-1">
        <div className="space-y-4 p-8 pt-6">
        <GettingStarted />
        </div>
        <div className="space-y-4 p-8 pt-6">
          <MetricsGrid />
        </div>
      </main>
    </div>
  )
}
