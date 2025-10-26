/*
 * DATA.JS - GitHub-Only Data Management
 * All data stored in GitHub repository (no localStorage)
 * Requires authentication via auth.js
 */

// In-memory cache to reduce API calls
let dataCache = null;
let configCache = null;
let isLoading = false;

// Default data structures
const DEFAULT_DATA = {
    production: [],
    transactions: [],
    sales: [],
    version: '1.0'
};

const DEFAULT_CONFIG = {
    laborRate: 150, // MXN per hour
    profitMarginPercentage: 60, // 60% markup
    version: '1.0'
};

/**
 * Initialize data from GitHub
 * Called once at app startup
 */
async function initializeData() {
    if (isLoading) {
        console.log('⏳ Data already loading...');
        return dataCache || DEFAULT_DATA;
    }

    if (dataCache) {
        console.log('✅ Using cached data');
        return dataCache;
    }

    isLoading = true;
    try {
        console.log('📥 Loading data from GitHub...');
        if (typeof setSyncing === 'function') setSyncing();
        const githubData = await loadAllFromGitHub();

        dataCache = {
            production: githubData.production || [],
            transactions: githubData.transactions || [],
            sales: githubData.sales || [],
            version: '1.0'
        };

        configCache = githubData.config || DEFAULT_CONFIG;

        console.log('✅ Data loaded successfully from GitHub');
        if (typeof setSyncComplete === 'function') setSyncComplete();
        return dataCache;
    } catch (error) {
        console.error('❌ Error loading data from GitHub:', error);
        // Initialize with empty data if GitHub fails
        dataCache = { ...DEFAULT_DATA };
        configCache = { ...DEFAULT_CONFIG };
        return dataCache;
    } finally {
        isLoading = false;
    }
}

/**
 * Initialize config from GitHub
 */
async function initializeConfig() {
    if (configCache) {
        return configCache;
    }

    try {
        const githubData = await loadAllFromGitHub();
        configCache = githubData.config || DEFAULT_CONFIG;
        return configCache;
    } catch (error) {
        console.error('Error loading config from GitHub:', error);
        configCache = { ...DEFAULT_CONFIG };
        return configCache;
    }
}

/**
 * Save data to GitHub
 * @param {Object} data - Data to save
 */
async function saveData(data) {
    try {
        if (typeof setSyncing === 'function') setSyncing();
        showToast('💾 Guardando en la Base de Datos...', 'info');
        await saveFileToGitHub(DATA_FILES.production, data.production, 'Update production data [skip ci]');
        await saveFileToGitHub(DATA_FILES.transactions, data.transactions, 'Update transactions data [skip ci]');
        await saveFileToGitHub(DATA_FILES.sales, data.sales, 'Update sales data [skip ci]');
        dataCache = data;
        console.log('✅ Data saved to GitHub');
        if (typeof setSyncComplete === 'function') setSyncComplete();
        showToast('✅ Guardado en la Base de Datos', 'success');
    } catch (error) {
        console.error('❌ Error saving data to GitHub:', error);
        showToast('❌ Error al guardar en la Base de Datos', 'error');
        throw error;
    }
}

/**
 * Save config to GitHub
 * @param {Object} config - Config to save
 */
async function saveConfig(config) {
    try {
        if (typeof setSyncing === 'function') setSyncing();
        await saveFileToGitHub(DATA_FILES.config, config, 'Update config [skip ci]');
        configCache = config;
        if (typeof setSyncComplete === 'function') setSyncComplete();
        console.log('✅ Config saved to GitHub');
    } catch (error) {
        console.error('❌ Error saving config to GitHub:', error);
        showToast('❌ Error al guardar configuración', 'error');
        throw error;
    }
}

/**
 * Load data from cache (or initialize if not loaded)
 */
function loadData() {
    if (!dataCache) {
        console.warn('⚠️ Data not initialized, returning default');
        return { ...DEFAULT_DATA };
    }
    return dataCache;
}

/**
 * Load config from cache (or initialize if not loaded)
 */
function loadConfig() {
    if (!configCache) {
        console.warn('⚠️ Config not initialized, returning default');
        return { ...DEFAULT_CONFIG };
    }
    return configCache;
}

// ====================
// PRODUCTION OPERATIONS
// ====================

async function addProduction(productionData) {
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
    await saveData(data);
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

async function updateProduction(id, updates) {
    const data = loadData();
    const index = data.production.findIndex(p => p.id === id);

    if (index !== -1) {
        data.production[index] = { ...data.production[index], ...updates };
        await saveData(data);
        return data.production[index];
    }

    return null;
}

async function deleteProduction(id) {
    const data = loadData();
    data.production = data.production.filter(p => p.id !== id);
    await saveData(data);
}

// ====================
// TRANSACTION OPERATIONS
// ====================

async function addTransaction(transactionData) {
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
    await saveData(data);
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

async function updateTransaction(id, updates) {
    const data = loadData();
    const index = data.transactions.findIndex(t => t.id === id);

    if (index !== -1) {
        data.transactions[index] = { ...data.transactions[index], ...updates };
        await saveData(data);
        return data.transactions[index];
    }

    return null;
}

async function deleteTransaction(id) {
    const data = loadData();
    data.transactions = data.transactions.filter(t => t.id !== id);
    await saveData(data);
}

// ====================
// SALES OPERATIONS
// ====================

async function addSales(salesData) {
    const data = loadData();
    const newEntry = {
        id: generateId(),
        date: salesData.date,
        revenue: parseFloat(salesData.revenue),
        volumeSold: parseFloat(salesData.volumeSold), // in pints
        createdAt: new Date().toISOString()
    };

    data.sales.push(newEntry);
    await saveData(data);
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

async function updateSales(id, updates) {
    const data = loadData();
    const index = data.sales.findIndex(s => s.id === id);

    if (index !== -1) {
        data.sales[index] = { ...data.sales[index], ...updates };
        await saveData(data);
        return data.sales[index];
    }

    return null;
}

async function deleteSales(id) {
    const data = loadData();
    data.sales = data.sales.filter(s => s.id !== id);
    await saveData(data);
}

// ====================
// CONFIG OPERATIONS
// ====================

function getConfig() {
    return loadConfig();
}

async function updateConfig(updates) {
    const config = loadConfig();
    const updatedConfig = { ...config, ...updates };
    await saveConfig(updatedConfig);
    return updatedConfig;
}

function getLaborRate() {
    const config = loadConfig();
    return config.laborRate || 150;
}

async function setLaborRate(rate) {
    const config = loadConfig();
    config.laborRate = parseFloat(rate);
    await saveConfig(config);
}

function getProfitMarginPercentage() {
    const config = loadConfig();
    return config.profitMarginPercentage || 60;
}

async function setProfitMarginPercentage(percentage) {
    const config = loadConfig();
    config.profitMarginPercentage = parseFloat(percentage);
    await saveConfig(config);
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
    a.download = `molina_export_${new Date().toISOString().split('T')[0]}.json`;
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
                message: '¿Está seguro de que desea importar estos datos? Esto sobrescribirá todos los datos en la Base de Datos.',
                confirmText: 'Sí, importar',
                cancelText: 'Cancelar',
                icon: '📥',
                isDanger: true
            });

            if (confirmed) {
                await saveData(importedData);
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
        message: '⚠️ ¿Está absolutamente seguro de que desea borrar TODOS los datos de la Base de Datos? Esta acción no se puede deshacer.',
        confirmText: 'Continuar',
        cancelText: 'Cancelar',
        icon: '⚠️',
        isDanger: true
    });

    if (firstConfirm) {
        const secondConfirm = await showConfirmDialog({
            title: 'Última Confirmación',
            message: '¿Realmente desea eliminar todos los datos permanentemente de la Base de Datos?',
            confirmText: 'Sí, eliminar todo',
            cancelText: 'Cancelar',
            icon: '🚨',
            isDanger: true
        });

        if (secondConfirm) {
            await saveData(DEFAULT_DATA);
            await saveConfig(DEFAULT_CONFIG);
            showToast('Todos los datos han sido eliminados. Recargando...', 'success');
            setTimeout(() => window.location.reload(), 1500);
        }
    }
}

// Initialize on load (called by app.js after authentication)
async function initializeDataOnLoad() {
    // Load the data from GitHub
    await initializeData();
    await initializeConfig();
}
