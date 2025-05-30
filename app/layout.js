import './globals.css'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <style dangerouslySetInnerHTML={{__html: `
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
            margin: 0 !important;
            padding: 0 !important;
            min-height: 100vh !important;
          }
          
          .dashboard-container {
            max-width: 1400px !important;
            margin: 0 auto !important;
            padding: 20px !important;
          }
          
          .header {
            background: rgba(255, 255, 255, 0.95) !important;
            backdrop-filter: blur(10px) !important;
            border-radius: 20px !important;
            padding: 1rem 2rem !important;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1) !important;
            border: 1px solid rgba(255, 255, 255, 0.2) !important;
            margin-bottom: 2rem !important;
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
          }
          
          .header h1 {
            font-size: 2rem !important;
            font-weight: 700 !important;
            color: #1f2937 !important;
            margin: 0 !important;
          }
          
          .header span {
            color: #6b7280 !important;
            font-size: 0.875rem !important;
          }
          
          .metrics-grid {
            display: grid !important;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)) !important;
            gap: 20px !important;
            margin-bottom: 40px !important;
          }
          
          .metric-card {
            background: rgba(255, 255, 255, 0.95) !important;
            backdrop-filter: blur(10px) !important;
            border-radius: 20px !important;
            padding: 30px !important;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1) !important;
            border: 1px solid rgba(255, 255, 255, 0.2) !important;
            transition: all 0.3s ease !important;
            position: relative !important;
            overflow: hidden !important;
          }
          
          .metric-card::before {
            content: '' !important;
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            height: 4px !important;
            background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%) !important;
          }
          
          .metric-card:hover {
            transform: translateY(-5px) !important;
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15) !important;
          }
          
          .metric-header {
            display: flex !important;
            align-items: center !important;
            margin-bottom: 15px !important;
          }
          
          .metric-icon {
            width: 50px !important;
            height: 50px !important;
            border-radius: 12px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            margin-right: 15px !important;
            font-size: 24px !important;
          }
          
          .balance-icon { background: linear-gradient(135deg, #667eea, #764ba2) !important; }
          .income-icon { background: linear-gradient(135deg, #4facfe, #00f2fe) !important; }
          .expense-icon { background: linear-gradient(135deg, #fa709a, #fee140) !important; }
          .projection-icon { background: linear-gradient(135deg, #a8edea, #fed6e3) !important; }
          
          .metric-title {
            font-size: 1rem !important;
            font-weight: 600 !important;
            color: #666 !important;
            text-transform: uppercase !important;
            letter-spacing: 0.5px !important;
          }
          
          .metric-value {
            font-size: 2.5rem !important;
            font-weight: 700 !important;
            color: #333 !important;
            margin-bottom: 5px !important;
          }
          
          .text-green-600 { color: #10b981 !important; }
          .text-red-600 { color: #ef4444 !important; }
          
          .main-content {
            display: grid !important;
            grid-template-columns: 2fr 1fr !important;
            gap: 30px !important;
          }
          
          .card {
            background: rgba(255, 255, 255, 0.95) !important;
            backdrop-filter: blur(10px) !important;
            border-radius: 20px !important;
            padding: 30px !important;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1) !important;
            border: 1px solid rgba(255, 255, 255, 0.2) !important;
          }
          
          .card-header {
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            margin-bottom: 25px !important;
          }
          
          .card-title {
            font-size: 1.4rem !important;
            font-weight: 700 !important;
            color: #333 !important;
            margin: 0 !important;
          }
          
          .btn-primary {
            background: linear-gradient(135deg, #4facfe, #00f2fe) !important;
            color: white !important;
            border: none !important;
            padding: 12px 24px !important;
            border-radius: 25px !important;
            font-weight: 600 !important;
            cursor: pointer !important;
            transition: all 0.3s ease !important;
          }
          
          .btn-primary:hover {
            transform: translateY(-2px) !important;
            box-shadow: 0 5px 15px rgba(79, 172, 254, 0.4) !important;
          }
          
          .transaction-list {
            display: flex !important;
            flex-direction: column !important;
            gap: 1rem !important;
          }
          
          .transaction-item {
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            padding: 15px 20px !important;
            background: rgba(255, 255, 255, 0.7) !important;
            border-radius: 12px !important;
            border-left: 4px solid #4facfe !important;
            transition: all 0.2s ease !important;
          }
          
          .transaction-item:hover {
            background: rgba(255, 255, 255, 0.9) !important;
            transform: translateX(5px) !important;
          }
          
          .transaction-item.expense {
            border-left-color: #ef4444 !important;
          }
          
          .transaction-item.income {
            border-left-color: #10b981 !important;
          }
          
          .transaction-info h4 {
            font-weight: 600 !important;
            color: #333 !important;
            margin: 0 0 4px 0 !important;
          }
          
          .transaction-info p {
            font-size: 0.9rem !important;
            color: #666 !important;
            margin: 0 !important;
          }
          
          .transaction-amount {
            font-size: 1.2rem !important;
            font-weight: 700 !important;
          }
          
          .sidebar {
            display: flex !important;
            flex-direction: column !important;
            gap: 1.5rem !important;
          }
          
          .no-data {
            text-align: center !important;
            padding: 3rem !important;
          }
          
          .no-data-icon {
            font-size: 4rem !important;
            margin-bottom: 1rem !important;
            display: block !important;
          }
          
          .no-data-title {
            font-size: 1.125rem !important;
            font-weight: 600 !important;
            color: #1e293b !important;
            margin-bottom: 0.5rem !important;
          }
          
          .no-data-text {
            color: #64748b !important;
            margin-bottom: 1.5rem !important;
          }
          
          @media (max-width: 768px) {
            .main-content {
              grid-template-columns: 1fr !important;
            }
            
            .metrics-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}} />
      </head>
      <body>
        <div className="dashboard-container">
          <div className="header">
            <h1>💰 Finance Dashboard</h1>
            <span>Powered by Plaid</span>
          </div>
          <main>{children}</main>
        </div>
      </body>
    </html>
  )
}