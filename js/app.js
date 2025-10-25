/*
 * APP.JS - Main Application Logic
 * Handles navigation, form submissions, and table rendering
 */

// ====================
// STATUS TRACKING
// ====================

let lastSyncTime = null;

/**
 * Update online/offline status indicator
 */
function updateOnlineStatus() {
    const onlineStatus = document.getElementById('online-status');
    const statusText = onlineStatus.querySelector('.status-text');

    if (navigator.onLine) {
        onlineStatus.classList.remove('offline');
        statusText.textContent = 'Online';
    } else {
        onlineStatus.classList.add('offline');
        statusText.textContent = 'Offline';
    }
}

/**
 * Update last sync time display
 */
function updateLastSyncDisplay() {
    console.log('🔍 updateLastSyncDisplay called');
    const syncText = document.getElementById('last-sync-text');

    console.log('  - Element found:', !!syncText);
    console.log('  - lastSyncTime:', lastSyncTime);

    if (!syncText) {
        console.warn('⚠️ last-sync-text element not found');
        return;
    }

    if (!lastSyncTime) {
        console.log('  - No lastSyncTime, setting to "No sincronizado"');
        syncText.textContent = 'No sincronizado';
        return;
    }

    const now = new Date();
    const diff = now - lastSyncTime;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    console.log('  - Time diff:', { seconds, minutes, hours });

    let newText = '';
    if (seconds < 10) {
        newText = 'Justo ahora';
    } else if (seconds < 60) {
        newText = `Hace ${seconds}s`;
    } else if (minutes < 60) {
        newText = `Hace ${minutes}m`;
    } else if (hours < 24) {
        newText = `Hace ${hours}h`;
    } else {
        const days = Math.floor(hours / 24);
        newText = `Hace ${days}d`;
    }

    console.log('  - Setting text to:', newText);
    syncText.textContent = newText;
    console.log('  - Text is now:', syncText.textContent);
}

/**
 * Mark sync as in progress
 */
function setSyncing() {
    const syncStatus = document.getElementById('sync-status');
    if (syncStatus) {
        syncStatus.classList.add('syncing');
    }
}

/**
 * Mark sync as complete
 */
function setSyncComplete() {
    const syncStatus = document.getElementById('sync-status');
    if (syncStatus) {
        syncStatus.classList.remove('syncing');
    }
    lastSyncTime = new Date();
    updateLastSyncDisplay();
    console.log('✅ Sync complete at:', lastSyncTime.toLocaleTimeString());
}

/**
 * Initialize status tracking
 */
function initializeStatusTracking() {
    // Update online status
    updateOnlineStatus();
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Update last sync time every 10 seconds
    setInterval(updateLastSyncDisplay, 10000);

    console.log('✅ Status tracking initialized');
}

// ====================
// TOAST NOTIFICATIONS
// ====================

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icon = type === 'success' ? '🍺' : type === 'error' ? '❌' : 'ℹ️';

    toast.innerHTML = `
        <span class="toast-icon">${icon}</span>
        <span class="toast-message">${message}</span>
        <span class="toast-close" onclick="this.parentElement.remove()">×</span>
    `;

    container.appendChild(toast);

    // Auto remove after 4 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// ====================
// CUSTOM MODAL DIALOG
// ====================

function showConfirmDialog(options) {
    return new Promise((resolve) => {
        const {
            title = '¿Confirmar acción?',
            message = '¿Está seguro de que desea continuar?',
            confirmText = 'Confirmar',
            cancelText = 'Cancelar',
            icon = '❓',
            isDanger = false
        } = options;

        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';

        // Create modal
        const modal = document.createElement('div');
        modal.className = 'modal';

        modal.innerHTML = `
            <div class="modal-header">
                <span class="modal-icon">${icon}</span>
                <h3 class="modal-title">${title}</h3>
            </div>
            <p class="modal-message">${message}</p>
            <div class="modal-actions">
                <button class="modal-btn modal-btn-cancel">${cancelText}</button>
                <button class="modal-btn ${isDanger ? 'modal-btn-danger' : 'modal-btn-confirm'}">${confirmText}</button>
            </div>
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // Handle button clicks
        const cancelBtn = modal.querySelector('.modal-btn-cancel');
        const confirmBtn = modal.querySelector('.modal-btn-confirm, .modal-btn-danger');

        function closeModal(result) {
            overlay.style.animation = 'fadeInOverlay 0.2s ease-out reverse';
            modal.style.animation = 'slideUp 0.2s ease-out reverse';
            setTimeout(() => {
                document.body.removeChild(overlay);
                resolve(result);
            }, 200);
        }

        cancelBtn.addEventListener('click', () => closeModal(false));
        confirmBtn.addEventListener('click', () => closeModal(true));
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal(false);
        });
    });
}

// ====================
// NAVIGATION
// ====================

function initializeNavigation() {
    // Initialize submenu card clicks
    const submenuCards = document.querySelectorAll('.submenu-card');
    console.log(`📋 Found ${submenuCards.length} menu cards`);

    submenuCards.forEach(card => {
        card.addEventListener('click', function() {
            const targetSection = this.getAttribute('data-section');
            console.log(`🖱️ Card clicked: ${targetSection}`);
            showSection(targetSection);
        });
    });
}

function showMenuGroup(group) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });

    // Show the submenu for this group
    document.getElementById(`${group}-menu`).classList.add('active');

    // Show back button
    document.getElementById('back-btn').style.display = 'inline-flex';
}

function showSection(sectionId) {
    console.log('🔄 Switching to section:', sectionId);

    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });

    // Show the target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        console.log('✅ Section shown:', sectionId);
    } else {
        console.error('❌ Section not found:', sectionId);
    }

    // Show back button if it exists
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
        backBtn.style.display = 'inline-flex';
    }

    // If navigating to dashboard, update it
    if (sectionId === 'dashboard') {
        updateDashboard();
    }
}

function goToHome() {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });

    // Show home
    document.getElementById('home').classList.add('active');

    // Hide back button
    document.getElementById('back-btn').style.display = 'none';
}

// ====================
// PRODUCTION MODULE
// ====================

function initializeProductionForm() {
    const form = document.getElementById('production-form');

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const productionData = {
            date: document.getElementById('prod-date').value,
            beerName: document.getElementById('prod-beer-name').value,
            volume: document.getElementById('prod-volume').value,
            laborHours: document.getElementById('prod-hours').value,
            ingredientCost: document.getElementById('prod-ingredients').value
        };

        try {
            if (editingProductionId) {
                // Update existing record
                await updateProduction(editingProductionId, productionData);
                showToast('Registro de producción actualizado');
                cancelProductionEdit();
            } else {
                // Create new record
                await addProduction(productionData);
                form.reset();
            }
            renderProductionTable();
            updateDashboard();
        } catch (error) {
            console.error('Error saving production:', error);
        }
    });

    // Set today's date as default
    document.getElementById('prod-date').valueAsDate = new Date();
}

function renderProductionTable() {
    const tbody = document.getElementById('production-tbody');
    const production = getAllProduction();

    tbody.innerHTML = '';

    if (production.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No hay registros de producción</td></tr>';
        return;
    }

    production.forEach(batch => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDate(batch.date)}</td>
            <td>${escapeHtml(batch.beerName)}</td>
            <td>${formatNumber(batch.volume, 1)}</td>
            <td>${formatNumber(batch.laborHours, 1)}</td>
            <td>${formatCurrency(batch.ingredientCost)}</td>
            <td>
                <button onclick="editProductionBatch('${batch.id}')">Editar</button>
                <button onclick="deleteProductionBatch('${batch.id}')">Eliminar</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

let editingProductionId = null;

function editProductionBatch(id) {
    const batch = getProduction(id);
    if (!batch) return;

    // Populate form with existing data
    document.getElementById('prod-date').value = batch.date;
    document.getElementById('prod-beer-name').value = batch.beerName;
    document.getElementById('prod-volume').value = batch.volume;
    document.getElementById('prod-hours').value = batch.laborHours;
    document.getElementById('prod-ingredients').value = batch.ingredientCost;

    // Store the ID being edited
    editingProductionId = id;

    // Change button text
    const submitBtn = document.querySelector('#production-form button[type="submit"]');
    submitBtn.textContent = 'Actualizar Lote';

    // Scroll to form
    document.getElementById('production').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function cancelProductionEdit() {
    editingProductionId = null;
    document.getElementById('production-form').reset();
    const submitBtn = document.querySelector('#production-form button[type="submit"]');
    submitBtn.textContent = 'Registrar Lote';
}

async function deleteProductionBatch(id) {
    const confirmed = await showConfirmDialog({
        title: 'Eliminar Registro',
        message: '¿Está seguro de que desea eliminar este registro de producción?',
        confirmText: 'Sí, eliminar',
        cancelText: 'Cancelar',
        icon: '🗑️',
        isDanger: true
    });

    if (confirmed) {
        try {
            await deleteProduction(id);
            renderProductionTable();
            updateDashboard();
        } catch (error) {
            console.error('Error deleting production:', error);
        }
    }
}

// ====================
// TRANSACTIONS MODULE
// ====================

function initializeTransactionForm() {
    const form = document.getElementById('transaction-form');

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const transactionData = {
            date: document.getElementById('trx-date').value,
            description: document.getElementById('trx-description').value,
            amount: document.getElementById('trx-amount').value,
            type: document.getElementById('trx-type').value,
            category: document.getElementById('trx-category').value
        };

        try {
            if (editingTransactionId) {
                // Update existing record
                await updateTransaction(editingTransactionId, transactionData);
                showToast('Transacción actualizada');
                cancelTransactionEdit();
            } else {
                // Create new record
                await addTransaction(transactionData);
                form.reset();
            }
            renderTransactionTable();
            updateDashboard();
        } catch (error) {
            console.error('Error saving transaction:', error);
        }
    });

    // Set today's date as default
    document.getElementById('trx-date').valueAsDate = new Date();
}

function renderTransactionTable() {
    const tbody = document.getElementById('transaction-tbody');
    const transactions = getAllTransactions();

    tbody.innerHTML = '';

    if (transactions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No hay transacciones registradas</td></tr>';
        return;
    }

    transactions.forEach(trx => {
        const row = document.createElement('tr');
        const typeLabel = trx.type === 'income' ? 'Ingreso' : 'Gasto';
        const typeClass = trx.type === 'income' ? 'status-positive' : 'status-negative';
        const amountDisplay = trx.type === 'income' ? '+' + formatCurrency(trx.amount) : '-' + formatCurrency(trx.amount);

        row.innerHTML = `
            <td>${formatDate(trx.date)}</td>
            <td>${escapeHtml(trx.description)}</td>
            <td class="${typeClass}">${typeLabel}</td>
            <td>${getCategoryDisplayName(trx.category)}</td>
            <td class="${typeClass}">${amountDisplay}</td>
            <td>
                <button onclick="editTransactionRecord('${trx.id}')">Editar</button>
                <button onclick="deleteTransactionRecord('${trx.id}')">Eliminar</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

let editingTransactionId = null;

function editTransactionRecord(id) {
    const trx = getTransaction(id);
    if (!trx) return;

    // Populate form with existing data
    document.getElementById('trx-date').value = trx.date;
    document.getElementById('trx-description').value = trx.description;
    document.getElementById('trx-amount').value = trx.amount;
    document.getElementById('trx-type').value = trx.type;
    document.getElementById('trx-category').value = trx.category;

    // Store the ID being edited
    editingTransactionId = id;

    // Change button text
    const submitBtn = document.querySelector('#transaction-form button[type="submit"]');
    submitBtn.textContent = 'Actualizar Transacción';

    // Scroll to form
    document.getElementById('transactions').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function cancelTransactionEdit() {
    editingTransactionId = null;
    document.getElementById('transaction-form').reset();
    const submitBtn = document.querySelector('#transaction-form button[type="submit"]');
    submitBtn.textContent = 'Registrar Transacción';
}

async function deleteTransactionRecord(id) {
    const confirmed = await showConfirmDialog({
        title: 'Eliminar Transacción',
        message: '¿Está seguro de que desea eliminar esta transacción?',
        confirmText: 'Sí, eliminar',
        cancelText: 'Cancelar',
        icon: '🗑️',
        isDanger: true
    });

    if (confirmed) {
        try {
            await deleteTransaction(id);
            renderTransactionTable();
            updateDashboard();
        } catch (error) {
            console.error('Error deleting transaction:', error);
        }
    }
}

// ====================
// SALES MODULE
// ====================

function initializeSalesForm() {
    const form = document.getElementById('sales-form');

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const salesData = {
            date: document.getElementById('sales-date').value,
            revenue: document.getElementById('sales-revenue').value,
            volumeSold: document.getElementById('sales-volume').value
        };

        try {
            if (editingSalesId) {
                // Update existing record
                await updateSales(editingSalesId, salesData);
                showToast('Registro de ventas actualizado');
                cancelSalesEdit();
            } else {
                // Create new record
                await addSales(salesData);
                form.reset();
            }
            renderSalesTable();
            updateDashboard();
        } catch (error) {
            console.error('Error saving sales:', error);
        }
    });

    // Set today's date as default
    document.getElementById('sales-date').valueAsDate = new Date();
}

function renderSalesTable() {
    const tbody = document.getElementById('sales-tbody');
    const sales = getAllSales();

    tbody.innerHTML = '';

    if (sales.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No hay ventas registradas</td></tr>';
        return;
    }

    sales.forEach(sale => {
        const avgPrice = sale.volumeSold > 0 ? sale.revenue / sale.volumeSold : 0;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDate(sale.date)}</td>
            <td>${formatCurrency(sale.revenue)}</td>
            <td>${formatNumber(sale.volumeSold, 1)}</td>
            <td>${formatCurrency(avgPrice)}</td>
            <td>
                <button onclick="editSalesRecord('${sale.id}')">Editar</button>
                <button onclick="deleteSalesRecord('${sale.id}')">Eliminar</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

let editingSalesId = null;

function editSalesRecord(id) {
    const sale = getSales(id);
    if (!sale) return;

    // Populate form with existing data
    document.getElementById('sales-date').value = sale.date;
    document.getElementById('sales-revenue').value = sale.revenue;
    document.getElementById('sales-volume').value = sale.volumeSold;

    // Store the ID being edited
    editingSalesId = id;

    // Change button text
    const submitBtn = document.querySelector('#sales-form button[type="submit"]');
    submitBtn.textContent = 'Actualizar Ventas';

    // Scroll to form
    document.getElementById('sales').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function cancelSalesEdit() {
    editingSalesId = null;
    document.getElementById('sales-form').reset();
    const submitBtn = document.querySelector('#sales-form button[type="submit"]');
    submitBtn.textContent = 'Registrar Ventas';
}

async function deleteSalesRecord(id) {
    const confirmed = await showConfirmDialog({
        title: 'Eliminar Ventas',
        message: '¿Está seguro de que desea eliminar este registro de ventas?',
        confirmText: 'Sí, eliminar',
        cancelText: 'Cancelar',
        icon: '🗑️',
        isDanger: true
    });

    if (confirmed) {
        try {
            await deleteSales(id);
            renderSalesTable();
            updateDashboard();
        } catch (error) {
            console.error('Error deleting sales:', error);
        }
    }
}

// ====================
// CONFIGURATION MODULE
// ====================

function initializeConfigForm() {
    const form = document.getElementById('config-form');

    // Load current configuration
    loadConfigValues();

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const configData = {
            laborRate: parseFloat(document.getElementById('config-labor-rate').value)
        };

        const margin = parseFloat(document.getElementById('config-margin').value);

        try {
            // Update config
            await updateConfig({
                laborRate: configData.laborRate,
                profitMarginPercentage: margin
            });

            // Refresh displays
            loadConfigValues();
            updateDashboard();

            // Hide form, show view
            toggleConfigEdit();
        } catch (error) {
            console.error('Error updating config:', error);
        }
    });
}

function toggleConfigEdit() {
    const view = document.getElementById('config-view');
    const form = document.getElementById('config-form');
    const editBtn = document.getElementById('config-edit-btn');

    if (form.style.display === 'none') {
        // Show form, hide view
        form.style.display = 'block';
        view.style.display = 'none';
        editBtn.style.display = 'none';
    } else {
        // Show view, hide form
        form.style.display = 'none';
        view.style.display = 'block';
        editBtn.style.display = 'block';
    }
}

function loadConfigValues() {
    const config = getConfig();

    // Populate form inputs
    document.getElementById('config-labor-rate').value = config.laborRate || 150;
    document.getElementById('config-margin').value = config.profitMarginPercentage || 60;

    // Update read-only view
    document.getElementById('view-labor-rate').textContent = formatCurrency(config.laborRate || 150) + '/hora';
    document.getElementById('view-margin').textContent = (config.profitMarginPercentage || 60) + '%';

    // Update configured repo display
    const repo = getGitHubRepo();
    const repoDisplay = document.getElementById('configured-repo');
    if (repoDisplay && repo) {
        repoDisplay.textContent = repo;
    }
}

// ====================
// GITHUB SYNC MODULE
// ====================

function initializeGitHubSync() {
    // Load token if exists and show sync controls
    const token = getGitHubToken();
    if (token) {
        document.getElementById('github-token').value = token;
        document.getElementById('sync-controls').style.display = 'block';
        updateLastSyncDisplay();
    }
}

function saveGitHubToken() {
    const token = document.getElementById('github-token').value.trim();

    if (!token) {
        showToast('Por favor ingrese un token válido', 'error');
        return;
    }

    // Validate token format (should start with ghp_ or github_pat_)
    if (!token.startsWith('ghp_') && !token.startsWith('github_pat_')) {
        showToast('El token no parece válido. Debe comenzar con ghp_ o github_pat_', 'error');
        return;
    }

    setGitHubToken(token);
    document.getElementById('sync-controls').style.display = 'block';
    showToast('Token de GitHub guardado exitosamente');
}

async function syncToGitHub() {
    if (!isGitHubConfigured()) {
        showToast('Por favor configure su token de GitHub primero', 'error');
        return;
    }

    const syncBtn = document.querySelector('#sync-controls button');
    const syncBtnText = document.getElementById('sync-btn-text');
    const syncStatus = document.getElementById('sync-status');

    try {
        // Disable button and show loading
        syncBtn.disabled = true;
        syncBtnText.textContent = 'Sincronizando...';
        syncStatus.textContent = '⏳ Guardando datos...';
        syncStatus.style.color = '#666';

        // Collect all data from localStorage
        const config = getConfig();
        const production = getAllProduction();
        const transactions = getAllTransactions();
        const sales = getAllSales();

        // Save to GitHub
        await saveAllToGitHub({
            config,
            production,
            transactions,
            sales
        });

        syncStatus.textContent = '✓ Sincronizado exitosamente';
        syncStatus.style.color = '#28A745';
        showToast('Datos sincronizados con GitHub exitosamente');

        updateLastSyncDisplay();

        // Reset status after 3 seconds
        setTimeout(() => {
            syncStatus.textContent = '';
        }, 3000);

    } catch (error) {
        console.error('Error syncing to GitHub:', error);
        syncStatus.textContent = '✗ Error en la sincronización';
        syncStatus.style.color = '#DC3545';
        showToast('Error al sincronizar: ' + error.message, 'error');
    } finally {
        syncBtn.disabled = false;
        syncBtnText.textContent = 'Sincronizar Ahora';
    }
}

async function loadFromGitHubAndMerge() {
    if (!isGitHubConfigured()) {
        return; // Silently skip if not configured
    }

    try {
        const githubData = await loadAllFromGitHub();

        // Get local data
        const localData = {
            config: getConfig(),
            production: getAllProduction(),
            transactions: getAllTransactions(),
            sales: getAllSales()
        };

        // Merge data (latest timestamp wins)
        const merged = mergeData(githubData, localData);

        // Save merged data to localStorage
        saveConfig(merged.config);

        // Clear and reload production
        const data = loadData();
        data.production = merged.production;
        data.transactions = merged.transactions;
        data.sales = merged.sales;
        saveData(data);

        console.log('Data loaded and merged from GitHub');
        return true;
    } catch (error) {
        console.error('Error loading from GitHub:', error);
        return false;
    }
}

// ====================
// REPORTS MODULE
// ====================

function generateReport() {
    const month = document.getElementById('report-month').value;
    const year = document.getElementById('report-year').value;

    if (!year) {
        showToast('Por favor seleccione un año', 'error');
        return;
    }

    const reportContent = document.getElementById('report-content');

    // Calculate metrics
    const revenue = calculateTotalRevenue(month, year);
    const expenses = calculateTotalExpenses(month, year);
    const profit = calculateProfit(month, year);
    const cpp = calculateCostPerBeer(month, year);
    const pints = calculateTotalPintsProduced(month, year);

    // Format period label
    let periodLabel = year;
    if (month) {
        periodLabel = `${getMonthName(parseInt(month))} ${year}`;
    }

    // Generate report HTML
    const reportHTML = `
        <div class="report">
            <h3 class="text-center">Estado de Pérdidas y Ganancias (PyG)</h3>
            <p class="text-center"><strong>Periodo: ${periodLabel}</strong></p>
            <hr>

            <div class="report-section">
                <h4>Ingresos</h4>
                <table>
                    <tr>
                        <td>Ingresos Brutos</td>
                        <td class="text-right status-positive"><strong>${formatCurrency(revenue)}</strong></td>
                    </tr>
                </table>
            </div>

            <div class="report-section">
                <h4>Gastos</h4>
                <table>
                    ${generateExpenseBreakdownRows(expenses.breakdown)}
                    <tr style="border-top: 2px solid #802A2A;">
                        <td><strong>Total Gastos</strong></td>
                        <td class="text-right status-negative"><strong>${formatCurrency(expenses.total)}</strong></td>
                    </tr>
                </table>
            </div>

            <div class="report-section">
                <h4>Resultado</h4>
                <table>
                    <tr class="${profit >= 0 ? 'status-positive' : 'status-negative'}">
                        <td><strong>${profit >= 0 ? 'Ganancia Neta' : 'Pérdida Neta'}</strong></td>
                        <td class="text-right"><strong>${formatCurrency(Math.abs(profit))}</strong></td>
                    </tr>
                </table>
            </div>

            <hr>

            <div class="report-section">
                <h4>Análisis de Producción</h4>
                <table>
                    <tr>
                        <td>Total Pintas Producidas</td>
                        <td class="text-right">${formatNumber(pints, 0)}</td>
                    </tr>
                    <tr>
                        <td>Costo por Pinta (CPP)</td>
                        <td class="text-right"><strong>${formatCurrency(cpp.costPerBeer)}</strong></td>
                    </tr>
                    <tr>
                        <td>Costo Variable Total</td>
                        <td class="text-right">${formatCurrency(cpp.totalVariableCost)}</td>
                    </tr>
                    <tr>
                        <td>Costo de Mano de Obra</td>
                        <td class="text-right">${formatCurrency(cpp.totalDirectLaborCost)}</td>
                    </tr>
                    <tr>
                        <td>Costos Fijos Amortizados</td>
                        <td class="text-right">${formatCurrency(cpp.totalFixedCostAmortization)}</td>
                    </tr>
                </table>
            </div>

            <div class="report-section">
                <h4>Producción por Tipo de Chela</h4>
                <table>
                    ${generateBeerProductionBreakdown(month, year)}
                </table>
            </div>
        </div>
    `;

    reportContent.innerHTML = reportHTML;
}

function generateExpenseBreakdownRows(breakdown) {
    let rows = '';
    for (const [category, amount] of Object.entries(breakdown)) {
        rows += `
            <tr>
                <td>${getCategoryDisplayName(category)}</td>
                <td class="text-right">${formatCurrency(amount)}</td>
            </tr>
        `;
    }
    return rows || '<tr><td colspan="2" class="text-center">No hay gastos registrados</td></tr>';
}

function generateBeerProductionBreakdown(month = null, year = null) {
    const beerPricing = calculateCostPerBeerByType(month, year);

    let rows = '<thead><tr><th>Chela</th><th>Lotes</th><th>Chelas</th><th>CPC</th><th>Precio Recomendado</th></tr></thead><tbody>';

    if (beerPricing.length === 0) {
        rows += '<tr><td colspan="5" class="text-center">No hay producción registrada</td></tr>';
    } else {
        beerPricing.forEach(beer => {
            rows += `
                <tr>
                    <td><strong>${escapeHtml(beer.beerName)}</strong></td>
                    <td>${beer.batches}</td>
                    <td>${formatNumber(beer.totalPints, 0)}</td>
                    <td>${formatCurrency(beer.costPerPint)}</td>
                    <td class="status-positive"><strong>${formatCurrency(beer.recommendedPrice)}</strong></td>
                </tr>
            `;
        });

        // Add note about profit margin
        const margin = getProfitMarginPercentage();
        rows += `
            <tr>
                <td colspan="5" style="text-align: center; font-size: 0.9em; color: #666; padding-top: 1rem;">
                    <em>Precio Recomendado = CPC + ${margin}% de margen (margen de ganancia configurable)</em>
                </td>
            </tr>
        `;
    }

    rows += '</tbody>';
    return rows;
}

// ====================
// UTILITY FUNCTIONS
// ====================

function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ====================
// INITIALIZATION
// ====================

/**
 * Initialize the main application
 * Called by auth.js after successful authentication
 */
async function initializeApp() {
    console.log('🚀 Initializing Molina App...');

    // Initialize status tracking FIRST
    initializeStatusTracking();
    console.log('✅ Status tracking initialized');

    // Initialize navigation early so cards work immediately
    initializeNavigation();
    console.log('✅ Navigation initialized');

    // Load data from GitHub
    await initializeDataOnLoad();
    console.log('✅ Data loaded from GitHub');

    // Initialize all form modules
    initializeProductionForm();
    initializeTransactionForm();
    initializeSalesForm();
    initializeConfigForm();
    console.log('✅ Forms initialized');

    // Render initial tables
    renderProductionTable();
    renderTransactionTable();
    renderSalesTable();
    console.log('✅ Tables rendered');

    // Initialize dashboard
    initializeYearFilters();
    updateDashboard();
    console.log('✅ Dashboard updated');

    // Force update sync status display one more time
    setTimeout(() => {
        updateLastSyncDisplay();
        console.log('🔄 Sync status display force updated');
    }, 100);

    console.log('🎉 Molina App fully initialized and ready!');
}

// DOM Content Loaded is handled by auth.js
// App will only initialize after successful authentication
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM loaded, waiting for authentication...');
    // Auth system will call initializeApp() after successful login
});
