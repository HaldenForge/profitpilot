
import InsightPanel from './InsightPanel'
import { useEffect, useMemo, useState } from 'react'
import { useProducts } from './ProductsContext'
import { supabase } from './lib/supabase'

type InventoryMovement = {
  id: string
  product_id: string
  movement_type: 'Stock In' | 'Stock Out'
  quantity: number
  note: string | null
  created_at: string
}

export default function InventoryManager({
  currency,
}: {
  currency: string
}) {
  const { products, loading, error, recordStockMovement } = useProducts()

  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState('')
  const [movementType, setMovementType] = useState<'Stock In' | 'Stock Out'>('Stock In')
  const [quantity, setQuantity] = useState('1')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  const [movements, setMovements] = useState<InventoryMovement[]>([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [historyError, setHistoryError] = useState('')

  useEffect(() => {
    if (loading) return

    let active = true

    async function loadMovementHistory() {
      const { data, error } = await supabase
        .from('inventory_movements')
        .select('id, product_id, movement_type, quantity, note, created_at')
        .order('created_at', { ascending: false })

      if (!active) return

      if (error) {
        setHistoryError(error.message)
      } else {
        setMovements((data ?? []) as InventoryMovement[])
        setHistoryError('')
      }

      setHistoryLoading(false)
    }

    setHistoryLoading(true)
    void loadMovementHistory()

    window.addEventListener(
      'profitpilot-inventory-updated',
      loadMovementHistory
    )

    return () => {
      active = false
      window.removeEventListener(
        'profitpilot-inventory-updated',
        loadMovementHistory
      )
    }
  }, [loading, products])

  const money = (value: number) =>
    new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
    }).format(value)

  const totalUnits = products.reduce(
    (total, product) => total + product.stockQuantity,
    0
  )

  const inventoryValue = products.reduce(
    (total, product) => total + product.stockQuantity * product.productCost,
    0
  )

  const lowStockProducts = products.filter(
    (product) => product.stockQuantity <= product.lowStockThreshold
  )
  const outOfStockProducts = products.filter(
    (product) => product.stockQuantity === 0
  )

  const restockProducts = lowStockProducts.map((product) => ({
    ...product,
    restockQuantity: Math.max(
      0,
      product.lowStockThreshold + 1 - product.stockQuantity
    ),
  }))
  const filteredProducts = useMemo(
    () =>
      products.filter((product) =>
        `${product.name} ${product.marketplace}`
          .toLowerCase()
          .includes(search.toLowerCase())
      ),
    [products, search]
  )

  async function recordMovement(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const product = products.find((item) => item.id === selectedId)
    const amount = Number(quantity)

    if (!product) {
      alert('Please select a product.')
      return
    }

    if (!Number.isInteger(amount) || amount <= 0) {
      alert('Please enter a whole number greater than zero.')
      return
    }

    if (movementType === 'Stock Out' && amount > product.stockQuantity) {
      alert('You cannot remove more stock than you currently have.')
      return
    }

    setSaving(true)

    try {
      await recordStockMovement(selectedId, movementType, amount, note)

      setQuantity('1')
      setNote('')
      alert('Stock quantity updated successfully.')
    } catch {
      alert('Could not update stock. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="product-manager inventory-manager">
      {products.length > 0 && <InsightPanel area="Inventory" level={restockProducts.length ? 'warning' : 'positive'} title={restockProducts.length ? 'Stock needs attention' : 'Stock levels are above saved thresholds'} explanation={restockProducts.length ? `${outOfStockProducts.length} product(s) are out of stock and ${lowStockProducts.length} are at or below their low-stock threshold.` : 'No saved product is currently at or below its low-stock threshold.'} action={restockProducts.length ? 'Review supplier lead times and plan replenishment. Record stock-in only when stock has actually arrived.' : 'Keep monitoring stock movements and review thresholds when demand changes.'} evidence={restockProducts.slice(0,4).map(p => `${p.name}: ${p.stockQuantity} left`).join(' · ') || `${totalUnits} total units recorded`} />}
      <div className="section-heading">
        <div>
          <h2>Inventory Management</h2>
          <p>Monitor stock levels and manage available inventory.</p>
        </div>
      </div>

            {lowStockProducts.length > 0 && (
        <div className="product-empty" role="alert">
          <h3>
            {outOfStockProducts.length > 0
              ? 'Inventory Warning'
              : 'Low Stock Warning'}
          </h3>

          <p>
            {outOfStockProducts.length} product(s) are out of stock.
            {' '}
            {lowStockProducts.length} product(s) need restocking.
          </p>
        </div>
      )}<div className="product-profit-summary">
        <div>
          <span>Total stock units</span>
          <strong>{totalUnits}</strong>
        </div>
        <div>
          <span>Inventory value (at product cost)</span>
          <strong>{money(inventoryValue)}</strong>
        </div>
        <div>
          <span>Low-stock products</span>
          <strong>{lowStockProducts.length}</strong>
        </div>
      </div>

      <form className="product-form" onSubmit={recordMovement}>
        <h3>Record Stock Movement</h3>

        <div className="product-form-grid">
          <label>
            Select product
            <select
              value={selectedId}
              onChange={(event) => setSelectedId(event.target.value)}
              required
            >
              <option value="">Choose a product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} — {product.stockQuantity} in stock
                </option>
              ))}
            </select>
          </label>

          <label>
            Movement type
            <select
              value={movementType}
              onChange={(event) =>
                setMovementType(event.target.value as 'Stock In' | 'Stock Out')
              }
            >
              <option value="Stock In">Stock In</option>
              <option value="Stock Out">Stock Out</option>
            </select>
          </label>

          <label>
            Quantity
            <input
              type="number"
              min="1"
              step="1"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              required
            />
          </label>

          <label>
            Note (optional)
            <input
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="e.g. New delivery or customer order"
            />
          </label>
        </div>

        <div className="product-form-actions">
          <button type="submit" disabled={saving || loading || products.length === 0}>
            {saving ? 'Updating...' : 'Update Stock'}
          </button>
        </div>
      </form>

      {error && (
        <p role="alert" className="product-empty">
          {error}
        </p>
      )}

      <div className="section-heading">
        <div>
          <h3>Stock Overview</h3>
          <p>Current quantities and low-stock warnings.</p>
        </div>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search products..."
          aria-label="Search inventory"
        />
      </div>

      {loading ? (
        <p>Loading inventory...</p>
      ) : products.length === 0 ? (
        <p className="product-empty">Add products first to manage inventory.</p>
      ) : (
        <div className="product-table-wrap">
          <table className="product-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Marketplace</th>
                <th>Stock quantity</th>
                <th>Low-stock threshold</th>
                <th>Stock value</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => {
                const isLow =
                  product.stockQuantity <= product.lowStockThreshold

                return (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>{product.marketplace}</td>
                    <td>{product.stockQuantity}</td>
                    <td>{product.lowStockThreshold}</td>
                    <td>
                      {money(product.stockQuantity * product.productCost)}
                    </td>
                    <td>
                      <span className={isLow ? 'inventory-low' : 'inventory-ok'}>
                        {isLow ? 'Low stock' : 'In stock'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="section-heading">
        <div>
          <h3>Inventory Movement History</h3>
          <p>Track every stock addition and removal.</p>
        </div>
      </div>

      {historyLoading ? (
        <p>Loading movement history...</p>
      ) : historyError ? (
        <p role="alert" className="product-empty">
          Could not load movement history: {historyError}
        </p>
      ) : movements.length === 0 ? (
        <p className="product-empty">No stock movements recorded yet.</p>
      ) : (
        <div className="product-table-wrap">
          <table className="product-table">
            <thead>
              <tr>
                <th>Date and time</th>
                <th>Product</th>
                <th>Movement</th>
                <th>Quantity</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((movement) => {
                const product = products.find(
                  (item) => item.id === movement.product_id
                )

                return (
                  <tr key={movement.id}>
                    <td>{new Date(movement.created_at).toLocaleString()}</td>
                    <td>{product?.name ?? 'Deleted product'}</td>
                    <td>
                      <span
                        className={
                          movement.movement_type === 'Stock In'
                            ? 'inventory-ok'
                            : 'inventory-low'
                        }
                      >
                        {movement.movement_type}
                      </span>
                    </td>
                    <td>{movement.quantity}</td>
                    <td>{movement.note || '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {restockProducts.length > 0 && (
        <div className="product-empty" role="alert">
          <h3>Restocking Required</h3>

          {restockProducts.map((product) => (
            <p key={product.id}>
              <strong>{product.name}</strong> —{' '}
              {product.stockQuantity === 0
                ? 'OUT OF STOCK'
                : `${product.stockQuantity} units remaining`}
              {' | '}
              Order at least {product.restockQuantity} more{' '}
              {product.restockQuantity === 1 ? 'unit' : 'units'}
              {' '}to reach the threshold of {product.lowStockThreshold}.
            </p>
          ))}
        </div>
      )}

    </section>
  )
}
