'use client'
import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from '@/components/ui/data-table'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartContainer } from '@/components/ui/chart'
import { verificationColumns } from './verification-column'
import { chartConfig } from './chart-config'

export type Verifications = {
    type: string;
    completed: boolean;
    creditCost: number;
    createdAt: string;
}[]

interface BillingProps {
    verifications: Verifications,
    balance: number
}

export default function Billing(data: BillingProps) {
  return (
    <div className="container mx-auto py-6 space-y-8 p-2">
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
                {data.balance}
              </div>
            </CardContent>
          </Card>

          {/* Usage Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Usage by Verification Type</CardTitle>
            </CardHeader>
            <CardContent>
              {data.verifications.length !== 0 ? (
                <div className="h-20 w-full">
                  <ResponsiveContainer height={40} width={20} >
                    <BarChart  data={data.verifications}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="type" />
                      <YAxis dataKey="creditCost" />
                      <Tooltip />
                      <Bar dataKey="creditCost" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : <div>No verifications Yet</div>}
            </CardContent>
          </Card>

          {/* Verification History */}
          <Card>
            <CardHeader>
              <CardTitle>Verification History</CardTitle>
            </CardHeader>
            <CardContent>
              {data.verifications && (
                <DataTable
                  columns={verificationColumns}
                  data={data.verifications} 
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
              <CardContent className='flex flex-col space-y-4'>
               <h1>Please contact the team at deeptrack using the contacts below to add credits while we work to integrate a payment gateway:</h1> 
                <li>tech@deeptrack.io</li>
                <li>info@deeptrack.io</li>
                <li>tech@deeptrack.io</li>
              </CardContent>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
