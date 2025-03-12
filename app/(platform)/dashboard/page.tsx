import { MetricsGrid } from "../_components/metrics-grid"
import GettingStarted from "../_components/gettingStarted"
import FeatureCards from "./_components/feature-cards"

export default function Page() {
  return (
    <div >
      <main className="flex-1">
        <div className="space-y-4 p-8 pt-6">
        <GettingStarted />
        </div>
        {/* Upcoming features section (new) */}
      <div className="mb-8 space-y-4 p-8 pt-6">
        <h2 className="text-2xl font-bold mb-6">Upcoming Features</h2>
        <p className="text-gray-600 mb-8">
          Explore the new verification capabilities coming soon to DeepTrack. These advanced features will enhance your
          verification process and provide additional security layers.
        </p>
        <FeatureCards />
      </div>
      </main>
    </div>
  )
}
