import type { Product } from '../ProductsContext'
import type { Sale } from '../SalesContext'

export type InsightLevel = 'positive' | 'warning' | 'opportunity' | 'info'

export type BusinessInsight = {
  id: string
  level: InsightLevel
  title: string
  explanation: string
  action: string
  evidence: string
  area: string
}

export type ResearchProductInsightInput = {
  product_name: string
  marketplace: string
  estimated_profit: number | null
  estimated_profit_margin: number | null
  data_status: string
}

export type KeywordInsightInput = {
  keyword: string
  marketplace: string
  search_volume: number | null
  competition_level: string | null
  competition_score: number | null
  trend_direction: string | null
  data_status: string
}

const money = (value: number, currency: string) =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 2 }).format(value)

export function buildBusinessInsights(input: {
  products: Product[]
  sales: Sale[]
  researchProducts: ResearchProductInsightInput[]
  keywords: KeywordInsightInput[]
  currency: string
}): BusinessInsight[] {
  const { products, sales, researchProducts, keywords, currency } = input
  const insights: BusinessInsight[] = []

  const lowStock = products.filter(p => p.stockQuantity <= p.lowStockThreshold)
  const outOfStock = products.filter(p => p.stockQuantity <= 0)
  if (outOfStock.length) {
    insights.push({
      id: 'stock-out',
      level: 'warning',
      title: 'Products are out of stock',
      explanation: `${outOfStock.length} saved product(s) currently have no stock available.`,
      action: 'Review these products and record a stock-in movement if replenishment has arrived.',
      evidence: outOfStock.slice(0, 4).map(p => p.name).join(', '),
      area: 'Inventory',
    })
  } else if (lowStock.length) {
    insights.push({
      id: 'low-stock',
      level: 'warning',
      title: 'Restocking may be needed',
      explanation: `${lowStock.length} product(s) are at or below their saved low-stock threshold.`,
      action: 'Check supplier lead times and plan replenishment before stock runs out.',
      evidence: lowStock.slice(0, 4).map(p => `${p.name}: ${p.stockQuantity} left`).join(' · '),
      area: 'Inventory',
    })
  }

  const activeSales = sales.filter(s => s.orderStatus !== 'Cancelled')
  const deliveredSales = activeSales.filter(s => s.orderStatus === 'Delivered')
  const salesProfit = activeSales.reduce((sum, s) => {
    const revenue = s.sellingPrice * s.quantity
    const costs = (s.productCost + s.shippingCost) * s.quantity + revenue * s.feePercent / 100
    return sum + revenue - costs
  }, 0)
  const salesRevenue = activeSales.reduce((sum, s) => sum + s.sellingPrice * s.quantity, 0)
  if (sales.length) {
    insights.push({
      id: 'sales-summary',
      level: salesProfit >= 0 ? 'positive' : 'warning',
      title: 'Recorded order performance',
      explanation: `${activeSales.length} non-cancelled order(s), including ${deliveredSales.length} delivered. Estimated profit is ${money(salesProfit, currency)}.`,
      action: salesProfit < 0
        ? 'Review product costs, shipping and marketplace fee assumptions on orders with negative margins.'
        : 'Compare order-level margins and focus on products that consistently deliver positive returns.',
      evidence: `${money(salesRevenue, currency)} estimated order revenue · Cancelled orders excluded`,
      area: 'Sales',
    })
  } else {
    insights.push({
      id: 'no-sales',
      level: 'info',
      title: 'Start recording your orders',
      explanation: 'There are no saved sales records yet, so order-based performance cannot be assessed.',
      action: 'Add completed or current customer orders in Sales & Orders to unlock sales-based insights.',
      evidence: 'Product listing prices are not treated as confirmed sales.',
      area: 'Sales',
    })
  }

  const estimatedProducts = products.map(p => ({
    name: p.name,
    marketplace: p.marketplace,
    profit: p.sellingPrice - p.productCost - p.shippingCost - p.sellingPrice * p.feePercent / 100,
  }))
  const lossProducts = estimatedProducts.filter(p => p.profit < 0)
  if (lossProducts.length) {
    insights.push({
      id: 'negative-product-margin',
      level: 'warning',
      title: 'Some saved products have negative estimated profit',
      explanation: `${lossProducts.length} product(s) may lose money at their current saved selling price and cost assumptions.`,
      action: 'Recheck supplier cost, delivery, fee percentage and selling price in Products and Smart Pricing.',
      evidence: lossProducts.slice(0, 4).map(p => `${p.name}: ${money(p.profit, currency)} per item`).join(' · '),
      area: 'Pricing',
    })
  }

  const researchedWithProfit = researchProducts.filter(p =>
    p.estimated_profit !== null && Number.isFinite(Number(p.estimated_profit))
  )
  const bestResearch = [...researchedWithProfit].sort(
    (a, b) => Number(b.estimated_profit) - Number(a.estimated_profit)
  )[0]
  if (bestResearch) {
    insights.push({
      id: 'research-opportunity',
      level: Number(bestResearch.estimated_profit) > 0 ? 'opportunity' : 'warning',
      title: 'Review your strongest saved research candidate',
      explanation: `${bestResearch.product_name} has the highest saved estimated profit among ${researchedWithProfit.length} researched product(s).`,
      action: 'Validate supplier pricing, shipping, marketplace fees and demand before investing.',
      evidence: `${bestResearch.marketplace} · ${money(Number(bestResearch.estimated_profit), currency)} estimated profit · Data status: ${bestResearch.data_status}`,
      area: 'Product Research',
    })
  }

  const usableKeywords = keywords.filter(k =>
    k.search_volume !== null || k.competition_score !== null || k.trend_direction
  )
  const promisingKeywords = usableKeywords.filter(k =>
    (k.trend_direction || '').toLowerCase() === 'rising' &&
    (k.competition_level || '').toLowerCase() === 'low'
  )
  if (promisingKeywords.length) {
    insights.push({
      id: 'keyword-opportunity',
      level: 'opportunity',
      title: 'Keywords marked as rising with low competition',
      explanation: `${promisingKeywords.length} saved keyword(s) have both a rising trend and low competition recorded.`,
      action: 'Prioritise these phrases for manual listing and search-result validation.',
      evidence: promisingKeywords.slice(0, 5).map(k => `${k.keyword} (${k.marketplace})`).join(' · '),
      area: 'Keyword Research',
    })
  } else if (keywords.length && usableKeywords.length === 0) {
    insights.push({
      id: 'keyword-data-needed',
      level: 'info',
      title: 'Add keyword metrics to unlock deeper analysis',
      explanation: 'Your saved keywords do not yet contain search volume, competition or trend information.',
      action: 'Add available metrics from a trusted research source. Keep unknown values blank rather than guessing.',
      evidence: `${keywords.length} keyword(s) saved · Metrics unavailable or not entered`,
      area: 'Keyword Research',
    })
  }

  if (!insights.length) {
    insights.push({
      id: 'getting-started',
      level: 'info',
      title: 'Your business insights will grow with your data',
      explanation: 'Add products, record orders, and save research to receive recommendations based on your own activity.',
      action: 'Start with Products and Sales & Orders, then add product and keyword research.',
      evidence: 'No performance figures have been invented or assumed.',
      area: 'Getting Started',
    })
  }

  return insights
}
