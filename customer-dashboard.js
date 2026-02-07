// Check if customer is logged in
function checkAuth() {
    const customerId = localStorage.getItem('customerId');
    if (!customerId || localStorage.getItem('customerLoggedIn') !== 'true') {
        window.location.href = 'login.html';
    }
    return customerId;
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('customerLoggedIn');
        localStorage.removeItem('customerId');
        localStorage.removeItem('customerName');
        window.location.href = 'login.html';
    }
}

// Initialize dashboard
function initializeDashboard() {
    const customerId = checkAuth();
    loadCustomerData(customerId);
    loadCommodities();
    loadPortfolio(customerId);
    loadTransactions(customerId);
    loadMarketTrends();
    updateDashboardStats(customerId);
    setCurrentDate();
    setupTransferForms();
}

// Load customer data
function loadCustomerData(customerId) {
    const customers = JSON.parse(localStorage.getItem('customers') || '[]');
    const customer = customers.find(c => c.id === customerId);
    
    if (customer) {
        document.getElementById('customerName').textContent = customer.fullName;
        document.getElementById('customerEmail').textContent = customer.email;
        
        // Update wallet balances
        const walletBalance = customer.walletBalance || 0;
        document.getElementById('walletBalance').textContent = `₦${formatNumber(walletBalance)}`;
        document.getElementById('walletBalanceLarge').textContent = `₦${formatNumber(walletBalance)}`;
        document.getElementById('withdrawAvailableBalance').textContent = `₦${formatNumber(walletBalance)}`;
        
        // Update bank info
        document.getElementById('withdrawBankName').textContent = customer.bankName || 'Not set';
        document.getElementById('withdrawAccountNumber').textContent = customer.accountNumber || 'Not set';
        document.getElementById('withdrawAccountName').textContent = customer.accountName || customer.fullName;
        
        // Calculate pending withdrawals
        const pendingWithdrawals = calculatePendingWithdrawals(customerId);
        document.getElementById('pendingWithdrawals').textContent = `₦${formatNumber(pendingWithdrawals)}`;
    }
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
    event.target.closest('.nav-item')?.classList.add('active');
    
    // Refresh data when switching sections
    const customerId = localStorage.getItem('customerId');
    if (sectionId === 'portfolio') {
        loadPortfolio(customerId);
    } else if (sectionId === 'wallet') {
        loadCustomerData(customerId);
    } else if (sectionId === 'transactions') {
        loadTransactions(customerId);
    }
}

// Load commodities
function loadCommodities() {
    const commodities = JSON.parse(localStorage.getItem('commodities') || '[]');
    const grid = document.getElementById('marketGrid');
    
    if (commodities.length === 0) {
        grid.innerHTML = '<p class="no-data" style="grid-column: 1/-1;">No commodities available at the moment</p>';
        return;
    }
    
    grid.innerHTML = commodities.map(commodity => {
        const pricePerUnit = calculatePricePerUnit(commodity.currentPrice, commodity.unitsPerBag);
        const interestRate = calculateInterestRate(commodity.currentPrice);
        const pricePerKg = commodity.currentPrice / commodity.weight;
        
        return `
            <div class="commodity-card">
                <div class="commodity-header">
                    <div class="commodity-category">${getCategoryIcon(commodity.category)} ${commodity.category.charAt(0).toUpperCase() + commodity.category.slice(1)}</div>
                    <div class="commodity-price">₦${formatNumber(commodity.currentPrice)}</div>
                </div>
                <div class="commodity-name">${commodity.name}</div>
                <div class="commodity-details">
                    <p><strong>Weight:</strong> ${commodity.weight}kg</p>
                    <p><strong>Price/kg:</strong> ₦${formatNumber(pricePerKg)}</p>
                    <p><strong>Price/Unit:</strong> ₦${formatNumber(pricePerUnit)}</p>
                    <p><strong>Interest Rate:</strong> ${interestRate.toFixed(2)}%</p>
                </div>
                <div class="commodity-bag-info">
                    <p><strong>Bag Contents:</strong></p>
                    <p>50kg: 1 bag</p>
                    <p>25kg: ${commodity.weight >= 25 ? Math.floor(commodity.weight / 25) : 0} bag(s)</p>
                    <p>10kg: ${commodity.weight >= 10 ? Math.floor(commodity.weight / 10) : 0} bag(s)</p>
                    <p>5kg: ${commodity.weight >= 5 ? Math.floor(commodity.weight / 5) : 0} bag(s)</p>
                    <p>1kg: ${commodity.weight} unit(s)</p>
                </div>
                <div class="commodity-actions">
                    <button onclick="openBuyModal('${commodity.id}')" class="btn-buy">
                        <span>🛒</span> Buy
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Filter market
function filterMarket(category) {
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    const commodities = JSON.parse(localStorage.getItem('commodities') || '[]');
    const grid = document.getElementById('marketGrid');
    
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
        const pricePerKg = commodity.currentPrice / commodity.weight;
        
        return `
            <div class="commodity-card">
                <div class="commodity-header">
                    <div class="commodity-category">${getCategoryIcon(commodity.category)} ${commodity.category.charAt(0).toUpperCase() + commodity.category.slice(1)}</div>
                    <div class="commodity-price">₦${formatNumber(commodity.currentPrice)}</div>
                </div>
                <div class="commodity-name">${commodity.name}</div>
                <div class="commodity-details">
                    <p><strong>Weight:</strong> ${commodity.weight}kg</p>
                    <p><strong>Price/kg:</strong> ₦${formatNumber(pricePerKg)}</p>
                    <p><strong>Price/Unit:</strong> ₦${formatNumber(pricePerUnit)}</p>
                    <p><strong>Interest Rate:</strong> ${interestRate.toFixed(2)}%</p>
                </div>
                <div class="commodity-bag-info">
                    <p><strong>Bag Contents:</strong></p>
                    <p>50kg: 1 bag</p>
                    <p>25kg: ${commodity.weight >= 25 ? Math.floor(commodity.weight / 25) : 0} bag(s)</p>
                    <p>10kg: ${commodity.weight >= 10 ? Math.floor(commodity.weight / 10) : 0} bag(s)</p>
                    <p>5kg: ${commodity.weight >= 5 ? Math.floor(commodity.weight / 5) : 0} bag(s)</p>
                    <p>1kg: ${commodity.weight} unit(s)</p>
                </div>
                <div class="commodity-actions">
                    <button onclick="openBuyModal('${commodity.id}')" class="btn-buy">
                        <span>🛒</span> Buy
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Open buy modal
function openBuyModal(commodityId) {
    const customerId = localStorage.getItem('customerId');
    const commodities = JSON.parse(localStorage.getItem('commodities') || '[]');
    const customers = JSON.parse(localStorage.getItem('customers') || '[]');
    
    const commodity = commodities.find(c => c.id === commodityId);
    const customer = customers.find(c => c.id === customerId);
    
    if (!commodity || !customer) {
        alert('Error loading commodity or customer data');
        return;
    }
    
    const modalBody = document.getElementById('buyModalBody');
    const pricePerKg = commodity.currentPrice / commodity.weight;
    const interestRate = calculateInterestRate(commodity.currentPrice);
    
    modalBody.innerHTML = `
        <div class="buy-modal-content">
            <h2>🛒 Buy ${commodity.name}</h2>
            <div class="commodity-summary">
                <p><strong>Current Price:</strong> ₦${formatNumber(commodity.currentPrice)} per ${commodity.weight}kg</p>
                <p><strong>Price per kg:</strong> ₦${formatNumber(pricePerKg)}</p>
                <p><strong>Interest Rate:</strong> ${interestRate.toFixed(2)}%</p>
                <p><strong>Available Balance:</strong> ₦${formatNumber(customer.walletBalance)}</p>
            </div>
            <form id="buyForm">
                <input type="hidden" name="commodityId" value="${commodity.id}">
                <div class="form-group">
                    <label>Quantity (kg) *</label>
                    <input type="number" name="quantity" required min="1" step="1" 
                           placeholder="Enter quantity in kg" onchange="calculateBuyTotal()">
                </div>
                <div class="form-group">
                    <label>Bag Size *</label>
                    <select name="bagSize" required onchange="calculateBuyTotal()">
                        <option value="50">50 kg</option>
                        <option value="25">25 kg</option>
                        <option value="10">10 kg</option>
                        <option value="5">5 kg</option>
                        <option value="1">1 kg</option>
                    </select>
                </div>
                <div class="buy-summary">
                    <p><strong>Total Cost:</strong> <span id="buyTotal">₦0.00</span></p>
                    <p><strong>Units in Bag:</strong> <span id="unitsInBag">0</span></p>
                </div>
                <div class="modal-actions">
                    <button type="button" onclick="closeBuyModal()" class="btn-cancel">Cancel</button>
                    <button type="submit" class="btn-submit">Confirm Purchase</button>
                </div>
            </form>
        </div>
    `;
    
    document.getElementById('buyModal').style.display = 'block';
    
    // Add event listener
    document.getElementById('buyForm').addEventListener('submit', handleBuy);
}

function closeBuyModal() {
    document.getElementById('buyModal').style.display = 'none';
}

function calculateBuyTotal() {
    const commodityId = document.querySelector('#buyForm input[name="commodityId"]').value;
    const commodities = JSON.parse(localStorage.getItem('commodities') || '[]');
    const commodity = commodities.find(c => c.id === commodityId);
    
    if (!commodity) return;
    
    const quantity = parseFloat(document.querySelector('#buyForm input[name="quantity"]').value) || 0;
    const bagSize = parseInt(document.querySelector('#buyForm select[name="bagSize"]').value);
    
    const pricePerKg = commodity.currentPrice / commodity.weight;
    const totalCost = quantity * pricePerKg;
    const unitsInBag = Math.floor((quantity / bagSize) * (commodity.unitsPerBag / (commodity.weight / bagSize)));
    
    document.getElementById('buyTotal').textContent = `₦${formatNumber(totalCost)}`;
    document.getElementById('unitsInBag').textContent = unitsInBag;
}

function handleBuy(e) {
    e.preventDefault();
    
    const form = e.target;
    const customerId = localStorage.getItem('customerId');
    const commodityId = form.commodityId.value;
    const quantity = parseFloat(form.quantity.value);
    const bagSize = parseInt(form.bagSize.value);
    
    const commodities = JSON.parse(localStorage.getItem('commodities') || '[]');
    const customers = JSON.parse(localStorage.getItem('customers') || '[]');
    
    const commodity = commodities.find(c => c.id === commodityId);
    const customerIndex = customers.findIndex(c => c.id === customerId);
    
    if (!commodity || customerIndex === -1) {
        alert('Error processing purchase');
        return;
    }
    
    const pricePerKg = commodity.currentPrice / commodity.weight;
    const totalCost = quantity * pricePerKg;
    
    // Check if customer has enough balance
    if (customers[customerIndex].walletBalance < totalCost) {
        alert('Insufficient wallet balance. Please add funds to your wallet.');
        return;
    }
    
    // Deduct from wallet
    customers[customerIndex].walletBalance -= totalCost;
    
    // Add to portfolio
    const portfolios = JSON.parse(localStorage.getItem('portfolios') || '[]');
    const customerPortfolio = portfolios.find(p => p.customerId === customerId) || {
        customerId: customerId,
        holdings: []
    };
    
    const existingHolding = customerPortfolio.holdings.find(h => h.commodityId === commodityId);
    
    if (existingHolding) {
        // Update existing holding
        const totalQuantity = existingHolding.quantity + quantity;
        const totalInvested = existingHolding.investedAmount + totalCost;
        existingHolding.quantity = totalQuantity;
        existingHolding.investedAmount = totalInvested;
        existingHolding.averagePrice = totalInvested / totalQuantity;
        existingHolding.currentValue = totalQuantity * pricePerKg;
    } else {
        // Add new holding
        customerPortfolio.holdings.push({
            commodityId: commodityId,
            quantity: quantity,
            investedAmount: totalCost,
            averagePrice: pricePerKg,
            currentValue: totalCost,
            purchasedAt: new Date().toISOString()
        });
    }
    
    // Update portfolio array
    const portfolioIndex = portfolios.findIndex(p => p.customerId === customerId);
    if (portfolioIndex !== -1) {
        portfolios[portfolioIndex] = customerPortfolio;
    } else {
        portfolios.push(customerPortfolio);
    }
    
    // Save changes
    localStorage.setItem('customers', JSON.stringify(customers));
    localStorage.setItem('portfolios', JSON.stringify(portfolios));
    
    // Add transaction
    addTransaction(customerId, 'purchase', totalCost, `Bought ${quantity}kg of ${commodity.name}`, 'completed');
    
    // Close modal and refresh
    closeBuyModal();
    loadCustomerData(customerId);
    loadPortfolio(customerId);
    loadTransactions(customerId);
    updateDashboardStats(customerId);
    
    alert(`Purchase successful! You have bought ${quantity}kg of ${commodity.name} for ₦${formatNumber(totalCost)}`);
}

// Load portfolio
function loadPortfolio(customerId) {
    const portfolios = JSON.parse(localStorage.getItem('portfolios') || '[]');
    const commodities = JSON.parse(localStorage.getItem('commodities') || '[]');
    
    const customerPortfolio = portfolios.find(p => p.customerId === customerId);
    const tbody = document.getElementById('portfolioTableBody');
    
    if (!customerPortfolio || customerPortfolio.holdings.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="no-data">No commodities in portfolio</td></tr>';
        document.getElementById('portfolioValue').textContent = '₦0.00';
        document.getElementById('portfolioInvested').textContent = '₦0.00';
        document.getElementById('portfolioProfit').textContent = '₦0.00';
        return;
    }
    
    let totalValue = 0;
    let totalInvested = 0;
    
    tbody.innerHTML = customerPortfolio.holdings.map(holding => {
        const commodity = commodities.find(c => c.id === holding.commodityId);
        if (!commodity) return '';
        
        const currentPricePerKg = commodity.currentPrice / commodity.weight;
        const currentValue = holding.quantity * currentPricePerKg;
        const profitLoss = currentValue - holding.investedAmount;
        const profitLossPercentage = ((currentValue - holding.investedAmount) / holding.investedAmount) * 100;
        
        totalValue += currentValue;
        totalInvested += holding.investedAmount;
        
        const profitClass = profitLoss >= 0 ? 'text-success' : 'text-danger';
        
        return `
            <tr>
                <td><strong>${commodity.name}</strong></td>
                <td>${holding.quantity.toFixed(2)} kg</td>
                <td>₦${formatNumber(holding.averagePrice)}/kg</td>
                <td>₦${formatNumber(currentPricePerKg)}/kg</td>
                <td><strong>₦${formatNumber(currentValue)}</strong></td>
                <td class="${profitClass}"><strong>₦${formatNumber(profitLoss)} (${profitLossPercentage.toFixed(2)}%)</strong></td>
                <td>
                    <button onclick="openSellModal('${holding.commodityId}')" class="action-btn btn-view">💰 Sell</button>
                </td>
            </tr>
        `;
    }).join('');
    
    const totalProfitLoss = totalValue - totalInvested;
    const profitClass = totalProfitLoss >= 0 ? 'text-success' : 'text-danger';
    
    document.getElementById('portfolioValue').textContent = `₦${formatNumber(totalValue)}`;
    document.getElementById('portfolioInvested').textContent = `₦${formatNumber(totalInvested)}`;
    document.getElementById('portfolioProfit').innerHTML = `<span class="${profitClass}">₦${formatNumber(totalProfitLoss)}</span>`;
}

// Open sell modal
function openSellModal(commodityId) {
    const customerId = localStorage.getItem('customerId');
    const portfolios = JSON.parse(localStorage.getItem('portfolios') || '[]');
    const commodities = JSON.parse(localStorage.getItem('commodities') || '[]');
    
    const customerPortfolio = portfolios.find(p => p.customerId === customerId);
    if (!customerPortfolio) return;
    
    const holding = customerPortfolio.holdings.find(h => h.commodityId === commodityId);
    if (!holding) return;
    
    const commodity = commodities.find(c => c.id === commodityId);
    if (!commodity) return;
    
    const modalBody = document.getElementById('sellModalBody');
    const currentPricePerKg = commodity.currentPrice / commodity.weight;
    const currentValue = holding.quantity * currentPricePerKg;
    const profitLoss = currentValue - holding.investedAmount;
    const profitLossPercentage = ((currentValue - holding.investedAmount) / holding.investedAmount) * 100;
    
    modalBody.innerHTML = `
        <div class="sell-modal-content">
            <h2>💰 Sell ${commodity.name}</h2>
            <div class="holding-summary">
                <p><strong>Owned Quantity:</strong> ${holding.quantity.toFixed(2)} kg</p>
                <p><strong>Average Price:</strong> ₦${formatNumber(holding.averagePrice)}/kg</p>
                <p><strong>Current Price:</strong> ₦${formatNumber(currentPricePerKg)}/kg</p>
                <p><strong>Current Value:</strong> ₦${formatNumber(currentValue)}</p>
                <p><strong>Profit/Loss:</strong> <span class="${profitLoss >= 0 ? 'text-success' : 'text-danger'}">₦${formatNumber(profitLoss)} (${profitLossPercentage.toFixed(2)}%)</span></p>
            </div>
            <form id="sellForm">
                <input type="hidden" name="commodityId" value="${commodity.id}">
                <div class="form-group">
                    <label>Quantity to Sell (kg) *</label>
                    <input type="number" name="quantity" required min="0.01" step="0.01" 
                           max="${holding.quantity}" placeholder="Enter quantity to sell" onchange="calculateSellTotal()">
                </div>
                <div class="sell-summary">
                    <p><strong>Selling Price:</strong> <span id="sellPrice">₦0.00</span></p>
                    <p><strong>Profit/Loss:</strong> <span id="sellProfit">₦0.00</span></p>
                </div>
                <div class="modal-actions">
                    <button type="button" onclick="closeSellModal()" class="btn-cancel">Cancel</button>
                    <button type="submit" class="btn-submit">Confirm Sale</button>
                </div>
            </form>
        </div>
    `;
    
    document.getElementById('sellModal').style.display = 'block';
    
    // Add event listener
    document.getElementById('sellForm').addEventListener('submit', handleSell);
}

function closeSellModal() {
    document.getElementById('sellModal').style.display = 'none';
}

function calculateSellTotal() {
    const commodityId = document.querySelector('#sellForm input[name="commodityId"]').value;
    const quantity = parseFloat(document.querySelector('#sellForm input[name="quantity"]').value) || 0;
    
    const commodities = JSON.parse(localStorage.getItem('commodities') || '[]');
    const portfolios = JSON.parse(localStorage.getItem('portfolios') || '[]');
    const customerId = localStorage.getItem('customerId');
    
    const commodity = commodities.find(c => c.id === commodityId);
    const customerPortfolio = portfolios.find(p => p.customerId === customerId);
    const holding = customerPortfolio?.holdings.find(h => h.commodityId === commodityId);
    
    if (!commodity || !holding) return;
    
    const currentPricePerKg = commodity.currentPrice / commodity.weight;
    const sellingPrice = quantity * currentPricePerKg;
    const investedPerKg = holding.investedAmount / holding.quantity;
    const profitLoss = (currentPricePerKg - investedPerKg) * quantity;
    
    document.getElementById('sellPrice').textContent = `₦${formatNumber(sellingPrice)}`;
    document.getElementById('sellProfit').innerHTML = `<span class="${profitLoss >= 0 ? 'text-success' : 'text-danger'}">₦${formatNumber(profitLoss)}</span>`;
}

function handleSell(e) {
    e.preventDefault();
    
    const form = e.target;
    const customerId = localStorage.getItem('customerId');
    const commodityId = form.commodityId.value;
    const quantity = parseFloat(form.quantity.value);
    
    const portfolios = JSON.parse(localStorage.getItem('portfolios') || '[]');
    const commodities = JSON.parse(localStorage.getItem('commodities') || '[]');
    const customers = JSON.parse(localStorage.getItem('customers') || '[]');
    
    const customerPortfolio = portfolios.find(p => p.customerId === customerId);
    const commodity = commodities.find(c => c.id === commodityId);
    const customerIndex = customers.findIndex(c => c.id === customerId);
    
    if (!customerPortfolio || !commodity || customerIndex === -1) {
        alert('Error processing sale');
        return;
    }
    
    const holding = customerPortfolio.holdings.find(h => h.commodityId === commodityId);
    if (!holding) return;
    
    if (quantity > holding.quantity) {
        alert('You cannot sell more than you own');
        return;
    }
    
    const currentPricePerKg = commodity.currentPrice / commodity.weight;
    const sellingPrice = quantity * currentPricePerKg;
    
    // Add to wallet
    customers[customerIndex].walletBalance += sellingPrice;
    
    // Update holding
    holding.quantity -= quantity;
    holding.currentValue = holding.quantity * currentPricePerKg;
    holding.investedAmount = holding.quantity * holding.averagePrice;
    
    // Remove holding if quantity is 0
    if (holding.quantity <= 0.001) {
        customerPortfolio.holdings = customerPortfolio.holdings.filter(h => h.commodityId !== commodityId);
    }
    
    // Save changes
    const portfolioIndex = portfolios.findIndex(p => p.customerId === customerId);
    portfolios[portfolioIndex] = customerPortfolio;
    
    localStorage.setItem('customers', JSON.stringify(customers));
    localStorage.setItem('portfolios', JSON.stringify(portfolios));
    
    // Add transaction
    addTransaction(customerId, 'sale', sellingPrice, `Sold ${quantity}kg of ${commodity.name}`, 'completed');
    
    // Close modal and refresh
    closeSellModal();
    loadCustomerData(customerId);
    loadPortfolio(customerId);
    loadTransactions(customerId);
    updateDashboardStats(customerId);
    
    alert(`Sale successful! You have sold ${quantity}kg of ${commodity.name} for ₦${formatNumber(sellingPrice)}`);
}

// Transaction functions
function addTransaction(customerId, type, amount, description, status = 'completed') {
    const transaction = {
        id: Date.now().toString(),
        customerId: customerId,
        type: type,
        amount: amount,
        description: description,
        status: status,
        date: new Date().toISOString()
    };
    
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    transactions.push(transaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

function loadTransactions(customerId) {
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const tbody = document.getElementById('transactionTableBody');
    
    const customerTransactions = transactions.filter(t => t.customerId === customerId);
    
    if (customerTransactions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="no-data">No transactions yet</td></tr>';
        return;
    }
    
    // Sort by date (newest first)
    const sortedTransactions = customerTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    tbody.innerHTML = sortedTransactions.map(transaction => {
        const typeClass = transaction.type === 'credit' || transaction.type === 'sale' ? 'text-success' : 'text-danger';
        const statusClass = transaction.status === 'completed' ? 'text-success' : 'text-warning';
        
        return `
            <tr>
                <td>${formatDate(transaction.date)}</td>
                <td><strong class="${typeClass}">${transaction.type.toUpperCase()}</strong></td>
                <td>${transaction.description}</td>
                <td><strong>₦${formatNumber(transaction.amount)}</strong></td>
                <td><span class="${statusClass}">${transaction.status.toUpperCase()}</span></td>
            </tr>
        `;
    }).join('');
}

function filterTransactions() {
    const dateFilter = document.getElementById('transactionDateFilter').value;
    const typeFilter = document.getElementById('transactionTypeFilter').value;
    const customerId = localStorage.getItem('customerId');
    
    let transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    
    // Apply customer filter
    transactions = transactions.filter(t => t.customerId === customerId);
    
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
    
    tbody.innerHTML = sortedTransactions.map(transaction => {
        const typeClass = transaction.type === 'credit' || transaction.type === 'sale' ? 'text-success' : 'text-danger';
        const statusClass = transaction.status === 'completed' ? 'text-success' : 'text-warning';
        
        return `
            <tr>
                <td>${formatDate(transaction.date)}</td>
                <td><strong class="${typeClass}">${transaction.type.toUpperCase()}</strong></td>
                <td>${transaction.description}</td>
                <td><strong>₦${formatNumber(transaction.amount)}</strong></td>
                <td><span class="${statusClass}">${transaction.status.toUpperCase()}</span></td>
            </tr>
        `;
    }).join('');
}

// Transfer functions
function showTransferTab(tabName) {
    // Hide all forms
    document.querySelectorAll('.transfer-form').forEach(form => {
        form.classList.remove('active');
    });
    
    // Remove active class from all tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected form
    document.getElementById(tabName + 'Form').classList.add('active');
    
    // Add active class to clicked tab
    event.target.classList.add('active');
}

function setupTransferForms() {
    // Deposit form
    const depositForm = document.getElementById('depositFormSubmit');
    if (depositForm) {
        depositForm.addEventListener('submit', handleDeposit);
    }
    
    // Withdraw form
    const withdrawForm = document.getElementById('withdrawFormSubmit');
    if (withdrawForm) {
        withdrawForm.addEventListener('submit', handleWithdraw);
    }
    
    // Transfer form
    const transferForm = document.getElementById('transferFormSubmit');
    if (transferForm) {
        transferForm.addEventListener('submit', handleTransfer);
    }
}

function handleDeposit(e) {
    e.preventDefault();
    
    const form = e.target;
    const customerId = localStorage.getItem('customerId');
    const amount = parseFloat(form.amount.value);
    
    // In a real application, this would process the payment
    // For now, we'll simulate it by adding to pending
    
    const deposit = {
        id: Date.now().toString(),
        customerId: customerId,
        type: 'credit',
        amount: amount,
        description: `Deposit - Ref: ${form.reference.value}`,
        reference: form.reference.value,
        status: 'pending',
        date: new Date().toISOString()
    };
    
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    transactions.push(deposit);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    
    alert(`Deposit request of ₦${formatNumber(amount)} submitted successfully! Your wallet will be credited after verification.`);
    
    form.reset();
    loadTransactions(customerId);
}

function handleWithdraw(e) {
    e.preventDefault();
    
    const form = e.target;
    const customerId = localStorage.getItem('customerId');
    const amount = parseFloat(form.amount.value);
    
    const customers = JSON.parse(localStorage.getItem('customers') || '[]');
    const customer = customers.find(c => c.id === customerId);
    
    if (!customer) {
        alert('Error: Customer not found');
        return;
    }
    
    if (customer.walletBalance < amount) {
        alert('Insufficient wallet balance');
        return;
    }
    
    // Deduct from wallet
    customer.walletBalance -= amount;
    localStorage.setItem('customers', JSON.stringify(customers));
    
    // Add transaction
    addTransaction(customerId, 'debit', amount, `Withdrawal - ${form.reason.value}`, 'pending');
    
    alert(`Withdrawal request of ₦${formatNumber(amount)} submitted successfully! Funds will be transferred to your registered bank account.`);
    
    form.reset();
    loadCustomerData(customerId);
    loadTransactions(customerId);
}

function handleTransfer(e) {
    e.preventDefault();
    
    const form = e.target;
    const customerId = localStorage.getItem('customerId');
    const amount = parseFloat(form.amount.value);
    
    const customers = JSON.parse(localStorage.getItem('customers') || '[]');
    const customer = customers.find(c => c.id === customerId);
    
    if (!customer) {
        alert('Error: Customer not found');
        return;
    }
    
    if (customer.walletBalance < amount) {
        alert('Insufficient wallet balance');
        return;
    }
    
    // Deduct from wallet
    customer.walletBalance -= amount;
    localStorage.setItem('customers', JSON.stringify(customers));
    
    // Add transaction with full details
    const transfer = {
        id: Date.now().toString(),
        customerId: customerId,
        type: 'debit',
        amount: amount,
        description: `Transfer to ${form.accountName.value} (${form.bankName.value} - ${form.accountNumber.value}): ${form.description.value}`,
        status: 'completed',
        date: new Date().toISOString()
    };
    
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    transactions.push(transfer);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    
    alert(`Transfer of ₦${formatNumber(amount)} to ${form.accountName.value} successful!`);
    
    form.reset();
    loadCustomerData(customerId);
    loadTransactions(customerId);
}

// Dashboard stats
function updateDashboardStats(customerId) {
    const portfolios = JSON.parse(localStorage.getItem('portfolios') || '[]');
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    
    const customerPortfolio = portfolios.find(p => p.customerId === customerId);
    const customerTransactions = transactions.filter(t => t.customerId === customerId);
    
    // Calculate total investments
    let totalInvestments = 0;
    let totalProfit = 0;
    let ownedCommodities = 0;
    
    if (customerPortfolio && customerPortfolio.holdings) {
        ownedCommodities = customerPortfolio.holdings.length;
        
        customerPortfolio.holdings.forEach(holding => {
            const commodities = JSON.parse(localStorage.getItem('commodities') || '[]');
            const commodity = commodities.find(c => c.id === holding.commodityId);
            
            if (commodity) {
                const currentPricePerKg = commodity.currentPrice / commodity.weight;
                const currentValue = holding.quantity * currentPricePerKg;
                
                totalInvestments += holding.investedAmount;
                totalProfit += (currentValue - holding.investedAmount);
            }
        });
    }
    
    // Monthly transactions
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyTransactions = customerTransactions.filter(t => new Date(t.date) >= monthStart);
    
    document.getElementById('totalInvestments').textContent = `₦${formatNumber(totalInvestments)}`;
    document.getElementById('totalProfit').innerHTML = `<span class="${totalProfit >= 0 ? 'text-success' : 'text-danger'}">₦${formatNumber(totalProfit)}</span>`;
    document.getElementById('ownedCommodities').textContent = ownedCommodities;
    document.getElementById('monthlyTransactions').textContent = monthlyTransactions.length;
}

// Market trends
function loadMarketTrends() {
    const commodities = JSON.parse(localStorage.getItem('commodities') || '[]');
    
    const riceTrend = calculateCategoryTrend(commodities, 'rice');
    const beansTrend = calculateCategoryTrend(commodities, 'beans');
    const garriTrend = calculateCategoryTrend(commodities, 'garri');
    
    document.getElementById('riceTrend').innerHTML = riceTrend;
    document.getElementById('beansTrend').innerHTML = beansTrend;
    document.getElementById('garriTrend').innerHTML = garriTrend;
}

function calculateCategoryTrend(commodities, category) {
    const categoryCommodities = commodities.filter(c => c.category === category);
    
    if (categoryCommodities.length === 0) {
        return '<span class="trend-neutral">No data</span>';
    }
    
    const prices = categoryCommodities.map(c => c.currentPrice);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    // Simulate trend
    const trend = Math.random() > 0.5 ? (Math.random() > 0.5 ? 'up' : 'down') : 'stable';
    
    let trendClass = 'trend-neutral';
    let trendIcon = '➡️';
    
    if (trend === 'up') {
        trendClass = 'trend-up';
        trendIcon = '📈';
    } else if (trend === 'down') {
        trendClass = 'trend-down';
        trendIcon = '📉';
    }
    
    return `<span class="${trendClass}">${trendIcon} Avg: ₦${formatNumber(avgPrice)}</span>`;
}

// Utility functions
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

function getCategoryIcon(category) {
    const icons = {
        rice: '🍚',
        beans: '🫘',
        garri: '🟡'
    };
    return icons[category] || '📦';
}

function calculatePricePerUnit(bagPrice, unitsPerBag) {
    const kgPerUnit = 50 / unitsPerBag;
    const pricePerUnit = bagPrice * kgPerUnit / 50;
    return pricePerUnit;
}

function calculateInterestRate(bagPrice) {
    const baseRate = 31.25;
    const priceFactor = bagPrice / 100000;
    const interestRate = Math.max(5, baseRate - (priceFactor * 15));
    return interestRate;
}

function calculatePendingWithdrawals(customerId) {
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const pendingWithdrawals = transactions.filter(t => 
        t.customerId === customerId && 
        t.type === 'debit' && 
        t.status === 'pending'
    );
    
    return pendingWithdrawals.reduce((sum, t) => sum + t.amount, 0);
}

function refreshData() {
    const customerId = localStorage.getItem('customerId');
    loadCustomerData(customerId);
    loadCommodities();
    loadPortfolio(customerId);
    loadTransactions(customerId);
    loadMarketTrends();
    updateDashboardStats(customerId);
    
    alert('Data refreshed successfully!');
}

function refreshPortfolio() {
    const customerId = localStorage.getItem('customerId');
    loadPortfolio(customerId);
    updateDashboardStats(customerId);
}

// Close modals when clicking outside
window.onclick = function(event) {
    const buyModal = document.getElementById('buyModal');
    const sellModal = document.getElementById('sellModal');
    
    if (event.target === buyModal) {
        closeBuyModal();
    }
    
    if (event.target === sellModal) {
        closeSellModal();
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initializeDashboard);