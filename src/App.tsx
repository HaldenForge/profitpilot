import { useEffect, useMemo, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import './App.css'
import { supabase } from './lib/supabase'
import Auth from './Auth'
import LandingPage from './LandingPage'
import LegalPage from './LegalPage'
import PricingCalculator from './PricingCalculator'
import ProductManager from './ProductManager'
import AnalyticsDashboard from './AnalyticsDashboard'
import VATCalculator from './VATCalculator'
import { ProductsProvider } from './ProductsContext'
import { SalesProvider } from './SalesContext'
import SalesManager from './SalesManager'
import InventoryManager from './InventoryManager'
import InventoryNotifications from './InventoryNotifications'
import ProductResearch from './ProductResearch'
import KeywordResearch from './KeywordResearch'
import ProductHunter from './ProductHunter'
import BusinessInsights from './BusinessInsights'
import InsightPanel from './InsightPanel'
import type { ExchangeRates } from './lib/currency'
const platforms = ['Amazon FBA', 'Amazon FBM', 'eBay', 'Etsy', 'Shopify']
const getDefaultCurrency = () => {
  const savedCurrency = localStorage.getItem('profitpilot-currency')

  if (['GBP', 'USD', 'EUR'].includes(savedCurrency || '')) {
    return savedCurrency!
  }

  const region = navigator.language.split('-')[1]?.toUpperCase()

  if (region === 'US') return 'USD'

  const euroCountries = [
    'AT', 'BE', 'CY', 'DE', 'EE', 'ES', 'FI', 'FR',
    'GR', 'HR', 'IE', 'IT', 'LT', 'LU', 'LV', 'MT',
    'NL', 'PT', 'SI', 'SK',
  ]

  if (region && euroCountries.includes(region)) return 'EUR'

  return 'GBP'
}
const initialValues = {
  price: '35',
  product: '12',
  shipping: '3',
  fulfilment: '0',
  marketplaceFee: '10',
  paymentFee: '2',
  fixedFee: '0.30',
  advertising: '1',
  other: '0',
  quantity: '1',
}

type Values = typeof initialValues

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [publicView, setPublicView] = useState<'home' | 'login' | 'signup' | 'privacy' | 'terms'>('home')

  const [platform, setPlatform] = useState('Amazon FBA')
  const [currency, setCurrency] = useState(getDefaultCurrency)
  const [values, setValues] = useState<Values>(initialValues)

  const [exchangeRates, setExchangeRates] = useState<ExchangeRates | null>(null)
  const [rateError, setRateError] = useState('')

  useEffect(() => {
    let mounted = true

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (mounted) {
        setSession(currentSession)
        setCheckingAuth(false)
      }
    })

    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return

      if (error) {
        console.error('Unable to check login session:', error)
      }

      setSession(data.session)
      setCheckingAuth(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('profitpilot-currency', currency)
  }, [currency])

  useEffect(() => {
    if (!session) return

    let active = true

    const loadExchangeRates = async () => {
      const { data, error } = await supabase.functions.invoke(
        'currency-rates',
        {
          body: { base: 'EUR' },
        }
      )

      if (!active) return

      if (error || !data?.success) {
        setRateError(
          error?.message || data?.error || 'Unable to load exchange rates.'
        )
        return
      }

      setExchangeRates(data as ExchangeRates)
      setRateError('')
    }

    void loadExchangeRates()

    return () => {
      active = false
    }
  }, [session?.user.id])

  const update = (key: keyof Values, value: string) => {
    setValues(current => ({ ...current, [key]: value }))
  }

  const number = (key: keyof Values) =>
    Math.max(0, Number(values[key]) || 0)

  const result = useMemo(() => {
    const quantity = Math.max(1, number('quantity'))
    const revenue = number('price') * quantity
    const productCost = number('product') * quantity
    const shipping = number('shipping') * quantity
    const fulfilment = number('fulfilment') * quantity
    const marketplace = revenue * number('marketplaceFee') / 100
    const payment = revenue * number('paymentFee') / 100
    const fixed = number('fixedFee') * quantity
    const advertising = number('advertising') * quantity
    const other = number('other') * quantity

    const totalCosts = productCost + shipping + fulfilment +
      marketplace + payment + fixed + advertising + other

    const profit = revenue - totalCosts

    return {
      revenue,
      totalCosts,
      profit,
      margin: revenue > 0 ? profit / revenue * 100 : 0,
      roi: productCost > 0 ? profit / productCost * 100 : 0,
      marketplace,
      payment,
    }
  }, [values])

  const money = (amount: number) =>
    new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(amount)

  const fields: {
    key: keyof Values
    label: string
    hint: string
    suffix?: string
  }[] = [
    { key: 'price', label: 'Selling price', hint: 'Price charged to customer' },
    { key: 'product', label: 'Product cost', hint: 'Cost to purchase or manufacture' },
    { key: 'shipping', label: 'Shipping cost', hint: 'Cost to deliver the order' },
    { key: 'fulfilment', label: 'Fulfilment fee', hint: 'Warehouse or order fulfilment cost' },
    { key: 'marketplaceFee', label: 'Marketplace fee', hint: 'Your estimated selling fee', suffix: '%' },
    { key: 'paymentFee', label: 'Payment processing fee', hint: 'Payment provider percentage', suffix: '%' },
    { key: 'fixedFee', label: 'Fixed transaction fee', hint: 'Fixed fee per order' },
    { key: 'advertising', label: 'Advertising cost', hint: 'Advertising spend per item' },
    { key: 'other', label: 'Other costs', hint: 'Packaging and additional expenses' },
    { key: 'quantity', label: 'Quantity sold', hint: 'Number of items' },
  ]

  if (checkingAuth) {
    return (
      <main className="auth-page">
        <section className="auth-card">
          <div className="auth-brand">
            <span className="brand-icon">P</span>
            <span>Profit<span className="brand-light">Pilot</span></span>
          </div>
          <p>Checking your account...</p>
        </section>
      </main>
    )
  }

  if (!session) {
    if (publicView === 'privacy' || publicView === 'terms') {
      return (
        <LegalPage
          page={publicView}
          onBack={() => setPublicView('home')}
        />
      )
    }

    if (publicView === 'home') {
      return (
        <LandingPage
          onLogin={() => setPublicView('login')}
          onSignup={() => setPublicView('signup')}
          onPrivacy={() => setPublicView('privacy')}
          onTerms={() => setPublicView('terms')}
        />
      )
    }

    return (
      <Auth
        key={publicView}
        initialMode={publicView}
        onBack={() => setPublicView('home')}
      />
    )
  }

    return (
    <ProductsProvider key={session.user.id} userId={session.user.id}>
      <SalesProvider key={session.user.id} userId={session.user.id}>
        <main className="app">
      <header className="topbar">
        <a className="brand" href="#">
          <span className="brand-icon">P</span>
          <span>Profit<span className="brand-light">Pilot</span></span>
        </a>
        <div className="top-right" id="account-settings">
          <span className="live-dot" /> Profit calculator
          <select aria-label="Currency" value={currency}
            onChange={e => setCurrency(e.target.value)}>
            <option value="GBP">GBP £</option>
            <option value="USD">USD $</option>
            <option value="EUR">EUR €</option>
          </select>
          {exchangeRates && (
            <span className="currency-rate-status">
              Rates updated: {exchangeRates.updatedAt}
            </span>
          )}
          {rateError && (
            <span className="currency-rate-status">
              Exchange rates unavailable
            </span>
          )}
          <span className="auth-user">{session.user.email}</span>
          <button
            className="auth-logout"
            onClick={() => { void supabase.auth.signOut() }}
          >
            Sign out
          </button>
        </div>
      </header>

      <section className="welcome">
        <div>
          <span className="eyebrow">SELL SMARTER. EARN MORE.</span>
          <h1>Know your profit.<br /><span>Grow your business.</span></h1>
          <p>Calculate your real selling profit, marketplace fees and margins in seconds.</p>
        </div>
        <div className="welcome-icon">↗</div>
      </section>

<div className="app-workspace">
  <aside className="app-sidebar" aria-label="Main navigation">
    <div className="sidebar-brand-mark">P</div>
    <span className="sidebar-label">WORKSPACE</span>
    <nav className="dashboard-nav">
      <a href="#business-insights-section"><span>▦</span> Overview</a>
      <a href="#profit-calculator"><span>⌁</span> Profit Calculator</a>
      <a href="#pricing-section"><span>◇</span> Smart Pricing</a>
      <a href="#products-section"><span>▣</span> Products</a>
      <a href="#inventory-section"><span>▤</span> Inventory</a>
      <a href="#sales-section"><span>🛒</span> Orders & Sales</a>
      <a href="#analytics-section"><span>▥</span> Analytics</a>
      <a href="#product-hunter-section"><span>⌕</span> Product Hunter</a>
      <a href="#research-section"><span>◎</span> Product Research</a>
      <a href="#keyword-research-section"><span>⌗</span> Keyword Research</a>
      <a href="#vat-section"><span>▧</span> VAT Calculator</a>
      <a href="#account-settings"><span>⚙</span> Settings</a>
    </nav>
    <div className="sidebar-help"><strong>Need help?</strong><span>Explore your tools and insights.</span></div>
  </aside>
  <div className="app-main-content">
<InventoryNotifications />

      <div id="business-insights-section">
        <BusinessInsights currency={currency} userId={session.user.id} />
      </div>

      <section className="platform-section">
        <div className="section-heading">
          <div>
            <h2>Choose your marketplace</h2>
            <p>Select where you sell your products.</p>
          </div>
          <span className="step-label">STEP 01</span>
        </div>
        <div className="platforms">
          {platforms.map(item => (
            <button key={item}
              className={`platform ${platform === item ? 'selected' : ''}`}
              onClick={() => setPlatform(item)}>
              <span className="platform-symbol">
                {item === 'Amazon FBA' ? 'A' :
                 item === 'Amazon FBM' ? 'A' :
                 item === 'eBay' ? 'e' :
                 item === 'Etsy' ? 'E' : 'S'}
              </span>
              <span>{item}</span>
              {platform === item && <span className="check">✓</span>}
            </button>
          ))}
        </div>
      </section>

      <div className="workspace">
        <section id="profit-calculator" className="calculator card">
          <div className="section-heading">
            <div>
              <span className="step-label">STEP 02</span>
              <h2>Product costs and fees</h2>
              <p>Enter your figures below. You can change all fee rates.</p>
            </div>
            <button className="reset" onClick={() => setValues(initialValues)}>
              ↺ Reset
            </button>
          </div>

          <div className="fields">
            {fields.map(field => (
              <label className="field" key={field.key}>
                <span className="field-label">{field.label}</span>
                <span className="field-hint">{field.hint}</span>
                <span className="input-wrap">
                  {field.suffix !== '%' && <span className="input-prefix">
                    {field.key === 'quantity' ? '#' :
                      new Intl.NumberFormat(undefined, {
                        style: 'currency', currency,
                      }).formatToParts(0).find(p => p.type === 'currency')?.value}
                  </span>}
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={values[field.key]}
                    onChange={e => update(field.key, e.target.value)}
                  />
                  {field.suffix && <span className="input-suffix">{field.suffix}</span>}
                </span>
              </label>
            ))}
          </div>
          <p className="disclaimer">Marketplace and payment fee rates are estimates entered by you. Check your actual seller account fees before making pricing decisions.</p>
        </section>

        <aside className="results">
          <div className="result-card profit-card">
            <span className="result-kicker">YOUR NET PROFIT</span>
            <div className={`profit-amount ${result.profit < 0 ? 'negative' : ''}`}>
              {money(result.profit)}
            </div>
            <span className="result-note">After all entered costs and fees</span>
            <div className="result-divider" />
            <div className="mini-results">
              <div>
                <span>Profit margin</span>
                <strong>{result.margin.toFixed(2)}%</strong>
              </div>
              <div>
                <span>Return on investment</span>
                <strong>{result.roi.toFixed(2)}%</strong>
              </div>
            </div>
          </div>

          <InsightPanel area="Profit Calculator" level={result.profit < 0 ? 'warning' : result.margin < 10 ? 'opportunity' : 'positive'} title={result.profit < 0 ? 'This calculation currently shows a loss' : result.margin < 10 ? 'Your estimated margin is relatively tight' : 'Your entered figures show a positive margin'} explanation={`Estimated profit is ${money(result.profit)} (${result.margin.toFixed(2)}% margin) after the costs and fees entered.`} action={result.profit < 0 ? 'Review selling price, product cost, shipping, advertising and marketplace fees before listing.' : result.margin < 10 ? 'Test a higher selling price or negotiate costs, while checking competitor prices.' : 'Check actual marketplace fees and include any missing costs before relying on this estimate.'} evidence="This is a calculator result based only on the values entered here." />
          <div className="result-card breakdown">
            <h3>Cost breakdown</h3>
            <div className="break-row">
              <span>Total revenue</span><strong>{money(result.revenue)}</strong>
            </div>
            <div className="break-row">
              <span>Product cost</span><strong>{money(number('product') * number('quantity'))}</strong>
            </div>
            <div className="break-row">
              <span>Shipping and fulfilment</span>
              <strong>{money((number('shipping') + number('fulfilment')) * number('quantity'))}</strong>
            </div>
            <div className="break-row">
              <span>Marketplace fees</span><strong>{money(result.marketplace)}</strong>
            </div>
            <div className="break-row">
              <span>Payment fees</span><strong>{money(result.payment + number('fixedFee') * number('quantity'))}</strong>
            </div>
            <div className="break-row">
              <span>Advertising and other</span>
              <strong>{money((number('advertising') + number('other')) * number('quantity'))}</strong>
            </div>
            <div className="break-row total">
              <span>Total costs</span><strong>{money(result.totalCosts)}</strong>
            </div>
          </div>

          <button className="export-button" onClick={() => {
            const report = [
              'ProfitPilot Profit Report',
              `Marketplace: ${platform}`,
              `Currency: ${currency}`,
              `Revenue: ${money(result.revenue)}`,
              `Total costs: ${money(result.totalCosts)}`,
              `Net profit: ${money(result.profit)}`,
              `Profit margin: ${result.margin.toFixed(2)}%`,
              `ROI: ${result.roi.toFixed(2)}%`,
            ].join('\n')
            const blob = new Blob([report], { type: 'text/plain' })
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = 'profitpilot-report.txt'
            link.click()
            URL.revokeObjectURL(url)
          }}>
            ↓ Download profit report
          </button>
        </aside>
      </div>

      <div id="pricing-section">
  <PricingCalculator currency={currency} />
</div>

      <div id="products-section">
  <ProductManager currency={currency} />
</div>
      <div id="inventory-section">
  <InventoryManager currency={currency} />
</div>
      <div id="analytics-section">
  <AnalyticsDashboard currency={currency} />
</div>
      <div id="sales-section">
  <SalesManager currency={currency} />
</div>

      <div id="vat-section">
  <VATCalculator currency={currency} />
</div>
      <div id="product-hunter-section">
  <ProductHunter currency={currency} exchangeRates={exchangeRates} />
</div><div id="research-section">
        <ProductResearch currency={currency} />
      </div>
            <div id="keyword-research-section">
        <KeywordResearch />
      </div>
      <footer>
        <span className="footer-brand">ProfitPilot</span>
        <span>Simple tools for smarter selling.</span>
        <span>© 2026 ProfitPilot</span>
      </footer>
  </div>
</div>
            </main>
      </SalesProvider>
    </ProductsProvider>
  )
}

export default App
