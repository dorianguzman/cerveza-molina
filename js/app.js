/*
 * APP.JS - Main Application Logic
 * Handles navigation, form submissions, and table rendering
 */

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
    const navButtons = document.querySelectorAll('.nav-btn');

    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetSection = this.getAttribute('data-section');

            // Update active button
            navButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            // Update active section
            document.querySelectorAll('.section').forEach(section => {
                section.classList.remove('active');
            });
            document.getElementById(targetSection).classList.add('active');

            // If navigating to dashboard, update it
            if (targetSection === 'dashboard') {
                updateDashboard();
            }
        });
    });
}

// ====================
// PRODUCTION MODULE
// ====================

function initializeProductionForm() {
    const form = document.getElementById('production-form');

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const productionData = {
            date: document.getElementById('prod-date').value,
            beerName: document.getElementById('prod-beer-name').value,
            volume: document.getElementById('prod-volume').value,
            laborHours: document.getElementById('prod-hours').value,
            ingredientCost: document.getElementById('prod-ingredients').value
        };

        addProduction(productionData);
        form.reset();
        renderProductionTable();
        showToast('¡Lote de producción registrado exitosamente!');
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
                <button onclick="deleteProductionBatch('${batch.id}')">Eliminar</button>
            </td>
        `;
        tbody.appendChild(row);
    });
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
        deleteProduction(id);
        renderProductionTable();
        updateDashboard();
        showToast('Registro eliminado correctamente', 'success');
    }
}

// ====================
// TRANSACTIONS MODULE
// ====================

function initializeTransactionForm() {
    const form = document.getElementById('transaction-form');

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const transactionData = {
            date: document.getElementById('trx-date').value,
            description: document.getElementById('trx-description').value,
            amount: document.getElementById('trx-amount').value,
            type: document.getElementById('trx-type').value,
            category: document.getElementById('trx-category').value
        };

        addTransaction(transactionData);
        form.reset();
        renderTransactionTable();
        showToast('¡Transacción registrada exitosamente!');
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
                <button onclick="deleteTransactionRecord('${trx.id}')">Eliminar</button>
            </td>
        `;
        tbody.appendChild(row);
    });
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
        deleteTransaction(id);
        renderTransactionTable();
        updateDashboard();
        showToast('Transacción eliminada correctamente', 'success');
    }
}

// ====================
// SALES MODULE
// ====================

function initializeSalesForm() {
    const form = document.getElementById('sales-form');

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const salesData = {
            date: document.getElementById('sales-date').value,
            revenue: document.getElementById('sales-revenue').value,
            volumeSold: document.getElementById('sales-volume').value
        };

        addSales(salesData);
        form.reset();
        renderSalesTable();
        showToast('¡Ventas registradas exitosamente!');
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
                <button onclick="deleteSalesRecord('${sale.id}')">Eliminar</button>
            </td>
        `;
        tbody.appendChild(row);
    });
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
        deleteSales(id);
        renderSalesTable();
        updateDashboard();
        showToast('Ventas eliminadas correctamente', 'success');
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
                <h4>Producción por Tipo de Cerveza</h4>
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

    let rows = '<thead><tr><th>Cerveza</th><th>Lotes</th><th>Cervezas</th><th>CPC</th><th>Precio Recomendado</th></tr></thead><tbody>';

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
        const margin = getProfitMarginMultiplier();
        rows += `
            <tr>
                <td colspan="5" style="text-align: center; font-size: 0.9em; color: #666; padding-top: 1rem;">
                    <em>Precio Recomendado = CPC × ${margin}x (margen de ganancia configurable)</em>
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

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all modules
    initializeNavigation();
    initializeProductionForm();
    initializeTransactionForm();
    initializeSalesForm();

    // Render initial tables
    renderProductionTable();
    renderTransactionTable();
    renderSalesTable();

    // Initialize dashboard
    initializeYearFilters();
    updateDashboard();
});
