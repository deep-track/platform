import { NextResponse } from 'next/server'
export async function GET() {
  try {

    const transactions: any[] = []
    return NextResponse.json(transactions)
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
