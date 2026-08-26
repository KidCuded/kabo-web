// app/login/page.tsx
import { login } from './actions'

export default async function LoginPage(props: {
  searchParams: Promise<{ message?: string }>
}) {
  // Await the searchParams promise (Required in Next.js 15+)
  const searchParams = await props.searchParams
  const errorMessage = searchParams?.message

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg ring-1 ring-gray-100">
        
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">KABO</h1>
          <p className="mt-2 text-sm text-gray-500">Merchant POS Access</p>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-600 border border-red-200">
            {errorMessage}
          </div>
        )}

        {/* Login Form */}
        <form action={login} className="space-y-6">
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
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700" htmlFor="password">
                Password
              </label>
              <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                Forgot password?
              </a>
            </div>
            <input
              id="password"
              type="password"
              name="password"
              required
              className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="flex w-full justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 transition-colors"
          >
            Sign In
          </button>
        </form>

        {/* Registration Link */}
        <div className="mt-8 text-center text-sm">
          <p className="text-gray-600">
            Don't have a merchant account?{' '}
            <a href="/register" className="font-semibold text-blue-600 hover:text-blue-500">
              Register here
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}