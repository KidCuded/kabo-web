// app/register/page.tsx
import { register } from './actions'

export default async function RegisterPage(props: {
  searchParams: Promise<{ message?: string }>
}) {
  const searchParams = await props.searchParams
  const errorMessage = searchParams?.message

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg ring-1 ring-gray-100">
        
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">KABO</h1>
          <p className="mt-2 text-sm text-gray-500">Register your business</p>
        </div>

        {errorMessage && (
          <div className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-600 border border-red-200">
            {errorMessage}
          </div>
        )}

        <form action={register} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="businessName">
              Business Name
            </label>
            <input
              id="businessName"
              type="text"
              name="businessName"
              required
              placeholder="e.g., Kopi Kampung"
              className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              name="email"
              required
              placeholder="store@example.com"
              className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              name="password"
              required
              minLength={6}
              placeholder="Minimum 6 characters"
              className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="flex w-full justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Create Account
          </button>
        </form>

        <div className="mt-8 text-center text-sm">
          <p className="text-gray-600">
            Already have an account?{' '}
            <a href="/login" className="font-semibold text-blue-600 hover:text-blue-500">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}