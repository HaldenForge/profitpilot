import { useEffect, useMemo, useState } from 'react'

type Product = {
  id: string
  name: string
  marketplace: string
  productCost: number
  sellingPrice: number
  shippingCost: number
  feePercent: number
}

const STORAGE_KEY = 'profitpilot-products'
const UPDATE_EVENT = 'profitpilot-products-updated'

function readProducts(): Product[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return []

    const data: unknown = JSON.parse(saved)
    if (!Array.isArray(data)) return []

    return data.filter((item): item is Product =>
      item !== null &&
      typeof item === 'object' &&
      typeof item.id === 'string' &&
      typeof item.name === 'string' &&
      typeof item.marketplace === 'string' &&
      Number.isFinite(item.productCost) &&
      Number.isFinite(item.sellingPrice) &&
      Number.isFinite(item.shippingCost) &&
      Number.isFinite(item.feePercent)
    )
  } catch {
    return []
  }
}

function productProfit(product: Product) {
  return product.sellingPrice -
    product.productCost -
    product.shippingCost -
    product.sellingPrice * product.feePercent / 100
}

export default function AnalyticsDashboard({
  currency,
}: {
  currency: string
}) {
  const [products, setProducts] = useState<Product[]>(readProducts)

  useEffect(() => {
    const refreshProducts = () => setProducts(readProducts())

    window.addEventListener(UPDATE_EVENT, refreshProducts)
    window.addEventListener('storage', refreshProducts)

    return () => {
      window.removeEventListener(UPDATE_EVENT, refreshProducts)
      window.removeEventListener('storage', refreshProducts)
    }
  }, [])

  const money = (value: number) =>
    new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
    }).format(value)

  const analytics = useMemo(() => {
    const revenue = products.reduce(
      (sum, product) => sum + product.sellingPrice, 0
    )

    const costs = products.reduce(
      (sum, product) =>
        sum + product.productCost +
        product.shippingCost +
        product.sellingPrice * product.feePercent / 100,
      0
    )

    const profit = revenue - costs
    const margin = revenue > 0 ? profit / revenue * 100 : 0

    const marketplaceMap = new Map<string, {
      revenue: number
      profit: number
      count: number
    }>()

    products.forEach((product) => {
      const current = marketplaceMap.get(product.marketplace) ?? {
        revenue: 0,
        profit: 0,
        count: 0,
      }

      current.revenue += product.sellingPrice
      current.profit += productProfit(product)
      current.count += 1

      marketplaceMap.set(product.marketplace, current)
    })

    const marketplaces = Array.from(
      marketplaceMap,
      ([name, values]) => ({ name, ...values })
    ).sort((a, b) => b.profit - a.profit)

    const bestProduct = [...products].sort(
      (a, b) => productProfit(b) - productProfit(a)
    )[0]

    return {
      revenue,
      costs,
      profit,
      margin,
      marketplaces,
      bestProduct,
    }
  }, [products])

  const maxMarketplaceProfit = Math.max(
    0,
    ...analytics.marketplaces.map((item) => Math.abs(item.profit))
  )

  return (
    <section className="analytics-dashboard">
      <div className="analytics-heading">
        <div>
          <h2>Business Analytics Dashboard</h2>
          <p>Understand your estimated product performance at a glance.</p>
        </div>
        <span className="analytics-live-label">Product data overview</span>
      </div>

      <div className="analytics-cards">
        <article className="analytics-card">
          <span>Total products</span>
          <strong>{products.length}</strong>
          <small>Products in your manager</small>
        </article>

        <article className="analytics-card">
          <span>Estimated revenue</span>
          <strong>{money(analytics.revenue)}</strong>
          <small>Combined listed selling prices</small>
        </article>

        <article className="analytics-card">
          <span>Estimated costs</span>
          <strong>{money(analytics.costs)}</strong>
          <small>Product, shipping and marketplace fees</small>
        </article>

        <article className="analytics-card">
          <span>Estimated profit</span>
          <strong className={analytics.profit >= 0 ? 'analytics-positive' : 'analytics-negative'}>
            {money(analytics.profit)}
          </strong>
          <small>Revenue minus estimated costs</small>
        </article>
      </div>

      <div className="analytics-secondary-grid">
        <article className="analytics-panel">
          <span className="analytics-panel-label">Average profit margin</span>
          <strong className={analytics.margin >= 0 ? 'analytics-positive' : 'analytics-negative'}>
            {analytics.margin.toFixed(2)}%
          </strong>
          <p>Estimated profit as a percentage of listed revenue.</p>
        </article>

        <article className="analytics-panel">
          <span className="analytics-panel-label">Best-performing product</span>
          {analytics.bestProduct ? (
            <>
              <strong>{analytics.bestProduct.name}</strong>
              <p>
                {analytics.bestProduct.marketplace} ·
                {' '}{money(productProfit(analytics.bestProduct))} estimated profit
              </p>
            </>
          ) : (
            <p>Add products to see your best performer.</p>
          )}
        </article>
      </div>

      <article className="analytics-panel marketplace-panel">
        <h3>Marketplace Performance</h3>
        <p>Compare estimated profit across your marketplaces.</p>

        {analytics.marketplaces.length === 0 ? (
          <p className="analytics-empty">
            No marketplace data yet. Add products to get started.
          </p>
        ) : (
          <div className="marketplace-chart">
            {analytics.marketplaces.map((item) => {
              const width = maxMarketplaceProfit > 0
                ? Math.abs(item.profit) / maxMarketplaceProfit * 100
                : 0

              return (
                <div className="marketplace-row" key={item.name}>
                  <div className="marketplace-row-heading">
                    <strong>{item.name}</strong>
                    <span>{money(item.profit)}</span>
                  </div>
                  <div className="marketplace-track">
                    <div
                      className={`marketplace-bar ${item.profit < 0 ? 'negative-bar' : ''}`}
                      style={{ width: `${width}%` }}
                    />
                  </div>
                  <small>
                    {item.count} product{item.count === 1 ? '' : 's'} ·
                    {' '}{money(item.revenue)} listed revenue
                  </small>
                </div>
              )
            })}
          </div>
        )}
      </article>

      <p className="analytics-disclaimer">
        These figures are estimates based on saved product prices and costs.
        They do not represent confirmed sales, cash received or accounting profit.
        Taxes, advertising and other unentered costs are excluded.
      </p>
    </section>
  )
}
