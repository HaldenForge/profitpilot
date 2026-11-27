export type ProductValidationInput = {
  name: string
  marketplace: string
  productCost: number
  sellingPrice: number
  shippingCost: number
  feePercent: number
  stockQuantity: number
  lowStockThreshold: number
}

export type SaleValidationInput = {
  productId: string | null
  orderId: string
  productName: string
  marketplace: string
  quantity: number
  sellingPrice: number
  productCost: number
  shippingCost: number
  feePercent: number
  orderStatus: string
  orderDate: string
}

function validNonNegativeNumber(value: number): boolean {
  return Number.isFinite(value) && value >= 0
}

function isValidDate(value: string): boolean {
  if (!/^\\d{4}-\\d{2}-\\d{2}$/.test(value)) return false
  const parsed = new Date(`${value}T00:00:00.000Z`)
  return !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
}

export function validateProductInput(product: ProductValidationInput): string | null {
  if (!product.name.trim()) return 'Please enter a product name.'
  if (!product.marketplace.trim()) return 'Please select a marketplace.'

  const amounts = [
    product.productCost,
    product.sellingPrice,
    product.shippingCost,
  ]
  if (!amounts.every(validNonNegativeNumber)) {
    return 'Product cost, selling price and shipping cost must be valid non-negative numbers.'
  }

  if (!Number.isFinite(product.feePercent) || product.feePercent < 0 || product.feePercent > 100) {
    return 'Marketplace fee must be between 0% and 100%.'
  }

  if (!Number.isInteger(product.stockQuantity) || product.stockQuantity < 0) {
    return 'Stock quantity must be a whole number of 0 or more.'
  }

  if (!Number.isInteger(product.lowStockThreshold) || product.lowStockThreshold < 0) {
    return 'Low-stock threshold must be a whole number of 0 or more.'
  }

  return null
}

export function validateSaleInput(sale: SaleValidationInput): string | null {
  if (!sale.productId) return 'Please select a product.'
  if (!sale.orderId.trim()) return 'Please enter an order ID.'
  if (!sale.productName.trim() || !sale.marketplace.trim()) {
    return 'The selected product details are incomplete.'
  }
  if (!Number.isInteger(sale.quantity) || sale.quantity < 1) {
    return 'Order quantity must be a whole number of at least 1.'
  }

  const amounts = [sale.sellingPrice, sale.productCost, sale.shippingCost]
  if (!amounts.every(validNonNegativeNumber)) {
    return 'Selling price, product cost and shipping cost must be valid non-negative numbers.'
  }

  if (!Number.isFinite(sale.feePercent) || sale.feePercent < 0 || sale.feePercent > 100) {
    return 'Marketplace fee must be between 0% and 100%.'
  }

  if (!['Pending', 'Shipped', 'Delivered', 'Cancelled'].includes(sale.orderStatus)) {
    return 'Please select a valid order status.'
  }

  if (!isValidDate(sale.orderDate)) return 'Please enter a valid order date.'

  return null
}
