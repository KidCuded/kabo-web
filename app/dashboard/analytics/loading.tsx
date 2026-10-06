// app/dashboard/analytics/loading.tsx
export default function AnalyticsLoading() {
  return (
    <div className="max-w-4xl mx-auto animate-pulse">
      {/* Title Skeleton */}
      <div className="h-8 w-48 bg-gray-200 rounded-md mb-8"></div>

      {/* Metric Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-3">
          <div className="h-4 w-28 bg-gray-200 rounded"></div>
          <div className="h-9 w-20 bg-gray-300 rounded"></div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-3">
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
          <div className="h-9 w-20 bg-gray-300 rounded"></div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-3">
          <div className="h-4 w-36 bg-gray-200 rounded"></div>
          <div className="h-9 w-20 bg-gray-300 rounded"></div>
        </div>
      </div>

      {/* Recent Transactions List Skeleton */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="h-6 w-44 bg-gray-200 rounded mb-6"></div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-none">
              <div className="space-y-2">
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
                <div className="h-3 w-24 bg-gray-100 rounded"></div>
              </div>
              <div className="h-5 w-16 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}