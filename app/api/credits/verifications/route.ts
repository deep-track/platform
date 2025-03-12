import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {


    const verifications: any[] = []

    return NextResponse.json(verifications)
  } catch (error) {
    console.error('Error fetching verifications:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
