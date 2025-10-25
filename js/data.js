/*
 * DATA.JS - Data Model and LocalStorage Management
 * Handles all data persistence and CRUD operations
 */

// Data Storage Key
const STORAGE_KEY = 'claude_brewery_ledger';

// Initialize Data Structure
function initializeData() {
    const defaultData = {
        production: [],
        transactions: [],
        sales: [],
        fixedCosts: {
            laborRate: 150, // MXN per hour - configurable
            monthlyRent: 0,
            monthlySalaries: 0,
            monthlyUtilities: 0
        },
        version: '1.0'
    };

    const existing = localStorage.getItem(STORAGE_KEY);
    if (!existing) {
        saveData(defaultData);
        return defaultData;
    }

    return JSON.parse(existing);
}

// Save Data to LocalStorage
function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Load Data from LocalStorage
function loadData() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : initializeData();
}

// ====================
// PRODUCTION OPERATIONS
// ====================

function addProduction(productionData) {
    const data = loadData();
    const newEntry = {
        id: generateId(),
        date: productionData.date,
        beerName: productionData.beerName,
        volume: parseFloat(productionData.volume), // in pints
        laborHours: parseFloat(productionData.laborHours),
        ingredientCost: parseFloat(productionData.ingredientCost),
        createdAt: new Date().toISOString()
    };

    data.production.push(newEntry);
    saveData(data);
    return newEntry;
}

function getProduction(id) {
    const data = loadData();
    return data.production.find(p => p.id === id);
}

function getAllProduction() {
    const data = loadData();
    return data.production.sort((a, b) => new Date(b.date) - new Date(a.date));
}

function updateProduction(id, updates) {
    const data = loadData();
    const index = data.production.findIndex(p => p.id === id);

    if (index !== -1) {
        data.production[index] = { ...data.production[index], ...updates };
        saveData(data);
        return data.production[index];
    }

    return null;
}

function deleteProduction(id) {
    const data = loadData();
    data.production = data.production.filter(p => p.id !== id);
    saveData(data);
}

// ====================
// TRANSACTION OPERATIONS
// ====================

function addTransaction(transactionData) {
    const data = loadData();
    const newEntry = {
        id: generateId(),
        date: transactionData.date,
        description: transactionData.description,
        amount: parseFloat(transactionData.amount),
        type: transactionData.type, // 'income' or 'expense'
        category: transactionData.category,
        createdAt: new Date().toISOString()
    };

    data.transactions.push(newEntry);
    saveData(data);
    return newEntry;
}

function getTransaction(id) {
    const data = loadData();
    return data.transactions.find(t => t.id === id);
}

function getAllTransactions() {
    const data = loadData();
    return data.transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
}

function updateTransaction(id, updates) {
    const data = loadData();
    const index = data.transactions.findIndex(t => t.id === id);

    if (index !== -1) {
        data.transactions[index] = { ...data.transactions[index], ...updates };
        saveData(data);
        return data.transactions[index];
    }

    return null;
}

function deleteTransaction(id) {
    const data = loadData();
    data.transactions = data.transactions.filter(t => t.id !== id);
    saveData(data);
}

// ====================
// SALES OPERATIONS
// ====================

function addSales(salesData) {
    const data = loadData();
    const newEntry = {
        id: generateId(),
        date: salesData.date,
        revenue: parseFloat(salesData.revenue),
        volumeSold: parseFloat(salesData.volumeSold), // in pints
        createdAt: new Date().toISOString()
    };

    data.sales.push(newEntry);
    saveData(data);
    return newEntry;
}

function getSales(id) {
    const data = loadData();
    return data.sales.find(s => s.id === id);
}

function getAllSales() {
    const data = loadData();
    return data.sales.sort((a, b) => new Date(b.date) - new Date(a.date));
}

function updateSales(id, updates) {
    const data = loadData();
    const index = data.sales.findIndex(s => s.id === id);

    if (index !== -1) {
        data.sales[index] = { ...data.sales[index], ...updates };
        saveData(data);
        return data.sales[index];
    }

    return null;
}

function deleteSales(id) {
    const data = loadData();
    data.sales = data.sales.filter(s => s.id !== id);
    saveData(data);
}

// ====================
// FIXED COSTS OPERATIONS
// ====================

function getFixedCosts() {
    const data = loadData();
    return data.fixedCosts;
}

function updateFixedCosts(updates) {
    const data = loadData();
    data.fixedCosts = { ...data.fixedCosts, ...updates };
    saveData(data);
    return data.fixedCosts;
}

// ====================
// UTILITY FUNCTIONS
// ====================

function generateId() {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Filter data by date range
function filterByDateRange(items, startDate, endDate) {
    return items.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= new Date(startDate) && itemDate <= new Date(endDate);
    });
}

// Filter data by month and year
function filterByMonthYear(items, month, year) {
    return items.filter(item => {
        const itemDate = new Date(item.date);
        const itemMonth = itemDate.getMonth() + 1; // 0-indexed
        const itemYear = itemDate.getFullYear();

        const monthMatch = !month || itemMonth === parseInt(month);
        const yearMatch = !year || itemYear === parseInt(year);

        return monthMatch && yearMatch;
    });
}

// Get all unique years from data
function getAllYears() {
    const data = loadData();
    const allDates = [
        ...data.production.map(p => p.date),
        ...data.transactions.map(t => t.date),
        ...data.sales.map(s => s.date)
    ];

    const years = new Set(allDates.map(date => new Date(date).getFullYear()));
    return Array.from(years).sort((a, b) => b - a);
}

// ====================
// DATA IMPORT/EXPORT
// ====================

function exportData() {
    const data = loadData();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `claude_ledger_export_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

async function importData() {
    const fileInput = document.getElementById('import-file');
    const file = fileInput.files[0];

    if (!file) {
        showToast('Por favor seleccione un archivo JSON', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = async function(e) {
        try {
            const importedData = JSON.parse(e.target.result);

            // Validate data structure
            if (!importedData.production || !importedData.transactions || !importedData.sales) {
                throw new Error('Formato de datos inválido');
            }

            // Confirm before overwriting
            const confirmed = await showConfirmDialog({
                title: 'Importar Datos',
                message: '¿Está seguro de que desea importar estos datos? Esto sobrescribirá todos los datos actuales.',
                confirmText: 'Sí, importar',
                cancelText: 'Cancelar',
                icon: '📥',
                isDanger: true
            });

            if (confirmed) {
                saveData(importedData);
                showToast('¡Datos importados exitosamente! Recargando...', 'success');
                setTimeout(() => window.location.reload(), 1500);
            }
        } catch (error) {
            showToast('Error al importar datos: ' + error.message, 'error');
        }
    };

    reader.readAsText(file);
}

async function clearAllData() {
    const firstConfirm = await showConfirmDialog({
        title: 'Borrar Todos los Datos',
        message: '⚠️ ¿Está absolutamente seguro de que desea borrar TODOS los datos? Esta acción no se puede deshacer.',
        confirmText: 'Continuar',
        cancelText: 'Cancelar',
        icon: '⚠️',
        isDanger: true
    });

    if (firstConfirm) {
        const secondConfirm = await showConfirmDialog({
            title: 'Última Confirmación',
            message: '¿Realmente desea eliminar todos los datos permanentemente?',
            confirmText: 'Sí, eliminar todo',
            cancelText: 'Cancelar',
            icon: '🚨',
            isDanger: true
        });

        if (secondConfirm) {
            localStorage.removeItem(STORAGE_KEY);
            showToast('Todos los datos han sido eliminados. Recargando...', 'success');
            setTimeout(() => window.location.reload(), 1500);
        }
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
    initializeData();
});
