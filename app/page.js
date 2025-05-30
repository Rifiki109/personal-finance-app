'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import PlaidLink from '../components/PlaidLink'
import EditTransactionModal from '../components/EditTransactionModal'

export default function Dashboard() {
  const [transactions, setTransactions] = useState([])
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [stats, setStats] = useState({
    totalBalance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    transactionCount: 0
  })

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      const { data: transactionData, error: transError } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false })
        .limit(50)
      
      if (transError) {
        console.log('No transactions yet:', transError)
      }
      
      const { data: accountData, error: accError } = await supabase
        .from('accounts')
        .select('*')
      
      if (accError) {
        console.log('No accounts yet:', accError)
      }
      
      setTransactions(transactionData || [])
      setAccounts(accountData || [])
      
      const totalBalance = accountData?.reduce((sum, acc) => sum + (acc.balance_current || 0), 0) || 0
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      const recentTransactions = transactionData?.filter(tx => 
        new Date(tx.date) >= thirtyDaysAgo
      ) || []
      
      const monthlyIncome = recentTransactions
        .filter(tx => tx.amount > 0)
        .reduce((sum, tx) => sum + tx.amount, 0)
      
      const monthlyExpenses = Math.abs(recentTransactions
        .filter(tx => tx.amount < 0)
        .reduce((sum, tx) => sum + tx.amount, 0))
      
      setStats({
        totalBalance,
        monthlyIncome,
        monthlyExpenses,
        transactionCount: transactionData?.length || 0
      })
      
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(Math.abs(amount))
  }

  const handleSyncTransactions = async () => {
    alert('Sync feature coming next! For now, refreshing your data...')
    await loadDashboardData()
  }

  const handlePlaidSuccess = (data) => {
    console.log('Bank connected successfully!', data)
    // The PlaidLink component will handle the page refresh
  }

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction)
  }

  const handleSaveTransaction = async (updatedData) => {
    // Update the local state immediately for better UX
    setTransactions(transactions.map(tx => 
      tx.id === editingTransaction.id 
        ? { ...tx, ...updatedData }
        : tx
    ))
    
    // Refresh the stats
    await loadDashboardData()
  }

  const handleCloseModal = () => {
    setEditingTransaction(null)
  }

  if (loading) {
    return (
      <div className="metrics-grid">
        {[1,2,3,4].map(i => (
          <div key={i} style={{
            background: '#e5e7eb',
            height: '128px',
            borderRadius: '12px',
            animation: 'pulse 2s infinite'
          }}></div>
        ))}
      </div>
    )
  }

  return (
    <>
      {/* Stats Cards */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-header">
            <div className="metric-icon balance-icon">
              <span>💳</span>
            </div>
            <div className="metric-title">Total Balance</div>
          </div>
          <div className="metric-value">
            {formatCurrency(stats.totalBalance)}
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <div className="metric-icon income-icon">
              <span>📈</span>
            </div>
            <div className="metric-title">Monthly Income</div>
          </div>
          <div className="metric-value text-green-600">
            {formatCurrency(stats.monthlyIncome)}
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <div className="metric-icon expense-icon">
              <span>📉</span>
            </div>
            <div className="metric-title">Monthly Expenses</div>
          </div>
          <div className="metric-value text-red-600">
            {formatCurrency(stats.monthlyExpenses)}
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <div className="metric-icon projection-icon">
              <span>📊</span>
            </div>
            <div className="metric-title">Transactions</div>
          </div>
          <div className="metric-value">
            {stats.transactionCount}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Recent Transactions */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Transactions</h2>
            <button onClick={handleSyncTransactions} className="btn-primary">
              Sync Transactions
            </button>
          </div>
          
          {transactions.length === 0 ? (
            <div className="no-data">
              <span className="no-data-icon">🏦</span>
              <h3 className="no-data-title">No transactions yet</h3>
              <p className="no-data-text">
                Connect your bank account to start tracking your finances
              </p>
              <PlaidLink onSuccess={handlePlaidSuccess}>
                <button className="btn-primary">
                  Connect Bank Account
                </button>
              </PlaidLink>
            </div>
          ) : (
            <div className="transaction-list">
              {transactions.slice(0, 10).map((transaction) => (
                <div 
                  key={transaction.id} 
                  className={`transaction-item ${
                    transaction.amount > 0 ? 'income' : 'expense'
                  }`}
                  onClick={() => handleEditTransaction(transaction)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="transaction-info">
                    <h4>{transaction.name}</h4>
                    <p>
                      {new Date(transaction.date).toLocaleDateString()} • 
                      {transaction.user_category || 'Uncategorized'}
                    </p>
                  </div>
                  <div className={`transaction-amount ${
                    transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.amount > 0 ? '+' : ''}
                    {formatCurrency(transaction.amount)}
                  </div>
                  <div className="edit-indicator">
                    ✏️
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="sidebar">
          {/* Enhanced Accounts with Balance Details */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Account Balances</h3>
              <button 
                onClick={handleSyncTransactions} 
                className="btn-secondary"
                style={{ fontSize: '12px', padding: '6px 12px' }}
              >
                🔄 Refresh
              </button>
            </div>
            {accounts.length === 0 ? (
              <div className="no-data">
                <span style={{fontSize: '2rem', display: 'block', marginBottom: '1rem'}}>🏦</span>
                <p className="no-data-text">No accounts connected</p>
              </div>
            ) : (
              <div className="account-balance-list">
                {accounts.map((account) => (
                  <div key={account.id} className="account-balance-item">
                    <div className="account-info">
                      <h4 style={{ 
                        margin: '0 0 4px 0', 
                        fontSize: '15px', 
                        fontWeight: '600',
                        color: '#111827'
                      }}>
                        {account.name}
                      </h4>
                      <p style={{ 
                        margin: '0 0 8px 0', 
                        fontSize: '12px', 
                        color: '#6b7280',
                        textTransform: 'capitalize'
                      }}>
                        {account.type} • {account.subtype}
                      </p>
                    </div>
                    
                    <div className="balance-details">
                      {/* Current Balance */}
                      <div className="balance-row">
                        <span className="balance-label">Current</span>
                        <span className="balance-value current">
                          {formatCurrency(account.balance_current || 0)}
                        </span>
                      </div>
                      
                      {/* Available Balance (if different) */}
                      {account.balance_available !== null && 
                       account.balance_available !== account.balance_current && (
                        <div className="balance-row">
                          <span className="balance-label">Available</span>
                          <span className="balance-value available">
                            {formatCurrency(account.balance_available || 0)}
                          </span>
                        </div>
                      )}
                      
                      {/* Credit Limit (for credit accounts) */}
                      {account.balance_limit && account.balance_limit > 0 && (
                        <div className="balance-row">
                          <span className="balance-label">Limit</span>
                          <span className="balance-value limit">
                            {formatCurrency(account.balance_limit)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Total Balance Summary */}
                <div className="total-balance-summary">
                  <div className="balance-row total">
                    <span className="balance-label total">Total Balance</span>
                    <span className="balance-value total">
                      {formatCurrency(accounts.reduce((sum, acc) => sum + (acc.balance_current || 0), 0))}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h3 className="card-title">Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <PlaidLink onSuccess={handlePlaidSuccess}>
                <button className="btn-primary">
                  🔗 Connect Bank Account
                </button>
              </PlaidLink>
              <button onClick={() => alert('Manual transaction feature coming soon!')} className="btn-primary">
                📝 Add Manual Transaction
              </button>
              <button onClick={() => alert('Recurring bills feature coming soon!')} className="btn-primary">
                🔄 Add Recurring Bill
              </button>
              <button onClick={() => alert('Reports feature coming soon!')} className="btn-primary">
                📊 View Reports
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Transaction Modal */}
      {editingTransaction && (
        <EditTransactionModal
          transaction={editingTransaction}
          onClose={handleCloseModal}
          onSave={handleSaveTransaction}
        />
      )}

      <style jsx>{`
        .transaction-item {
          position: relative;
          transition: all 0.2s;
        }

        .transaction-item:hover {
          background: #f9fafb !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .edit-indicator {
          position: absolute;
          top: 50%;
          right: 16px;
          transform: translateY(-50%);
          opacity: 0;
          transition: opacity 0.2s;
          font-size: 14px;
        }

        .transaction-item:hover .edit-indicator {
          opacity: 1;
        }

        .account-balance-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .account-balance-item {
          padding: 16px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          transition: all 0.2s;
        }

        .account-balance-item:hover {
          background: #f1f5f9;
          border-color: #cbd5e1;
          transform: translateY(-1px);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }

        .balance-details {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .balance-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .balance-label {
          font-size: 12px;
          color: #64748b;
          font-weight: 500;
        }

        .balance-value {
          font-size: 14px;
          font-weight: 600;
        }

        .balance-value.current {
          color: #059669;
          font-size: 15px;
        }

        .balance-value.available {
          color: #0369a1;
        }

        .balance-value.limit {
          color: #7c3aed;
        }

        .total-balance-summary {
          margin-top: 16px;
          padding: 16px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          color: white;
        }

        .balance-row.total {
          margin: 0;
        }

        .balance-label.total {
          color: rgba(255, 255, 255, 0.9);
          font-weight: 600;
          font-size: 13px;
        }

        .balance-value.total {
          color: white;
          font-size: 18px;
          font-weight: 700;
        }

        .btn-secondary {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          color: #475569;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-secondary:hover {
          background: #f1f5f9;
          border-color: #cbd5e1;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
      `}</style>
    </>
  )
}