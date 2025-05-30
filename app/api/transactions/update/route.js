import { NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabase'

export async function PUT(request) {
  try {
    const body = await request.json()
    const { id, name, user_category, amount } = body

    console.log('Updating transaction:', { id, name, user_category, amount })

    if (!id) {
      return NextResponse.json(
        { error: 'Transaction ID is required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('transactions')
      .update({
        name: name,
        user_category: user_category,
        amount: parseFloat(amount)
      })
      .eq('id', id)
      .select()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to update transaction', details: error.message },
        { status: 500 }
      )
    }

    if (data.length === 0) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    console.log('Transaction updated successfully')
    return NextResponse.json({ 
      success: true, 
      transaction: data[0]
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}