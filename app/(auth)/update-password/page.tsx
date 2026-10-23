'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  
  const router = useRouter()
  const supabase = createClient()

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      setStatus('error')
      setMessage('Passwords do not match.')
      return
    }

    if (password.length < 6) {
      setStatus('error')
      setMessage('Password must be at least 6 characters.')
      return
    }

    setStatus('loading')
    setMessage('')

    // updateUser automatically applies to the user tied to the active session
    const { error } = await supabase.auth.updateUser({
      password: password
    })

    if (error) {
      setStatus('error')
      setMessage(error.message)
    } else {
      setStatus('success')
      setMessage('Password updated successfully! Redirecting to dashboard...')
      
      // Give them a moment to read the success message, then route to dashboard
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Create New Password</h2>
        <p className="text-gray-600 mb-6">Your password must be at least 6 characters long.</p>

        {status === 'success' ? (
          <div className="bg-green-50 text-green-700 p-4 rounded-lg border border-green-200 text-center font-medium">
            {message}
          </div>
        ) : (
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">New Password</label>
              <input
                type="password"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">Confirm Password</label>
              <input
                type="password"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            {status === 'error' && (
              <p className="text-sm text-red-600">{message}</p>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50 mt-2"
            >
              {status === 'loading' ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}