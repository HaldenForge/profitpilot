import { useMemo, useState } from 'react'
import './App.css'
import PricingCalculator from './PricingCalculator'
import ProductManager from './ProductManager'
import AnalyticsDashboard from './AnalyticsDashboard'
import VATCalculator from './VATCalculator'

const platforms = ['Amazon FBA', 'Amazon FBM', 'eBay', 'Etsy', 'Shopify']

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
  const [platform, setPlatform] = useState('Amazon FBA')
  const [currency, setCurrency] = useState('GBP')
  const [values, setValues] = useState<Values>(initialValues)

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
    { key: 'quantity', label: 'Quantity sold', hint: 'Number of items', },
  ]

  return (
    <main className="app">
      <header className="topbar">
        <a className="brand" href="#">
          <span className="brand-icon">P</span>
          <span>Profit<span className="brand-light">Pilot</span></span>
        </a>
        <div className="top-right">
          <span className="live-dot" /> Profit calculator
          <select aria-label="Currency" value={currency}
            onChange={e => setCurrency(e.target.value)}>
            <option value="GBP">GBP £</option>
            <option value="USD">USD $</option>
            <option value="EUR">EUR €</option>
          </select>
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
        <section className="calculator card">
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

      <PricingCalculator currency={currency} />

      <ProductManager currency={currency} />

      <AnalyticsDashboard currency={currency} />

      <VATCalculator currency={currency} />

      <footer>
        <span className="footer-brand">ProfitPilot</span>
        <span>Simple tools for smarter selling.</span>
        <span>© 2026 ProfitPilot</span>
      </footer>
    </main>
  )
}

export default App
