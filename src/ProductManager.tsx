import { useMemo, useState, type FormEvent } from 'react'
import { useProducts, type Product } from './ProductsContext'

const marketplaces = ['Amazon FBA', 'Amazon FBM', 'eBay', 'Etsy', 'Shopify']

export default function ProductManager({
  currency,
}: {
  currency: string
}) {
  const {
    products,
    loading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
  } = useProducts()

  const [name, setName] = useState('')
  const [marketplace, setMarketplace] = useState('Amazon FBA')
  const [productCost, setProductCost] = useState('0')
  const [sellingPrice, setSellingPrice] = useState('0')
  const [shippingCost, setShippingCost] = useState('0')
  const [feePercent, setFeePercent] = useState('15')
  const [stockQuantity, setStockQuantity] = useState('0')
const [lowStockThreshold, setLowStockThreshold] = useState('5')
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const money = (value: number) =>
    new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
    }).format(value)

  const profit = (product: Product) =>
    product.sellingPrice -
    product.productCost -
    product.shippingCost -
    (product.sellingPrice * product.feePercent / 100)

  const filteredProducts = useMemo(
    () =>
      products.filter((product) =>
        `${product.name} ${product.marketplace}`
          .toLowerCase()
          .includes(search.toLowerCase())
      ),
    [products, search]
  )

  function resetForm() {
    setName('')
    setMarketplace('Amazon FBA')
    setProductCost('0')
    setSellingPrice('0')
    setShippingCost('0')
    setFeePercent('15')
setStockQuantity('0')
setLowStockThreshold('5')
setLowStockThreshold('5')
    setEditingId(null)
  }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const values = [
      Number(productCost),
      Number(sellingPrice),
      Number(shippingCost),
      Number(feePercent),
    ]

    if (
      !name.trim() ||
      values.some((value) => !Number.isFinite(value) || value < 0)
    ) {
      alert('Please enter a product name and valid non-negative numbers.')
      return
    }

    const product = {
  name: name.trim(),
  marketplace,
  productCost: values[0],
  sellingPrice: values[1],
  shippingCost: values[2],
  feePercent: values[3],
  stockQuantity: Number(stockQuantity),
  lowStockThreshold: Number(lowStockThreshold),
}

    setSaving(true)

    try {
      if (editingId) {
        await updateProduct(editingId, product)
      } else {
        await addProduct(product)
      }

      resetForm()
    } catch (deleteError) {
      window.alert(
        deleteError instanceof Error
          ? deleteError.message
          : 'Could not delete product. Please try again.'
      )
    } finally {
      setSaving(false)
    }
  }

  function editProduct(product: Product) {
    setEditingId(product.id)
    setName(product.name)
    setMarketplace(product.marketplace)
    setProductCost(String(product.productCost))
    setSellingPrice(String(product.sellingPrice))
    setShippingCost(String(product.shippingCost))
    setFeePercent(String(product.feePercent))
    setStockQuantity(String(product.stockQuantity))
setLowStockThreshold(String(product.lowStockThreshold))
  }

  async function removeProduct(id: string) {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return
    }

    try {
      await deleteProduct(id)
      if (editingId === id) resetForm()
    } catch {
      // The shared context displays the Supabase error.
    }
  }

  const totalProfit = products.reduce(
    (total, product) => total + profit(product),
    0
  )

  return (
    <section className="product-manager">
      <div className="section-heading">
        <div>
          <h2>Product Management</h2>
          <p>Manage your products and track estimated profit.</p>
        </div>
        <div className="product-summary">
          <span>Total products</span>
          <strong>{products.length}</strong>
        </div>
      </div>

      <div className="product-profit-summary">
        <span>Combined estimated profit</span>
        <strong>{money(totalProfit)}</strong>
      </div>

      <form className="product-form" onSubmit={saveProduct}>
        <h3>{editingId ? 'Edit Product' : 'Add New Product'}</h3>

        <div className="product-form-grid">
          <label>
            Product name
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Handmade wallet"
              required
            />
          </label>

          <label>
            Marketplace
            <select
              value={marketplace}
              onChange={(event) => setMarketplace(event.target.value)}
            >
              {marketplaces.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>

          <label>
            Product cost ({currency})
            <input
              type="number"
              min="0"
              step="0.01"
              value={productCost}
              onChange={(event) => setProductCost(event.target.value)}
              required
            />
          </label>

          <label>
            Selling price ({currency})
            <input
              type="number"
              min="0"
              step="0.01"
              value={sellingPrice}
              onChange={(event) => setSellingPrice(event.target.value)}
              required
            />
          </label>

          <label>
            Shipping cost ({currency})
            <input
              type="number"
              min="0"
              step="0.01"
              value={shippingCost}
              onChange={(event) => setShippingCost(event.target.value)}
              required
            />
          </label>

          <label>
            Marketplace fee (%)
            <input
              type="number"
              min="0"
              step="0.01"
              value={feePercent}
              onChange={(event) => setFeePercent(event.target.value)}
              required
            />
          </label><label>
  Stock quantity
  <input
    type="number"
    min="0"
    step="1"
    value={stockQuantity}
    onChange={(event) => setStockQuantity(event.target.value)}
    required
  />
</label>

<label>
  Low-stock alert threshold
  <input
    type="number"
    min="0"
    step="1"
    value={lowStockThreshold}
    onChange={(event) => setLowStockThreshold(event.target.value)}
    required
  />
</label>
        </div>

        <div className="product-form-actions">
          <button type="submit" disabled={saving || loading}>
            {saving
              ? 'Saving...'
              : editingId
                ? 'Update Product'
                : 'Save Product'}
          </button>

          {editingId && (
            <button
              type="button"
              className="secondary-button"
              onClick={resetForm}
              disabled={saving}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {error && (
        <p role="alert" className="product-empty">
          {error}
        </p>
      )}

      <div className="product-list-heading">
        <h3>Your Products</h3>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search products..."
          aria-label="Search products"
        />
      </div>

      {loading ? (
        <p className="product-empty">Loading your cloud products...</p>
      ) : filteredProducts.length === 0 ? (
        <p className="product-empty">
          {products.length === 0
            ? 'No products added yet. Add your first product above.'
            : 'No products match your search.'}
        </p>
      ) : (
        <div className="product-table-wrap">
          <table className="product-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Marketplace</th>
                <th>Selling price</th>
                <th>Estimated profit</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>{product.marketplace}</td>
                  <td>{money(product.sellingPrice)}</td>
                  <td className={profit(product) >= 0 ? 'profit-positive' : 'profit-negative'}>
                    {money(profit(product))}
                  </td>
                  <td className="product-actions">
                    <button
                      type="button"
                      onClick={() => editProduct(product)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="delete-button"
                      onClick={() => void removeProduct(product.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="product-disclaimer">
        Profit is an estimate based on the costs and marketplace fee entered.
        Other taxes, advertising and additional fees are not included.
      </p>
    </section>
  )
}
