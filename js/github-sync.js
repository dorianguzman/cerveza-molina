/*
 * GITHUB-SYNC.JS - GitHub API Integration
 * Handles syncing data to/from GitHub repository
 * Uses authentication from auth.js (getGitHubPAT and getGitHubRepo)
 */

// GitHub configuration
const GITHUB_BRANCH = 'main';

// File paths in repository
const DATA_FILES = {
    config: 'data/config.json',
    production: 'data/production.json',
    transactions: 'data/transactions.json',
    sales: 'data/sales.json'
};

/**
 * Get GitHub repository owner and name
 * @returns {Object} {owner, repo} or null if not configured
 */
function getGitHubRepoInfo() {
    const repoString = getGitHubRepo(); // From auth.js
    if (!repoString || !repoString.includes('/')) {
        return null;
    }
    const [owner, repo] = repoString.split('/');
    return { owner, repo };
}

/**
 * Get stored GitHub Personal Access Token
 * Uses auth.js getGitHubPAT() function
 */
function getGitHubToken() {
    return getGitHubPAT(); // From auth.js
}

/**
 * Check if GitHub sync is configured
 */
function isGitHubConfigured() {
    const token = getGitHubToken();
    const repoInfo = getGitHubRepoInfo();
    return token && token.length > 0 && repoInfo !== null;
}

/**
 * Load a single file from GitHub
 * @param {string} path - File path in repository
 * @returns {Promise<any>} Parsed JSON content
 */
async function loadFileFromGitHub(path) {
    const token = getGitHubToken();
    if (!token) {
        throw new Error('GitHub token not configured');
    }

    const repoInfo = getGitHubRepoInfo();
    if (!repoInfo) {
        throw new Error('GitHub repository not configured');
    }

    const url = `https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/contents/${path}?ref=${GITHUB_BRANCH}`;

    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!response.ok) {
            if (response.status === 404) {
                // File doesn't exist yet, return empty data
                return path.includes('config') ? { laborRate: 150, profitMarginPercentage: 60, version: '1.0' } : [];
            }
            throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        // GitHub returns base64 encoded content
        const content = atob(data.content);
        return JSON.parse(content);
    } catch (error) {
        console.error(`Error loading ${path} from GitHub:`, error);
        throw error;
    }
}

/**
 * Save a single file to GitHub
 * @param {string} path - File path in repository
 * @param {any} content - Content to save (will be JSON.stringify'd)
 * @param {string} message - Commit message
 * @returns {Promise<void>}
 */
async function saveFileToGitHub(path, content, message = 'Update data') {
    const token = getGitHubToken();
    if (!token) {
        throw new Error('GitHub token not configured');
    }

    const repoInfo = getGitHubRepoInfo();
    if (!repoInfo) {
        throw new Error('GitHub repository not configured');
    }

    const url = `https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/contents/${path}`;

    try {
        // First, get the current file SHA (required for updates)
        let sha = null;
        try {
            const getResponse = await fetch(url, {
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            if (getResponse.ok) {
                const fileData = await getResponse.json();
                sha = fileData.sha;
            }
        } catch (error) {
            // File might not exist yet, that's okay
        }

        // Convert content to base64
        const jsonContent = JSON.stringify(content, null, 2);
        const base64Content = btoa(unescape(encodeURIComponent(jsonContent)));

        // Create or update the file
        const body = {
            message: message,
            content: base64Content,
            branch: GITHUB_BRANCH
        };

        if (sha) {
            body.sha = sha; // Required for updates
        }

        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`GitHub API error: ${response.status} - ${errorData.message}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Error saving ${path} to GitHub:`, error);
        throw error;
    }
}

/**
 * Load all data from GitHub
 * @returns {Promise<Object>} Object with config, production, transactions, sales
 */
async function loadAllFromGitHub() {
    const token = getGitHubToken();
    if (!token) {
        throw new Error('GitHub token not configured');
    }

    try {
        const [config, production, transactions, sales] = await Promise.all([
            loadFileFromGitHub(DATA_FILES.config),
            loadFileFromGitHub(DATA_FILES.production),
            loadFileFromGitHub(DATA_FILES.transactions),
            loadFileFromGitHub(DATA_FILES.sales)
        ]);

        return {
            config,
            production,
            transactions,
            sales
        };
    } catch (error) {
        console.error('Error loading data from GitHub:', error);
        throw error;
    }
}

/**
 * Save all data to GitHub
 * @param {Object} data - Object with config, production, transactions, sales
 * @returns {Promise<void>}
 */
async function saveAllToGitHub(data) {
    const token = getGitHubToken();
    if (!token) {
        throw new Error('GitHub token not configured');
    }

    try {
        const timestamp = new Date().toISOString();
        const message = `Sync data - ${timestamp}`;

        // Save all files (could be done in parallel, but sequential is safer for conflicts)
        if (data.config) {
            await saveFileToGitHub(DATA_FILES.config, data.config, message);
        }
        if (data.production) {
            await saveFileToGitHub(DATA_FILES.production, data.production, message);
        }
        if (data.transactions) {
            await saveFileToGitHub(DATA_FILES.transactions, data.transactions, message);
        }
        if (data.sales) {
            await saveFileToGitHub(DATA_FILES.sales, data.sales, message);
        }

        // Update last sync timestamp
        localStorage.setItem('molina_last_sync', timestamp);
    } catch (error) {
        console.error('Error saving data to GitHub:', error);
        throw error;
    }
}

/**
 * Get last sync timestamp
 * @returns {string|null}
 */
function getLastSyncTime() {
    return localStorage.getItem('molina_last_sync');
}

/**
 * Merge GitHub data with local data
 * Strategy: Latest timestamp wins for conflicts
 * @param {Object} githubData - Data from GitHub
 * @param {Object} localData - Data from localStorage
 * @returns {Object} Merged data
 */
function mergeData(githubData, localData) {
    const merged = {
        config: githubData.config || localData.config,
        production: mergeArrayByTimestamp(githubData.production || [], localData.production || []),
        transactions: mergeArrayByTimestamp(githubData.transactions || [], localData.transactions || []),
        sales: mergeArrayByTimestamp(githubData.sales || [], localData.sales || [])
    };

    return merged;
}

/**
 * Merge two arrays of records by timestamp
 * Keeps unique records and latest version of duplicates
 */
function mergeArrayByTimestamp(arr1, arr2) {
    const map = new Map();

    // Add all items from both arrays to map (id as key)
    [...arr1, ...arr2].forEach(item => {
        const existing = map.get(item.id);
        if (!existing) {
            map.set(item.id, item);
        } else {
            // Keep the one with latest createdAt timestamp
            const existingTime = new Date(existing.createdAt || 0).getTime();
            const newTime = new Date(item.createdAt || 0).getTime();
            if (newTime > existingTime) {
                map.set(item.id, item);
            }
        }
    });

    return Array.from(map.values());
}
