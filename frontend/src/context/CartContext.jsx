import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem('syndycate_cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error("Failed to parse cart from local storage", error);
      return [];
    }
  });

  // Save cart to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem('syndycate_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, selectedSize) => {
    if (!selectedSize) {
      alert("Please select a size first!");
      return;
    }

    setCart((prevCart) => {
      // Check if product with same ID and SIZE already exists
      const existingItem = prevCart.find(item => item._id === product._id && item.size === selectedSize);

      // Get available stock
      const currentStock = product.stock;
      let sizeStock = 0;
      if (currentStock) {
        if (typeof currentStock.get === 'function') {
          sizeStock = currentStock.get(selectedSize) || 0;
        } else if (typeof currentStock === 'object') {
          sizeStock = currentStock[selectedSize] || 0;
        } else {
          sizeStock = Number(currentStock) || 0;
        }
      }

      if (existingItem) {
        if (existingItem.qty + 1 > sizeStock) {
          alert(`You already have all available items (${sizeStock}) in your bag.`);
          return prevCart;
        }
        return prevCart.map(item => 
          item._id === product._id && item.size === selectedSize 
          ? { ...item, qty: item.qty + 1 } : item
        );
      }

      // If it's a new item, check if stock is at least 1
      if (sizeStock <= 0) {
        alert("This item is currently sold out.");
        return prevCart;
      }
      
      // Add new item to cart
      return [...prevCart, { ...product, size: selectedSize, qty: 1 }];
    });
  };

  const removeFromCart = (id, size) => {
    setCart(prevCart => prevCart.filter(item => !(item._id === id && item.size === size)));
  };

  const updateQty = (id, size, delta) => {
    setCart(prevCart => prevCart.map(item => {
      if (item._id === id && item.size === size) {
        if (delta > 0) {
          const currentStock = item.stock;
          let sizeStock = 0;
          if (currentStock) {
            if (typeof currentStock.get === 'function') {
              sizeStock = currentStock.get(size) || 0;
            } else if (typeof currentStock === 'object') {
              sizeStock = currentStock[size] || 0;
            } else {
              sizeStock = Number(currentStock) || 0;
            }
          }

          if (item.qty + delta > sizeStock) {
            alert(`Only ${sizeStock} item(s) left in stock for size ${size}!`);
            return item;
          }
        }
        const newQty = Math.max(1, item.qty + delta);
        return { ...item, qty: newQty };
      }
      return item;
    }));
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // Clear coupon if cart becomes empty
  useEffect(() => {
    if (cart.length === 0) {
      setAppliedCoupon(null);
    }
  }, [cart]);

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      updateQty, 
      clearCart,
      appliedCoupon,
      setAppliedCoupon
    }}>
      {children}
    </CartContext.Provider>
  );
};
