/*
 * DASHBOARD.JS - Dashboard Rendering and Charts
 * Handles KPI display and Chart.js visualizations
 */

// Chart instances (global to allow updates)
let revenueExpensesChart = null;
let expenseBreakdownChart = null;
let productionChart = null;
let cppTrendChart = null;

// Preload logo image
const logoImage = new Image();
logoImage.src = 'assets/logo-molina.png';

// Logo watermark plugin
const logoWatermarkPlugin = {
    id: 'logoWatermark',
    beforeDraw: (chart) => {
        if (!logoImage.complete) return; // Wait for image to load

        const ctx = chart.ctx;
        const {top, left, width, height} = chart.chartArea;

        // Calculate watermark size
        // Doughnut charts use 45%, line/bar charts use 50% to match visual impact
        const isDoughnut = chart.config.type === 'doughnut';
        const sizeMultiplier = isDoughnut ? 0.45 : 0.50;
        const maxSize = Math.min(width, height) * sizeMultiplier;
        const imgWidth = maxSize;
        const imgHeight = maxSize;
        const x = left + (width - imgWidth) / 2;
        const y = top + (height - imgHeight) / 2;

        ctx.save();
        ctx.globalAlpha = 0.12; // Slightly more visible
        ctx.drawImage(logoImage, x, y, imgWidth, imgHeight);
        ctx.restore();
    }
};

/**
 * Update Dashboard
 * Main function to refresh all dashboard elements
 */
function updateDashboard() {
    const month = document.getElementById('filter-month').value;
    const year = document.getElementById('filter-year').value;

    updateKPIs(month, year);
    updateCharts(month, year);
}

/**
 * Update KPI Cards
 */
function updateKPIs(month = null, year = null) {
    // Calculate metrics
    const revenue = calculateTotalRevenue(month, year);
    const expenses = calculateTotalExpenses(month, year).total;
    const profit = calculateProfit(month, year);
    const pints = calculateTotalPintsProduced(month, year);
    const cpp = calculateCostPerBeer(month, year);

    // Update KPI elements
    document.getElementById('kpi-revenue').textContent = formatCurrency(revenue);
    document.getElementById('kpi-expenses').textContent = formatCurrency(expenses);

    const profitElement = document.getElementById('kpi-profit');
    profitElement.textContent = formatCurrency(profit);
    profitElement.className = 'kpi-value ' + (profit >= 0 ? 'status-positive' : 'status-negative');

    document.getElementById('kpi-pints').textContent = formatNumber(pints, 0);

    // Update Cost Per Beer
    document.getElementById('cost-per-beer').textContent = formatCurrency(cpp.costPerBeer);

    // Update Suggested Price
    const profitMarginMultiplier = getProfitMarginMultiplier();
    const suggestedPrice = cpp.costPerBeer * profitMarginMultiplier;
    document.getElementById('suggested-price').textContent = formatCurrency(suggestedPrice);
    document.getElementById('profit-margin-label').textContent = `Con margen de ${profitMarginMultiplier}x`;
}

/**
 * Update All Charts
 */
function updateCharts(month = null, year = null) {
    const currentYear = year || new Date().getFullYear();

    // Get monthly data for the year
    const monthlyData = getMonthlyDataForYear(currentYear);

    // Update each chart
    updateRevenueExpensesChart(monthlyData);
    updateExpenseBreakdownChart(month, year);
    updateProductionChart(monthlyData);
    updateCPPTrendChart(monthlyData);
}

/**
 * Revenue vs Expenses Chart (Line Chart)
 */
function updateRevenueExpensesChart(monthlyData) {
    const ctx = document.getElementById('revenueExpensesChart').getContext('2d');

    const labels = monthlyData.map(d => d.monthName);
    const revenueData = monthlyData.map(d => d.revenue);
    const expenseData = monthlyData.map(d => d.expenses);

    if (revenueExpensesChart) {
        revenueExpensesChart.destroy();
    }

    revenueExpensesChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Ingresos',
                    data: revenueData,
                    borderColor: '#28A745',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    tension: 0.3,
                    fill: true
                },
                {
                    label: 'Gastos',
                    data: expenseData,
                    borderColor: '#DC3545',
                    backgroundColor: 'rgba(220, 53, 69, 0.1)',
                    tension: 0.3,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + formatCurrency(context.parsed.y);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toLocaleString();
                        }
                    }
                }
            }
        },
        plugins: [logoWatermarkPlugin]
    });
}

/**
 * Expense Breakdown Chart (Pie Chart)
 */
function updateExpenseBreakdownChart(month = null, year = null) {
    const ctx = document.getElementById('expenseBreakdownChart').getContext('2d');

    const expenses = calculateTotalExpenses(month, year);
    const breakdown = expenses.breakdown;

    const labels = Object.keys(breakdown).map(category => getCategoryDisplayName(category));
    const data = Object.values(breakdown);

    const backgroundColors = [
        '#802A2A',
        '#5a1f1f',
        '#DC3545',
        '#FF6B6B',
        '#C92A2A',
        '#A61E1E',
        '#8E1515'
    ];

    if (expenseBreakdownChart) {
        expenseBreakdownChart.destroy();
    }

    expenseBreakdownChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: backgroundColors,
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = formatCurrency(context.parsed);
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return label + ': ' + value + ' (' + percentage + '%)';
                        }
                    }
                }
            }
        },
        plugins: [logoWatermarkPlugin]
    });
}

/**
 * Production Chart (Bar Chart)
 */
function updateProductionChart(monthlyData) {
    const ctx = document.getElementById('productionChart').getContext('2d');

    const labels = monthlyData.map(d => d.monthName);
    const productionData = monthlyData.map(d => d.production);

    if (productionChart) {
        productionChart.destroy();
    }

    productionChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Chelas Producidas',
                data: productionData,
                backgroundColor: '#802A2A',
                borderColor: '#5a1f1f',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return 'Chelas: ' + context.parsed.y.toFixed(0);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString();
                        }
                    }
                }
            }
        },
        plugins: [logoWatermarkPlugin]
    });
}

/**
 * Cost Per Pint Trend Chart (Line Chart)
 */
function updateCPPTrendChart(monthlyData) {
    const ctx = document.getElementById('cppTrendChart').getContext('2d');

    const labels = monthlyData.map(d => d.monthName);
    const cppData = monthlyData.map(d => d.costPerBeer);

    if (cppTrendChart) {
        cppTrendChart.destroy();
    }

    cppTrendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Costo por Chela (MXN)',
                data: cppData,
                borderColor: '#802A2A',
                backgroundColor: 'rgba(128, 42, 42, 0.1)',
                tension: 0.3,
                fill: true,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return 'CPC: ' + formatCurrency(context.parsed.y);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toFixed(2);
                        }
                    }
                }
            }
        },
        plugins: [logoWatermarkPlugin]
    });
}

/**
 * Get display name for expense category
 */
function getCategoryDisplayName(category) {
    const names = {
        'ventas': 'Ventas',
        'otros-ingresos': 'Otros Ingresos',
        'ingredientes': 'Ingredientes',
        'renta': 'Renta',
        'alquiler': 'Renta', // Legacy support
        'salario': 'Salarios',
        'servicios': 'Servicios',
        'marketing': 'Marketing',
        'mantenimiento': 'Mantenimiento',
        'general': 'General'
    };

    return names[category] || category;
}

/**
 * Initialize year filter dropdowns
 */
function initializeYearFilters() {
    const years = getAllYears();
    const currentYear = new Date().getFullYear();

    // If no years in data, add current year
    if (years.length === 0) {
        years.push(currentYear);
    }

    // Dashboard filter
    const dashboardYearSelect = document.getElementById('filter-year');
    dashboardYearSelect.innerHTML = '';
    years.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        if (year === currentYear) {
            option.selected = true;
        }
        dashboardYearSelect.appendChild(option);
    });

    // Report filter
    const reportYearSelect = document.getElementById('report-year');
    reportYearSelect.innerHTML = '';
    years.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        if (year === currentYear) {
            option.selected = true;
        }
        reportYearSelect.appendChild(option);
    });
}

/**
 * Initialize dashboard on page load
 */
document.addEventListener('DOMContentLoaded', function() {
    initializeYearFilters();
    updateDashboard();
});
