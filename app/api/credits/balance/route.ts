import { NextResponse } from 'next/server'

export async function GET() {
  try {
    return NextResponse.json({ credits:  0 })
  } catch (error) {
    console.error('Error fetching credit balance:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
