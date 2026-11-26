import './LegalPage.css'

type LegalPageProps = {
  page: 'privacy' | 'terms'
  onBack: () => void
}

export default function LegalPage({ page, onBack }: LegalPageProps) {
  const isPrivacy = page === 'privacy'

  return (
    <main className="legal-page">
      <header className="legal-header">
        <a className="legal-brand" href="/" onClick={(event) => { event.preventDefault(); onBack() }}>
          <span className="legal-brand-icon">P</span>
          <span>Profit<span>Pilot</span></span>
        </a>
        <button className="legal-back" onClick={onBack}>← Back to ProfitPilot</button>
      </header>

      <article className="legal-document">
        <span className="legal-eyebrow">PROFITPILOT · LEGAL INFORMATION</span>
        <h1>{isPrivacy ? 'Privacy Policy' : 'Terms of Service'}</h1>
        <p className="legal-updated">Last updated: 26 November 2026</p>

        {isPrivacy ? (
          <>
            <p>This Privacy Policy explains how ProfitPilot handles information when you visit the website or use the ProfitPilot workspace. Please read it carefully.</p>

            <h2>1. Who operates ProfitPilot</h2>
            <p>ProfitPilot is an independent software project operated by Roman Eli, an individual developer based in England.</p>
            <p><strong>Contact:</strong> <a href="mailto:mountainforge786@gmail.com">mountainforge786@gmail.com</a><br />
              <strong>Postal address:</strong> 10 Butterwick Close, Manchester, M12 5RA, United Kingdom.</p>

            <h2>2. Information that may be processed</h2>
            <p><strong>Account information.</strong> When you register, sign in or request a password reset, our authentication service processes information needed to manage your account, such as your email address and account identifier. Your password is handled by the authentication service and is not stored in ProfitPilot product or sales records.</p>
            <p><strong>Workspace information.</strong> Depending on the features you use and the information you enter, this can include product names, marketplace selections, product and shipping costs, selling prices, fee percentages, stock quantities, inventory movements, sales and order details, product research entries, keywords, research notes and related estimates.</p>
            <p><strong>Browser storage.</strong> The app uses browser local storage for your currency preference and a local copy/cache of product information. Older versions also used this storage when moving existing product records into the cloud account. Browser storage is held on the device and browser you use.</p>
            <p><strong>Product discovery requests.</strong> If you use Product Hunter, the current function can receive the selected marketplace, target country, keyword and requested result limit. A live marketplace data provider is not currently connected, so this function does not currently return live marketplace listings.</p>
            <p>Please avoid entering payment-card details, passwords, or sensitive personal information into product names, notes or other free-text fields.</p>

            <h2>3. How information is used</h2>
            <p>Information is used to create and manage your account; provide the calculators and workspace features you request; save, display and update your products, inventory, sales and research records; respond to support enquiries; maintain and troubleshoot the service; and help protect accounts and the website.</p>

            <h2>4. Service providers and data providers</h2>
            <p>We use trusted service providers to support account authentication, cloud data storage, website hosting, website security and the operation of ProfitPilot. These providers may process account details, workspace information or technical information where this is necessary to deliver, maintain and protect their services on our behalf.</p>
            <p>We also use a currency-rate service to obtain reference exchange rates. Requests for exchange-rate information use currency codes and do not include your product or sales records.</p>
            <p>ProfitPilot may use external data providers to support product research, marketplace information and other features. We will explain the relevant use when such features are introduced. At present, a live marketplace research data provider is not connected to Product Hunter, so it does not currently return live marketplace listings.</p>
            <p>We do not sell your personal information. We do not intentionally share your private business records with unrelated organisations for their own marketing. Service providers are expected to handle information in accordance with their service terms, applicable privacy requirements and the arrangements under which they provide services to us.</p>

            <h2>5. Legal grounds for processing</h2>
            <p>Where UK data protection law applies, information is generally processed where it is necessary to provide the service you request, to pursue legitimate interests such as operating, maintaining and securing ProfitPilot, or to comply with a legal obligation. If a particular activity requires consent, we will request it and explain how to withdraw it.</p>

            <h2>6. Storage, security and retention</h2>
            <p>Workspace records are stored in the relevant cloud database tables and some product information and preferences may also be present in your browser storage. We take reasonable steps to operate the service responsibly, but no website or electronic storage method can be guaranteed completely secure.</p>
            <p>We keep information for as long as it is needed to provide the service, manage your account, deal with requests, meet legal requirements or resolve disputes. The exact retention period can depend on the type of record and the requirements of the service providers. You can delete certain product, sales and research records using the available app features. There is not currently an automatic account-deletion control in the app; contact us by email to request account closure and deletion of associated personal information. Some information may need to be retained where the law permits or requires it, or in service backups for a limited period.</p>

            <h2>7. International processing</h2>
            <p>Our hosting and infrastructure providers may process information in locations outside the United Kingdom. The location and transfer arrangements can depend on the provider, the service configuration and its current contractual terms. Where applicable data protection law requires safeguards for an international transfer, the relevant provider arrangements must be used. You can contact us if you would like further information about the providers involved.</p>

            <h2>8. Cookies and similar technologies</h2>
            <p>The application uses browser storage for selected preferences and product information, and our sign-in service may use browser storage to maintain your session. Your browser and service providers may also process technical information required to deliver and protect the website. This policy will be updated if additional analytics, advertising or other tracking technologies are introduced.</p>

            <h2>9. Your data protection rights</h2>
            <p>Depending on the circumstances, you may have the right to request access to your personal information, ask for inaccurate information to be corrected, request erasure or restriction, object to certain processing, or request data portability. These rights are subject to legal conditions and exceptions. To make a request, email <a href="mailto:mountainforge786@gmail.com">mountainforge786@gmail.com</a>.</p>

            <h2>10. Changes and contact</h2>
            <p>We may update this policy when ProfitPilot or its data handling changes. The latest version will be published on this page. For privacy questions or requests, contact Roman Eli at <a href="mailto:mountainforge786@gmail.com">mountainforge786@gmail.com</a> or by post at the address in section 1.</p>
          </>
        ) : (
          <>
            <p>These Terms of Service apply when you access or use the ProfitPilot website and workspace. By using the service, you agree to these terms.</p>

            <h2>1. About ProfitPilot</h2>
            <p>ProfitPilot is an independent software project operated by Roman Eli, an individual developer based in England. Questions about these terms can be sent to <a href="mailto:mountainforge786@gmail.com">mountainforge786@gmail.com</a>.</p>

            <h2>2. The service and availability</h2>
            <p>ProfitPilot provides ecommerce tools that may include profit and pricing calculations, product and inventory management, sales records, analytics, VAT calculations, and product and keyword research. Features may change as the service develops. The Free, Basic and Premium membership options shown as “Coming Soon” are not currently available for purchase. No subscription fee is due unless a paid plan is formally launched and you separately agree to its price and terms.</p>
            <p>ProfitPilot is an early-stage service. We may update, suspend or discontinue features, and maintenance or technical issues may occasionally make the service unavailable. We do not promise uninterrupted access or that every feature will always be error-free.</p>

            <h2>3. Calculations and research are not professional advice</h2>
            <p>ProfitPilot is a business-support tool, not accounting, tax, legal, financial or other professional advice. Calculations depend on the figures and assumptions entered and may not include every cost or charge. Marketplace fees, taxes, VAT rules, exchange rates, shipping costs, platform policies and market conditions can change. Research information may be incomplete, estimated or user-entered. Product Hunter does not currently provide live marketplace listings. You are responsible for checking information independently before making decisions. We do not promise any level of sales, profit, ranking or business performance.</p>

            <h2>4. Your account and use of the service</h2>
            <p>You must provide accurate account information, keep your login details secure and tell us promptly if you believe your account has been accessed without permission. You are responsible for activity through your account. You must not use ProfitPilot unlawfully, attempt unauthorised access, disrupt the service, introduce malicious code, or misuse third-party platforms or services.</p>

            <h2>5. Your information</h2>
            <p>You remain responsible for the information and records you enter. You must have the rights and permissions needed to submit that information. You retain your rights in your own content. You authorise us to process it as reasonably necessary to provide, maintain and support ProfitPilot, as explained in the Privacy Policy. Keep your own copies of important records; ProfitPilot is not a guaranteed backup or archival service.</p>

            <h2>6. Intellectual property</h2>
            <p>The ProfitPilot name, branding, software, design and service materials are owned by or licensed to the operator. You may use the service for its intended purpose, but must not copy, redistribute, reverse engineer or commercially exploit the service except where the law allows or we give written permission. These terms do not transfer ownership of your own records to us.</p>

            <h2>7. Third-party services</h2>
            <p>ProfitPilot relies on third-party infrastructure providers and may refer to external websites or marketplaces. Those services are controlled by their respective providers and are subject to their own terms and privacy notices. We are not responsible for services that we do not control.</p>

            <h2>8. Suspension and termination</h2>
            <p>You may stop using ProfitPilot at any time. You can contact us to request account closure. We may restrict or suspend access where reasonably necessary to protect the service or users, address misuse, comply with law, or discontinue the service. Information retained after closure will be handled in accordance with the Privacy Policy and applicable law.</p>

            <h2>9. Liability</h2>
            <p>Nothing in these terms excludes or limits liability where doing so would be unlawful, including liability for fraud or for death or personal injury caused by negligence. To the extent permitted by law, we are not responsible for indirect or consequential losses, loss of profits or business opportunities, or decisions made solely in reliance on unverified calculations or research. If you use ProfitPilot as a consumer, these terms do not remove rights that cannot legally be excluded.</p>

            <h2>10. Changes to these terms</h2>
            <p>We may update these terms as the service changes. The latest version will be available on this page. Continued use after updated terms are published means you accept the updated terms, to the extent permitted by law.</p>

            <h2>11. Governing law</h2>
            <p>These terms are governed by the laws of England and Wales. The courts of England and Wales will have jurisdiction, subject to any mandatory legal rights that apply to you.</p>

            <h2>12. Contact</h2>
            <p>Roman Eli, ProfitPilot<br />10 Butterwick Close, Manchester, M12 5RA, United Kingdom<br /><a href="mailto:mountainforge786@gmail.com">mountainforge786@gmail.com</a></p>
          </>
        )}

        <div className="legal-document-footer">
          <button onClick={onBack}>← Back to ProfitPilot</button>
          <a href="mailto:mountainforge786@gmail.com">Contact ProfitPilot</a>
        </div>
      </article>
    </main>
  )
}
