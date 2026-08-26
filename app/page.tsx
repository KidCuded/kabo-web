import { createClient } from '@/utils/supabase/server'

export default async function TestConnectionPage() {
  const supabase = await createClient()

  // Execute a simple read query against your customers table
  const { data, error } = await supabase.from('customers').select('*')

  if (error) {
    return (
      <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
        <h1 style={{ color: 'red' }}>Connection Failed!</h1>
        <p>Error Message: {error.message}</p>
        <p>Error Code: {error.code}</p>
      </main>
    )
  }

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: 'green' }}>Successfully Connected to Supabase!</h1>
      <p>Retrieved {data ? data.length : 0} row(s) from the "customers" table.</p>
      <pre style={{ background: '#f4f4f4', padding: '1rem', borderRadius: '8px' }}>
        {JSON.stringify(data, null, 2)}
      </pre>
    </main>
  )
}