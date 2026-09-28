let cart = JSON.parse(localStorage.getItem("cart")) || [];

function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
}


function renderCart() {
    const cartList = document.getElementById("cart-list");
    const totalAmount = document.getElementById("total-amount");

    if (!cartList || !totalAmount) {
        console.error("cart-list or total-amount not found");
        return;
    }

    cartList.innerHTML = "";

    if (cart.length === 0) {
        cartList.innerHTML = "<li>Your cart is empty.</li>";
        totalAmount.textContent = "$0.00";
        return;
    }

    let total = 0;

    cart.forEach(function (product, index) {
        const price = Number(product.price) || 0;
        const quantity = Number(product.quantity) || 1;
        const itemTotal = price * quantity;
        total += itemTotal;

        const li = document.createElement("li");
        li.className = "cart-item";

        li.innerHTML = `
            <span>
                ${product.name} x ${quantity} -
                $${itemTotal.toFixed(2)}
            </span>

            <button type="button" class="remove-button" onclick="removeFromCart(${index})">
                Remove
            </button>
        `;

        cartList.appendChild(li);
    });

    totalAmount.textContent = "$" + total.toFixed(2);
}

function addToCart(product) {
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }

    saveCart();
    renderCart();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    renderCart();
}

async function loadProducts() {
    const productList = document.getElementById("product-list");

    if (!productList) {
        console.error("product-list not found");
        return;
    }

    try {
        const response = await fetch("/api/products");

        if (!response.ok) {
            throw new Error("Failed to fetch products");
        }

        const products = await response.json();

        productList.innerHTML = "";

        products.forEach(function (product) {
            const card = document.createElement("div");
            card.className = "product-card";

            const imageHtml = product.imageUrl
                ? `<img src="${product.imageUrl}" alt="${product.name}" />`
                : `<img src="https://via.placeholder.com/300x200?text=No+Image" alt="${product.name}" />`;

            card.innerHTML = `
                ${imageHtml}
                <h3>${product.name}</h3>
                <p>${product.description || ""}</p>
                <p class="price">$${Number(product.price).toFixed(2)}</p>
                <p>Category: ${product.category || "N/A"}</p>
                <p>Stock: ${product.stock ?? 0}</p>
                <button type="button" class="add-to-cart-button">Add to Cart</button>
            `;

            const addButton = card.querySelector(".add-to-cart-button");
            addButton.addEventListener("click", function () {
                addToCart(product);
            });

            productList.appendChild(card);
        });

    } catch (error) {
        console.error("Error loading products:", error);
        productList.innerHTML = "<p>Could not load products.</p>";
    }
}

async function saveProduct(event) {
    event.preventDefault();

    const form = document.getElementById("product-form");
    const formMessage = document.getElementById("form-message");

    const product = {
        name: document.getElementById("name").value.trim(),
        description: document.getElementById("description").value.trim(),
        price: Number(document.getElementById("price").value),
        imageUrl: document.getElementById("imageUrl").value.trim(),
        category: document.getElementById("category").value.trim(),
        stock: Number(document.getElementById("stock").value)
    };

    try {
        const response = await fetch("/api/products", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(product)
        });

        if (!response.ok) {
            throw new Error("Product save failed");
        }

        formMessage.textContent = "Product saved successfully.";
        formMessage.style.color = "green";
        form.reset();

        await loadProducts();

    } catch (error) {
        console.error("Save product error:", error);
        formMessage.textContent = "Could not save product.";
        formMessage.style.color = "red";
    }
}

async function placeOrder(event) {
    event.preventDefault();

    const checkoutMessage = document.getElementById("checkout-message");

    if (cart.length === 0) {
        checkoutMessage.textContent = "Your cart is empty.";
        checkoutMessage.style.color = "red";
        return;
    }

    const order = {
    customerName: document.getElementById("customer-name").value.trim(),
    customerEmail: document.getElementById("customer-email").value.trim(),
    customerPhone: document.getElementById("customer-phone").value.trim(),
    customerAddress: document.getElementById("customer-address").value.trim(),
    products: JSON.stringify(cart),
    total: cart.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity || 1)), 0),
    status: document.getElementById("order-status").value
};

    try {
        const response = await fetch("/api/orders", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(order)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Order submit failed");
        }

        checkoutMessage.textContent = "Order placed successfully!";
        checkoutMessage.style.color = "green";

        cart = [];
        saveCart();
        renderCart();
        document.getElementById("checkout-form").reset();

        await loadOrders();

    } catch (error) {
        console.error("Place order error:", error);
        checkoutMessage.textContent = "Could not place order.";
        checkoutMessage.style.color = "red";
    }
}

async function loadOrders() {
    const orderList = document.getElementById("order-list");

    if (!orderList) {
        return;
    }

    try {
        const response = await fetch("/api/orders");

        if (!response.ok) {
            throw new Error("Failed to load orders");
        }

        const orders = await response.json();

        orderList.innerHTML = "";

        if (!Array.isArray(orders) || orders.length === 0) {
            orderList.innerHTML = "<p>No orders found.</p>";
            return;
        }

        orders.forEach(function (order) {
            let products = [];

            try {
                products = JSON.parse(order.products || "[]");
            } catch (error) {
                console.error("Parse products error:", error);
            }

            const productItems = products.length
    ? products.map(function (item) {
        const qty = Number(item.quantity) || 1;
        return `<li>${item.name} x ${qty} - $${(Number(item.price) * qty).toFixed(2)}</li>`;
    }).join("")
    : "<li>No product details</li>";

            const orderStatus = String(order.status || "PENDING").toLowerCase();

const item = document.createElement("div");
item.className = `order-item ${orderStatus}`;

            item.innerHTML = `
                <h3>Order #${order.id}</h3>
                <p><strong>Name:</strong> ${order.customerName}</p>
                <p><strong>Email:</strong> ${order.customerEmail}</p>
                <p><strong>Phone:</strong> ${order.customerPhone}</p>
                <p><strong>Address:</strong> ${order.customerAddress}</p>

                <p>
    <strong>Status:</strong>
    <span class="status-badge">${order.status || "PENDING"}</span>
</p>

<select id="status-${order.id}" class="order-status-select">
                    <option value="PENDING" ${order.status === "PENDING" ? "selected" : ""}>Pending</option>
                    <option value="CONFIRMED" ${order.status === "CONFIRMED" ? "selected" : ""}>Confirmed</option>
                    <option value="SHIPPED" ${order.status === "SHIPPED" ? "selected" : ""}>Shipped</option>
                </select>

                <button type="button" class="order-btn" onclick="updateOrderStatus(${order.id})">
                    Update Status
                </button>

                <p><strong>Total:</strong> $${Number(order.total).toFixed(2)}</p>

                <p><strong>Products:</strong></p>
                <ul>${productItems}</ul>

                <p><strong>Date:</strong> ${order.createdAt ? new Date(order.createdAt).toLocaleString() : "N/A"}</p>
            `;

            orderList.appendChild(item);
        });

    } catch (error) {
        console.error("Load orders error:", error);
        orderList.innerHTML = "<p>Could not load orders.</p>";
    }
}

async function updateOrderStatus(orderId) {
    const select = document.getElementById("status-" + orderId);
    const newStatus = select ? select.value : "PENDING";

    try {
        const response = await fetch(`/api/orders/${orderId}/status`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ status: newStatus })
        });

        if (!response.ok) {
            throw new Error("Status update failed");
        }

        alert("Order status updated to " + newStatus);
        await loadOrders();

    } catch (error) {
        console.error("Update order status error:", error);
        alert("Could not update order status.");
    }
}

document.addEventListener("DOMContentLoaded", function () {
    renderCart();
    loadProducts();
    loadOrders();

    const productForm = document.getElementById("product-form");
    if (productForm) {
        productForm.addEventListener("submit", saveProduct);
    }

    const checkoutForm = document.getElementById("checkout-form");
    if (checkoutForm) {
        checkoutForm.addEventListener("submit", placeOrder);
    }
});