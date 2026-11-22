import { useMemo, useState } from 'react'

type Props = {
  currency: string
}

export default function PricingCalculator({ currency }: Props) {
  const [product, setProduct] = useState('12')
  const [shipping, setShipping] = useState('3')
  const [fulfilment, setFulfilment] = useState('0')
  const [other, setOther] = useState('0')
  const [fixedFee, setFixedFee] = useState('0.30')
  const [marketplaceFee, setMarketplaceFee] = useState('10')
  const [paymentFee, setPaymentFee] = useState('2')
  const [targetProfit, setTargetProfit] = useState('10')

  const money = (amount: number) =>
    new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(amount)

  const result = useMemo(() => {
    const cost =
      Math.max(0, Number(product) || 0) +
      Math.max(0, Number(shipping) || 0) +
      Math.max(0, Number(fulfilment) || 0) +
      Math.max(0, Number(other) || 0)

    const fixed = Math.max(0, Number(fixedFee) || 0)
    const percentage =
      (Math.max(0, Number(marketplaceFee) || 0) +
       Math.max(0, Number(paymentFee) || 0)) / 100

    const profit = Math.max(0, Number(targetProfit) || 0)
    const divisor = 1 - percentage

    if (divisor <= 0) {
      return { valid: false, cost, breakEven: 0, target: 0 }
    }

    return {
      valid: true,
      cost,
      breakEven: (cost + fixed) / divisor,
      target: (cost + fixed + profit) / divisor,
    }
  }, [
    product, shipping, fulfilment, other,
    fixedFee, marketplaceFee, paymentFee, targetProfit
  ])

  const inputs = [
    { label: 'Product cost', value: product, set: setProduct },
    { label: 'Shipping cost', value: shipping, set: setShipping },
    { label: 'Fulfilment cost', value: fulfilment, set: setFulfilment },
    { label: 'Other costs', value: other, set: setOther },
    { label: 'Fixed transaction fee', value: fixedFee, set: setFixedFee },
    { label: 'Desired profit per item', value: targetProfit, set: setTargetProfit },
    { label: 'Marketplace fee (%)', value: marketplaceFee, set: setMarketplaceFee },
    { label: 'Payment fee (%)', value: paymentFee, set: setPaymentFee },
  ]

  return (
    <section className="pricing-tool card">
      <div className="pricing-heading">
        <span className="step-label">SMART PRICING TOOL</span>
        <h2>Find your ideal selling price</h2>
        <p>Calculate your break-even price and target selling price.</p>
      </div>

      <div className="pricing-fields">
        {inputs.map(item => (
          <label className="field" key={item.label}>
            <span className="field-label">{item.label}</span>
            <span className="input-wrap">
              <input
                type="number"
                min="0"
                step="any"
                value={item.value}
                onChange={e => item.set(e.target.value)}
              />
            </span>
          </label>
        ))}
      </div>

      {result.valid ? (
        <div className="pricing-results">
          <div className="pricing-result-box">
            <span>Break-even selling price</span>
            <strong>{money(result.breakEven)}</strong>
            <small>Minimum price before profit</small>
          </div>
          <div className="pricing-result-box recommended">
            <span>Recommended target price</span>
            <strong>{money(result.target)}</strong>
            <small>Includes your desired profit</small>
          </div>
        </div>
      ) : (
        <p className="pricing-error">
          Combined percentage fees must be below 100%.
        </p>
      )}

      <p className="disclaimer">
        Estimates exclude VAT, income tax and any additional fees not entered.
        Check actual marketplace fee rules before setting your prices.
      </p>
    </section>
  )
}
