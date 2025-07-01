// Application State
let currentUser = null
let currentPage = "home"

// Data Storage (simulating backend)
const storage = {
  users: JSON.parse(localStorage.getItem("young4chicks_users") || "[]"),
  requests: JSON.parse(localStorage.getItem("young4chicks_requests") || "[]"),
  stock: JSON.parse(localStorage.getItem("young4chicks_stock") || "[]"),

  save() {
    localStorage.setItem("young4chicks_users", JSON.stringify(this.users))
    localStorage.setItem("young4chicks_requests", JSON.stringify(this.requests))
    localStorage.setItem("young4chicks_stock", JSON.stringify(this.stock))
  },
}

// Initialize default stock if empty
if (storage.stock.length === 0) {
  storage.stock = [
    { id: 1, type: "Layer - Local", quantity: 500, age: 7 },
    { id: 2, type: "Layer - Exotic", quantity: 300, age: 7 },
    { id: 3, type: "Broiler - Local", quantity: 400, age: 5 },
    { id: 4, type: "Broiler - Exotic", quantity: 250, age: 5 },
  ]
  storage.save()
}

// Initialize default users for testing
if (storage.users.length === 0) {
  storage.users = [
    {
      id: 1,
      name: "John Manager",
      email: "manager@young4chicks.com",
      password: "manager123",
      role: "manager",
      createdAt: new Date().toISOString(),
    },
    {
      id: 2,
      name: "Jane Sales",
      email: "sales@young4chicks.com",
      password: "sales123",
      role: "sales",
      createdAt: new Date().toISOString(),
    },
  ]
  storage.save()
}

// Utility Functions
function generateId() {
  return Date.now() + Math.random().toString(36).substr(2, 9)
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString()
}

function showNotification(message, type = "success") {
  const notification = document.createElement("div")
  notification.className = `notification ${type}`
  notification.textContent = message
  notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === "success" ? "#28a745" : "#dc3545"};
        color: white;
        padding: 1rem 2rem;
        border-radius: 5px;
        z-index: 3000;
        animation: slideIn 0.3s ease;
    `

  document.body.appendChild(notification)
  setTimeout(() => {
    notification.remove()
  }, 3000)
}

// Navigation Functions
function showPage(pageId) {
  // Hide all pages
  document.querySelectorAll(".page").forEach((page) => {
    page.classList.remove("active")
  })

  // Show selected page
  const targetPage = document.getElementById(pageId + "-page")
  if (targetPage) {
    targetPage.classList.add("active")
    currentPage = pageId
  }

  // Close mobile menu
  document.getElementById("nav-menu").classList.remove("active")
}

function toggleMenu() {
  document.getElementById("nav-menu").classList.toggle("active")
}

function updateNavigation() {
  const loginLink = document.getElementById("login-link")
  const registerLink = document.getElementById("register-link")
  const logoutLink = document.getElementById("logout-link")

  if (currentUser) {
    loginLink.style.display = "none"
    registerLink.style.display = "none"
    logoutLink.style.display = "block"

    // Show appropriate dashboard
    showDashboard()
  } else {
    loginLink.style.display = "block"
    registerLink.style.display = "block"
    logoutLink.style.display = "none"
  }
}

function showDashboard() {
  const dashboards = ["customer-dashboard", "sales-dashboard", "manager-dashboard"]
  dashboards.forEach((id) => {
    document.getElementById(id).classList.remove("active")
  })

  if (currentUser) {
    const dashboardId = currentUser.role + "-dashboard"
    const dashboard = document.getElementById(dashboardId)
    if (dashboard) {
      dashboard.classList.add("active")
      loadDashboardData()
    }
  }
}

// Authentication Functions
function login(email, password, role) {
  const user = storage.users.find((u) => u.email === email && u.password === password && u.role === role)

  if (user) {
    currentUser = user
    updateNavigation()
    showNotification("Login successful!")
    return true
  }
  return false
}

function logout() {
  currentUser = null
  updateNavigation()
  showPage("home")
  showNotification("Logged out successfully!")
}

// Fix the register function to include contact information
function register(userData) {
  // Check if user already exists
  const existingUser = storage.users.find((u) => u.email === userData.email)
  if (existingUser) {
    return { success: false, message: "User already exists with this email" }
  }

  // Validate age
  if (userData.age < 18 || userData.age > 30) {
    return { success: false, message: "Age must be between 18 and 30" }
  }

  // Create new user
  const newUser = {
    id: generateId(),
    ...userData,
    role: "customer",
    farmerType: "starter",
    createdAt: new Date().toISOString(),
    lastRequestDate: null,
  }

  storage.users.push(newUser)
  storage.save()

  return { success: true, message: "Registration successful! Please login." }
}

// Dashboard Functions
// Update the loadDashboardData function to properly initialize all dashboards
function loadDashboardData() {
  if (!currentUser) return

  switch (currentUser.role) {
    case "customer":
      loadCustomerDashboard()
      break
    case "sales":
      loadSalesDashboard()
      // Initialize sales dashboard content
      showAllRequests()
      break
    case "manager":
      loadManagerDashboard()
      // Initialize manager dashboard content
      showStockManagement()
      break
  }
}

// Fix the loadSalesDashboard function to properly update the dashboard
function loadSalesDashboard() {
  document.getElementById("sales-name").textContent = currentUser.name

  const pendingRequests = storage.requests.filter((r) => r.status === "pending")
  const approvedRequests = storage.requests.filter((r) => r.status === "approved")
  const completedSales = storage.requests.filter((r) => r.status === "completed")

  document.getElementById("pending-requests-count").textContent = pendingRequests.length
  document.getElementById("approved-requests-count").textContent = approvedRequests.length
  document.getElementById("completed-sales-count").textContent = completedSales.length
}

// Fix the loadManagerDashboard function to properly update the dashboard
function loadManagerDashboard() {
  document.getElementById("manager-name").textContent = currentUser.name

  const totalStock = storage.stock.reduce((sum, item) => sum + item.quantity, 0)
  const pendingApprovals = storage.requests.filter((r) => r.status === "pending")
  const totalFarmers = storage.users.filter((u) => u.role === "customer")

  document.getElementById("total-stock").textContent = totalStock
  document.getElementById("pending-approvals-count").textContent = pendingApprovals.length
  document.getElementById("total-farmers").textContent = totalFarmers.length
}

function loadCustomerDashboard() {
  document.getElementById("customer-name").textContent = currentUser.name

  const userRequests = storage.requests.filter((r) => r.userId === currentUser.id)
  const totalChicks = userRequests.filter((r) => r.status === "completed").reduce((sum, r) => sum + r.quantity, 0)

  document.getElementById("customer-requests-count").textContent = userRequests.length
  document.getElementById("customer-chicks-count").textContent = totalChicks

  // Calculate next request date
  const lastRequest = userRequests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]

  if (lastRequest) {
    const lastDate = new Date(lastRequest.createdAt)
    const nextDate = new Date(lastDate.getTime() + 4 * 30 * 24 * 60 * 60 * 1000) // 4 months
    const now = new Date()

    if (now < nextDate) {
      document.getElementById("next-request-date").textContent = formatDate(nextDate)
      document.getElementById("request-btn").disabled = true
      document.getElementById("request-btn").textContent = "Request Available " + formatDate(nextDate)
    } else {
      document.getElementById("next-request-date").textContent = "Now"
      document.getElementById("request-btn").disabled = false
      document.getElementById("request-btn").textContent = "Request Chicks"
    }
  }
}

// Request Functions
function showRequestForm() {
  const content = `
        <h3>Request Chicks</h3>
        <form id="chick-request-form">
            <div class="form-group">
                <label for="chick-type">Chick Type</label>
                <select id="chick-type" required>
                    <option value="">Select Chick Type</option>
                    ${storage.stock
                      .map(
                        (item) =>
                          `<option value="${item.type}" ${item.quantity === 0 ? "disabled" : ""}>
                            ${item.type} (Available: ${item.quantity})
                        </option>`,
                      )
                      .join("")}
                </select>
            </div>
            <div class="form-group">
                <label for="chick-quantity">Quantity</label>
                <input type="number" id="chick-quantity" min="1" max="${currentUser.farmerType === "starter" ? 100 : 500}" required>
                <small>Maximum: ${currentUser.farmerType === "starter" ? 100 : 500} chicks</small>
            </div>
            <div class="form-group">
                <label for="request-notes">Additional Notes</label>
                <textarea id="request-notes" rows="3"></textarea>
            </div>
            <div class="form-group">
                <p><strong>Price:</strong> UGx 1,650 per chick</p>
                <p><strong>Total Cost:</strong> <span id="total-cost">UGx 0</span></p>
                <p><strong>Free Feed:</strong> 2 bags (payable after 2 months)</p>
            </div>
            <button type="submit" class="btn btn-primary">Submit Request</button>
        </form>
    `

  document.getElementById("customer-content").innerHTML = content

  // Add event listeners
  document.getElementById("chick-quantity").addEventListener("input", function () {
    const quantity = Number.parseInt(this.value) || 0
    const totalCost = quantity * 1650
    document.getElementById("total-cost").textContent = `UGx ${totalCost.toLocaleString()}`
  })

  document.getElementById("chick-request-form").addEventListener("submit", (e) => {
    e.preventDefault()
    submitChickRequest()
  })
}

// Update the submitChickRequest function to include contact information
function submitChickRequest() {
  const type = document.getElementById("chick-type").value
  const quantity = Number.parseInt(document.getElementById("chick-quantity").value)
  const notes = document.getElementById("request-notes").value

  // Validate stock availability
  const stockItem = storage.stock.find((item) => item.type === type)
  if (!stockItem || stockItem.quantity < quantity) {
    showNotification("Insufficient stock available", "error")
    return
  }

  // Create request
  const request = {
    id: generateId(),
    userId: currentUser.id,
    userName: currentUser.name,
    userContact: currentUser.contact,
    type: type,
    quantity: quantity,
    notes: notes,
    totalCost: quantity * 1650,
    status: "pending",
    createdAt: new Date().toISOString(),
    approvedAt: null,
    completedAt: null,
  }

  storage.requests.push(request)

  // Update user's last request date
  currentUser.lastRequestDate = new Date().toISOString()
  const userIndex = storage.users.findIndex((u) => u.id === currentUser.id)
  if (userIndex !== -1) {
    storage.users[userIndex] = currentUser
  }

  storage.save()

  showNotification("Request submitted successfully!")
  loadCustomerDashboard()
  showMyRequests()
}

function showMyRequests() {
  const userRequests = storage.requests.filter((r) => r.userId === currentUser.id)

  const content = `
        <h3>My Requests</h3>
        <div class="table-container">
            <table class="table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Quantity</th>
                        <th>Total Cost</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${userRequests
                      .map(
                        (request) => `
                        <tr>
                            <td>${formatDate(request.createdAt)}</td>
                            <td>${request.type}</td>
                            <td>${request.quantity}</td>
                            <td>UGx ${request.totalCost.toLocaleString()}</td>
                            <td><span class="status status-${request.status}">${request.status.toUpperCase()}</span></td>
                        </tr>
                    `,
                      )
                      .join("")}
                </tbody>
            </table>
        </div>
    `

  document.getElementById("customer-content").innerHTML = content
}

// Sales Functions
// Update the showAllRequests function to refresh the sales dashboard stats
function showAllRequests() {
  const allRequests = storage.requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  const content = `
        <h3>All Requests</h3>
        <div class="dashboard-actions mb-2">
            <button class="btn btn-secondary" onclick="showSalesHistory()">View Sales History</button>
        </div>
        <div class="table-container">
            <table class="table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Farmer</th>
                        <th>Contact</th>
                        <th>Type</th>
                        <th>Quantity</th>
                        <th>Total Cost</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${allRequests
                      .map(
                        (request) => `
                        <tr>
                            <td>${formatDate(request.createdAt)}</td>
                            <td>${request.userName}</td>
                            <td>${request.userContact || "N/A"}</td>
                            <td>${request.type}</td>
                            <td>${request.quantity}</td>
                            <td>UGx ${request.totalCost.toLocaleString()}</td>
                            <td><span class="status status-${request.status}">${request.status.toUpperCase()}</span></td>
                            <td>
                                ${
                                  request.status === "approved"
                                    ? `<button class="btn btn-success" onclick="completeSale('${request.id}')">Complete Sale</button>`
                                    : request.status === "pending"
                                      ? `<span class="text-warning">Awaiting Manager Approval</span>`
                                      : request.status === "completed"
                                        ? `<span class="text-success">✓ Completed</span>`
                                        : `<span class="text-danger">✗ ${request.status}</span>`
                                }
                            </td>
                        </tr>
                    `,
                      )
                      .join("")}
                </tbody>
            </table>
        </div>
    `

  document.getElementById("sales-content").innerHTML = content
}

// Update the completeSale function to refresh dashboard stats
function completeSale(requestId) {
  const request = storage.requests.find((r) => r.id === requestId)
  if (request && request.status === "approved") {
    request.status = "completed"
    request.completedAt = new Date().toISOString()
    storage.save()

    showNotification("Sale completed successfully!")
    loadSalesDashboard() // Refresh dashboard stats
    showAllRequests() // Refresh the table
  }
}

function showSalesHistory() {
  const completedSales = storage.requests.filter((r) => r.status === "completed")
  const totalRevenue = completedSales.reduce((sum, sale) => sum + sale.totalCost, 0)

  const content = `
        <h3>Sales History</h3>
        <div class="card mb-2">
            <h4>Total Revenue: UGx ${totalRevenue.toLocaleString()}</h4>
            <p>Total Sales: ${completedSales.length}</p>
        </div>
        <div class="table-container">
            <table class="table">
                <thead>
                    <tr>
                        <th>Date Completed</th>
                        <th>Farmer</th>
                        <th>Type</th>
                        <th>Quantity</th>
                        <th>Revenue</th>
                    </tr>
                </thead>
                <tbody>
                    ${completedSales
                      .map(
                        (sale) => `
                        <tr>
                            <td>${formatDate(sale.completedAt)}</td>
                            <td>${sale.userName}</td>
                            <td>${sale.type}</td>
                            <td>${sale.quantity}</td>
                            <td>UGx ${sale.totalCost.toLocaleString()}</td>
                        </tr>
                    `,
                      )
                      .join("")}
                </tbody>
            </table>
        </div>
    `

  document.getElementById("sales-content").innerHTML = content
}

// Manager Functions
// Update the showStockManagement function to include better navigation
function showStockManagement() {
  const content = `
        <h3>Stock Management</h3>
        <div class="dashboard-actions mb-2">
            <button class="btn btn-primary" onclick="showAddStockForm()">Add New Stock</button>
            <button class="btn btn-secondary" onclick="showPendingApprovals()">View Pending Approvals</button>
            <button class="btn btn-success" onclick="showAllFarmers()">View All Farmers</button>
        </div>
        <div class="table-container">
            <table class="table">
                <thead>
                    <tr>
                        <th>Type</th>
                        <th>Quantity</th>
                        <th>Age (Days)</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${storage.stock
                      .map(
                        (item) => `
                        <tr>
                            <td>${item.type}</td>
                            <td>${item.quantity}</td>
                            <td>${item.age}</td>
                            <td>
                                <span class="status ${item.quantity > 0 ? "status-approved" : "status-pending"}">
                                    ${item.quantity > 0 ? "In Stock" : "Out of Stock"}
                                </span>
                            </td>
                            <td>
                                <button class="btn btn-secondary" onclick="updateStock('${item.id}')">Update</button>
                            </td>
                        </tr>
                    `,
                      )
                      .join("")}
                </tbody>
            </table>
        </div>
    `

  document.getElementById("manager-content").innerHTML = content
}

function showAddStockForm() {
  const modalContent = `
        <h3>Add New Stock</h3>
        <form id="add-stock-form">
            <div class="form-group">
                <label for="stock-type">Chick Type</label>
                <select id="stock-type" required>
                    <option value="">Select Type</option>
                    <option value="Layer - Local">Layer - Local</option>
                    <option value="Layer - Exotic">Layer - Exotic</option>
                    <option value="Broiler - Local">Broiler - Local</option>
                    <option value="Broiler - Exotic">Broiler - Exotic</option>
                </select>
            </div>
            <div class="form-group">
                <label for="stock-quantity">Quantity</label>
                <input type="number" id="stock-quantity" min="1" required>
            </div>
            <div class="form-group">
                <label for="stock-age">Age (Days)</label>
                <input type="number" id="stock-age" min="1" required>
            </div>
            <button type="submit" class="btn btn-primary">Add Stock</button>
        </form>
    `

  showModal(modalContent)

  document.getElementById("add-stock-form").addEventListener("submit", (e) => {
    e.preventDefault()
    addStock()
  })
}

// Update the addStock function to refresh dashboard stats
function addStock() {
  const type = document.getElementById("stock-type").value
  const quantity = Number.parseInt(document.getElementById("stock-quantity").value)
  const age = Number.parseInt(document.getElementById("stock-age").value)

  // Check if stock type already exists
  const existingStock = storage.stock.find((item) => item.type === type)
  if (existingStock) {
    existingStock.quantity += quantity
  } else {
    storage.stock.push({
      id: generateId(),
      type: type,
      quantity: quantity,
      age: age,
    })
  }

  storage.save()
  closeModal()
  showNotification("Stock added successfully!")
  loadManagerDashboard() // Refresh dashboard stats
  showStockManagement() // Refresh the current view
}

function updateStock(stockId) {
  const stockItem = storage.stock.find((item) => item.id == stockId)
  if (!stockItem) return

  const modalContent = `
        <h3>Update Stock</h3>
        <form id="update-stock-form">
            <div class="form-group">
                <label>Chick Type</label>
                <input type="text" value="${stockItem.type}" readonly>
            </div>
            <div class="form-group">
                <label for="update-quantity">Quantity</label>
                <input type="number" id="update-quantity" value="${stockItem.quantity}" min="0" required>
            </div>
            <div class="form-group">
                <label for="update-age">Age (Days)</label>
                <input type="number" id="update-age" value="${stockItem.age}" min="1" required>
            </div>
            <button type="submit" class="btn btn-primary">Update Stock</button>
        </form>
    `

  showModal(modalContent)

  document.getElementById("update-stock-form").addEventListener("submit", (e) => {
    e.preventDefault()

    stockItem.quantity = Number.parseInt(document.getElementById("update-quantity").value)
    stockItem.age = Number.parseInt(document.getElementById("update-age").value)

    storage.save()
    closeModal()
    showNotification("Stock updated successfully!")
    loadManagerDashboard()
    showStockManagement()
  })
}

// Update the showPendingApprovals function to refresh dashboard stats
function showPendingApprovals() {
  const pendingRequests = storage.requests.filter((r) => r.status === "pending")

  const content = `
        <h3>Pending Approvals (${pendingRequests.length})</h3>
        <div class="dashboard-actions mb-2">
            <button class="btn btn-secondary" onclick="showStockManagement()">Back to Stock Management</button>
        </div>
        ${
          pendingRequests.length === 0
            ? '<div class="card text-center"><h4>No pending requests</h4><p>All requests have been processed.</p></div>'
            : `<div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Farmer</th>
                            <th>Contact</th>
                            <th>Type</th>
                            <th>Quantity</th>
                            <th>Total Cost</th>
                            <th>Available Stock</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${pendingRequests
                          .map((request) => {
                            const stockItem = storage.stock.find((item) => item.type === request.type)
                            const availableStock = stockItem ? stockItem.quantity : 0
                            const canApprove = availableStock >= request.quantity

                            return `
                                <tr>
                                    <td>${formatDate(request.createdAt)}</td>
                                    <td>${request.userName}</td>
                                    <td>${request.userContact || "N/A"}</td>
                                    <td>${request.type}</td>
                                    <td>${request.quantity}</td>
                                    <td>UGx ${request.totalCost.toLocaleString()}</td>
                                    <td>
                                        <span class="${canApprove ? "text-success" : "text-danger"}">
                                            ${availableStock} available
                                        </span>
                                    </td>
                                    <td>
                                        <button class="btn btn-success" onclick="approveRequest('${request.id}')" 
                                                ${!canApprove ? 'disabled title="Insufficient stock"' : ""}>
                                            Approve
                                        </button>
                                        <button class="btn btn-danger" onclick="rejectRequest('${request.id}')">Reject</button>
                                    </td>
                                </tr>
                              `
                          })
                          .join("")}
                    </tbody>
                </table>
            </div>`
        }
    `

  document.getElementById("manager-content").innerHTML = content
}

// Update the approveRequest function to refresh dashboard stats
function approveRequest(requestId) {
  const request = storage.requests.find((r) => r.id === requestId)
  if (!request) return

  // Check stock availability
  const stockItem = storage.stock.find((item) => item.type === request.type)
  if (!stockItem || stockItem.quantity < request.quantity) {
    showNotification("Insufficient stock to approve this request", "error")
    return
  }

  // Update request status
  request.status = "approved"
  request.approvedAt = new Date().toISOString()

  // Reduce stock
  stockItem.quantity -= request.quantity

  // Update farmer type if starter
  const farmer = storage.users.find((u) => u.id === request.userId)
  if (farmer && farmer.farmerType === "starter") {
    farmer.farmerType = "returning"
  }

  storage.save()
  showNotification("Request approved successfully!")
  loadManagerDashboard() // Refresh dashboard stats
  showPendingApprovals() // Refresh the current view
}

// Update the rejectRequest function to refresh dashboard stats
function rejectRequest(requestId) {
  const request = storage.requests.find((r) => r.id === requestId)
  if (request) {
    request.status = "rejected"
    storage.save()

    showNotification("Request rejected")
    loadManagerDashboard() // Refresh dashboard stats
    showPendingApprovals() // Refresh the current view
  }
}

function showAllFarmers() {
  const farmers = storage.users.filter((u) => u.role === "customer")

  const content = `
        <h3>Registered Farmers</h3>
        <div class="table-container">
            <table class="table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Age</th>
                        <th>Contact</th>
                        <th>Type</th>
                        <th>Registered</th>
                        <th>Total Chicks</th>
                    </tr>
                </thead>
                <tbody>
                    ${farmers
                      .map((farmer) => {
                        const farmerRequests = storage.requests.filter(
                          (r) => r.userId === farmer.id && r.status === "completed",
                        )
                        const totalChicks = farmerRequests.reduce((sum, r) => sum + r.quantity, 0)

                        return `
                            <tr>
                                <td>${farmer.name}</td>
                                <td>${farmer.age}</td>
                                <td>${farmer.contact}</td>
                                <td>${farmer.farmerType}</td>
                                <td>${formatDate(farmer.createdAt)}</td>
                                <td>${totalChicks}</td>
                            </tr>
                        `
                      })
                      .join("")}
                </tbody>
            </table>
        </div>
    `

  document.getElementById("manager-content").innerHTML = content
}

// Modal Functions
function showModal(content) {
  document.getElementById("modal-body").innerHTML = content
  document.getElementById("modal").style.display = "block"
}

function closeModal() {
  document.getElementById("modal").style.display = "none"
}

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  // Login form
  document.getElementById("login-form").addEventListener("submit", function (e) {
    e.preventDefault()

    const email = document.getElementById("login-email").value
    const password = document.getElementById("login-password").value
    const role = document.getElementById("user-role").value

    if (login(email, password, role)) {
      this.reset()
    } else {
      showNotification("Invalid credentials", "error")
    }
  })

  // Register form
  document.getElementById("register-form").addEventListener("submit", function (e) {
    e.preventDefault()

    const userData = {
      name: document.getElementById("reg-name").value,
      age: Number.parseInt(document.getElementById("reg-age").value),
      gender: document.getElementById("reg-gender").value,
      contact: document.getElementById("reg-contact").value,
      email: document.getElementById("reg-email").value,
      password: document.getElementById("reg-password").value,
      nin: document.getElementById("reg-nin").value,
      recommenderName: document.getElementById("reg-recommender-name").value,
      recommenderNin: document.getElementById("reg-recommender-nin").value,
    }

    const result = register(userData)
    if (result.success) {
      this.reset()
      showPage("login")
    }
    showNotification(result.message, result.success ? "success" : "error")
  })

  // Close modal when clicking outside
  window.addEventListener("click", (e) => {
    const modal = document.getElementById("modal")
    if (e.target === modal) {
      closeModal()
    }
  })

  // Initialize app
  updateNavigation()
})

// Add CSS for animations
const style = document.createElement("style")
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
`
document.head.appendChild(style)


//**Manager**: [manager@young4chicks.com](mailto:manager@young4chicks.com) / manager123
//**Sales**: [sales@young4chicks.com](mailto:sales@young4chicks.com) / sales123