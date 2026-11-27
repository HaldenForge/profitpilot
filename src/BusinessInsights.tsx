import { useEffect, useMemo, useState } from 'react'
import { useProducts } from './ProductsContext'
import { useSales } from './SalesContext'
import { supabase } from './lib/supabase'
import { buildBusinessInsights, type BusinessInsight, type KeywordInsightInput, type ResearchProductInsightInput } from './lib/businessInsights'
import './BusinessInsights.css'

function InsightCard({ insight }: { insight: BusinessInsight }) {
  return (
    <article className={`business-insight-card insight-${insight.level}`}>
      <div className="business-insight-topline">
        <span className="business-insight-area">{insight.area}</span>
        <span className="business-insight-level">{insight.level}</span>
      </div>
      <h3>{insight.title}</h3>
      <p>{insight.explanation}</p>
      <div className="business-insight-action"><strong>Recommended action</strong><span>{insight.action}</span></div>
      <small>{insight.evidence}</small>
    </article>
  )
}

export default function BusinessInsights({ currency }: { currency: string }) {
  const { products, loading: productsLoading, error: productsError } = useProducts()
  const { sales, loading: salesLoading, error: salesError } = useSales()
  const [researchProducts, setResearchProducts] = useState<ResearchProductInsightInput[]>([])
  const [keywords, setKeywords] = useState<KeywordInsightInput[]>([])
  const [researchLoading, setResearchLoading] = useState(true)
  const [researchError, setResearchError] = useState('')

  useEffect(() => {
    let active = true
    async function loadResearch() {
      setResearchLoading(true)
      setResearchError('')
      const [productResult, keywordResult] = await Promise.all([
        supabase.from('product_research').select('product_name, marketplace, estimated_profit, estimated_profit_margin, data_status'),
        supabase.from('keyword_research').select('keyword, marketplace, search_volume, competition_level, competition_score, trend_direction, data_status'),
      ])
      if (!active) return
      if (productResult.error || keywordResult.error) {
        setResearchError(productResult.error?.message || keywordResult.error?.message || 'Research data could not be loaded.')
      } else {
        setResearchProducts((productResult.data ?? []) as ResearchProductInsightInput[])
        setKeywords((keywordResult.data ?? []) as KeywordInsightInput[])
      }
      setResearchLoading(false)
    }
    void loadResearch()
    return () => { active = false }
  }, [])

  const insights = useMemo(() => buildBusinessInsights({
    products, sales, researchProducts, keywords, currency,
  }), [products, sales, researchProducts, keywords, currency])

  const loading = productsLoading || salesLoading || researchLoading
  const errors = [productsError, salesError, researchError].filter(Boolean)

  return (
    <section className="business-insights">
      <div className="business-insights-heading">
        <div>
          <span className="step-label">YOUR BUSINESS INTELLIGENCE</span>
          <h2>Business Insights Centre</h2>
          <p>Practical recommendations generated from your saved ProfitPilot data.</p>
        </div>
        <span className="business-insights-status">RULE-BASED BETA</span>
      </div>
      <div className="business-insights-summary">
        <div><strong>{products.length}</strong><span>Saved products</span></div>
        <div><strong>{sales.filter(s => s.orderStatus !== 'Cancelled').length}</strong><span>Active orders</span></div>
        <div><strong>{researchProducts.length}</strong><span>Product research</span></div>
        <div><strong>{keywords.length}</strong><span>Saved keywords</span></div>
      </div>
      {errors.length > 0 && <p className="business-insights-error" role="alert">Some information could not be loaded: {errors.join(' · ')}</p>}
      {loading ? <p className="business-insights-loading">Analysing your business data…</p> : (
        <div className="business-insights-grid">
          {insights.map(insight => <InsightCard key={insight.id} insight={insight} />)}
        </div>
      )}
      <p className="business-insights-disclaimer">
        These are rule-based recommendations, not generated AI predictions. Product margins use saved cost and fee assumptions. Order profit is estimated from recorded order values; cancelled orders are excluded. Customer-entered research is not independently verified. Missing marketplace metrics are never guessed.
      </p>
    </section>
  )
}
