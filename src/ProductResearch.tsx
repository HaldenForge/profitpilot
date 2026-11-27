
import InsightPanel from './InsightPanel'
import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { supabase } from './lib/supabase'

type ResearchProduct = {
  id: string
  marketplace: string
  product_name: string
  product_url: string | null
  seller_name: string | null
  currency: string
  selling_price: number | null
  product_cost: number | null
  shipping_cost: number | null
  marketplace_fee_percent: number | null
  estimated_profit: number | null
  estimated_profit_margin: number | null
  research_status: string
  data_status: string
  created_at: string
}

const marketplaces = [
  'Amazon', 'Amazon FBA', 'Amazon FBM', 'eBay', 'Etsy',
  'Shopify', 'Google Search', 'Google Shopping', 'Walmart', 'Other',
]

export default function ProductResearch({ currency }: { currency: string }) {
  const [products, setProducts] = useState<ResearchProduct[]>([])
  const [marketplace, setMarketplace] = useState('Amazon')
  const [productName, setProductName] = useState('')
  const [productUrl, setProductUrl] = useState('')
  const [sellerName, setSellerName] = useState('')
  const [sellingPrice, setSellingPrice] = useState('')
  const [productCost, setProductCost] = useState('')
  const [shippingCost, setShippingCost] = useState('')
  const [feePercent, setFeePercent] = useState('15')
  const [researchStatus, setResearchStatus] = useState('saved')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const money = (amount: number) =>
    new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount)

  const estimates = useMemo(() => {
    const price = Math.max(0, Number(sellingPrice) || 0)
    const cost = Math.max(0, Number(productCost) || 0)
    const shipping = Math.max(0, Number(shippingCost) || 0)
    const fee = Math.max(0, Number(feePercent) || 0)
    const profit = price - cost - shipping - price * fee / 100

    return {
      profit,
      margin: price > 0 ? profit / price * 100 : 0,
    }
  }, [sellingPrice, productCost, shippingCost, feePercent])

  async function loadProducts() {

    const { data, error: loadError } = await supabase
      .from('product_research')
      .select('*')
      .order('created_at', { ascending: false })

    if (loadError) setError(loadError.message)
    else setProducts((data ?? []) as ResearchProduct[])

    setLoading(false)
  }

  useEffect(() => {
    void loadProducts()
  }, [])

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')

    const price = Number(sellingPrice)
    const cost = Number(productCost)
    const shipping = Number(shippingCost)
    const fee = Number(feePercent)

    if (
      !productName.trim() ||
      ![price, cost, shipping, fee].every(Number.isFinite) ||
      price < 0 || cost < 0 || shipping < 0 || fee < 0
    ) {
      setError('Please check the product details and enter valid amounts.')
      setSaving(false)
      return
    }

    const profit = price - cost - shipping - price * fee / 100

    const { error: saveError } = await supabase
      .from('product_research')
      .insert({
        marketplace,
        product_name: productName.trim(),
        product_url: productUrl.trim() || null,
        seller_name: sellerName.trim() || null,
        currency,
        selling_price: price,
        product_cost: cost,
        shipping_cost: shipping,
        marketplace_fee_percent: fee,
        estimated_profit: profit,
        estimated_profit_margin: price > 0 ? profit / price * 100 : 0,
        research_status: researchStatus,
        data_status: 'user_entered',
        data_source: 'Customer entered',
      })

    if (saveError) {
      setError(saveError.message)
    } else {
      setMessage('Product research saved successfully.')
      setProductName('')
      setProductUrl('')
      setSellerName('')
      setSellingPrice('')
      setProductCost('')
      setShippingCost('')
      setFeePercent('15')
      setResearchStatus('saved')
      await loadProducts()
    }

    setSaving(false)
  }

  async function updateStatus(id: string, status: string) {
    setError('')
    const { error: updateError } = await supabase
      .from('product_research')
      .update({ research_status: status })
      .eq('id', id)

    if (updateError) setError(updateError.message)
    else {
      setProducts(current => current.map(product =>
        product.id === id ? { ...product, research_status: status } : product
      ))
    }
  }

  async function deleteProduct(id: string) {
    if (!window.confirm('Delete this saved research record?')) return

    setError('')
    const { error: deleteError } = await supabase
      .from('product_research')
      .delete()
      .eq('id', id)

    if (deleteError) setError(deleteError.message)
    else {
      setProducts(current => current.filter(product => product.id !== id))
      setMessage('Research record deleted.')
    }
  }

  const filteredProducts = products.filter(product =>
    `${product.product_name} ${product.marketplace}`
      .toLowerCase().includes(search.toLowerCase())
  )

  return (
    <section className="product-research">
      {!loading && products.length > 0 && (() => { const ready = products.filter(p => p.estimated_profit !== null); const best = [...ready].sort((a,b) => Number(b.estimated_profit)-Number(a.estimated_profit))[0]; return best ? <InsightPanel area="Product Research" level={Number(best.estimated_profit) > 0 ? 'opportunity' : 'warning'} title="Strongest saved research estimate" explanation={`${best.product_name} has the highest saved estimated profit among ${ready.length} products with a profit estimate.`} action="Validate supplier quotes, shipping, marketplace fees and real demand before buying stock." evidence={`${best.marketplace} · ${money(Number(best.estimated_profit))} estimated · ${best.data_status.replace(/_/g,' ')} data`} /> : <InsightPanel area="Product Research" title="Add cost and price details" explanation="Your saved research does not yet include enough profit estimates to compare candidates." action="Enter selling price, product cost, shipping and marketplace fee for each candidate. Keep unverified information labelled." /> })()}
      <div className="research-heading">
        <div>
          <h2>Product Research &amp; Product Hunter</h2>
          <p>Research products, compare estimated profitability and save promising opportunities.</p>
        </div>
        <span className="research-label">Research Centre</span>
      </div>

      <div className="research-marketplaces">
        {marketplaces.slice(0, 8).map(item => (
          <button
            type="button"
            key={item}
            className={marketplace === item ? 'research-market-active' : ''}
            onClick={() => setMarketplace(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="research-layout">
        <form className="research-form" onSubmit={saveProduct}>
          <h3>Add Product Research</h3>
          <p>Enter product information to evaluate its potential profitability.</p>

          <label>
            Target marketplace
            <select value={marketplace} onChange={event => setMarketplace(event.target.value)}>
              {marketplaces.map(item => <option key={item}>{item}</option>)}
            </select>
          </label>

          <label>
            Product name *
            <input value={productName} onChange={event => setProductName(event.target.value)} placeholder="Enter product name" required />
          </label>

          <label>
            Product URL
            <input type="url" value={productUrl} onChange={event => setProductUrl(event.target.value)} placeholder="https://..." />
          </label>

          <label>
            Competitor or seller name
            <input value={sellerName} onChange={event => setSellerName(event.target.value)} placeholder="Seller name" />
          </label>

          <div className="research-input-grid">
            <label>
              Selling price ({currency})
              <input type="number" min="0" step="0.01" value={sellingPrice} onChange={event => setSellingPrice(event.target.value)} required />
            </label>
            <label>
              Product cost ({currency})
              <input type="number" min="0" step="0.01" value={productCost} onChange={event => setProductCost(event.target.value)} required />
            </label>
            <label>
              Shipping cost ({currency})
              <input type="number" min="0" step="0.01" value={shippingCost} onChange={event => setShippingCost(event.target.value)} required />
            </label>
            <label>
              Marketplace fee (%)
              <input type="number" min="0" step="0.01" value={feePercent} onChange={event => setFeePercent(event.target.value)} required />
            </label>
          </div>

          <div className="research-estimate">
            <div>
              <span>Estimated profit per unit</span>
              <strong className={estimates.profit >= 0 ? 'research-positive' : 'research-negative'}>
                {money(estimates.profit)}
              </strong>
            </div>
            <div>
              <span>Estimated profit margin</span>
              <strong>{estimates.margin.toFixed(2)}%</strong>
            </div>
          </div>

          <label>
            Research status
            <select value={researchStatus} onChange={event => setResearchStatus(event.target.value)}>
              <option value="saved">Saved</option>
              <option value="watching">Watching</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="rejected">Rejected</option>
            </select>
          </label>

          <button className="research-save-button" type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Product Research'}
          </button>

          <p className="research-disclaimer">
            Profit is estimated using entered product cost, shipping and marketplace fee.
            Other expenses, taxes and advertising are not included.
          </p>
        </form>

        <div className="research-saved">
          <div className="research-saved-heading">
            <div>
              <h3>Saved Product Research</h3>
              <p>{products.length} saved research record(s)</p>
            </div>
          </div>

          <input className="research-search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search products or marketplaces..." />

          {message && <p className="research-success">{message}</p>}
          {error && <p className="research-error" role="alert">{error}</p>}

          {loading ? (
            <p>Loading saved research...</p>
          ) : filteredProducts.length === 0 ? (
            <div className="research-empty">
              <h4>No saved research found</h4>
              <p>Add your first product to start building your research list.</p>
            </div>
          ) : (
            <div className="research-product-list">
              {filteredProducts.map(product => (
                <article className="research-product-card" key={product.id}>
                  <div className="research-product-top">
                    <div>
                      <span className="research-market-tag">{product.marketplace}</span>
                      <h4>{product.product_name}</h4>
                      {product.seller_name && <small>Seller: {product.seller_name}</small>}
                    </div>
                    <strong className={(product.estimated_profit ?? 0) >= 0 ? 'research-positive' : 'research-negative'}>
                      {money(product.estimated_profit ?? 0)}
                    </strong>
                  </div>

                  <div className="research-product-details">
                    <span>Price: {money(product.selling_price ?? 0)}</span>
                    <span>Margin: {(product.estimated_profit_margin ?? 0).toFixed(2)}%</span>
                  </div>

                  <div className="research-product-actions">
                    <select
                      aria-label={`Research status for ${product.product_name}`}
                      value={product.research_status}
                      onChange={event => void updateStatus(product.id, event.target.value)}
                    >
                      <option value="saved">Saved</option>
                      <option value="watching">Watching</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="rejected">Rejected</option>
                    </select>

                    {product.product_url && (
                      <a href={product.product_url} target="_blank" rel="noreferrer">View product</a>
                    )}

                    <button type="button" className="research-delete-button" onClick={() => void deleteProduct(product.id)}>
                      Delete
                    </button>
                  </div>

                  <small className="research-data-note">
                    Customer-entered information · Not verified live marketplace data
                  </small>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
