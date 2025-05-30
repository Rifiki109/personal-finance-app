import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // For now, this will just trigger a refresh
    // Later we can add logic to sync new transactions
    
    return NextResponse.json({ 
      success: true, 
      message: 'Sync completed' 
    })
  } catch (error) {
    console.error('Error syncing transactions:', error)
    return NextResponse.json(
      { error: 'Failed to sync transactions' },
      { status: 500 }
    )
  }
}