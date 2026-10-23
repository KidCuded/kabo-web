// app/dashboard/customers/page.tsx
'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation' // Add this import

type CustomerData = {
  id: string
  name: string | null
  phone_number: string
  total_spent: number
  created_at: string
  stamps: number
}

type SortField = 'name' | 'phone_number' | 'stamps' | 'total_spent' | 'created_at'

export default function CustomersPage() {
    const router = useRouter()
    const [customers, setCustomers] = useState<CustomerData[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [sortField, setSortField] = useState<SortField>('created_at')
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

    const supabase = createClient()

    useEffect(() => {
        async function fetchCustomers() {
            const { data: userData } = await supabase.auth.getUser()
            if (!userData.user) return

            const { data: businessData } = await supabase
                .from('businesses')
                .select('id')
                .eq('auth_user_id', userData.user.id)
                .single()

            if (!businessData) return

            const { data: customerData, error } = await supabase
                .from('customers')
                .select(`
                id,
                name,
                phone_number,
                total_spent,
                created_at,
                loyalty_balances ( current_stamps )
                `)
                .eq('business_id', businessData.id)

            if (!error && customerData) {
                const formattedData: CustomerData[] = customerData.map((c: any) => {
                const balances = Array.isArray(c.loyalty_balances) ? c.loyalty_balances[0] : c.loyalty_balances
                    return {
                        id: c.id,
                        name: c.name,
                        phone_number: c.phone_number,
                        total_spent: c.total_spent || 0,
                        created_at: c.created_at,
                        stamps: balances?.current_stamps || 0
                    }
                })
                setCustomers(formattedData)
            }
        setLoading(false)
    }

    fetchCustomers()
  }, [])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc') 
    }
  }

  const filteredAndSortedCustomers = useMemo(() => {
    // 1. Filter
    const filtered = customers.filter(c => {
      const searchLower = searchTerm.toLowerCase()
      const nameMatch = (c.name || '').toLowerCase().includes(searchLower)
      const phoneMatch = c.phone_number.includes(searchLower)
      return nameMatch || phoneMatch
    })

    // 2. Sort
    return filtered.sort((a, b) => {
      // Fallback to an empty string if the value is null
      let aValue = a[sortField] ?? ''
      let bValue = b[sortField] ?? ''

      // If comparing strings, make it case-insensitive so "Zack" doesn't come before "alice"
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [customers, searchTerm, sortField, sortDirection])

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h2 className="text-3xl font-bold text-gray-900">Customer Directory</h2>
        
        {/* Search Input */}
        <div className="relative w-full sm:w-72 shrink-0">
          <input
            type="text"
            placeholder="Search name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
          <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th onClick={() => handleSort('name')} className="p-4 font-semibold text-gray-600 cursor-pointer hover:bg-gray-100 transition-colors whitespace-nowrap">
                  Customer Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('phone_number')} className="p-4 font-semibold text-gray-600 cursor-pointer hover:bg-gray-100 transition-colors whitespace-nowrap">
                  Phone Number {sortField === 'phone_number' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('stamps')} className="p-4 font-semibold text-gray-600 cursor-pointer hover:bg-gray-100 transition-colors whitespace-nowrap">
                  Stamps {sortField === 'stamps' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('total_spent')} className="p-4 font-semibold text-gray-600 cursor-pointer hover:bg-gray-100 transition-colors whitespace-nowrap">
                  Total Spent {sortField === 'total_spent' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('created_at')} className="p-4 font-semibold text-gray-600 cursor-pointer hover:bg-gray-100 transition-colors whitespace-nowrap">
                  Joined Date {sortField === 'created_at' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500 animate-pulse">Loading customers...</td>
                </tr>
              ) : filteredAndSortedCustomers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">No customers found.</td>
                </tr>
              ) : (
                filteredAndSortedCustomers.map((customer) => (
                    <tr 
                    key={customer.id} 
                    onClick={() => router.push(`/dashboard/customers/${customer.id}`)}
                    className="hover:bg-blue-50 transition-colors cursor-pointer group"
                    >
                        <td className="p-4 font-medium text-gray-900">{customer.name || <span className="text-gray-400 italic">Unknown</span>}</td>
                        <td className="p-4 text-gray-600">{customer.phone_number}</td>
                        <td className="p-4">
                        <span className="inline-flex items-center justify-center bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold text-sm">
                            {customer.stamps}
                        </span>
                        </td>
                        <td className="p-4 font-semibold text-green-600">RM {customer.total_spent.toFixed(2)}</td>
                        <td className="p-4 text-gray-500 text-sm">
                            {new Date(customer.created_at).toLocaleDateString('en-MY')}
                        </td>
                    </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}