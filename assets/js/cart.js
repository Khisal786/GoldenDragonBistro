document.addEventListener("DOMContentLoaded", () => {
  let cart = [];
  let tableNumber = "1"; // Default fallback table
  const RESTAURANT_WHATSAPP = "923049999325"; // Target WhatsApp number without '+'

  // Check URL for table number (e.g., ?table=4)
  const urlParams = new URLSearchParams(window.location.search);
  const t = urlParams.get('table');
  if (t) {
    tableNumber = t;
    const tableBadge = document.getElementById('tableBadge');
    if (tableBadge) {
      tableBadge.innerText = `📍 Table ${t} Connected (Secure Session)`;
    }
  }

  const cartDrawer = document.getElementById("whatsapp-cart-drawer");
  const closeCartBtn = document.getElementById("close-cart-btn");
  const cartItemsList = document.getElementById("cart-items-list");
  const cartTotalPrice = document.getElementById("cart-total-price");
  const whatsappCheckoutBtn = document.getElementById("whatsapp-checkout-btn");
  const floatingCartBubble = document.getElementById("floatingCartBubble");

  // Open drawer when clicking the floating bubble if items exist
  if (floatingCartBubble) {
    floatingCartBubble.addEventListener("click", () => {
      if (cart.length > 0) {
        cartDrawer.classList.add("active");
      }
    });
  }

  // Add to cart listener from menu cards
  const buttons = document.querySelectorAll(".add-to-cart-btn");
  buttons.forEach(btn => {
    btn.addEventListener("click", (e) => {
      const name = e.target.getAttribute("data-name");
      const price = parseFloat(e.target.getAttribute("data-price"));
      
      const existing = cart.find(item => item.name === name);
      if (existing) {
        existing.qty += 1;
      } else {
        cart.push({ name, price, qty: 1 });
      }
      
      updateCartUI();
      cartDrawer.classList.add("active"); // Slide open drawer/modal
    });
  });

  // Close drawer
  if (closeCartBtn) {
    closeCartBtn.addEventListener("click", () => {
      cartDrawer.classList.remove("active");
    });
  }

  // Global function to modify quantity from inside the cart drawer (+ / - buttons)
  window.changeQuantity = function(name, amount) {
    const item = cart.find(i => i.name === name);
    if (item) {
      item.qty += amount;
      if (item.qty <= 0) {
        cart = cart.filter(i => i.name !== name);
      }
    }
    updateCartUI();
  };

  function updateCartUI() {
    const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

    // Update floating bubble state
    if (floatingCartBubble) {
      if (totalCount > 0) {
        floatingCartBubble.style.display = 'flex';
        const countEl = document.getElementById('bubbleCount');
        const totalEl = document.getElementById('bubbleTotal');
        if (countEl) countEl.innerText = totalCount + (totalCount === 1 ? ' item' : ' items');
        if (totalEl) totalEl.innerText = '$' + totalPrice.toFixed(2);
      } else {
        floatingCartBubble.style.display = 'none';
        cartDrawer.classList.remove("active");
      }
    }

    if (cart.length === 0) {
      cartItemsList.innerHTML = `<p class="empty-cart-msg" style="text-align:center; color:#a0a0a0; padding: 1.5rem 0;">Your order is currently empty.</p>`;
      cartTotalPrice.textContent = "$0.00";
      if (whatsappCheckoutBtn) whatsappCheckoutBtn.disabled = true;
      return;
    }

    let html = "";
    cart.forEach(item => {
      const itemTotal = item.price * item.qty;
      // Clean 2-row item layout for mobile compatibility and inline editing
      html += `
        <div class="cart-modal-item">
          <div class="cart-item-info">
            <span class="cart-item-name">${item.name}</span>
            <span class="cart-item-unit-price">$${item.price.toFixed(2)} each</span>
          </div>
          <div class="cart-item-controls-row">
            <div class="quantity-selector">
              <button type="button" class="qty-btn" onclick="changeQuantity('${item.name}', -1)">−</button>
              <span class="qty-display">${item.qty}</span>
              <button type="button" class="qty-btn" onclick="changeQuantity('${item.name}', 1)">+</button>
            </div>
            <span class="cart-item-total">$${itemTotal.toFixed(2)}</span>
          </div>
        </div>
      `;
    });

    cartItemsList.innerHTML = html;
    cartTotalPrice.textContent = `$${totalPrice.toFixed(2)}`;
    if (whatsappCheckoutBtn) whatsappCheckoutBtn.disabled = false;
  }

  // WhatsApp Checkout Dispatch
  if (whatsappCheckoutBtn) {
    whatsappCheckoutBtn.addEventListener("click", () => {
      if (cart.length === 0) return;

      const randomOrderNum = '#' + Math.floor(100 + Math.random() * 900);
      
      // Build message using clean standard newlines
      let message = `🥢 *NEW TABLE ORDER* 🥢\n`;
      message += `Order ID: ${randomOrderNum}\n`;
      message += `Table Number: ${tableNumber}\n`;
      message += `------------------\n`;
      
      let total = 0;
      cart.forEach(item => {
        let itemSum = item.price * item.qty;
        total += itemSum;
        message += `• ${item.qty}x ${item.name} ($${itemSum.toFixed(2)})\n`;
      });

      message += `------------------\n`;
      message += `*Total Amount: $${total.toFixed(2)}*\nPlease confirm this order. Thank you!`;

      // CRITICAL: Encode the message so WhatsApp correctly parses emojis, spaces, and line breaks
      const encodedMessage = encodeURIComponent(message);
      const whatsappURL = `https://wa.me/${RESTAURANT_WHATSAPP}?text=${encodedMessage}`;

      window.open(whatsappURL, "_blank");

      // Clear cart after successful dispatch
      cart = [];
      updateCartUI();
      cartDrawer.classList.remove("active");
    });
  }
});