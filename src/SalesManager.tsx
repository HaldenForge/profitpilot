
import { useMemo, useState, type FormEvent } from 'react'
import { useProducts } from './ProductsContext'
import {
  useSales,
  type Sale,
  type SaleInput,
  type SaleStatus,
} from './SalesContext'

type SalesManagerProps = {
  currency: string
}

const emptyForm = {
  productId: '',
  orderId: '',
  quantity: '1',
  sellingPrice: '',
  productCost: '',
  shippingCost: '',
  feePercent: '',
  orderDate: new Date().toISOString().slice(0, 10),
  orderStatus: 'Pending' as SaleStatus,
}

export default function SalesManager({ currency }: SalesManagerProps) {
  const { products } = useProducts()
  const {
    sales,
    loading,
    error,
    addSale,
    updateSale,
    deleteSale,
  } = useSales()

  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  const money = (value: number) =>
    new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency,
    }).format(value)

  const selectedProduct = products.find(
    (product) => product.id === form.productId
  )

  const handleProductChange = (productId: string) => {
    const product = products.find((item) => item.id === productId)

    setForm((current) => ({
      ...current,
      productId,
      sellingPrice: product ? String(product.sellingPrice) : '',
      productCost: product ? String(product.productCost) : '',
      shippingCost: product ? String(product.shippingCost) : '',
      feePercent: product ? String(product.feePercent) : '',
    }))
  }

  const resetForm = () => {
    setForm(emptyForm)
    setEditingId(null)
    setMessage('')
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage('')

    if (!form.productId || !selectedProduct) {
      setMessage('Please select a product.')
      return
    }

    const quantity = Number(form.quantity)
    const sellingPrice = Number(form.sellingPrice)
    const productCost = Number(form.productCost)
    const shippingCost = Number(form.shippingCost)
    const feePercent = Number(form.feePercent)

    if (
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      !Number.isFinite(sellingPrice) ||
      sellingPrice < 0 ||
      !Number.isFinite(productCost) ||
      productCost < 0 ||
      !Number.isFinite(shippingCost) ||
      shippingCost < 0 ||
      !Number.isFinite(feePercent) ||
      feePercent < 0
    ) {
      setMessage('Please enter valid numbers. Quantity must be at least 1.')
      return
    }

    const sale: SaleInput = {
      productId: selectedProduct.id,
      orderId: form.orderId.trim(),
      productName: selectedProduct.name,
      marketplace: selectedProduct.marketplace,
      quantity,
      sellingPrice,
      productCost,
      shippingCost,
      feePercent,
      orderStatus: form.orderStatus,
      orderDate: form.orderDate,
    }

    if (!sale.orderId || !sale.orderDate) {
      setMessage('Please enter an order ID and order date.')
      return
    }

    setSaving(true)

    try {
      if (editingId) {
        await updateSale(editingId, sale)
        setMessage('Order updated successfully.')
      } else {
        await addSale(sale)
        setMessage('Sale recorded successfully.')
      }

      setForm(emptyForm)
      setEditingId(null)
    } catch (saveError) {
      setMessage(
        saveError instanceof Error
          ? saveError.message
          : 'Could not save this order.'
      )
    } finally {
      setSaving(false)
    }
  }

  const startEditing = (sale: Sale) => {
    setEditingId(sale.id)
    setMessage('')

    setForm({
      productId: sale.productId ?? '',
      orderId: sale.orderId,
      quantity: String(sale.quantity),
      sellingPrice: String(sale.sellingPrice),
      productCost: String(sale.productCost),
      shippingCost: String(sale.shippingCost),
      feePercent: String(sale.feePercent),
      orderDate: sale.orderDate,
      orderStatus: sale.orderStatus,
    })

    document.getElementById('sales-form')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this order?')) {
      return
    }

    try {
      await deleteSale(id)
      setMessage('Order deleted successfully.')

      if (editingId === id) {
        resetForm()
      }
    } catch (deleteError) {
      setMessage(
        deleteError instanceof Error
          ? deleteError.message
          : 'Could not delete this order.'
      )
    }
  }

  const filteredSales = useMemo(() => {
    const term = search.trim().toLowerCase()

    if (!term) return sales

    return sales.filter((sale) =>
      sale.orderId.toLowerCase().includes(term) ||
      sale.productName.toLowerCase().includes(term) ||
      sale.marketplace.toLowerCase().includes(term) ||
      sale.orderStatus.toLowerCase().includes(term)
    )
  }, [sales, search])

  const summary = useMemo(() => {
    const activeSales = sales.filter(
      (sale) => sale.orderStatus !== 'Cancelled'
    )

    const revenue = activeSales.reduce(
      (total, sale) => total + sale.sellingPrice * sale.quantity,
      0
    )

    const costs = activeSales.reduce(
      (total, sale) =>
        total +
        (
          sale.productCost +
          sale.shippingCost +
          sale.sellingPrice * sale.feePercent / 100
        ) * sale.quantity,
      0
    )

    return {
      orders: activeSales.length,
      revenue,
      costs,
      profit: revenue - costs,
    }
  }, [sales])

  const getProfit = (sale: Sale) => {
    if (sale.orderStatus === 'Cancelled') return 0

    const revenue = sale.sellingPrice * sale.quantity
    const costs =
      (
        sale.productCost +
        sale.shippingCost +
        sale.sellingPrice * sale.feePercent / 100
      ) * sale.quantity

    return revenue - costs
  }

  return (
    <section className="sales-manager" id="sales-manager">
      <div className="sales-heading">
        <div>
          <h2>Sales &amp; Order Tracking</h2>
          <p>Record orders and monitor your actual sales performance.</p>
        </div>
      </div>

      <div className="sales-summary">
        <div className="sales-summary-card">
          <span>Total Orders</span>
          <strong>{summary.orders}</strong>
        </div>

        <div className="sales-summary-card">
          <span>Total Sales</span>
          <strong>{money(summary.revenue)}</strong>
        </div>

        <div className="sales-summary-card">
          <span>Total Costs</span>
          <strong>{money(summary.costs)}</strong>
        </div>

        <div className="sales-summary-card">
          <span>Estimated Actual Profit</span>
          <strong>{money(summary.profit)}</strong>
        </div>
      </div>

      <div className="sales-form-card" id="sales-form">
        <h3>{editingId ? 'Edit Order' : 'Record a New Sale'}</h3>

        {products.length === 0 ? (
          <p>Please add a product in Product Management before recording a sale.</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="sales-form-grid">
              <label>
                Select Product
                <select
                  value={form.productId}
                  onChange={(event) =>
                    handleProductChange(event.target.value)
                  }
                  required
                >
                  <option value="">Choose a product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} ({product.marketplace})
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Order ID
                <input
                  value={form.orderId}
                  onChange={(event) =>
                    setForm({ ...form, orderId: event.target.value })
                  }
                  placeholder="e.g. 123-4567890-1234567"
                  required
                />
              </label>

              <label>
                Quantity
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={form.quantity}
                  onChange={(event) =>
                    setForm({ ...form, quantity: event.target.value })
                  }
                  required
                />
              </label>

              <label>
                Selling Price (per item)
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.sellingPrice}
                  onChange={(event) =>
                    setForm({ ...form, sellingPrice: event.target.value })
                  }
                  required
                />
              </label>

              <label>
                Product Cost (per item)
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.productCost}
                  onChange={(event) =>
                    setForm({ ...form, productCost: event.target.value })
                  }
                  required
                />
              </label>

              <label>
                Shipping Cost (per item)
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.shippingCost}
                  onChange={(event) =>
                    setForm({ ...form, shippingCost: event.target.value })
                  }
                  required
                />
              </label>

              <label>
                Marketplace Fee (%)
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.feePercent}
                  onChange={(event) =>
                    setForm({ ...form, feePercent: event.target.value })
                  }
                  required
                />
              </label>

              <label>
                Order Date
                <input
                  type="date"
                  value={form.orderDate}
                  onChange={(event) =>
                    setForm({ ...form, orderDate: event.target.value })
                  }
                  required
                />
              </label>

              <label>
                Order Status
                <select
                  value={form.orderStatus}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      orderStatus: event.target.value as SaleStatus,
                    })
                  }
                >
                  <option value="Pending">Pending</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </label>
            </div>

            {form.sellingPrice !== '' &&
              form.productCost !== '' &&
              form.shippingCost !== '' &&
              form.feePercent !== '' && (
                <p className="sales-profit-preview">
                  Estimated profit per item:{' '}
                  <strong>
                    {money(
                      Number(form.sellingPrice) -
                      Number(form.productCost) -
                      Number(form.shippingCost) -
                      Number(form.sellingPrice) *
                        Number(form.feePercent) / 100
                    )}
                  </strong>
                </p>
              )}

            <div className="sales-form-actions">
              <button type="submit" disabled={saving}>
                {saving
                  ? 'Saving...'
                  : editingId
                    ? 'Update Order'
                    : 'Record Sale'}
              </button>

              {editingId && (
                <button type="button" onClick={resetForm}>
                  Cancel Editing
                </button>
              )}
            </div>
          </form>
        )}

        {message && <p className="sales-message">{message}</p>}
        {error && <p className="sales-error">{error}</p>}
      </div>

      <div className="sales-history-card">
        <div className="sales-history-heading">
          <div>
            <h3>Sales History &amp; Orders</h3>
            <p>Review, edit and manage your recorded orders.</p>
          </div>

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search orders..."
            aria-label="Search orders"
          />
        </div>

        {loading ? (
          <p>Loading your sales...</p>
        ) : filteredSales.length === 0 ? (
          <p>No sales found. Record your first sale above.</p>
        ) : (
          <div className="sales-table-wrap">
            <table className="sales-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Product</th>
                  <th>Marketplace</th>
                  <th>Date</th>
                  <th>Qty</th>
                  <th>Sales</th>
                  <th>Profit</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredSales.map((sale) => (
                  <tr key={sale.id}>
                    <td>{sale.orderId}</td>
                    <td>{sale.productName}</td>
                    <td>{sale.marketplace}</td>
                    <td>{sale.orderDate}</td>
                    <td>{sale.quantity}</td>
                    <td>{money(sale.sellingPrice * sale.quantity)}</td>
                    <td>{money(getProfit(sale))}</td>
                    <td>
                      <span className={`sales-status status-${sale.orderStatus.toLowerCase()}`}>
                        {sale.orderStatus}
                      </span>
                    </td>
                    <td>
                      <div className="sales-row-actions">
                        <button
                          type="button"
                          onClick={() => startEditing(sale)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(sale.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="sales-disclaimer">
          Profit is an estimate based on the costs and marketplace fee entered
          for each order. It does not include taxes, advertising, refunds or
          other expenses unless you include them in your costs.
          Cancelled orders are excluded from the summary.
        </p>
      </div>
    </section>
  )
}
