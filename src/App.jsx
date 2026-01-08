import { useState, useEffect } from 'react'
import './index.css'

// Initial data definition
const INITIAL_ITEMS = [
  { id: 'fresh-meat', name: '鮮肉包', defaultPrice: 24 },
  { id: 'cabbage', name: '高麗菜包', defaultPrice: 22 },
  { id: 'bean-paste', name: '豆沙包', defaultPrice: 22 },
  { id: 'flower-roll', name: '花捲', defaultPrice: 22 },
  { id: 'taro', name: '芋頭饅頭', defaultPrice: 22 },
  { id: 'multigrain', name: '雜糧饅頭', defaultPrice: 22 },
  { id: 'white', name: '白饅頭', defaultPrice: 18 },
  { id: 'brown-sugar', name: '紅糖饅頭', defaultPrice: 18 },
]

const DISCOUNT_TRIGGERS = ['cabbage', 'bean-paste', 'flower-roll', 'multigrain']
const DISCOUNT_VALUE_ITEM_ID = 'taro'

function App() {
  const [items, setItems] = useState(() => {
    // Load from local storage or use initial default
    const saved = localStorage.getItem('baozi-data-v1')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        console.error("Failed to parse local storage", e)
      }
    }
    // Initialize with default quantity 2
    return INITIAL_ITEMS.map(item => ({
      ...item,
      price: item.defaultPrice,
      quantity: 2
    }))
  })

  // Save to local storage whenever items change
  useEffect(() => {
    localStorage.setItem('baozi-data-v1', JSON.stringify(items))
  }, [items])

  const handleUpdate = (id, field, value) => {
    const numValue = field === 'name' ? value : Number(value)
    // Prevent negative numbers for price/qty
    if (field !== 'name' && numValue < 0) return

    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, [field]: numValue } : item
    ))
  }

  // Derived Calculations
  const totalQuantity = items.reduce((sum, item) => sum + (item.quantity || 0), 0)
  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  // Discount Logic:
  // If Total Quantity < 10: Actual Amount = Total Price
  // Else (Total Quantity >= 10):
  //   If (cabbage OR bean-paste OR flower-roll OR taro OR multigrain) quantity >= 1:
  //      Actual Amount = Total Price - Price of "Taro Mantou"
  //   Else If (white OR brown-sugar) quantity >= 1:
  //      Actual Amount = Total Price - Price of "White Mantou"

  let actualAmount = totalPrice
  let discountValue = 0

  if (totalQuantity >= 10) {
    const tier1Triggers = ['cabbage', 'bean-paste', 'flower-roll', 'taro', 'multigrain']
    const hasTier1 = items.some(item => tier1Triggers.includes(item.id) && item.quantity >= 1)

    if (hasTier1) {
      const taroItem = items.find(item => item.id === 'taro')
      discountValue = taroItem ? taroItem.price : 22
    } else {
      const tier2Triggers = ['white', 'brown-sugar']
      const hasTier2 = items.some(item => tier2Triggers.includes(item.id) && item.quantity >= 1)

      if (hasTier2) {
        const whiteItem = items.find(item => item.id === 'white')
        discountValue = whiteItem ? whiteItem.price : 18
      }
    }
  }

  if (discountValue > 0) {
    actualAmount = totalPrice - discountValue
  }

  const isDiscountActive = discountValue > 0

  return (
    <div className="app-container">
      <h1 className="title">包子快計</h1>

      <div className="glass-card">
        {/* Header Row */}
        <div className="header-row">
          <div>品項</div>
          <div style={{ textAlign: 'center' }}>單價</div>
          <div style={{ textAlign: 'center' }}>數量</div>
          <div style={{ textAlign: 'right' }}>小計</div>
        </div>

        {/* List */}
        <div>
          {items.map(item => (
            <div key={item.id} className="item-row">
              <div className="item-name">{item.name}</div>

              {/* Price Input */}
              <div className="control-group">
                <span className="input-label">單價</span>
                <button className="btn-control" onClick={() => handleUpdate(item.id, 'price', item.price - 1)}>−</button>
                <input
                  type="number"
                  className="input-ghost"
                  value={item.price}
                  onChange={(e) => handleUpdate(item.id, 'price', e.target.value)}
                  onFocus={(e) => e.target.select()}
                />
                <button className="btn-control" onClick={() => handleUpdate(item.id, 'price', item.price + 1)}>+</button>
              </div>

              {/* Qty Input */}
              <div className="control-group">
                <span className="input-label">數量</span>
                <button className="btn-control" onClick={() => handleUpdate(item.id, 'quantity', item.quantity - 1)}>−</button>
                <input
                  type="number"
                  className="input-ghost"
                  value={item.quantity}
                  onChange={(e) => handleUpdate(item.id, 'quantity', e.target.value)}
                  onFocus={(e) => e.target.select()}
                />
                <button className="btn-control" onClick={() => handleUpdate(item.id, 'quantity', item.quantity + 1)}>+</button>
              </div>

              <div className="subtotal">
                {(item.price * item.quantity).toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="summary-section">
          <div className="summary-row">
            <span>總數量</span>
            <span className="summary-value">{totalQuantity}</span>
          </div>
          <div className="summary-row">
            <span>總價</span>
            <span className="summary-value">{totalPrice.toLocaleString()}</span>
          </div>

          <div className="total-highlight">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              實際金額
              {isDiscountActive && (
                <span className="discount-badge">
                  - {discountValue}
                </span>
              )}
            </div>
            <div className="final-price">
              {actualAmount.toLocaleString()}
            </div>
          </div>
          {isDiscountActive && (
            <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-scnd)', marginTop: '0.5rem' }}>
              {/* Description removed as requested */}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
