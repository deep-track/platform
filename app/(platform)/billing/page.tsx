'use client'

import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { DataTable } from '@/components/ui/data-table'
import { BarChart, XAxis, YAxis, Bar, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'

// Create a client
const queryClient = new QueryClient()

// API functions
async function getCreditsBalance() {
  const res = await fetch('/api/credits/balance')
  return res.json()
}

async function getTransactions() {
  const res = await fetch('/api/credits/transactions')
  return res.json()
}

async function getVerifications() {
  const res = await fetch('/api/credits/verifications')
  return res.json()
}

// Column definitions for verification history
const verificationColumns = [
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }: { row: any }) => {
      const type = row.getValue('type')
      return (
        <Badge variant="outline">
          {type.replace('_', ' ')}
        </Badge>
      )
    }
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }: { row: any }) => {
      const status = row.getValue('status')
      return (
        <Badge 
          variant={
            status === 'completed' 
              ? 'success' 
              : status === 'failed' 
                ? 'destructive' 
                : 'secondary' // Changed from 'warning' to 'secondary'
          }
        >
          {status}
        </Badge>
      )
    }
  },
  {
    accessorKey: 'creditCost',
    header: 'Credits Used'
  },
  {
    accessorKey: 'timestamp',
    header: 'Date',
    cell: ({ row }: { row: any }) => format(new Date(row.getValue('timestamp')), 'MMM dd, yyyy')
  }
]

// Actual component that uses the queries
function BillingPageContent() {
  // Fetch data
  const { data: balance } = useQuery({
    queryKey: ['credits-balance'],
    queryFn: getCreditsBalance
  })

  const { data: transactions } = useQuery({
    queryKey: ['transactions'],
    queryFn: getTransactions
  })

  const { data: verifications } = useQuery({
    queryKey: ['verifications'],
    queryFn: getVerifications
  })

  return (
    <div className="container mx-auto py-6 space-y-8">
      <h1 className="text-3xl font-bold">Billing & Usage</h1>
      
      <Tabs defaultValue="usage" className="w-full">
        <TabsList>
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="usage" className="space-y-6">
          {/* Credit Balance Card */}
          <Card>
            <CardHeader>
              <CardTitle>Available Credits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">
                {balance?.credits || 0}
              </div>
            </CardContent>
          </Card>

          {/* Usage Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Usage by Verification Type</CardTitle>
            </CardHeader>
            <CardContent>
              {verifications && (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={verifications}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="type" />
                      <YAxis dataKey="creditCost" />
                      <Tooltip />
                      <Bar dataKey="creditCost" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Verification History */}
          <Card>
            <CardHeader>
              <CardTitle>Verification History</CardTitle>
            </CardHeader>
            <CardContent>
              {verifications && (
                <DataTable
                  columns={verificationColumns}
                  data={verifications} 
                  tableTitle={''}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          {/* Transaction History */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              {transactions && (
                <DataTable
                  columns={[
                    {
                      accessorKey: 'type',
                      header: 'Transaction Type'
                    },
                    {
                      accessorKey: 'amount',
                      header: 'Amount'
                    },
                    {
                      accessorKey: 'date',
                      header: 'Date',
                      cell: ({ row }) => format(new Date(row.getValue('date')), 'MMM dd, yyyy')
                    }
                  ]}
                  data={transactions} 
                  tableTitle={''}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Wrapper component that provides the QueryClient
export default function BillingPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <BillingPageContent />
    </QueryClientProvider>
  )
}