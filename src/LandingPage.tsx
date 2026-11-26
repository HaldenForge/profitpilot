import './LandingPage.css'
import HeroCarousel from './HeroCarousel'

type LandingPageProps = {
  onLogin: () => void
  onSignup: () => void
  onPrivacy: () => void
  onTerms: () => void
}

const features = [
  {
    icon: '📊',
    title: 'Profit Calculator',
    description: 'Calculate your real profit, marketplace fees, margins and return on investment.',
  },
  {
    icon: '💰',
    title: 'Smart Pricing',
    description: 'Work out selling prices using your costs, fees and target profit margin.',
  },
  {
    icon: '📦',
    title: 'Product Management',
    description: 'Organise your products, costs, selling prices and business records.',
  },
  {
    icon: '🏬',
    title: 'Inventory Management',
    description: 'Monitor stock levels, record movements and identify low-stock products.',
  },
  {
    icon: '📈',
    title: 'Business Analytics',
    description: 'Understand your sales, costs and business performance in one workspace.',
  },
  {
    icon: '🔎',
    title: 'Product & Keyword Research',
    description: 'Organise product ideas and keyword research for your marketplace strategy.',
  },
]

const marketplaces = [
  'Amazon',
  'eBay',
  'Etsy',
  'Shopify',
  'Google Shopping',
  'Walmart',
]

export default function LandingPage({
  onLogin,
  onSignup,
  onPrivacy,
  onTerms,
}: LandingPageProps) {
  return (
    <main className="landing-page">
      <header className="landing-header">
        <a className="landing-brand" href="#home">
          <span className="landing-brand-icon">P</span>
          <span>Profit<span>Pilot</span></span>
        </a>

        <nav className="landing-nav">
          <a href="#features">Features</a>
          <a href="#marketplaces">Marketplaces</a>
          <a href="#pricing">Membership</a>
          <a href="#about">About</a>
        </nav>

        <div className="landing-header-actions">
          <button className="landing-login" onClick={onLogin}>
            Log in
          </button>
          <button className="landing-button landing-button-small" onClick={onSignup}>
            Get Started
          </button>
        </div>
      </header>

      <section className="landing-hero" id="home">
        <div className="landing-hero-content">
          <span className="landing-eyebrow">
            YOUR ECOMMERCE BUSINESS, UNDER CONTROL
          </span>

          <h1>
            Make smarter decisions.
            <span>Grow your profits.</span>
          </h1>

          <p>
            Manage your ecommerce business with practical tools for profit
            calculations, pricing, products, inventory and business research.
            Everything you need in one workspace.
          </p>

          <div className="landing-hero-actions">
            <button className="landing-button" onClick={onSignup}>
              Get Started Free <span>→</span>
            </button>
            <button className="landing-button landing-button-outline" onClick={onLogin}>
              Log In
            </button>
          </div>

          <div className="landing-hero-note">
            <span>✓</span> Built for online sellers and growing businesses
          </div>
        </div>

        <HeroCarousel />
      </section>

      <section className="landing-trust">
        <p>TOOLS FOR SELLERS ACROSS MAJOR ECOMMERCE MARKETPLACES</p>
        <div>
          {marketplaces.map(marketplace => (
            <span key={marketplace}>{marketplace}</span>
          ))}
        </div>
      </section>

      <section className="landing-section" id="features">
        <div className="landing-section-heading">
          <span className="landing-eyebrow">POWERFUL BUSINESS TOOLS</span>
          <h2>Everything you need to manage your selling business</h2>
          <p>
            Practical tools designed to help you understand your numbers,
            organise your operations and make better business decisions.
          </p>
        </div>

        <div className="landing-feature-grid">
          {features.map(feature => (
            <article className="landing-feature-card" key={feature.title}>
              <div className="landing-feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-marketplace-section" id="marketplaces">
        <div>
          <span className="landing-eyebrow">MULTI-MARKETPLACE VISION</span>
          <h2>One workspace for your ecommerce journey.</h2>
          <p>
            ProfitPilot is being developed to support sellers across different
            marketplaces and regions. Research and integrations depend on
            available data providers and marketplace API approvals.
          </p>
        </div>

        <div className="landing-marketplace-list">
          {marketplaces.map(marketplace => (
            <div key={marketplace}>
              <span>✓</span> {marketplace}
            </div>
          ))}
        </div>
      </section>

      <section className="landing-pricing" id="pricing">
        <div className="landing-section-heading">
          <span className="landing-eyebrow">MEMBERSHIP</span>
          <h2>Plans designed for every stage of business</h2>
          <p>
            Our membership options are planned for different business needs.
            Subscription features and pricing will be announced when available.
          </p>
        </div>

        <div className="landing-plan-grid">
          {[
            {
              name: 'Free',
              description: 'For sellers getting started.',
              items: ['Essential business tools', 'Limited research access', 'Basic usage allowance'],
            },
            {
              name: 'Basic',
              description: 'For growing online businesses.',
              items: ['More research access', 'Higher usage allowance', 'Additional business tools'],
            },
            {
              name: 'Premium',
              description: 'For sellers who need more.',
              items: ['Broader marketplace access', 'Advanced research tools', 'Higher usage allowance'],
            },
          ].map(plan => (
            <article className="landing-plan-card" key={plan.name}>
              <span className="landing-plan-status">COMING SOON</span>
              <h3>{plan.name}</h3>
              <p>{plan.description}</p>
              <ul>
                {plan.items.map(item => (
                  <li key={item}><span>✓</span> {item}</li>
                ))}
              </ul>
              <button className="landing-plan-button" onClick={onSignup}>
                Create an account
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-about" id="about">
        <span className="landing-eyebrow">ABOUT PROFITPILOT</span>
        <h2>Helping online sellers make informed decisions.</h2>
        <p>
          ProfitPilot is an ecommerce business toolkit being developed to
          bring essential selling, management and research tools together.
          Our goal is to make everyday business decisions clearer and easier
          for online sellers.
        </p>
      </section>

      <section className="landing-cta">
        <h2>Ready to take control of your business?</h2>
        <p>Create your account and explore the ProfitPilot workspace.</p>
        <button className="landing-button landing-cta-button" onClick={onSignup}>
          Get Started Free <span>→</span>
        </button>
      </section>

      <footer className="landing-footer">
        <div className="landing-footer-main">
          <a className="landing-brand" href="#home">
            <span className="landing-brand-icon">P</span>
            <span>Profit<span>Pilot</span></span>
          </a>
          <p>Practical tools for smarter ecommerce decisions.</p>
        </div>

        <div className="landing-footer-privacy-note">
          <strong>Your privacy matters.</strong> We use trusted service providers to operate ProfitPilot and handle the information needed to provide our services.
        </div>

        <div className="landing-footer-links">
          <a href="#features">Features</a>
          <a href="#pricing">Membership</a>
          <a href="#about">About</a>
          <a href="mailto:mountainforge786@gmail.com">Contact</a>
          <button type="button" onClick={onPrivacy}>Privacy Policy</button>
          <button type="button" onClick={onTerms}>Terms of Service</button>
        </div>

        <div className="landing-footer-bottom">
          <span>© {new Date().getFullYear()} ProfitPilot. All rights reserved.</span>
          <span>Built for smarter selling.</span>
        </div>
      </footer>
    </main>
  )
}
