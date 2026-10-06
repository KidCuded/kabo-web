// app/dashboard/feedback/loading.tsx
export default function FeedbackLoading() {
  return (
    <div className="max-w-4xl mx-auto animate-pulse">
      {/* Title Skeleton */}
      <div className="h-8 w-48 bg-gray-200 rounded-md mb-17"></div>

      {/* Feedback Feed Skeleton */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white border-b border-gray-200/50 shadow-sm p-6 space-y-3"
          >
            {/* Top row: Stars & Date */}
            <div className="flex justify-between items-center">
              <div className="flex gap-1">
                {[...Array(5)].map((_, starIndex) => (
                  <div key={starIndex} className="w-5 h-5 bg-gray-200 rounded-full"></div>
                ))}
              </div>
              <div className="h-3 w-20 bg-gray-100 rounded"></div>
            </div>

            {/* Customer info skeleton */}
            <div className="h-4 w-36 bg-gray-200 rounded"></div>

            {/* Comment text lines skeleton */}
            <div className="space-y-2 pt-1">
              <div className="h-3 w-full bg-gray-100 rounded"></div>
              <div className="h-3 w-3/4 bg-gray-100 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}