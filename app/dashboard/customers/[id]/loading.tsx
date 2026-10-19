// app/dashboard/customers/[id]/loading.tsx
export default function CustomerDetailSkeleton() {
  return (
    <div className="max-w-4xl mx-auto animate-pulse">
      {/* Header & Back Button Skeleton */}
      <div className="mb-8">
        <div className="h-4 w-32 bg-gray-200 rounded mb-4"></div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <div className="h-9 w-56 bg-gray-200 rounded-md mb-2"></div>
            <div className="h-6 w-36 bg-gray-200 rounded-md mb-2"></div>
            <div className="h-4 w-44 bg-gray-200 rounded"></div>
          </div>
          <div className="h-10 w-36 bg-gray-200 rounded-lg shrink-0"></div>
        </div>
      </div>

      {/* Snapshot Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-center justify-between shadow-sm">
          <div className="space-y-2">
            <div className="h-4 w-28 bg-gray-200 rounded"></div>
            <div className="h-9 w-16 bg-gray-200 rounded-md"></div>
          </div>
          <div className="w-12 h-12 bg-gray-200 rounded-full shrink-0"></div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-center justify-between shadow-sm">
          <div className="space-y-2">
            <div className="h-4 w-28 bg-gray-200 rounded"></div>
            <div className="h-9 w-24 bg-gray-200 rounded-md"></div>
          </div>
          <div className="w-12 h-12 bg-gray-200 rounded-full shrink-0"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Transaction Timeline Skeleton */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
            <div className="h-5 w-40 bg-gray-200 rounded"></div>
          </div>
          <div className="p-6 space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0"></div>
                  {i !== 3 && <div className="w-0.5 h-12 bg-gray-100 mt-2"></div>}
                </div>
                <div className="flex-1 pb-2">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="h-4 w-32 bg-gray-200 rounded"></div>
                      <div className="h-3 w-24 bg-gray-200 rounded"></div>
                    </div>
                    <div className="space-y-2 text-right">
                      <div className="h-5 w-12 bg-gray-200 rounded ml-auto"></div>
                      <div className="h-3 w-16 bg-gray-200 rounded ml-auto"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Customer Feedback Skeleton */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
            <div className="h-5 w-40 bg-gray-200 rounded"></div>
          </div>
          <div className="p-6 space-y-6">
            {[1, 2].map((i) => (
              <div key={i} className="space-y-3 pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                <div className="flex justify-between items-center">
                  <div className="h-4 w-28 bg-gray-200 rounded"></div>
                  <div className="h-3 w-20 bg-gray-200 rounded"></div>
                </div>
                <div className="h-16 w-full bg-gray-100 rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}