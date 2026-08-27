// app/dashboard/feedback/page.tsx
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function FeedbackPage() {
  const supabase = await createClient()

  // 1. Authenticate and get Business ID
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/login')

  const { data: businessData } = await supabase
    .from('businesses')
    .select('id')
    .eq('auth_user_id', userData.user.id)
    .single()

  if (!businessData) redirect('/login')

  // 2. Fetch all reviews for this business
  const { data: reviews } = await supabase
    .from('reviews')
    .select('rating, comment, created_at')
    .eq('business_id', businessData.id)
    .order('created_at', { ascending: false })

  // Helper function to draw the correct number of solid/empty stars
  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg 
            key={star} 
            className={`w-5 h-5 ${star <= rating ? 'text-amber-400' : 'text-gray-200'}`} 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Customer Feedback</h2>
        <p className="text-gray-500 mt-2">Private ratings and comments collected from your QR portal.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {!reviews || reviews.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">No feedback yet</h3>
            <p className="text-gray-500 mt-1">When customers leave a rating, it will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {reviews.map((review, index) => (
              <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  {renderStars(review.rating)}
                  <span className="text-sm text-gray-400 font-medium">
                    {new Date(review.created_at || Date.now()).toLocaleDateString('en-MY', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                
                {/* Only show the comment box if they actually typed something */}
                {review.comment ? (
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-100">
                    "{review.comment}"
                  </p>
                ) : (
                  <p className="text-gray-400 italic text-sm">
                    No written comment provided.
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}