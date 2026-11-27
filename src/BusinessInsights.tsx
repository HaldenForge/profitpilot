import { useEffect, useMemo, useState } from 'react'
import { useProducts } from './ProductsContext'
import { useSales } from './SalesContext'
import { supabase } from './lib/supabase'
import { buildBusinessInsights, type BusinessInsight, type KeywordInsightInput, type ResearchProductInsightInput } from './lib/businessInsights'
import './BusinessInsights.css'

type ResearchRow = ResearchProductInsightInput & {
  demand_score?: number | null
  competition_score?: number | null
  opportunity_score?: number | null
}

function InsightCard({ insight }: { insight: BusinessInsight }) {
  return (
    <article className={`bi-insight-card bi-${insight.level}`}>
      <div className="bi-insight-meta"><span>{insight.area}</span><span>{insight.level}</span></div>
      <h3>{insight.title}</h3>
      <p>{insight.explanation}</p>
      <div className="bi-action"><strong>Recommended action</strong><span>{insight.action}</span></div>
      <small>{insight.evidence}</small>
    </article>
  )
}

function makeDonut(values: number[], colors: string[]) {
  const total = values.reduce((sum, value) => sum + value, 0)
  if (!total) return 'conic-gradient(#273244 0deg 360deg)'
  let cursor = 0
  const parts = values.map((value, index) => {
    const start = cursor
    cursor += value / total * 360
    return `${colors[index]} ${start}deg ${cursor}deg`
  })
  return `conic-gradient(${parts.join(', ')})`
}

function trendPath(values: number[], width: number, height: number) {
  if (!values.length) return ''
  const max = Math.max(1, ...values)
  const min = Math.min(0, ...values)
  const range = Math.max(1, max - min)
  return values.map((value, index) => {
    const x = values.length === 1 ? width / 2 : index / (values.length - 1) * width
    const y = height - ((value - min) / range) * height
    return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`
  }).join(' ')
}

export default function BusinessInsights({ currency, userId }: { currency: string; userId: string }) {
  const { products, loading: productsLoading, error: productsError } = useProducts()
  const { sales, loading: salesLoading, error: salesError } = useSales()
  const [researchProducts, setResearchProducts] = useState<ResearchRow[]>([])
  const [keywords, setKeywords] = useState<KeywordInsightInput[]>([])
  const [researchLoading, setResearchLoading] = useState(true)
  const [researchError, setResearchError] = useState('')

  useEffect(() => {
    let active = true
    async function loadResearch() {
      setResearchLoading(true)
      setResearchError('')
      setResearchProducts([])
      setKeywords([])
      const [productResult, keywordResult] = await Promise.all([
        supabase.from('product_research')
          .select('product_name, marketplace, estimated_profit, estimated_profit_margin, data_status, demand_score, competition_score, opportunity_score')
          .eq('user_id', userId),
        supabase.from('keyword_research')
          .select('keyword, marketplace, search_volume, competition_level, competition_score, trend_direction, data_status')
          .eq('user_id', userId),
      ])
      if (!active) return
      if (productResult.error || keywordResult.error) {
        setResearchError(productResult.error?.message || keywordResult.error?.message || 'Research data could not be loaded.')
      } else {
        setResearchProducts((productResult.data ?? []) as ResearchRow[])
        setKeywords((keywordResult.data ?? []) as KeywordInsightInput[])
      }
      setResearchLoading(false)
    }
    void loadResearch()
    return () => { active = false }
  }, [userId])

  const insights = useMemo(() => buildBusinessInsights({
    products, sales, researchProducts, keywords, currency,
  }), [products, sales, researchProducts, keywords, currency])

  const activeSales = sales.filter(s => s.orderStatus !== 'Cancelled')
  const salesMetrics = useMemo(() => {
    const revenue = activeSales.reduce((sum, sale) => sum + sale.sellingPrice * sale.quantity, 0)
    const profit = activeSales.reduce((sum, sale) => {
      const itemRevenue = sale.sellingPrice * sale.quantity
      const itemCosts = (sale.productCost + sale.shippingCost) * sale.quantity + itemRevenue * sale.feePercent / 100
      return sum + itemRevenue - itemCosts
    }, 0)
    return { revenue, profit, margin: revenue > 0 ? profit / revenue * 100 : 0 }
  }, [activeSales])

  const trend = useMemo(() => {
    const now = new Date()
    const months = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1)
      return { key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`, label: date.toLocaleDateString(undefined, { month: 'short' }), revenue: 0 }
    })
    const byMonth = new Map(months.map(month => [month.key, month]))
    activeSales.forEach(sale => {
      const date = new Date(sale.orderDate)
      if (Number.isNaN(date.getTime())) return
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const month = byMonth.get(key)
      if (month) month.revenue += sale.sellingPrice * sale.quantity
    })
    return months
  }, [activeSales])

  const channels = useMemo(() => {
    const totals = new Map<string, number>()
    activeSales.forEach(sale => totals.set(sale.marketplace, (totals.get(sale.marketplace) ?? 0) + sale.sellingPrice * sale.quantity))
    return Array.from(totals, ([name, revenue]) => ({ name, revenue })).sort((a, b) => b.revenue - a.revenue)
  }, [activeSales])

  const stock = useMemo(() => ({
    out: products.filter(product => product.stockQuantity <= 0).length,
    low: products.filter(product => product.stockQuantity > 0 && product.stockQuantity <= product.lowStockThreshold).length,
    healthy: products.filter(product => product.stockQuantity > product.lowStockThreshold).length,
  }), [products])

  const researchQuality = useMemo(() => ({
    verified: researchProducts.filter(item => item.data_status === 'verified').length + keywords.filter(item => item.data_status === 'verified').length,
    estimated: researchProducts.filter(item => item.data_status === 'estimated').length + keywords.filter(item => item.data_status === 'estimated').length,
    entered: researchProducts.filter(item => item.data_status === 'user_entered').length + keywords.filter(item => item.data_status === 'user_entered').length,
    unavailable: researchProducts.filter(item => item.data_status === 'unavailable').length + keywords.filter(item => item.data_status === 'unavailable').length,
  }), [researchProducts, keywords])

  const money = (value: number) => {
    try {
      return new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 0 }).format(value)
    } catch {
      return value.toFixed(0)
    }
  }

  const loading = productsLoading || salesLoading || researchLoading
  const errors = [productsError, salesError, researchError].filter(Boolean)
  const hasAnyData = products.length > 0 || sales.length > 0 || researchProducts.length > 0 || keywords.length > 0
  const trendValues = trend.map(item => item.revenue)
  const maxChannel = Math.max(1, ...channels.map(item => item.revenue))
  const stockTotal = stock.out + stock.low + stock.healthy
  const qualityValues = [researchQuality.verified, researchQuality.estimated, researchQuality.entered, researchQuality.unavailable]

  return (
    <section className="business-intelligence">
      <div className="bi-heading">
        <div>
          <span className="bi-eyebrow">PROFITPILOT · BUSINESS INTELLIGENCE</span>
          <h2>Business Intelligence Dashboard</h2>
          <p>Your business performance, research signals and recommended next steps in one place.</p>
        </div>
        <span className="bi-beta">RULE-BASED BETA</span>
      </div>

      {errors.length > 0 && <div className="bi-error" role="alert">Some account data could not be loaded: {errors.join(' · ')}</div>}
      {loading ? <div className="bi-loading">Loading your saved business data and preparing your dashboard…</div> : (
        <>
          <div className="bi-kpis">
            <article><span>Products tracked</span><strong>{products.length}</strong><small>Saved in your account</small></article>
            <article><span>Active orders</span><strong>{activeSales.length}</strong><small>Cancelled orders excluded</small></article>
            <article><span>Order revenue</span><strong>{activeSales.length ? money(salesMetrics.revenue) : '—'}</strong><small>{activeSales.length ? 'Recorded order value' : 'No saved orders yet'}</small></article>
            <article><span>Estimated order profit</span><strong className={salesMetrics.profit < 0 ? 'bi-negative' : ''}>{activeSales.length ? money(salesMetrics.profit) : '—'}</strong><small>{activeSales.length ? `${salesMetrics.margin.toFixed(1)}% estimated margin` : 'Add orders to calculate'}</small></article>
          </div>

          {!hasAnyData && (
            <div className="bi-empty">
              <strong>Your dashboard is ready for your business data.</strong>
              <p>Add products, record customer orders, and save product or keyword research. Your dashboard and recommendations will be rebuilt from those saved records whenever you sign in.</p>
            </div>
          )}

          <div className="bi-main-grid">
            <article className="bi-panel bi-trend-panel">
              <div className="bi-panel-heading"><div><span>SALES PERFORMANCE</span><h3>Revenue trend</h3></div><small>Last 6 months</small></div>
              {activeSales.length ? (
                <>
                  <div className="bi-chart-total">{money(salesMetrics.revenue)} <small>total recorded revenue</small></div>
                  <svg className="bi-line-chart" viewBox="0 0 640 190" role="img" aria-label="Recorded monthly order revenue trend">
                    {[35, 85, 135, 185].map(y => <line key={y} x1="0" x2="640" y1={y} y2={y} className="bi-gridline" />)}
                    <path d={trendPath(trendValues, 620, 150)} transform="translate(10 15)" className="bi-trend-area" />
                    <path d={trendPath(trendValues, 620, 150)} transform="translate(10 15)" className="bi-trend-line" />
                  </svg>
                  <div className="bi-month-labels">{trend.map(item => <span key={item.key}>{item.label}</span>)}</div>
                </>
              ) : <div className="bi-chart-empty">Your monthly revenue chart will appear when you record customer orders.</div>}
            </article>

            <article className="bi-panel bi-margin-panel">
              <div className="bi-panel-heading"><div><span>PROFITABILITY</span><h3>Order contribution</h3></div></div>
              <div className="bi-ring-wrap">
                <div className="bi-ring" style={{ background: `conic-gradient(${salesMetrics.profit >= 0 ? '#d5ad58' : '#d96b60'} 0deg ${Math.max(0, Math.min(100, salesMetrics.margin)) * 3.6}deg, #28313d 0deg)` }}>
                  <div><strong>{activeSales.length ? `${salesMetrics.margin.toFixed(1)}%` : '—'}</strong><span>margin</span></div>
                </div>
              </div>
              <div className="bi-ring-legend"><span><i className="bi-dot bi-gold" /> Estimated order profit</span><strong>{activeSales.length ? money(salesMetrics.profit) : 'No order data'}</strong></div>
              <p className="bi-note">Calculated from recorded selling prices, product costs, shipping and marketplace fees.</p>
            </article>

            <article className="bi-panel">
              <div className="bi-panel-heading"><div><span>SALES CHANNELS</span><h3>Revenue by marketplace</h3></div></div>
              {channels.length ? <div className="bi-channel-list">{channels.slice(0, 6).map(channel => (
                <div className="bi-channel" key={channel.name}>
                  <div><strong>{channel.name}</strong><span>{money(channel.revenue)}</span></div>
                  <div className="bi-channel-track"><i style={{ width: `${channel.revenue / maxChannel * 100}%` }} /></div>
                </div>
              ))}</div> : <div className="bi-chart-empty">Marketplace comparisons will appear after you record orders.</div>}
            </article>

            <article className="bi-panel">
              <div className="bi-panel-heading"><div><span>INVENTORY HEALTH</span><h3>Stock overview</h3></div></div>
              {stockTotal ? (
                <div className="bi-stock-layout">
                  <div className="bi-stock-donut" style={{ background: makeDonut([stock.healthy, stock.low, stock.out], ['#d5ad58', '#e69b50', '#d96b60']) }}><div><strong>{stockTotal}</strong><span>products</span></div></div>
                  <div className="bi-legend">
                    <span><i style={{ background: '#d5ad58' }} />Healthy <b>{stock.healthy}</b></span>
                    <span><i style={{ background: '#e69b50' }} />Low stock <b>{stock.low}</b></span>
                    <span><i style={{ background: '#d96b60' }} />Out of stock <b>{stock.out}</b></span>
                  </div>
                </div>
              ) : <div className="bi-chart-empty">Add products and stock levels to see inventory health.</div>}
            </article>

            <article className="bi-panel">
              <div className="bi-panel-heading"><div><span>RESEARCH QUALITY</span><h3>Source status</h3></div></div>
              {qualityValues.some(value => value > 0) ? (
                <div className="bi-stock-layout">
                  <div className="bi-stock-donut" style={{ background: makeDonut(qualityValues, ['#d5ad58', '#70a9cf', '#9b8ac8', '#596575']) }}><div><strong>{qualityValues.reduce((sum, value) => sum + value, 0)}</strong><span>records</span></div></div>
                  <div className="bi-legend">
                    <span><i style={{ background: '#d5ad58' }} />Verified <b>{researchQuality.verified}</b></span>
                    <span><i style={{ background: '#70a9cf' }} />Estimated <b>{researchQuality.estimated}</b></span>
                    <span><i style={{ background: '#9b8ac8' }} />Entered by you <b>{researchQuality.entered}</b></span>
                    <span><i style={{ background: '#596575' }} />Unavailable <b>{researchQuality.unavailable}</b></span>
                  </div>
                </div>
              ) : <div className="bi-chart-empty">Save product or keyword research to compare its data quality.</div>}
            </article>

            <article className="bi-panel bi-research-panel">
              <div className="bi-panel-heading"><div><span>RESEARCH ACTIVITY</span><h3>Saved opportunities</h3></div></div>
              <div className="bi-research-stats"><div><strong>{researchProducts.length}</strong><span>Products researched</span></div><div><strong>{keywords.length}</strong><span>Keywords saved</span></div></div>
              <p className="bi-note">Opportunity and trend recommendations use the metrics saved in your research tools. Missing marketplace data is not estimated by this dashboard.</p>
            </article>
          </div>

          <section className="bi-recommendations">
            <div className="bi-recommendations-heading"><div><span>TAKE ACTION</span><h3>Business recommendations</h3></div><small>{insights.length} insight{insights.length === 1 ? '' : 's'}</small></div>
            <div className="bi-insights-grid">{insights.map(insight => <InsightCard key={insight.id} insight={insight} />)}</div>
          </section>
        </>
      )}

      <p className="bi-disclaimer">This is a rule-based beta, not an AI prediction engine. Revenue and profit charts use recorded orders, not product listing prices. Inventory and research charts use saved account records. ROAS, customer retention and cohort analytics are not shown because advertising attribution and customer-level event data are not currently connected. Insights are recalculated from your saved Supabase records when you sign in.</p>
    </section>
  )
}
