
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { supabase } from './lib/supabase'

export type Product = {
  id: string
  name: string
  marketplace: string
  productCost: number
  sellingPrice: number
  shippingCost: number
  feePercent: number
  stockQuantity: number
  lowStockThreshold: number
}

type ProductInput = Omit<Product, 'id'>

type DatabaseProduct = {
  id: string
  name: string
  marketplace: string
  product_cost: number
  selling_price: number
  shipping_cost: number
  fee_percent: number
  stock_quantity: number
  low_stock_threshold: number
}

type ProductsContextType = {
  products: Product[]
  loading: boolean
  error: string
  addProduct: (product: ProductInput) => Promise<void>
  updateProduct: (id: string, product: ProductInput) => Promise<void>
  recordStockMovement: (
  id: string,
  movementType: 'Stock In' | 'Stock Out',
  quantity: number,
  note: string
) => Promise<number>
  deleteProduct: (id: string) => Promise<void>
}

const STORAGE_KEY = 'profitpilot-products'

const ProductsContext = createContext<ProductsContextType | undefined>(
  undefined
)

function fromDatabase(item: DatabaseProduct): Product {
  return {
    id: item.id,
    name: item.name,
    marketplace: item.marketplace,
    productCost: Number(item.product_cost),
    sellingPrice: Number(item.selling_price),
    shippingCost: Number(item.shipping_cost),
    feePercent: Number(item.fee_percent),
    stockQuantity: Number(item.stock_quantity),
    lowStockThreshold: Number(item.low_stock_threshold),
  }
}

type LegacyProduct = {
  id: string
  name: string
  marketplace: string
  productCost: number
  sellingPrice: number
  shippingCost: number
  feePercent: number
  stockQuantity?: number
  lowStockThreshold?: number
}

function readLegacyProducts(): Product[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return []

    const parsed: unknown = JSON.parse(saved)
    if (!Array.isArray(parsed)) return []

    return parsed.filter((item): item is LegacyProduct =>
      item !== null &&
      typeof item === 'object' &&
      typeof item.id === 'string' &&
      typeof item.name === 'string' &&
      typeof item.marketplace === 'string' &&
      Number.isFinite(item.productCost) &&
      Number.isFinite(item.sellingPrice) &&
      Number.isFinite(item.shippingCost) &&
      Number.isFinite(item.feePercent) &&
      (item.stockQuantity === undefined || Number.isFinite(item.stockQuantity)) &&
      (item.lowStockThreshold === undefined || Number.isFinite(item.lowStockThreshold))
    ).map((item) => ({
      ...item,
      stockQuantity: item.stockQuantity ?? 0,
      lowStockThreshold: item.lowStockThreshold ?? 5,
    }))
  } catch {
    return []
  }
}

export function ProductsProvider({
  userId,
  children,
}: {
  userId: string
  children: ReactNode
}) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadProducts() {
      setLoading(true)
      setError('')

      try {
        const { data, error: fetchError } = await supabase
          .from('products')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (fetchError) throw fetchError

        let databaseProducts = (data ?? []) as DatabaseProduct[]

        if (databaseProducts.length === 0) {
          const legacyProducts = readLegacyProducts()

          if (legacyProducts.length > 0) {
            const rows = legacyProducts.map((product) => ({
              user_id: userId,
              name: product.name,
              marketplace: product.marketplace,
              product_cost: product.productCost,
              selling_price: product.sellingPrice,
              shipping_cost: product.shippingCost,
              fee_percent: product.feePercent,
              stock_quantity: product.stockQuantity,
              low_stock_threshold: product.lowStockThreshold,
            }))

            const { data: imported, error: importError } = await supabase
              .from('products')
              .insert(rows)
              .select('*')

            if (importError) throw importError

            databaseProducts = (imported ?? []) as DatabaseProduct[]
          }
        }

        if (active) {
          const mapped = databaseProducts.map(fromDatabase)
          setProducts(mapped)

          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(mapped))
          } catch {
            // Cloud data remains available if browser storage is unavailable.
          }
        }
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Could not load your products.'
          )
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadProducts()

    return () => {
      active = false
    }
  }, [userId])

  useEffect(() => {
    async function refreshProducts() {
      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (fetchError || !data) return

      const mapped = (data as DatabaseProduct[]).map(fromDatabase)
      setProducts(mapped)

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mapped))
      } catch {
        // Cloud data remains available.
      }
    }

    window.addEventListener(
      'profitpilot-inventory-updated',
      refreshProducts
    )

    return () => {
      window.removeEventListener(
        'profitpilot-inventory-updated',
        refreshProducts
      )
    }
  }, [userId])

  const addProduct = useCallback(async (product: ProductInput) => {
    setError('')

    const { data, error: insertError } = await supabase
      .from('products')
      .insert({
        user_id: userId,
        name: product.name,
        marketplace: product.marketplace,
        product_cost: product.productCost,
        selling_price: product.sellingPrice,
        shipping_cost: product.shippingCost,
        fee_percent: product.feePercent,
        stock_quantity: product.stockQuantity,
        low_stock_threshold: product.lowStockThreshold,
      })
      .select('*')
      .single()

    if (insertError) {
      setError(insertError.message)
      throw insertError
    }

    const saved = fromDatabase(data as DatabaseProduct)
    setProducts((current) => {
      const updated = [saved, ...current]
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      } catch {
        // Cloud save has already succeeded.
      }
      return updated
    })
  }, [userId])

  const updateProduct = useCallback(async (
    id: string,
    product: ProductInput
  ) => {
    setError('')

    const { data, error: updateError } = await supabase
      .from('products')
      .update({
        name: product.name,
        marketplace: product.marketplace,
        product_cost: product.productCost,
        selling_price: product.sellingPrice,
        shipping_cost: product.shippingCost,
        fee_percent: product.feePercent,
        stock_quantity: product.stockQuantity,
        low_stock_threshold: product.lowStockThreshold,
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select('*')
      .single()

    if (updateError) {
      setError(updateError.message)
      throw updateError
    }

    const updatedProduct = fromDatabase(data as DatabaseProduct)

    setProducts((current) => {
      const updated = current.map((item) =>
        item.id === id ? updatedProduct : item
      )
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      } catch {
        // Cloud save has already succeeded.
      }
      return updated
    })
  }, [userId])

      const recordStockMovement = useCallback(async (
    id: string,
    movementType: 'Stock In' | 'Stock Out',
    quantity: number,
    note: string
  ): Promise<number> => {
    setError('')

    const { data, error: movementError } = await supabase.rpc(
      'record_stock_movement',
      {
        p_product_id: id,
        p_movement_type: movementType,
        p_quantity: quantity,
        p_note: note.trim() || null,
      }
    )

    if (movementError) {
      setError(movementError.message)
      throw movementError
    }

    const newStockQuantity = Number(data)

    setProducts((current) => {
      const updated = current.map((item) =>
        item.id === id
          ? { ...item, stockQuantity: newStockQuantity }
          : item
      )

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      } catch {
        // Cloud data remains available.
      }

      return updated
    })

    return newStockQuantity
  }, [])

  const deleteProduct = useCallback(async (id: string) => {
    setError('')

    const { error: deleteError } = await supabase.rpc(
      'delete_product_safely',
      {
        p_product_id: id,
      }
    )

    if (deleteError) {
      setError(deleteError.message)
      throw deleteError
    }

    setProducts((current) => {
      const updated = current.filter((item) => item.id !== id)
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      } catch {
        // Cloud delete has already succeeded.
      }
      return updated
    })
  }, [userId])

  return (
    <ProductsContext.Provider
      value={{
        products,
        loading,
        error,
        addProduct,
updateProduct,
recordStockMovement,
deleteProduct,
      }}
    >
      {children}
    </ProductsContext.Provider>
  )
}

export function useProducts() {
  const context = useContext(ProductsContext)

  if (!context) {
    throw new Error('useProducts must be used inside ProductsProvider.')
  }

  return context
}
