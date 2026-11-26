import './LandingPage.css'
import HeroCarousel from './HeroCarousel'

type LandingPageProps = {
  onLogin: () => void
  onSignup: () => void
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

        <div className="landing-footer-links">
          <a href="#features">Features</a>
          <a href="#pricing">Membership</a>
          <a href="#about">About</a>
          <a href="mailto:mountainforge786@gmail.com">Contact</a>
          <a href="#privacy">Privacy Policy</a>
          <a href="#terms">Terms of Service</a>
        </div>

        <div className="landing-legal" id="privacy">
          <h3>Privacy Policy</h3>
          <p><strong>Last updated: 26 November 2026</strong></p>
          <p><strong>Who we are.</strong> ProfitPilot is an independent software project operated by Roman Eli, an individual developer based in England. It is not operated by Romans Group Ltd or another registered company. Contact: <a href="mailto:mountainforge786@gmail.com">mountainforge786@gmail.com</a>. Postal address: 10 Butterwick Close, Manchester, M12 5RA, United Kingdom.</p>
          <p><strong>Information we handle.</strong> When you register or sign in, Supabase authentication processes your account identifier and email address and handles your password. ProfitPilot does not receive or store your password in its application tables. Depending on the features you use, information may include product names, marketplaces, costs, prices, stock levels, inventory movements, sales and order details, product research, keywords, notes and your chosen display currency. Product and currency information may also be stored in your browser's local storage. Do not enter payment-card details or sensitive personal information into free-text fields.</p>
          <p><strong>How we use information.</strong> We use this information to create and manage accounts, provide calculators and workspace features, save and display your business records, support product and keyword research, calculate currency conversions, respond to support requests, maintain service security and troubleshoot errors.</p>
          <p><strong>Where information is processed.</strong> The app uses Supabase for authentication, database storage and server functions, and Cloudflare Pages to host the website. The currency-rates function requests reference exchange rates from Frankfurter using currency codes; it does not send your product or sales records to that service. The current Product Hunter function does not connect to live marketplace data providers and returns no live marketplace results. Hosting and service providers may process technical connection information such as IP address, device/browser information and request logs under their own policies.</p>
          <p><strong>Legal grounds.</strong> Where UK data protection law applies, we generally process account and workspace information because it is needed to provide the service you request (contract), for legitimate interests such as keeping the service secure and maintaining it, or to meet legal obligations. Where consent is required, we will ask for it and you can withdraw it.</p>
          <p><strong>Storage and retention.</strong> Account and workspace records are kept while needed to operate your account and provide the service. You can delete individual product research and keyword research records and manage certain sales and product records within the app. There is currently no self-service account deletion control. To request account and associated personal-data deletion, email us. We may retain information where required by law, to resolve disputes, protect the service or maintain necessary backups; backup deletion periods depend on the relevant provider.</p>
          <p><strong>International processing and security.</strong> Our service providers may process information in countries outside the UK. Where UK data protection law requires safeguards for an international transfer, the relevant provider's applicable transfer arrangements should apply. We use established hosting and database providers and take reasonable steps appropriate to an independent early-stage service, but no internet transmission or storage system can be guaranteed completely secure. Use a strong, unique password and sign out on shared devices.</p>
          <p><strong>Cookies and local storage.</strong> The application uses browser local storage for product data/cache and your currency preference. Supabase authentication may use browser storage to maintain your signed-in session. The application source reviewed for this policy does not include a third-party advertising or analytics tracker. Your browser, hosting provider or service providers may use essential technical technologies and logs to deliver and protect the service.</p>
          <p><strong>Your rights.</strong> Depending on the circumstances, you may have rights to request access, correction, deletion, restriction or transfer of your personal data, or to object to certain processing. These rights are not absolute and legal exceptions may apply. To make a request, email <a href="mailto:mountainforge786@gmail.com">mountainforge786@gmail.com</a>. You may also complain to the UK Information Commissioner's Office at <a href="https://ico.org.uk/make-a-complaint/" target="_blank" rel="noreferrer">ico.org.uk</a>.</p>
          <p><strong>Children.</strong> ProfitPilot is a business tool and is not intended for children.</p>
          <p><strong>Changes and contact.</strong> We may update this notice as the service changes. The latest version will be published here. Contact Roman Eli, ProfitPilot, 10 Butterwick Close, Manchester, M12 5RA, United Kingdom, or <a href="mailto:mountainforge786@gmail.com">mountainforge786@gmail.com</a>.</p>
        </div>

        <div className="landing-legal" id="terms">
          <h3>Terms of Service</h3>
          <p><strong>Last updated: 26 November 2026</strong></p>
          <p><strong>1. About these terms.</strong> These terms govern your use of ProfitPilot, an independent software project operated by Roman Eli, an individual developer based in England. ProfitPilot is not operated by Romans Group Ltd. By creating an account or using the service, you agree to these terms. If you do not agree, do not use the service.</p>
          <p><strong>2. The service.</strong> ProfitPilot provides ecommerce tools including profit and pricing calculations, product and inventory management, sales records, analytics, and product and keyword research features. Features may change as the service develops. Membership plans and paid subscriptions displayed as “Coming Soon” are not currently available for purchase. No paid plan or recurring charge applies unless a paid offer is expressly introduced and you separately agree to it.</p>
          <p><strong>3. No professional advice or guarantee.</strong> ProfitPilot is an information and record-keeping tool, not accounting, tax, legal, investment or other professional advice. Calculations and research may be estimates, may rely on information you enter, and may not reflect current marketplace fees, taxes, exchange rates, shipping costs, rules or market conditions. Product Hunter does not currently provide live marketplace results. You must independently verify all inputs and outputs before making a business decision. We do not guarantee sales, profits, rankings, demand or business results.</p>
          <p><strong>4. Your account and responsibilities.</strong> You must provide accurate registration information, keep your sign-in details confidential and promptly tell us if you suspect unauthorised access. You are responsible for activity carried out through your account. You must only upload information you are entitled to use and must not use the service unlawfully, interfere with its operation, attempt unauthorised access, introduce malicious code, or misuse third-party marketplaces or services.</p>
          <p><strong>5. Your content and records.</strong> You retain your rights in the business information and content you submit. You give us permission to process it only as reasonably necessary to operate, maintain and support ProfitPilot. You are responsible for keeping your own copies of important business records. The service is not a guaranteed backup or archival service.</p>
          <p><strong>6. Availability and changes.</strong> ProfitPilot is an early-stage service and may be changed, interrupted, suspended or withdrawn for maintenance, security, legal or operational reasons. We aim to keep the service available but do not promise uninterrupted or error-free operation. We may suspend access where reasonably necessary to protect users, the service or comply with law.</p>
          <p><strong>7. Intellectual property.</strong> The ProfitPilot name, branding, software, design and materials are owned by or licensed to the operator and may not be copied, redistributed or commercially exploited without permission, except where the law allows. These terms do not transfer ownership of your own data to us.</p>
          <p><strong>8. Third-party services.</strong> The service relies on providers such as Supabase and Cloudflare and may refer to third-party marketplaces or websites. Their services are subject to their own terms and privacy notices. We are not responsible for third-party services that we do not control.</p>
          <p><strong>9. Liability.</strong> Nothing in these terms excludes or limits liability where it would be unlawful to do so, including liability for fraud or for death or personal injury caused by negligence. To the extent permitted by law, we are not liable for indirect or consequential loss, lost profits, lost business opportunities, or decisions made in reliance on unverified calculations or research. If you use ProfitPilot as a consumer, nothing in these terms removes rights that cannot legally be excluded.</p>
          <p><strong>10. Ending use.</strong> You may stop using ProfitPilot at any time. You can request account deletion by emailing <a href="mailto:mountainforge786@gmail.com">mountainforge786@gmail.com</a>. We may restrict or end access where reasonably necessary for a breach of these terms, security, legal compliance or discontinuation of the service. Any information retained after closure will be handled under the Privacy Policy and applicable law.</p>
          <p><strong>11. Governing law.</strong> These terms are governed by the laws of England and Wales. Courts in England and Wales will have jurisdiction, subject to any mandatory rights you may have under applicable consumer law.</p>
          <p><strong>12. Contact.</strong> Roman Eli, ProfitPilot, 10 Butterwick Close, Manchester, M12 5RA, United Kingdom. Email: <a href="mailto:mountainforge786@gmail.com">mountainforge786@gmail.com</a>.</p>
          <p><em>These terms and this privacy notice are general templates for an early-stage service, not legal advice. Please obtain UK legal and data-protection advice before relying on them as a final compliance review.</em></p>
        </div>

        <div className="landing-footer-bottom">
          <span>© {new Date().getFullYear()} ProfitPilot. All rights reserved.</span>
          <span>Built for smarter selling.</span>
        </div>
      </footer>
    </main>
  )
}
