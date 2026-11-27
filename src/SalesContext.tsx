
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { supabase } from './lib/supabase'
import { validateSaleInput } from './lib/inputValidation'

export type SaleStatus =
  | 'Pending'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled'

export type Sale = {
  id: string
  userId: string
  productId: string | null
  orderId: string
  productName: string
  marketplace: string
  quantity: number
  sellingPrice: number
  productCost: number
  shippingCost: number
  feePercent: number
  orderStatus: SaleStatus
  orderDate: string
  createdAt: string
}

export type SaleInput = Omit<
  Sale,
  'id' | 'userId' | 'createdAt'
>

type DatabaseSale = {
  id: string
  user_id: string
  product_id: string | null
  order_id: string
  product_name: string
  marketplace: string
  quantity: number
  selling_price: number
  product_cost: number
  shipping_cost: number
  fee_percent: number
  order_status: SaleStatus
  order_date: string
  created_at: string
}

type SalesContextType = {
  sales: Sale[]
  loading: boolean
  error: string
  addSale: (sale: SaleInput) => Promise<void>
  updateSale: (id: string, sale: SaleInput) => Promise<void>
  deleteSale: (id: string) => Promise<void>
}

const SalesContext = createContext<SalesContextType | undefined>(
  undefined
)

function fromDatabase(item: DatabaseSale): Sale {
  return {
    id: item.id,
    userId: item.user_id,
    productId: item.product_id,
    orderId: item.order_id,
    productName: item.product_name,
    marketplace: item.marketplace,
    quantity: Number(item.quantity),
    sellingPrice: Number(item.selling_price),
    productCost: Number(item.product_cost),
    shippingCost: Number(item.shipping_cost),
    feePercent: Number(item.fee_percent),
    orderStatus: item.order_status,
    orderDate: item.order_date,
    createdAt: item.created_at,
  }
}

export function SalesProvider({
  userId,
  children,
}: {
  userId: string
  children: ReactNode
}) {
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadSales() {
      setLoading(true)
      setError('')

      try {
        const { data, error: fetchError } = await supabase
          .from('sales')
          .select('*')
          .eq('user_id', userId)
          .order('order_date', { ascending: false })

        if (fetchError) throw fetchError

        if (active) {
          setSales(((data ?? []) as DatabaseSale[]).map(fromDatabase))
        }
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Could not load your sales.'
          )
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadSales()

    return () => {
      active = false
    }
  }, [userId])

  const addSale = useCallback(async (sale: SaleInput) => {
    setError('')
    const validationError = validateSaleInput(sale)
    if (validationError) {
      setError(validationError)
      throw new Error(validationError)
    }

    const { data, error: insertError } = await supabase.rpc(
      'record_sale_with_stock',
      {
        p_product_id: sale.productId,
        p_order_id: sale.orderId,
        p_product_name: sale.productName,
        p_marketplace: sale.marketplace,
        p_quantity: sale.quantity,
        p_selling_price: sale.sellingPrice,
        p_product_cost: sale.productCost,
        p_shipping_cost: sale.shippingCost,
        p_fee_percent: sale.feePercent,
        p_order_status: sale.orderStatus,
        p_order_date: sale.orderDate,
      }
    )

    if (insertError) {
      setError(insertError.message)
      throw insertError
    }

    if (!data) {
      throw new Error('The order could not be saved.')
    }

    setSales((current) =>
      [fromDatabase(data as DatabaseSale), ...current].sort(
        (a, b) => b.orderDate.localeCompare(a.orderDate)
      )
    )

    window.dispatchEvent(new Event('profitpilot-inventory-updated'))
  }, [])

  const updateSale = useCallback(async (
    id: string,
    sale: SaleInput
  ) => {
    setError('')
    const validationError = validateSaleInput(sale)
    if (validationError) {
      setError(validationError)
      throw new Error(validationError)
    }

    const { data, error: updateError } = await supabase.rpc(
      'update_sale_with_stock',
      {
        p_sale_id: id,
        p_product_id: sale.productId,
        p_order_id: sale.orderId,
        p_product_name: sale.productName,
        p_marketplace: sale.marketplace,
        p_quantity: sale.quantity,
        p_selling_price: sale.sellingPrice,
        p_product_cost: sale.productCost,
        p_shipping_cost: sale.shippingCost,
        p_fee_percent: sale.feePercent,
        p_order_status: sale.orderStatus,
        p_order_date: sale.orderDate,
      }
    )

    if (updateError) {
      setError(updateError.message)
      throw updateError
    }

    if (!data) {
      throw new Error('The order could not be updated.')
    }

    const updatedSale = fromDatabase(data as DatabaseSale)

    setSales((current) =>
      current
        .map((item) => item.id === id ? updatedSale : item)
        .sort((a, b) => b.orderDate.localeCompare(a.orderDate))
    )

    window.dispatchEvent(new Event('profitpilot-inventory-updated'))
  }, [])

  const deleteSale = useCallback(async (id: string) => {
    setError('')

    const { error: deleteError } = await supabase.rpc(
      'delete_sale_with_stock',
      {
        p_sale_id: id,
      }
    )

    if (deleteError) {
      setError(deleteError.message)
      throw deleteError
    }

    setSales((current) =>
      current.filter((item) => item.id !== id)
    )

    window.dispatchEvent(new Event('profitpilot-inventory-updated'))
  }, [])

  return (
    <SalesContext.Provider
      value={{
        sales,
        loading,
        error,
        addSale,
        updateSale,
        deleteSale,
      }}
    >
      {children}
    </SalesContext.Provider>
  )
}

// This context hook is intentionally exported alongside its provider.
// eslint-disable-next-line react-refresh/only-export-components
export function useSales() {
  const context = useContext(SalesContext)

  if (!context) {
    throw new Error('useSales must be used inside SalesProvider.')
  }

  return context
}
