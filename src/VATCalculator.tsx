import { useMemo, useState } from 'react'

export default function VATCalculator({
  currency,
}: {
  currency: string
}) {
  const [price, setPrice] = useState('100')
  const [rate, setRate] = useState('20')
  const [customRate, setCustomRate] = useState('20')
  const [mode, setMode] = useState<'net' | 'gross'>('net')
  const [useCustomRate, setUseCustomRate] = useState(false)

  const activeRate = useCustomRate ? Number(customRate) : Number(rate)
  const enteredPrice = Number(price)

  const result = useMemo(() => {
    if (
      !Number.isFinite(enteredPrice) ||
      enteredPrice < 0 ||
      !Number.isFinite(activeRate) ||
      activeRate < 0 ||
      activeRate > 100
    ) {
      return null
    }

    if (mode === 'net') {
      const vat = enteredPrice * activeRate / 100
      return {
        net: enteredPrice,
        vat,
        gross: enteredPrice + vat,
      }
    }

    const net = enteredPrice / (1 + activeRate / 100)
    return {
      net,
      vat: enteredPrice - net,
      gross: enteredPrice,
    }
  }, [enteredPrice, activeRate, mode])

  const money = (value: number) =>
    new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
    }).format(value)

  function chooseRate(value: string) {
    setRate(value)
    setUseCustomRate(false)
  }

  return (
    <section className="vat-calculator">
      <div className="vat-heading">
        <div>
          <h2>VAT Calculator</h2>
          <p>Calculate VAT, net prices and VAT-inclusive totals.</p>
        </div>
        <span className="vat-label">Tax calculation tool</span>
      </div>

      <div className="vat-input-panel">
        <div className="vat-mode-control">
          <button
            type="button"
            className={mode === 'net' ? 'vat-mode-active' : ''}
            onClick={() => setMode('net')}
          >
            Add VAT to net price
          </button>
          <button
            type="button"
            className={mode === 'gross' ? 'vat-mode-active' : ''}
            onClick={() => setMode('gross')}
          >
            Extract VAT from total
          </button>
        </div>

        <div className="vat-fields">
          <label>
            {mode === 'net' ? 'Net price' : 'VAT-inclusive price'} ({currency})
            <input
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              placeholder="Enter price"
            />
          </label>

          <label>
            VAT rate
            <select
              value={useCustomRate ? 'custom' : rate}
              onChange={(event) => {
                if (event.target.value === 'custom') {
                  setUseCustomRate(true)
                } else {
                  chooseRate(event.target.value)
                }
              }}
            >
              <option value="20">20% – UK standard rate</option>
              <option value="5">5% – UK reduced rate</option>
              <option value="0">0% – Zero rate</option>
              <option value="custom">Custom rate</option>
            </select>
          </label>

          {useCustomRate && (
            <label>
              Custom VAT rate (%)
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={customRate}
                onChange={(event) => setCustomRate(event.target.value)}
              />
            </label>
          )}
        </div>

        <p className="vat-rate-note">
          VAT rates depend on the goods or services and applicable tax rules.
          Check the correct rate before using a calculation for tax reporting.
        </p>
      </div>

      <div className="vat-results">
        {result ? (
          <>
            <div className="vat-result-card">
              <span>Net amount</span>
              <strong>{money(result.net)}</strong>
            </div>
            <div className="vat-result-card vat-highlight">
              <span>VAT amount ({activeRate}%)</span>
              <strong>{money(result.vat)}</strong>
            </div>
            <div className="vat-result-card">
              <span>Total including VAT</span>
              <strong>{money(result.gross)}</strong>
            </div>
          </>
        ) : (
          <p className="vat-error">
            Please enter a valid non-negative price and a VAT rate between 0% and 100%.
          </p>
        )}
      </div>

      {result && (
        <div className="vat-breakdown">
          <h3>Calculation breakdown</h3>
          <div>
            <span>Net amount</span>
            <strong>{money(result.net)}</strong>
          </div>
          <div>
            <span>VAT rate</span>
            <strong>{activeRate}%</strong>
          </div>
          <div>
            <span>VAT amount</span>
            <strong>{money(result.vat)}</strong>
          </div>
          <div className="vat-total-line">
            <span>Final total</span>
            <strong>{money(result.gross)}</strong>
          </div>
        </div>
      )}

      <p className="vat-disclaimer">
        This calculator provides estimates only. It does not determine whether
        a business must register for VAT, whether a supply is taxable, or how
        much VAT is payable to a tax authority.
      </p>
    </section>
  )
}
