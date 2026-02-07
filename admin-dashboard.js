// Check if admin is logged in
function checkAuth() {
    if (localStorage.getItem('adminLoggedIn') !== 'true') {
        window.location.href = 'login.html';
    }
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('adminUsername');
        window.location.href = 'login.html';
    }
}

// Initialize dashboard
function initializeDashboard() {
    checkAuth();
    setCurrentDate();
    loadInitialData();
    updateDashboardStats();
    loadCustomers();
    loadCommodities();
    loadTransactions();
    loadMarketData();
    loadRecentActivity();
}

// Set current date
function setCurrentDate() {
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        const now = new Date();
        dateElement.textContent = now.toLocaleDateString('en-GB', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
}

// Show section
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionId).classList.add('active');
    
    // Add active class to clicked nav item
    event.target.closest('.nav-item').classList.add('active');
}

// Modal functions
function openModal(type, data = null) {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modalBody');
    
    let content = '';
    
    switch(type) {
        case 'registerCustomer':
            content = `
                <div class="modal-form">
                    <h2>👤 Register New Customer</h2>
                    <form id="registerCustomerForm">
                        <div class="form-group">
                            <label>Full Name *</label>
                            <input type="text" name="fullName" required placeholder="Enter customer's full name">
                        </div>
                        <div class="form-group">
                            <label>Email Address *</label>
                            <input type="email" name="email" required placeholder="Enter email address">
                        </div>
                        <div class="form-group">
                            <label>Phone Number *</label>
                            <input type="tel" name="phone" required placeholder="Enter phone number">
                        </div>
                        <div class="form-group">
                            <label>Bank Name *</label>
                            <input type="text" name="bankName" required placeholder="Enter bank name">
                        </div>
                        <div class="form-group">
                            <label>Account Number *</label>
                            <input type="text" name="accountNumber" required placeholder="Enter account number">
                        </div>
                        <div class="form-group">
                            <label>Initial Balance (₦)</label>
                            <input type="number" name="initialBalance" value="0" min="0" step="0.01">
                        </div>
                        <div class="modal-actions">
                            <button type="button" onclick="closeModal()" class="btn-cancel">Cancel</button>
                            <button type="submit" class="btn-submit">Register Customer</button>
                        </div>
                    </form>
                </div>
            `;
            break;
            
        case 'editCustomer':
            content = `
                <div class="modal-form">
                    <h2>✏️ Edit Customer Details</h2>
                    <form id="editCustomerForm">
                        <input type="hidden" name="customerId" value="${data.id}">
                        <div class="form-group">
                            <label>Full Name *</label>
                            <input type="text" name="fullName" required value="${data.fullName}">
                        </div>
                        <div class="form-group">
                            <label>Email Address *</label>
                            <input type="email" name="email" required value="${data.email}">
                        </div>
                        <div class="form-group">
                            <label>Phone Number *</label>
                            <input type="tel" name="phone" required value="${data.phone}">
                        </div>
                        <div class="form-group">
                            <label>Bank Name *</label>
                            <input type="text" name="bankName" required value="${data.bankName}">
                        </div>
                        <div class="form-group">
                            <label>Account Number *</label>
                            <input type="text" name="accountNumber" required value="${data.accountNumber}">
                        </div>
                        <div class="modal-actions">
                            <button type="button" onclick="closeModal()" class="btn-cancel">Cancel</button>
                            <button type="submit" class="btn-submit">Update Customer</button>
                        </div>
                    </form>
                </div>
            `;
            break;
            
        case 'manageWallet':
            content = `
                <div class="modal-form">
                    <h2>💰 Manage Customer Wallet</h2>
                    <p style="margin-bottom: 20px; color: #666;">Customer: <strong>${data.fullName}</strong></p>
                    <p style="margin-bottom: 20px; color: #666;">Current Balance: <strong>₦${formatNumber(data.walletBalance)}</strong></p>
                    <form id="manageWalletForm">
                        <input type="hidden" name="customerId" value="${data.id}">
                        <div class="form-group">
                            <label>Transaction Type *</label>
                            <select name="transactionType" required>
                                <option value="credit">Credit (Add Money)</option>
                                <option value="debit">Debit (Withdraw Money)</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Amount (₦) *</label>
                            <input type="number" name="amount" required min="0.01" step="0.01" placeholder="Enter amount">
                        </div>
                        <div class="form-group">
                            <label>Description</label>
                            <textarea name="description" rows="3" placeholder="Enter transaction description"></textarea>
                        </div>
                        <div class="modal-actions">
                            <button type="button" onclick="closeModal()" class="btn-cancel">Cancel</button>
                            <button type="submit" class="btn-submit">Process Transaction</button>
                        </div>
                    </form>
                </div>
            `;
            break;
            
        case 'addCommodity':
            content = `
                <div class="modal-form">
                    <h2>📦 Add New Commodity</h2>
                    <form id="addCommodityForm">
                        <div class="form-group">
                            <label>Commodity Name *</label>
                            <input type="text" name="name" required placeholder="Enter commodity name">
                        </div>
                        <div class="form-group">
                            <label>Category *</label>
                            <select name="category" required>
                                <option value="rice">🍚 Rice</option>
                                <option value="beans">🫘 Beans</option>
                                <option value="garri">🟡 Garri</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Weight (kg) *</label>
                            <input type="number" name="weight" required min="1" step="0.5" placeholder="Enter weight">
                        </div>
                        <div class="form-group">
                            <label>Min Price (₦) *</label>
                            <input type="number" name="minPrice" required min="0" step="100" placeholder="Enter minimum price">
                        </div>
                        <div class="form-group">
                            <label>Max Price (₦) *</label>
                            <input type="number" name="maxPrice" required min="0" step="100" placeholder="Enter maximum price">
                        </div>
                        <div class="form-group">
                            <label>Current Price (₦) *</label>
                            <input type="number" name="currentPrice" required min="0" step="100" placeholder="Enter current price">
                        </div>
                        <div class="form-group">
                            <label>Units per Bag</label>
                            <input type="number" name="unitsPerBag" required min="1" placeholder="Units per bag">
                        </div>
                        <div class="modal-actions">
                            <button type="button" onclick="closeModal()" class="btn-cancel">Cancel</button>
                            <button type="submit" class="btn-submit">Add Commodity</button>
                        </div>
                    </form>
                </div>
            `;
            break;
    }
    
    modalBody.innerHTML = content;
    modal.style.display = 'block';
    
    // Add event listeners
    attachModalListeners();
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

function attachModalListeners() {
    // Register customer form
    const registerForm = document.getElementById('registerCustomerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegisterCustomer);
    }
    
    // Edit customer form
    const editForm = document.getElementById('editCustomerForm');
    if (editForm) {
        editForm.addEventListener('submit', handleEditCustomer);
    }
    
    // Manage wallet form
    const walletForm = document.getElementById('manageWalletForm');
    if (walletForm) {
        walletForm.addEventListener('submit', handleManageWallet);
    }
    
    // Add commodity form
    const commodityForm = document.getElementById('addCommodityForm');
    if (commodityForm) {
        commodityForm.addEventListener('submit', handleAddCommodity);
    }
}

// Customer Management Functions
function handleRegisterCustomer(e) {
    e.preventDefault();
    
    const form = e.target;
    const customer = {
        id: Date.now().toString(),
        fullName: form.fullName.value,
        email: form.email.value,
        phone: form.phone.value,
        bankName: form.bankName.value,
        accountNumber: form.accountNumber.value,
        walletBalance: parseFloat(form.initialBalance.value) || 0,
        createdAt: new Date().toISOString(),
        status: 'active'
    };
    
    // Save to localStorage
    const customers = JSON.parse(localStorage.getItem('customers') || '[]');
    customers.push(customer);
    localStorage.setItem('customers', JSON.stringify(customers));
    
    // Log transaction
    if (customer.walletBalance > 0) {
        addTransaction(customer.id, 'credit', customer.walletBalance, 'Initial wallet funding');
    }
    
    // Close modal and refresh
    closeModal();
    loadCustomers();
    updateDashboardStats();
    addActivity('New customer registered', `${customer.fullName} has been registered`);
    
    alert('Customer registered successfully!');
}

function handleEditCustomer(e) {
    e.preventDefault();
    
    const form = e.target;
    const customers = JSON.parse(localStorage.getItem('customers') || '[]');
    const customerIndex = customers.findIndex(c => c.id === form.customerId.value);
    
    if (customerIndex !== -1) {
        customers[customerIndex] = {
            ...customers[customerIndex],
            fullName: form.fullName.value,
            email: form.email.value,
            phone: form.phone.value,
            bankName: form.bankName.value,
            accountNumber: form.accountNumber.value
        };
        
        localStorage.setItem('customers', JSON.stringify(customers));
        closeModal();
        loadCustomers();
        addActivity('Customer updated', `${form.fullName.value}'s details have been updated`);
        
        alert('Customer updated successfully!');
    }
}

function handleManageWallet(e) {
    e.preventDefault();
    
    const form = e.target;
    const customers = JSON.parse(localStorage.getItem('customers') || '[]');
    const customerIndex = customers.findIndex(c => c.id === form.customerId.value);
    
    if (customerIndex !== -1) {
        const amount = parseFloat(form.amount.value);
        const type = form.transactionType.value;
        
        if (type === 'debit' && customers[customerIndex].walletBalance < amount) {
            alert('Insufficient wallet balance!');
            return;
        }
        
        // Update wallet balance
        if (type === 'credit') {
            customers[customerIndex].walletBalance += amount;
        } else {
            customers[customerIndex].walletBalance -= amount;
        }
        
        localStorage.setItem('customers', JSON.stringify(customers));
        
        // Log transaction
        addTransaction(
            customers[customerIndex].id,
            type,
            amount,
            form.description.value || `${type} by admin`
        );
        
        closeModal();
        loadCustomers();
        updateDashboardStats();
        addActivity(
            `Wallet ${type}`,
            `${customers[customerIndex].fullName}: ₦${formatNumber(amount)} ${type}ed`
        );
        
        alert('Transaction processed successfully!');
    }
}

function loadCustomers() {
    const customers = JSON.parse(localStorage.getItem('customers') || '[]');
    const tbody = document.getElementById('customerTableBody');
    
    if (customers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="no-data">No customers registered yet</td></tr>';
        return;
    }
    
    tbody.innerHTML = customers.map(customer => `
        <tr>
            <td><strong>${customer.fullName}</strong></td>
            <td>${customer.email}</td>
            <td>${customer.phone}</td>
            <td><strong>₦${formatNumber(customer.walletBalance)}</strong></td>
            <td>
                <button onclick="editCustomer('${customer.id}')" class="action-btn btn-edit">✏️ Edit</button>
                <button onclick="manageWallet('${customer.id}')" class="action-btn btn-view">💰 Wallet</button>
                <button onclick="deleteCustomer('${customer.id}')" class="action-btn btn-delete">🗑️ Delete</button>
            </td>
        </tr>
    `).join('');
}

function editCustomer(customerId) {
    const customers = JSON.parse(localStorage.getItem('customers') || '[]');
    const customer = customers.find(c => c.id === customerId);
    
    if (customer) {
        openModal('editCustomer', customer);
    }
}

function manageWallet(customerId) {
    const customers = JSON.parse(localStorage.getItem('customers') || '[]');
    const customer = customers.find(c => c.id === customerId);
    
    if (customer) {
        openModal('manageWallet', customer);
    }
}

function deleteCustomer(customerId) {
    if (confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
        const customers = JSON.parse(localStorage.getItem('customers') || '[]');
        const filteredCustomers = customers.filter(c => c.id !== customerId);
        localStorage.setItem('customers', JSON.stringify(filteredCustomers));
        
        loadCustomers();
        updateDashboardStats();
        addActivity('Customer deleted', 'A customer account has been removed');
        
        alert('Customer deleted successfully!');
    }
}

function searchCustomers() {
    const searchTerm = document.getElementById('customerSearch').value.toLowerCase();
    const customers = JSON.parse(localStorage.getItem('customers') || '[]');
    const tbody = document.getElementById('customerTableBody');
    
    const filteredCustomers = customers.filter(customer => 
        customer.fullName.toLowerCase().includes(searchTerm) ||
        customer.email.toLowerCase().includes(searchTerm) ||
        customer.phone.includes(searchTerm)
    );
    
    if (filteredCustomers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="no-data">No customers found</td></tr>';
        return;
    }
    
    tbody.innerHTML = filteredCustomers.map(customer => `
        <tr>
            <td><strong>${customer.fullName}</strong></td>
            <td>${customer.email}</td>
            <td>${customer.phone}</td>
            <td><strong>₦${formatNumber(customer.walletBalance)}</strong></td>
            <td>
                <button onclick="editCustomer('${customer.id}')" class="action-btn btn-edit">✏️ Edit</button>
                <button onclick="manageWallet('${customer.id}')" class="action-btn btn-view">💰 Wallet</button>
                <button onclick="deleteCustomer('${customer.id}')" class="action-btn btn-delete">🗑️ Delete</button>
            </td>
        </tr>
    `).join('');
}

// Commodity Management Functions
function handleAddCommodity(e) {
    e.preventDefault();
    
    const form = e.target;
    const commodity = {
        id: Date.now().toString(),
        name: form.name.value,
        category: form.category.value,
        weight: parseFloat(form.weight.value),
        minPrice: parseFloat(form.minPrice.value),
        maxPrice: parseFloat(form.maxPrice.value),
        currentPrice: parseFloat(form.currentPrice.value),
        unitsPerBag: parseInt(form.unitsPerBag.value),
        createdAt: new Date().toISOString()
    };
    
    const commodities = JSON.parse(localStorage.getItem('commodities') || '[]');
    commodities.push(commodity);
    localStorage.setItem('commodities', JSON.stringify(commodities));
    
    closeModal();
    loadCommodities();
    updateDashboardStats();
    addActivity('Commodity added', `${commodity.name} has been added to inventory`);
    
    alert('Commodity added successfully!');
}

function loadCommodities() {
    const commodities = JSON.parse(localStorage.getItem('commodities') || '[]');
    const grid = document.getElementById('commodityGrid');
    
    if (commodities.length === 0) {
        grid.innerHTML = '<p class="no-data" style="grid-column: 1/-1;">No commodities added yet</p>';
        return;
    }
    
    grid.innerHTML = commodities.map(commodity => {
        const pricePerUnit = calculatePricePerUnit(commodity.currentPrice, commodity.unitsPerBag);
        const interestRate = calculateInterestRate(commodity.currentPrice);
        
        return `
            <div class="commodity-card">
                <div class="commodity-header">
                    <div class="commodity-name">${getCategoryIcon(commodity.category)} ${commodity.name}</div>
                    <div class="commodity-price">₦${formatNumber(commodity.currentPrice)}</div>
                </div>
                <div class="commodity-details">
                    <p>Weight: ${commodity.weight}kg</p>
                    <p>Price Range: ₦${formatNumber(commodity.minPrice)} - ₦${formatNumber(commodity.maxPrice)}</p>
                </div>
                <div class="commodity-stats">
                    <div class="commodity-stat">
                        <strong>Price/Unit:</strong> ₦${formatNumber(pricePerUnit)}
                    </div>
                    <div class="commodity-stat">
                        <strong>Interest Rate:</strong> ${interestRate.toFixed(2)}%
                    </div>
                    <div class="commodity-stat">
                        <strong>Units/Bag:</strong> ${commodity.unitsPerBag}
                    </div>
                    <div class="commodity-stat">
                        <strong>Trend:</strong> <span class="trend-neutral">Stable</span>
                    </div>
                </div>
                <div class="commodity-actions">
                    <button onclick="updateCommodityPrice('${commodity.id}')" class="action-btn btn-edit">Update Price</button>
                    <button onclick="deleteCommodity('${commodity.id}')" class="action-btn btn-delete">Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

function filterCommodities(category) {
    // Update active button
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    const commodities = JSON.parse(localStorage.getItem('commodities') || '[]');
    const grid = document.getElementById('commodityGrid');
    
    const filteredCommodities = category === 'all' 
        ? commodities 
        : commodities.filter(c => c.category === category);
    
    if (filteredCommodities.length === 0) {
        grid.innerHTML = '<p class="no-data" style="grid-column: 1/-1;">No commodities found in this category</p>';
        return;
    }
    
    grid.innerHTML = filteredCommodities.map(commodity => {
        const pricePerUnit = calculatePricePerUnit(commodity.currentPrice, commodity.unitsPerBag);
        const interestRate = calculateInterestRate(commodity.currentPrice);
        
        return `
            <div class="commodity-card">
                <div class="commodity-header">
                    <div class="commodity-name">${getCategoryIcon(commodity.category)} ${commodity.name}</div>
                    <div class="commodity-price">₦${formatNumber(commodity.currentPrice)}</div>
                </div>
                <div class="commodity-details">
                    <p>Weight: ${commodity.weight}kg</p>
                    <p>Price Range: ₦${formatNumber(commodity.minPrice)} - ₦${formatNumber(commodity.maxPrice)}</p>
                </div>
                <div class="commodity-stats">
                    <div class="commodity-stat">
                        <strong>Price/Unit:</strong> ₦${formatNumber(pricePerUnit)}
                    </div>
                    <div class="commodity-stat">
                        <strong>Interest Rate:</strong> ${interestRate.toFixed(2)}%
                    </div>
                    <div class="commodity-stat">
                        <strong>Units/Bag:</strong> ${commodity.unitsPerBag}
                    </div>
                    <div class="commodity-stat">
                        <strong>Trend:</strong> <span class="trend-neutral">Stable</span>
                    </div>
                </div>
                <div class="commodity-actions">
                    <button onclick="updateCommodityPrice('${commodity.id}')" class="action-btn btn-edit">Update Price</button>
                    <button onclick="deleteCommodity('${commodity.id}')" class="action-btn btn-delete">Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

function updateCommodityPrice(commodityId) {
    const commodities = JSON.parse(localStorage.getItem('commodities') || '[]');
    const commodity = commodities.find(c => c.id === commodityId);
    
    if (commodity) {
        const newPrice = prompt(`Enter new price for ${commodity.name} (Current: ₦${formatNumber(commodity.currentPrice)}):`);
        
        if (newPrice !== null && !isNaN(newPrice)) {
            const price = parseFloat(newPrice);
            
            if (price >= commodity.minPrice && price <= commodity.maxPrice) {
                commodity.currentPrice = price;
                localStorage.setItem('commodities', JSON.stringify(commodities));
                loadCommodities();
                loadMarketData();
                addActivity('Price updated', `${commodity.name} price updated to ₦${formatNumber(price)}`);
                alert('Price updated successfully!');
            } else {
                alert(`Price must be between ₦${formatNumber(commodity.minPrice)} and ₦${formatNumber(commodity.maxPrice)}`);
            }
        }
    }
}

function deleteCommodity(commodityId) {
    if (confirm('Are you sure you want to delete this commodity?')) {
        const commodities = JSON.parse(localStorage.getItem('commodities') || '[]');
        const filteredCommodities = commodities.filter(c => c.id !== commodityId);
        localStorage.setItem('commodities', JSON.stringify(filteredCommodities));
        
        loadCommodities();
        updateDashboardStats();
        loadMarketData();
        addActivity('Commodity deleted', 'A commodity has been removed from inventory');
        
        alert('Commodity deleted successfully!');
    }
}

// Transaction Functions
function loadTransactions() {
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const tbody = document.getElementById('transactionTableBody');
    const customers = JSON.parse(localStorage.getItem('customers') || '[]');
    
    if (transactions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="no-data">No transactions yet</td></tr>';
        return;
    }
    
    // Sort by date (newest first)
    const sortedTransactions = transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    tbody.innerHTML = sortedTransactions.slice(0, 50).map(transaction => {
        const customer = customers.find(c => c.id === transaction.customerId);
        const customerName = customer ? customer.fullName : 'Unknown';
        const typeClass = transaction.type === 'credit' ? 'text-success' : 
                        transaction.type === 'debit' ? 'text-danger' : 'text-warning';
        
        return `
            <tr>
                <td>${formatDate(transaction.date)}</td>
                <td>${customerName}</td>
                <td><strong class="${typeClass}">${transaction.type.toUpperCase()}</strong></td>
                <td><strong>₦${formatNumber(transaction.amount)}</strong></td>
                <td>${transaction.description}</td>
            </tr>
        `;
    }).join('');
}

function addTransaction(customerId, type, amount, description) {
    const transaction = {
        id: Date.now().toString(),
        customerId: customerId,
        type: type,
        amount: amount,
        description: description,
        date: new Date().toISOString()
    };
    
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    transactions.push(transaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    
    loadTransactions();
}

function filterTransactions() {
    const dateFilter = document.getElementById('transactionDateFilter').value;
    const typeFilter = document.getElementById('transactionTypeFilter').value;
    
    let transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const customers = JSON.parse(localStorage.getItem('customers') || '[]');
    
    // Apply date filter
    if (dateFilter) {
        transactions = transactions.filter(t => {
            const transactionDate = new Date(t.date).toISOString().split('T')[0];
            return transactionDate === dateFilter;
        });
    }
    
    // Apply type filter
    if (typeFilter !== 'all') {
        transactions = transactions.filter(t => t.type === typeFilter);
    }
    
    const tbody = document.getElementById('transactionTableBody');
    
    if (transactions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="no-data">No transactions found</td></tr>';
        return;
    }
    
    const sortedTransactions = transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    tbody.innerHTML = sortedTransactions.slice(0, 50).map(transaction => {
        const customer = customers.find(c => c.id === transaction.customerId);
        const customerName = customer ? customer.fullName : 'Unknown';
        const typeClass = transaction.type === 'credit' ? 'text-success' : 
                        transaction.type === 'debit' ? 'text-danger' : 'text-warning';
        
        return `
            <tr>
                <td>${formatDate(transaction.date)}</td>
                <td>${customerName}</td>
                <td><strong class="${typeClass}">${transaction.type.toUpperCase()}</strong></td>
                <td><strong>₦${formatNumber(transaction.amount)}</strong></td>
                <td>${transaction.description}</td>
            </tr>
        `;
    }).join('');
}

function exportTransactions() {
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const customers = JSON.parse(localStorage.getItem('customers') || '[]');
    
    if (transactions.length === 0) {
        alert('No transactions to export');
        return;
    }
    
    let csv = 'Date,Customer Name,Type,Amount,Description\n';
    
    transactions.forEach(transaction => {
        const customer = customers.find(c => c.id === transaction.customerId);
        const customerName = customer ? customer.fullName : 'Unknown';
        csv += `${formatDate(transaction.date)},${customerName},${transaction.type},${transaction.amount},${transaction.description}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
}

// Market Data Functions
function loadMarketData() {
    const commodities = JSON.parse(localStorage.getItem('commodities') || '[]');
    
    // Calculate market data for each category
    const riceData = calculateMarketData(commodities, 'rice');
    const beansData = calculateMarketData(commodities, 'beans');
    const garriData = calculateMarketData(commodities, 'garri');
    
    // Update UI
    document.getElementById('riceAvgPrice').textContent = `₦${formatNumber(riceData.avgPrice)}`;
    document.getElementById('ricePriceRange').textContent = `₦${formatNumber(riceData.minPrice)} - ₦${formatNumber(riceData.maxPrice)}`;
    document.getElementById('riceTrend').textContent = riceData.trend;
    
    document.getElementById('beansAvgPrice').textContent = `₦${formatNumber(beansData.avgPrice)}`;
    document.getElementById('beansPriceRange').textContent = `₦${formatNumber(beansData.minPrice)} - ₦${formatNumber(beansData.maxPrice)}`;
    document.getElementById('beansTrend').textContent = beansData.trend;
    
    document.getElementById('garriAvgPrice').textContent = `₦${formatNumber(garriData.avgPrice)}`;
    document.getElementById('garriPriceRange').textContent = `₦${formatNumber(garriData.minPrice)} - ₦${formatNumber(garriData.maxPrice)}`;
    document.getElementById('garriTrend').textContent = garriData.trend;
}

function calculateMarketData(commodities, category) {
    const categoryCommodities = commodities.filter(c => c.category === category);
    
    if (categoryCommodities.length === 0) {
        return {
            avgPrice: 0,
            minPrice: 0,
            maxPrice: 0,
            trend: 'No data'
        };
    }
    
    const prices = categoryCommodities.map(c => c.currentPrice);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    // Simple trend calculation (in production, this would be more sophisticated)
    const trend = Math.random() > 0.5 ? (Math.random() > 0.5 ? 'Rising 📈' : 'Falling 📉') : 'Stable ➡️';
    
    return {
        avgPrice,
        minPrice,
        maxPrice,
        trend
    };
}

function refreshMarketData() {
    // Simulate market price updates
    const commodities = JSON.parse(localStorage.getItem('commodities') || '[]');
    
    commodities.forEach(commodity => {
        // Random price fluctuation within range (±5%)
        const fluctuation = (Math.random() - 0.5) * 0.1;
        let newPrice = commodity.currentPrice * (1 + fluctuation);
        
        // Ensure price stays within range
        newPrice = Math.max(commodity.minPrice, Math.min(commodity.maxPrice, newPrice));
        
        commodity.currentPrice = Math.round(newPrice / 100) * 100; // Round to nearest 100
    });
    
    localStorage.setItem('commodities', JSON.stringify(commodities));
    
    loadCommodities();
    loadMarketData();
    addActivity('Market updated', 'Commodity prices have been refreshed');
    
    alert('Market data refreshed successfully!');
}

// Dashboard Stats
function updateDashboardStats() {
    const customers = JSON.parse(localStorage.getItem('customers') || '[]');
    const commodities = JSON.parse(localStorage.getItem('commodities') || '[]');
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    
    // Total customers
    document.getElementById('totalCustomers').textContent = customers.length;
    
    // Total wallet balance
    const totalWallet = customers.reduce((sum, customer) => sum + customer.walletBalance, 0);
    document.getElementById('totalWallet').textContent = `₦${formatNumber(totalWallet)}`;
    
    // Total commodities
    document.getElementById('totalCommodities').textContent = commodities.length;
    
    // Today's transactions
    const today = new Date().toISOString().split('T')[0];
    const todayTransactions = transactions.filter(t => t.date.startsWith(today));
    document.getElementById('totalTransactions').textContent = todayTransactions.length;
}

// Activity Functions
function addActivity(title, description) {
    const activity = {
        id: Date.now().toString(),
        title: title,
        description: description,
        timestamp: new Date().toISOString()
    };
    
    const activities = JSON.parse(localStorage.getItem('activities') || '[]');
    activities.unshift(activity); // Add to beginning
    
    // Keep only last 50 activities
    if (activities.length > 50) {
        activities.pop();
    }
    
    localStorage.setItem('activities', JSON.stringify(activities));
    loadRecentActivity();
}

function loadRecentActivity() {
    const activities = JSON.parse(localStorage.getItem('activities') || '[]');
    const activityList = document.getElementById('recentActivityList');
    
    if (activities.length === 0) {
        activityList.innerHTML = '<p class="no-data">No recent activity</p>';
        return;
    }
    
    activityList.innerHTML = activities.slice(0, 10).map(activity => `
        <div class="activity-item">
            <div class="activity-icon">📢</div>
            <div class="activity-content">
                <div class="activity-title">${activity.title}</div>
                <div class="activity-time">${timeAgo(activity.timestamp)}</div>
            </div>
        </div>
    `).join('');
}

// Utility Functions
function formatNumber(number) {
    return number.toLocaleString('en-NG', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function timeAgo(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
}

function getCategoryIcon(category) {
    const icons = {
        rice: '🍚',
        beans: '🫘',
        garri: '🟡'
    };
    return icons[category] || '📦';
}

// Price Calculation Algorithm (as specified)
function calculatePricePerUnit(bagPrice, unitsPerBag) {
    // Calculate price per unit (example: 50kg bag / 400 units = 0.125 kg per unit)
    const kgPerUnit = 50 / unitsPerBag;
    const pricePerUnit = bagPrice * kgPerUnit / 50;
    return pricePerUnit;
}

function calculateInterestRate(bagPrice) {
    // The higher the price, the lower the interest rate
    // Base interest rate of 31.25% for lower prices
    const baseRate = 31.25;
    
    // Reduce interest rate as price increases (simple formula)
    // This is a simplified version - in production, this would be more sophisticated
    const priceFactor = bagPrice / 100000; // Normalize price
    const interestRate = Math.max(5, baseRate - (priceFactor * 15));
    
    return interestRate;
}

function loadInitialData() {
    // Initialize commodities if not exists
    if (!localStorage.getItem('commodities')) {
        const initialCommodities = [
            // Rice varieties
            { id: 'rice1', name: "Mama's Pride", category: 'rice', weight: 50, minPrice: 40000, maxPrice: 55000, currentPrice: 55000, unitsPerBag: 400, createdAt: new Date().toISOString() },
            { id: 'rice2', name: "Mama's Choice", category: 'rice', weight: 50, minPrice: 42500, maxPrice: 60500, currentPrice: 50000, unitsPerBag: 400, createdAt: new Date().toISOString() },
            { id: 'rice3', name: "Mama's Pride Premium", category: 'rice', weight: 50, minPrice: 45000, maxPrice: 55500, currentPrice: 52000, unitsPerBag: 400, createdAt: new Date().toISOString() },
            { id: 'rice4', name: "Gerawa Rice", category: 'rice', weight: 50, minPrice: 40000, maxPrice: 52500, currentPrice: 48000, unitsPerBag: 400, createdAt: new Date().toISOString() },
            { id: 'rice5', name: "Mango Rice", category: 'rice', weight: 50, minPrice: 41500, maxPrice: 55500, currentPrice: 49000, unitsPerBag: 400, createdAt: new Date().toISOString() },
            { id: 'rice6', name: "Big Bull Stone Rice", category: 'rice', weight: 50, minPrice: 48000, maxPrice: 60000, currentPrice: 55000, unitsPerBag: 400, createdAt: new Date().toISOString() },
            { id: 'rice7', name: "Siamese", category: 'rice', weight: 50, minPrice: 40500, maxPrice: 53200, currentPrice: 47000, unitsPerBag: 400, createdAt: new Date().toISOString() },
            { id: 'rice8', name: "Caprice", category: 'rice', weight: 50, minPrice: 40000, maxPrice: 57000, currentPrice: 48000, unitsPerBag: 400, createdAt: new Date().toISOString() },
            { id: 'rice9', name: "Labana Rice", category: 'rice', weight: 50, minPrice: 41000, maxPrice: 50000, currentPrice: 45000, unitsPerBag: 400, createdAt: new Date().toISOString() },
            { id: 'rice10', name: "Destoned Ofada Rice", category: 'rice', weight: 50, minPrice: 35000, maxPrice: 50000, currentPrice: 42000, unitsPerBag: 400, createdAt: new Date().toISOString() },
            { id: 'rice11', name: "Ebonyi Special Rice", category: 'rice', weight: 50, minPrice: 40000, maxPrice: 55500, currentPrice: 48000, unitsPerBag: 400, createdAt: new Date().toISOString() },
            { id: 'rice12', name: "Mafa Rice", category: 'rice', weight: 50, minPrice: 41500, maxPrice: 55000, currentPrice: 49000, unitsPerBag: 400, createdAt: new Date().toISOString() },
            { id: 'rice13', name: "Vitali", category: 'rice', weight: 50, minPrice: 42500, maxPrice: 58000, currentPrice: 51000, unitsPerBag: 400, createdAt: new Date().toISOString() },
            { id: 'rice14', name: "Optimum Parboiled", category: 'rice', weight: 50, minPrice: 40000, maxPrice: 55000, currentPrice: 47000, unitsPerBag: 400, createdAt: new Date().toISOString() },
            { id: 'rice15', name: "HAB Premium Parboiled", category: 'rice', weight: 50, minPrice: 49000, maxPrice: 65000, currentPrice: 58000, unitsPerBag: 400, createdAt: new Date().toISOString() },
            { id: 'rice16', name: "Royal Stallion", category: 'rice', weight: 50, minPrice: 50000, maxPrice: 65000, currentPrice: 59000, unitsPerBag: 400, createdAt: new Date().toISOString() },
            { id: 'rice17', name: "Mama Gold", category: 'rice', weight: 50, minPrice: 50000, maxPrice: 67000, currentPrice: 61000, unitsPerBag: 400, createdAt: new Date().toISOString() },
            
            // Beans varieties
            { id: 'beans1', name: "White Beans", category: 'beans', weight: 25, minPrice: 18000, maxPrice: 20000, currentPrice: 18750, unitsPerBag: 200, createdAt: new Date().toISOString() },
            { id: 'beans2', name: "White Beans", category: 'beans', weight: 50, minPrice: 36000, maxPrice: 40000, currentPrice: 37500, unitsPerBag: 400, createdAt: new Date().toISOString() },
            { id: 'beans3', name: "White Beans", category: 'beans', weight: 100, minPrice: 72000, maxPrice: 80000, currentPrice: 75000, unitsPerBag: 800, createdAt: new Date().toISOString() },
            { id: 'beans4', name: "Brown Beans", category: 'beans', weight: 25, minPrice: 18500, maxPrice: 21000, currentPrice: 19500, unitsPerBag: 200, createdAt: new Date().toISOString() },
            { id: 'beans5', name: "Brown Beans", category: 'beans', weight: 50, minPrice: 37000, maxPrice: 42000, currentPrice: 39000, unitsPerBag: 400, createdAt: new Date().toISOString() },
            { id: 'beans6', name: "Brown Beans", category: 'beans', weight: 100, minPrice: 74000, maxPrice: 84000, currentPrice: 78000, unitsPerBag: 800, createdAt: new Date().toISOString() },
            { id: 'beans7', name: "Honey Beans", category: 'beans', weight: 25, minPrice: 19000, maxPrice: 22000, currentPrice: 20000, unitsPerBag: 200, createdAt: new Date().toISOString() },
            { id: 'beans8', name: "Honey Beans", category: 'beans', weight: 50, minPrice: 38000, maxPrice: 44000, currentPrice: 40000, unitsPerBag: 400, createdAt: new Date().toISOString() },
            { id: 'beans9', name: "Honey Beans", category: 'beans', weight: 100, minPrice: 76000, maxPrice: 88000, currentPrice: 80000, unitsPerBag: 800, createdAt: new Date().toISOString() },
            { id: 'beans10', name: "Oloyin Beans", category: 'beans', weight: 25, minPrice: 18000, maxPrice: 20000, currentPrice: 19000, unitsPerBag: 200, createdAt: new Date().toISOString() },
            { id: 'beans11', name: "Oloyin Beans", category: 'beans', weight: 50, minPrice: 37000, maxPrice: 42000, currentPrice: 39000, unitsPerBag: 400, createdAt: new Date().toISOString() },
            { id: 'beans12', name: "Olotun Beans", category: 'beans', weight: 25, minPrice: 17000, maxPrice: 18500, currentPrice: 17500, unitsPerBag: 200, createdAt: new Date().toISOString() },
            { id: 'beans13', name: "Olotun Beans", category: 'beans', weight: 50, minPrice: 35000, maxPrice: 38000, currentPrice: 36000, unitsPerBag: 400, createdAt: new Date().toISOString() },
            { id: 'beans14', name: "Butter Beans", category: 'beans', weight: 25, minPrice: 16000, maxPrice: 18000, currentPrice: 16500, unitsPerBag: 200, createdAt: new Date().toISOString() },
            { id: 'beans15', name: "Butter Beans", category: 'beans', weight: 50, minPrice: 32000, maxPrice: 36000, currentPrice: 33000, unitsPerBag: 400, createdAt: new Date().toISOString() },
            
            // Garri varieties
            { id: 'garri1', name: "Ijebu Garri", category: 'garri', weight: 50, minPrice: 35000, maxPrice: 50000, currentPrice: 42000, unitsPerBag: 400, createdAt: new Date().toISOString() },
            { id: 'garri2', name: "Oyo Garri", category: 'garri', weight: 50, minPrice: 28000, maxPrice: 35000, currentPrice: 30000, unitsPerBag: 400, createdAt: new Date().toISOString() },
            { id: 'garri3', name: "Yellow Garri", category: 'garri', weight: 50, minPrice: 42000, maxPrice: 50000, currentPrice: 45000, unitsPerBag: 400, createdAt: new Date().toISOString() },
            { id: 'garri4', name: "White Garri", category: 'garri', weight: 50, minPrice: 40000, maxPrice: 48000, currentPrice: 43000, unitsPerBag: 400, createdAt: new Date().toISOString() }
        ];
        
        localStorage.setItem('commodities', JSON.stringify(initialCommodities));
    }
    
    // Initialize other arrays if not exists
    if (!localStorage.getItem('customers')) {
        localStorage.setItem('customers', '[]');
    }
    
    if (!localStorage.getItem('transactions')) {
        localStorage.setItem('transactions', '[]');
    }
    
    if (!localStorage.getItem('activities')) {
        localStorage.setItem('activities', '[]');
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
        closeModal();
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initializeDashboard);