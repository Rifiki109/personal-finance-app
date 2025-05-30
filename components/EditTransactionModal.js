'use client'

import { useState } from 'react'

const EditTransactionModal = ({ transaction, onClose, onSave }) => {
  const [editedTransaction, setEditedTransaction] = useState({
    name: transaction?.name || '',
    user_category: transaction?.user_category || 'Other',
    amount: transaction?.amount || 0
  })

  const categories = [
    'Food & Dining',
    'Transportation', 
    'Shopping',
    'Bills & Utilities',
    'Entertainment',
    'Healthcare',
    'Income',
    'Transfer',
    'Other'
  ]

  const handleSave = async () => {
    try {
      const response = await fetch('/api/transactions/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: transaction.id,
          name: editedTransaction.name,
          user_category: editedTransaction.user_category,
          amount: parseFloat(editedTransaction.amount)
        })
      })

      if (response.ok) {
        onSave(editedTransaction)
        onClose()
      } else {
        alert('Failed to update transaction')
      }
    } catch (error) {
      console.error('Error updating transaction:', error)
      alert('Error updating transaction')
    }
  }

  if (!transaction) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }} onClick={onClose}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '80vh',
        overflowY: 'auto',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
      }} onClick={e => e.stopPropagation()}>
        
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 24px',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Edit Transaction</h3>
          <button onClick={onClose} style={{
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            padding: '4px'
          }}>×</button>
        </div>
        
        <div style={{ padding: '24px' }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>
              Transaction Name
            </label>
            <input
              type="text"
              value={editedTransaction.name}
              onChange={(e) => setEditedTransaction({
                ...editedTransaction,
                name: e.target.value
              })}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>
              Category
            </label>
            <select
              value={editedTransaction.user_category}
              onChange={(e) => setEditedTransaction({
                ...editedTransaction,
                user_category: e.target.value
              })}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>
              Amount
            </label>
            <input
              type="number"
              step="0.01"
              value={editedTransaction.amount}
              onChange={(e) => setEditedTransaction({
                ...editedTransaction,
                amount: e.target.value
              })}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>
        </div>

        <div style={{
          display: 'flex',
          gap: '12px',
          padding: '20px 24px',
          borderTop: '1px solid #e5e7eb',
          justifyContent: 'flex-end'
        }}>
          <button onClick={onClose} style={{
            padding: '10px 20px',
            border: '1px solid #d1d5db',
            background: 'white',
            borderRadius: '8px',
            cursor: 'pointer'
          }}>
            Cancel
          </button>
          <button onClick={handleSave} style={{
            padding: '10px 20px',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}

export default EditTransactionModal