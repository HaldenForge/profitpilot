
import InsightPanel from './InsightPanel'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { supabase } from './lib/supabase'
import {
  convertCurrency,
  formatCurrency,
  type CurrencyCode,
  type ExchangeRates,
} from './lib/currency'

const marketplaces = [
  'Amazon',
  'eBay',
  'Etsy',
  'Shopify',
  'Google Search',
  'Google Shopping',
  'Walmart',
]

const targetCountries = [
  { code: 'GB', name: 'United Kingdom' },
  { code: 'US', name: 'United States' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'IN', name: 'India' },
]


type ProductResult = {
  id?: string
  title: string
  image_url?: string | null
  price?: number | null
  currency?: string | null
  seller_name?: string | null
  product_url?: string | null
  marketplace?: string
  data_status?: string
  data_source?: string
}

type DiscoveryResponse = {
  success: boolean
  marketplace: string
  keyword: string
  limit: number
  provider_connected: boolean
  data_status: string
  results: ProductResult[]
  message: string
}

function getConvertedPrice(
  price: number,
  originalCurrency: string | null | undefined,
  preferredCurrency: string,
  exchangeRates: ExchangeRates | null
): string | null {
  const from = originalCurrency?.toUpperCase()
  const to = preferredCurrency.toUpperCase()
  const supported = ['GBP', 'USD', 'EUR']

  if (
    !exchangeRates ||
    !from ||
    !supported.includes(from) ||
    !supported.includes(to) ||
    from === to
  ) {
    return null
  }

  const converted = convertCurrency(
    price,
    from as CurrencyCode,
    to as CurrencyCode,
    exchangeRates
  )

  return converted === null
    ? null
    : formatCurrency(converted, to as CurrencyCode)
}

function formatPrice(price: number, currency?: string | null) {
  if (!currency) {
    return `${price.toFixed(2)} (currency not provided)`
  }

  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
    }).format(price)
  } catch {
    return `${price.toFixed(2)} ${currency}`
  }
}

export default function ProductHunter({
  currency,
  exchangeRates,
}: {
  currency: string
  exchangeRates: ExchangeRates | null
}) {
  const [marketplace, setMarketplace] = useState('Amazon')
  const [targetCountry, setTargetCountry] = useState('GB')
  const [keyword, setKeyword] = useState('')
  const [limit, setLimit] = useState('10')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [response, setResponse] = useState<DiscoveryResponse | null>(null)

  const searchProducts = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!keyword.trim()) {
      setError('Please enter a product or keyword to search.')
      return
    }

    setLoading(true)
    setError('')
    setResponse(null)

    try {
      const { data, error: functionError } =
        await supabase.functions.invoke('product-discovery', {
          body: {
            marketplace,
            targetCountry,
            keyword: keyword.trim(),
            limit: Number(limit),
          },
        })

      if (functionError) {
        throw new Error(
          functionError.message || 'Unable to complete your product search.'
        )
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Product search was unsuccessful.')
      }

      const safeResults = Array.isArray(data.results)
        ? data.results.filter(
            (item: unknown): item is ProductResult =>
              typeof item === 'object' &&
              item !== null &&
              'title' in item &&
              typeof item.title === 'string'
          )
        : []

      setResponse({
        ...data,
        results: safeResults,
      } as DiscoveryResponse)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="product-hunter"
      {response && <InsightPanel area="Product Hunter" level={response.provider_connected && response.results.length ? 'opportunity' : 'info'} title={response.provider_connected && response.results.length ? 'Discovery results are ready for review' : 'Live marketplace data is not connected'} explanation={response.provider_connected && response.results.length ? `${response.results.length} result(s) were returned for “${response.keyword}”. The results alone do not confirm demand or profitability.` : 'Product discovery cannot produce verified live listings until an approved data provider is connected.'} action={response.provider_connected && response.results.length ? 'Compare original listing prices, sellers and product condition, then enter verified supplier and fee costs in Product Research.' : 'You can continue using Product Research with manually verified information. Do not treat unavailable results as zero demand.'} evidence={`Data status: ${response.data_status.replace(/_/g,' ')}`} />}>
      <div className="hunter-heading">
        <div>
          <span className="step-label">PRODUCT DISCOVERY</span>
          <h2>Product Hunter</h2>
          <p>
            Discover product opportunities across multiple marketplaces
            and research channels.
          </p>
        </div>
        <span className="hunter-icon">⌕</span>
      </div>

      <div className="hunter-marketplaces">
        {marketplaces.map(item => (
          <button
            type="button"
            key={item}
            className={marketplace === item ? 'hunter-market-active' : ''}
            onClick={() => {
              setMarketplace(item)
              setResponse(null)
              setError('')
            }}
          >
            {item}
          </button>
        ))}
      </div>

      <form className="hunter-search-form" onSubmit={searchProducts}>
        <label>
          <span>Marketplace</span>
          <select
            value={marketplace}
            onChange={event => {
              setMarketplace(event.target.value)
              setResponse(null)
            }}
          >
            {marketplaces.map(item => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </label>

        <label>
          <span>Target Country</span>
          <select
            value={targetCountry}
            onChange={event => {
              setTargetCountry(event.target.value)
              setResponse(null)
            }}
          >
            {targetCountries.map(country => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
        </label>

        <label className="hunter-keyword-field">
          <span>Product name or keyword</span>
          <input
            value={keyword}
            onChange={event => setKeyword(event.target.value)}
            placeholder="e.g. handmade leather wallet"
            maxLength={120}
          />
        </label>

        <label>
          <span>Results requested</span>
          <select
            value={limit}
            onChange={event => setLimit(event.target.value)}
          >
            <option value="5">5 results</option>
            <option value="10">10 results</option>
            <option value="20">20 results</option>
            <option value="25">25 results</option>
          </select>
        </label>

        <button type="submit" disabled={loading}>
          {loading ? 'Searching...' : 'Search Products'}
        </button>
      </form>

      <p className="hunter-disclaimer">
        Your preferred display currency is {currency}.
        Original marketplace prices remain in their listing currency.
        Currency conversion will be added when a live exchange-rate
        service is connected.
      </p>

      {error && (
        <div className="hunter-error" role="alert">
          {error}
        </div>
      )}

      {!response && !error && (
        <div className="hunter-empty">
          <span className="hunter-empty-icon">⌕</span>
          <h3>Find your next product opportunity</h3>
          <p>
            Choose a marketplace, enter a keyword and start your product
            research.
          </p>
        </div>
      )}

      {response && (
        <div className="hunter-results">
          <div className="hunter-results-heading">
            <div>
              <h3>Search results</h3>
              <p>{response.marketplace} · {response.keyword}</p>
            </div>
            <span className="hunter-data-status">
              {response.data_status.replace(/_/g, ' ')}
            </span>
          </div>

          {response.provider_connected && response.results.length > 0 ? (
            <div className="hunter-result-list">
              {response.results.map((product, index) => (
                <article
                  className="hunter-result-card"
                  key={product.id || `${product.title}-${index}`}
                >
                  {product.image_url ? (
                    <img
                      className="hunter-result-image"
                      src={product.image_url}
                      alt={product.title}
                      loading="lazy"
                    />
                  ) : (
                    <div className="hunter-result-image hunter-no-image">
                      Product image unavailable
                    </div>
                  )}

                  <div className="hunter-result-content">
                    <h4>{product.title}</h4>

                    {typeof product.price === 'number' && (
                      <div>
                        <p className="hunter-result-price">
                          Original price: {formatPrice(product.price, product.currency)}
                        </p>
                        {getConvertedPrice(
                          product.price,
                          product.currency,
                          currency,
                          exchangeRates
                        ) && (
                          <p className="hunter-result-price">
                            Converted price: {getConvertedPrice(
                              product.price,
                              product.currency,
                              currency,
                              exchangeRates
                            )}
                          </p>
                        )}
                      </div>
                    )}

                    {product.seller_name && (
                      <p>Seller: {product.seller_name}</p>
                    )}

                    <div className="hunter-result-meta">
                      <span>{product.marketplace || response.marketplace}</span>
                      {product.data_status && (
                        <span>{product.data_status.replace(/_/g, ' ')}</span>
                      )}
                      {product.data_source && (
                        <span>Source: {product.data_source}</span>
                      )}
                    </div>

                    {product.product_url && (
                      <a
                        className="hunter-result-link"
                        href={product.product_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View original listing
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : response.provider_connected ? (
            <div className="hunter-provider-notice">
              <h4>No matching products found</h4>
              <p>Try another keyword or marketplace.</p>
            </div>
          ) : (
            <div className="hunter-provider-notice">
              <h4>Marketplace connection required</h4>
              <p>{response.message}</p>
              <p>
                No live product listings or sales figures have been
                retrieved. Connect an approved data provider to enable
                real marketplace discovery.
              </p>
            </div>
          )}
        </div>
      )}

      <p className="hunter-disclaimer">
        Product availability, search volume, sales, competition and
        ranking information will only be displayed when supported by
        the connected data source. Estimates will be clearly labelled.
      </p>
    </section>
  )
}
