
import { useProducts } from './ProductsContext'

export default function InventoryNotifications() {
  const { products, loading } = useProducts()

  const lowStockProducts = products.filter(
    (product) => product.stockQuantity <= product.lowStockThreshold
  )

  const outOfStockCount = products.filter(
    (product) => product.stockQuantity === 0
  ).length

  if (loading) {
    return null
  }

  return (
    <section className="inventory-notifications">
      <div className="inventory-notifications-heading">
        <div>
          <span className="eyebrow">STOCK MONITOR</span>
          <h2>Inventory Notifications</h2>
          <p>
            {lowStockProducts.length === 0
              ? 'All your products have healthy stock levels.'
              : `${lowStockProducts.length} product(s) need your attention.`}
          </p>
        </div>

        <span className={`inventory-alert-count ${lowStockProducts.length > 0 ? 'has-alerts' : ''}`}>
          {lowStockProducts.length} {lowStockProducts.length === 1 ? 'alert' : 'alerts'}
        </span>
      </div>

      {lowStockProducts.length > 0 ? (
        <div className="inventory-notification-list">
          {lowStockProducts.map((product) => {
            const restockQuantity = Math.max(
              0,
              product.lowStockThreshold + 1 - product.stockQuantity
            )

            return (
              <div className="inventory-notification-item" key={product.id}>
                <div>
                  <strong>{product.name}</strong>
                  <p>
                    {product.stockQuantity === 0
                      ? 'OUT OF STOCK'
                      : `${product.stockQuantity} ${product.stockQuantity === 1 ? 'unit' : 'units'} remaining`}
                    {' · '}
                    Restock {restockQuantity} {restockQuantity === 1 ? 'unit' : 'units'}
                  </p>
                </div>
                <span className="inventory-notification-status">
                  {product.stockQuantity === 0 ? 'Out of stock' : 'Low stock'}
                </span>
              </div>
            )
          })}
        </div>
      ) : (
        <p className="inventory-all-clear">
          ✓ No products currently need restocking.
        </p>
      )}

            {outOfStockCount > 0 && (
        <p className="inventory-out-of-stock">
          {outOfStockCount} product(s) are completely out of stock.
        </p>
      )}<button
        className="inventory-go-button"
        onClick={() => {
          document.getElementById('inventory-section')?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          })
        }}
      >
        Go to Inventory →
      </button>
    </section>
  )
}
