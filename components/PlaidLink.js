'use client'

import { useCallback, useEffect, useState } from 'react'

const PlaidLink = ({ onSuccess, onExit, children }) => {
  const [linkToken, setLinkToken] = useState(null)
  const [loading, setLoading] = useState(false)
  const [plaidLoaded, setPlaidLoaded] = useState(false)

  // Load Plaid Link script
  useEffect(() => {
    // Check if Plaid is already loaded
    if (window.Plaid) {
      setPlaidLoaded(true)
      return
    }

    // Check if script is already in the DOM
    const existingScript = document.querySelector('script[src*="plaid.com/link"]')
    if (existingScript) {
      existingScript.onload = () => setPlaidLoaded(true)
      return
    }

    // Load the script
    const script = document.createElement('script')
    script.src = 'https://cdn.plaid.com/link/v2/stable/link-initialize.js'
    script.async = true
    script.onload = () => {
      console.log('Plaid Link script loaded successfully')
      setPlaidLoaded(true)
    }
    script.onerror = () => {
      console.error('Failed to load Plaid Link script')
    }
    
    document.head.appendChild(script)

    return () => {
      // Cleanup on unmount
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [])

  // Get link token from our API
  const getLinkToken = useCallback(async () => {
    if (linkToken) return // Already have a token

    try {
      setLoading(true)
      console.log('Requesting link token from API...')
      
      const response = await fetch('/api/plaid/create-link-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API Error ${response.status}: ${errorText}`)
      }
      
      const data = await response.json()
      
      if (!data.link_token) {
        throw new Error('No link token received from API')
      }
      
      console.log('Link token received successfully')
      setLinkToken(data.link_token)
      
    } catch (error) {
      console.error('Error getting link token:', error)
      alert(`Error connecting to Plaid: ${error.message}\n\nPlease check:\n1. Your API routes are working\n2. Your Plaid credentials are correct\n3. Your server is running`)
    } finally {
      setLoading(false)
    }
  }, [linkToken])

  // Handle Plaid Link success
  const handleOnSuccess = useCallback(async (public_token, metadata) => {
    try {
      setLoading(true)
      console.log('Plaid Link success! Institution:', metadata.institution.name)
      console.log('Exchanging public token for access token...')
      
      const response = await fetch('/api/plaid/exchange-public-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ public_token }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Exchange failed ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      console.log('Token exchange successful:', data)
      
      // Call the success callback
      if (onSuccess) {
        onSuccess(data)
      }
      
      // Show success message
      alert(`🎉 Success! Connected ${metadata.institution.name}\n\nAccounts: ${data.accounts || 0}\nTransactions: ${data.transactions || 0}\n\nRefreshing your dashboard...`)
      
      // Refresh the page to show new data
      setTimeout(() => {
        window.location.reload()
      }, 2000)
      
    } catch (error) {
      console.error('Error exchanging token:', error)
      alert(`Error connecting account: ${error.message}\n\nPlease try again or contact support.`)
    } finally {
      setLoading(false)
    }
  }, [onSuccess])

  // Handle Plaid Link exit/error
  const handleOnExit = useCallback((err, metadata) => {
    if (err != null) {
      console.error('Plaid Link error:', err)
      if (err.error_code !== 'USER_EXIT') {
        alert(`Connection error: ${err.display_message || err.error_message}`)
      }
    } else {
      console.log('User exited Plaid Link')
    }
    
    if (onExit) {
      onExit(err, metadata)
    }
  }, [onExit])

  // Open Plaid Link
  const openLink = useCallback(async () => {
    console.log('Attempting to open Plaid Link...')
    
    // Check if Plaid script is loaded
    if (!plaidLoaded || !window.Plaid) {
      alert('Plaid is still loading. Please wait a moment and try again.')
      return
    }

    // Get link token if we don't have one
    if (!linkToken) {
      console.log('No link token available, requesting one...')
      await getLinkToken()
      return
    }

    try {
      console.log('Creating Plaid Link handler...')
      const handler = window.Plaid.create({
        token: linkToken,
        onSuccess: handleOnSuccess,
        onExit: handleOnExit,
        onEvent: (eventName, metadata) => {
          console.log('Plaid Link event:', eventName, metadata)
        },
      })

      console.log('Opening Plaid Link...')
      handler.open()
      
    } catch (error) {
      console.error('Error creating Plaid handler:', error)
      alert(`Error opening bank connection: ${error.message}`)
    }
  }, [plaidLoaded, linkToken, handleOnSuccess, handleOnExit, getLinkToken])

  // Auto-get link token when component mounts and Plaid is ready
  useEffect(() => {
    if (plaidLoaded && !linkToken && !loading) {
      getLinkToken()
    }
  }, [plaidLoaded, linkToken, loading, getLinkToken])

  // Render loading state or children
  if (loading) {
    return (
      <button 
        disabled 
        style={{
          background: '#94a3b8',
          color: 'white',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '25px',
          fontWeight: '600',
          cursor: 'not-allowed',
          opacity: 0.7
        }}
      >
        {linkToken ? 'Connecting...' : 'Loading...'}
      </button>
    )
  }

  return (
    <div onClick={openLink} style={{ display: 'inline-block', cursor: 'pointer' }}>
      {children}
    </div>
  )
}

export default PlaidLink