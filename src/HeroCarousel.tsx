import { useEffect, useState } from 'react'
import './HeroCarousel.css'

const slides = [
  { type: 'both', label: 'Your success. Our mission.' },
  { type: 'man', label: 'Make confident selling decisions.' },
  { type: 'woman', label: 'Build your business with clarity.' },
] as const

export default function HeroCarousel() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive(current => (current + 1) % slides.length)
    }, 3000)

    return () => window.clearInterval(timer)
  }, [])

  const previous = () => {
    setActive(current => (current - 1 + slides.length) % slides.length)
  }

  const next = () => {
    setActive(current => (current + 1) % slides.length)
  }

  return (
    <div className="hero-carousel-visual">
      <div className="hero-carousel-photo">
        {active === 0 ? (
          <div className="hero-carousel-pair">
            <img src="/images/seller-man.jpg" alt="Online business owner" />
            <img src="/images/seller-woman.jpg" alt="Online business owner" />
          </div>
        ) : (
          <img
            className="hero-carousel-single"
            src={active === 1 ? '/images/seller-man.jpg' : '/images/seller-woman.jpg'}
            alt={active === 1 ? 'Online seller working on his business' : 'Online seller celebrating her progress'}
          />
        )}
        <div className="hero-carousel-caption">
          <span /> {slides[active].label}
        </div>
      </div>

      <div className="hero-carousel-dashboard">
        <div className="hero-dashboard-heading">
          <div>
            <small>PROFITPILOT WORKSPACE</small>
            <h3>Business overview</h3>
          </div>
          <span>↗</span>
        </div>

        <div className="hero-profit-card">
          <small>Example net profit</small>
          <strong>£2,450.00</strong>
          <span>Illustrative figures only — not a promise of earnings</span>
        </div>

        <div className="hero-metrics">
          <div><small>Revenue</small><strong>£8,920</strong><span>Example</span></div>
          <div><small>Orders</small><strong>186</strong><span>Example</span></div>
          <div><small>Profit margin</small><strong>27.5%</strong><span>Example</span></div>
        </div>

        <div className="hero-sales-chart">
          <div className="hero-chart-heading">
            <strong>Sales performance</strong>
            <small>ILLUSTRATIVE DATA</small>
          </div>
          <strong className="hero-chart-total">£8,920 <small>example revenue</small></strong>
          <svg viewBox="0 0 320 112" role="img" aria-label="Illustrative rising sales graph">
            <defs>
              <linearGradient id="heroSalesFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#25b98b" stopOpacity=".3" />
                <stop offset="100%" stopColor="#25b98b" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0 92 L40 76 L78 82 L118 55 L158 67 L198 36 L238 48 L278 18 L320 8 L320 112 L0 112 Z" fill="url(#heroSalesFill)" />
            <path className="hero-sales-line" d="M0 92 L40 76 L78 82 L118 55 L158 67 L198 36 L238 48 L278 18 L320 8" />
            <circle cx="320" cy="8" r="5" fill="#159b72" />
          </svg>
          <div className="hero-chart-weeks">
            <span>Week 1</span><span>Week 2</span><span>Week 3</span><span>Week 4</span>
          </div>
        </div>

        <div className="hero-dashboard-footer">
          <span /> Your business tools in one place
        </div>
      </div>

      <div className="hero-carousel-controls">
        <button type="button" onClick={previous} aria-label="Previous picture">‹</button>
        <div>
          {slides.map((slide, index) => (
            <button
              key={slide.type}
              type="button"
              className={active === index ? 'selected' : ''}
              onClick={() => setActive(index)}
              aria-label={`Show picture ${index + 1}`}
              aria-pressed={active === index}
            />
          ))}
        </div>
        <button type="button" onClick={next} aria-label="Next picture">›</button>
      </div>
    </div>
  )
}
