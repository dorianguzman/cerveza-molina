/*
 * CALCULATIONS.JS - Financial Calculations Engine
 * Implements Cost Per Beer (CPB) calculation and other financial metrics
 */

/**
 * Calculate Cost Per Beer (CPB) for a given period
 *
 * Formula: CPB = (Total VC + Total FCA + Total DLC) / Total Pints Produced
 *
 * Where:
 * - VC (Variable Cost): Direct ingredients and packaging
 * - FCA (Fixed Cost Amortization): Allocated portion of monthly fixed costs
 * - DLC (Direct Labor Cost): Labor hours * hourly rate
 *
 * @param {number|null} month - Month (1-12) or null for all months
 * @param {number|null} year - Year or null for all years
 * @returns {object} Calculation breakdown
 */
function calculateCostPerBeer(month = null, year = null) {
    const data = loadData();
    const fixedCosts = data.fixedCosts;

    // Filter production data by period
    let production = data.production;
    if (month || year) {
        production = filterByMonthYear(production, month, year);
    }

    // If no production, return zeros
    if (production.length === 0) {
        return {
            costPerBeer: 0,
            totalPintsProduced: 0,
            totalVariableCost: 0,
            totalFixedCostAmortization: 0,
            totalDirectLaborCost: 0,
            totalCost: 0
        };
    }

    // 1. Calculate Total Variable Cost (VC)
    const totalVariableCost = production.reduce((sum, batch) => {
        return sum + batch.ingredientCost;
    }, 0);

    // 2. Calculate Total Direct Labor Cost (DLC)
    const totalLaborHours = production.reduce((sum, batch) => {
        return sum + batch.laborHours;
    }, 0);
    const totalDirectLaborCost = totalLaborHours * fixedCosts.laborRate;

    // 3. Calculate Fixed Cost Amortization (FCA)
    // Get unique months in the production period
    const uniqueMonths = getUniqueMonthsFromProduction(production);
    const numberOfMonths = uniqueMonths.length;

    const monthlyFixedCosts = (fixedCosts.monthlyRent || 0) +
                              (fixedCosts.monthlySalaries || 0) +
                              (fixedCosts.monthlyUtilities || 0);

    const totalFixedCostAmortization = monthlyFixedCosts * numberOfMonths;

    // 4. Calculate Total Pints Produced
    const totalPintsProduced = production.reduce((sum, batch) => {
        return sum + batch.volume;
    }, 0);

    // 5. Calculate Total Cost
    const totalCost = totalVariableCost + totalFixedCostAmortization + totalDirectLaborCost;

    // 6. Calculate Cost Per Beer
    const costPerBeer = totalPintsProduced > 0 ? totalCost / totalPintsProduced : 0;

    return {
        costPerBeer: costPerBeer,
        totalPintsProduced: totalPintsProduced,
        totalVariableCost: totalVariableCost,
        totalFixedCostAmortization: totalFixedCostAmortization,
        totalDirectLaborCost: totalDirectLaborCost,
        totalCost: totalCost,
        numberOfMonths: numberOfMonths,
        monthlyFixedCosts: monthlyFixedCosts
    };
}

/**
 * Get unique months from production data
 * Returns array of {year, month} objects
 */
function getUniqueMonthsFromProduction(production) {
    const monthsSet = new Set();

    production.forEach(batch => {
        const date = new Date(batch.date);
        const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
        monthsSet.add(key);
    });

    return Array.from(monthsSet);
}

/**
 * Calculate total revenue for a period
 *
 * @param {number|null} month - Month (1-12) or null for all months
 * @param {number|null} year - Year or null for all years
 * @returns {number} Total revenue
 */
function calculateTotalRevenue(month = null, year = null) {
    const data = loadData();

    // Filter transactions and sales
    let transactions = data.transactions.filter(t => t.type === 'income');
    let sales = data.sales;

    if (month || year) {
        transactions = filterByMonthYear(transactions, month, year);
        sales = filterByMonthYear(sales, month, year);
    }

    const transactionRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);
    const salesRevenue = sales.reduce((sum, s) => sum + s.revenue, 0);

    return transactionRevenue + salesRevenue;
}

/**
 * Calculate total expenses for a period
 *
 * @param {number|null} month - Month (1-12) or null for all months
 * @param {number|null} year - Year or null for all years
 * @returns {object} Expense breakdown
 */
function calculateTotalExpenses(month = null, year = null) {
    const data = loadData();

    let transactions = data.transactions.filter(t => t.type === 'expense');

    if (month || year) {
        transactions = filterByMonthYear(transactions, month, year);
    }

    const total = transactions.reduce((sum, t) => sum + t.amount, 0);

    // Breakdown by category
    const breakdown = {};
    transactions.forEach(t => {
        if (!breakdown[t.category]) {
            breakdown[t.category] = 0;
        }
        breakdown[t.category] += t.amount;
    });

    return {
        total: total,
        breakdown: breakdown
    };
}

/**
 * Calculate profit/loss for a period
 *
 * @param {number|null} month - Month (1-12) or null for all months
 * @param {number|null} year - Year or null for all years
 * @returns {number} Profit (positive) or Loss (negative)
 */
function calculateProfit(month = null, year = null) {
    const revenue = calculateTotalRevenue(month, year);
    const expenses = calculateTotalExpenses(month, year).total;

    return revenue - expenses;
}

/**
 * Calculate total pints produced for a period
 *
 * @param {number|null} month - Month (1-12) or null for all months
 * @param {number|null} year - Year or null for all years
 * @returns {number} Total pints
 */
function calculateTotalPintsProduced(month = null, year = null) {
    const data = loadData();

    let production = data.production;

    if (month || year) {
        production = filterByMonthYear(production, month, year);
    }

    return production.reduce((sum, batch) => sum + batch.volume, 0);
}

/**
 * Calculate total pints sold for a period
 *
 * @param {number|null} month - Month (1-12) or null for all months
 * @param {number|null} year - Year or null for all years
 * @returns {number} Total pints sold
 */
function calculateTotalPintsSold(month = null, year = null) {
    const data = loadData();

    let sales = data.sales;

    if (month || year) {
        sales = filterByMonthYear(sales, month, year);
    }

    return sales.reduce((sum, sale) => sum + sale.volumeSold, 0);
}

/**
 * Calculate average price per pint from sales
 *
 * @param {number|null} month - Month (1-12) or null for all months
 * @param {number|null} year - Year or null for all years
 * @returns {number} Average price per pint
 */
function calculateAveragePricePerPint(month = null, year = null) {
    const revenue = calculateTotalRevenue(month, year);
    const pintsSold = calculateTotalPintsSold(month, year);

    return pintsSold > 0 ? revenue / pintsSold : 0;
}

/**
 * Calculate profit margin percentage
 *
 * @param {number|null} month - Month (1-12) or null for all months
 * @param {number|null} year - Year or null for all years
 * @returns {number} Profit margin as percentage
 */
function calculateProfitMargin(month = null, year = null) {
    const revenue = calculateTotalRevenue(month, year);
    const profit = calculateProfit(month, year);

    return revenue > 0 ? (profit / revenue) * 100 : 0;
}

/**
 * Get monthly data for charts
 * Returns array of objects with month, revenue, expenses, production data
 *
 * @param {number} year - Year to get data for
 * @returns {Array} Monthly data
 */
function getMonthlyDataForYear(year) {
    const monthlyData = [];

    for (let month = 1; month <= 12; month++) {
        const revenue = calculateTotalRevenue(month, year);
        const expenses = calculateTotalExpenses(month, year).total;
        const production = calculateTotalPintsProduced(month, year);
        const cpp = calculateCostPerBeer(month, year).costPerBeer;

        monthlyData.push({
            month: month,
            monthName: getMonthName(month),
            revenue: revenue,
            expenses: expenses,
            profit: revenue - expenses,
            production: production,
            costPerBeer: cpp
        });
    }

    return monthlyData;
}

/**
 * Get month name in Spanish
 *
 * @param {number} month - Month number (1-12)
 * @returns {string} Month name
 */
function getMonthName(month) {
    const months = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[month - 1];
}

/**
 * Format currency for display
 *
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount) {
    return `$${amount.toFixed(2)} MXN`;
}

/**
 * Format number with decimals
 *
 * @param {number} number - Number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted number
 */
function formatNumber(number, decimals = 2) {
    return number.toFixed(decimals);
}

/**
 * Calculate Cost Per Beer for each beer type separately
 *
 * @param {number|null} month - Month (1-12) or null for all months
 * @param {number|null} year - Year or null for all years
 * @returns {Array} Array of objects with beer name, CPP, and recommended price
 */
function calculateCostPerBeerByType(month = null, year = null) {
    const data = loadData();
    const fixedCosts = data.fixedCosts;

    // Get profit margin multiplier (default 3x for craft beer)
    const profitMarginMultiplier = data.profitMarginMultiplier || 3;

    // Filter production data
    let production = data.production;
    if (month || year) {
        production = filterByMonthYear(production, month, year);
    }

    if (production.length === 0) {
        return [];
    }

    // Group by beer name
    const beerGroups = {};
    production.forEach(batch => {
        if (!beerGroups[batch.beerName]) {
            beerGroups[batch.beerName] = [];
        }
        beerGroups[batch.beerName].push(batch);
    });

    // Calculate CPP for each beer type
    const results = [];

    for (const [beerName, batches] of Object.entries(beerGroups)) {
        // Variable costs
        const totalVariableCost = batches.reduce((sum, batch) => sum + batch.ingredientCost, 0);

        // Labor costs
        const totalLaborHours = batches.reduce((sum, batch) => sum + batch.laborHours, 0);
        const totalDirectLaborCost = totalLaborHours * fixedCosts.laborRate;

        // Total pints for this beer
        const totalPints = batches.reduce((sum, batch) => sum + batch.volume, 0);

        // Fixed cost allocation (proportional to labor hours)
        const uniqueMonths = getUniqueMonthsFromProduction(batches);
        const monthlyFixedCosts = (fixedCosts.monthlyRent || 0) +
                                  (fixedCosts.monthlySalaries || 0) +
                                  (fixedCosts.monthlyUtilities || 0);
        const fixedCostAllocation = monthlyFixedCosts * uniqueMonths.length;

        // Calculate total cost
        const totalCost = totalVariableCost + totalDirectLaborCost + fixedCostAllocation;

        // Calculate CPP
        const costPerPint = totalPints > 0 ? totalCost / totalPints : 0;

        // Calculate recommended price (CPP * multiplier)
        const recommendedPrice = costPerPint * profitMarginMultiplier;

        results.push({
            beerName: beerName,
            batches: batches.length,
            totalPints: totalPints,
            totalCost: totalCost,
            costPerPint: costPerPint,
            recommendedPrice: recommendedPrice,
            profitMargin: profitMarginMultiplier
        });
    }

    // Sort by beer name
    return results.sort((a, b) => a.beerName.localeCompare(b.beerName));
}

/**
 * Get/Set profit margin multiplier
 */
function getProfitMarginMultiplier() {
    const data = loadData();
    return data.profitMarginMultiplier || 3;
}

function setProfitMarginMultiplier(multiplier) {
    const data = loadData();
    data.profitMarginMultiplier = parseFloat(multiplier);
    saveData(data);
}
