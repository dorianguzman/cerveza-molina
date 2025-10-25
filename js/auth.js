/*
 * AUTH.JS - Authentication & GitHub Sync System
 * Two-step authentication: Password + GitHub PAT
 * All data is stored in GitHub (no localStorage fallback)
 */

// Session keys
const AUTH_SESSION_KEY = 'molina_auth_session';
const GITHUB_PAT_KEY = 'molina_github_pat';

/**
 * Check if user is authenticated
 */
function isAuthenticated() {
    const session = sessionStorage.getItem(AUTH_SESSION_KEY);
    const pat = sessionStorage.getItem(GITHUB_PAT_KEY);
    return session === 'true' && pat !== null;
}

/**
 * Initialize authentication on page load
 */
async function initializeAuth() {
    // Check if already authenticated in this session
    if (isAuthenticated()) {
        console.log('✅ Already authenticated');
        hideLoginScreen();
        return true;
    }

    // Show login screen
    showLoginScreen();
    return false;
}

/**
 * Load password hash from auth-hash.json
 */
async function loadPasswordHash() {
    try {
        console.log('📂 Loading auth-hash.json...');
        const response = await fetch('auth-hash.json');
        if (!response.ok) {
            throw new Error(`Could not load auth-hash.json: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        console.log('✅ Password hash loaded successfully');
        return data.passwordHash;
    } catch (error) {
        console.error('❌ Error loading password hash:', error);
        showAuthError('Error: No se pudo cargar la configuración de autenticación. Contacta al administrador.');
        return null;
    }
}

/**
 * Hash password using SHA-256
 */
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

/**
 * Validate password against stored hash
 */
async function validatePassword(password) {
    const correctHash = await loadPasswordHash();
    if (!correctHash) {
        console.error('❌ Could not load password hash from auth-hash.json');
        return false;
    }

    const inputHash = await hashPassword(password);
    console.log('🔐 Password validation:', {
        inputHash,
        correctHash,
        match: inputHash === correctHash
    });
    return inputHash === correctHash;
}

/**
 * Validate GitHub PAT by making a test API call
 */
async function validateGitHubPAT(pat, repo) {
    try {
        const [owner, repoName] = repo.split('/');
        const url = `https://api.github.com/repos/${owner}/${repoName}/contents/data`;

        const response = await fetch(url, {
            headers: {
                'Authorization': `token ${pat}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        return response.ok || response.status === 404; // 404 is ok (folder might not exist yet)
    } catch (error) {
        console.error('Error validating GitHub PAT:', error);
        return false;
    }
}

/**
 * Handle password step submission
 */
async function handlePasswordSubmit(event) {
    event.preventDefault();

    const passwordInput = document.getElementById('auth-password');
    const password = passwordInput.value;

    // Show loading
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Validando...';
    submitBtn.disabled = true;

    // Validate password
    const isValid = await validatePassword(password);

    if (isValid) {
        // Password correct, show GitHub PAT step
        document.getElementById('auth-step-1').style.display = 'none';
        document.getElementById('auth-step-2').style.display = 'block';
        passwordInput.value = ''; // Clear password input
    } else {
        showAuthError('❌ Contraseña incorrecta');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        passwordInput.value = '';
        passwordInput.focus();
    }
}

/**
 * Handle GitHub PAT step submission
 */
async function handleGitHubPATSubmit(event) {
    event.preventDefault();

    const patInput = document.getElementById('github-pat');
    const repoInput = document.getElementById('github-repo');
    const pat = patInput.value.trim();
    const repo = repoInput.value.trim();

    if (!pat || !repo) {
        showAuthError('⚠️ Por favor completa todos los campos');
        return;
    }

    // Validate repo format (owner/repo)
    if (!repo.includes('/') || repo.split('/').length !== 2) {
        showAuthError('⚠️ Formato de repositorio inválido. Usa: usuario/repositorio');
        return;
    }

    // Show loading
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Validando GitHub...';
    submitBtn.disabled = true;

    // Validate GitHub PAT
    const isValid = await validateGitHubPAT(pat, repo);

    if (isValid) {
        // Store in session
        sessionStorage.setItem(AUTH_SESSION_KEY, 'true');
        sessionStorage.setItem(GITHUB_PAT_KEY, pat);
        localStorage.setItem('github_repo', repo); // Repo can be in localStorage (not sensitive)

        // Success!
        showAuthSuccess();

        // Hide login screen after delay
        setTimeout(() => {
            hideLoginScreen();
            initializeApp(); // Initialize the main app
        }, 1500);
    } else {
        showAuthError('❌ No se pudo validar el GitHub PAT. Verifica tu token y el nombre del repositorio.');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

/**
 * Show login screen
 */
function showLoginScreen() {
    document.getElementById('auth-overlay').style.display = 'flex';
    document.getElementById('auth-step-1').style.display = 'block';
    document.getElementById('auth-step-2').style.display = 'none';
    document.getElementById('auth-password').focus();
}

/**
 * Hide login screen
 */
function hideLoginScreen() {
    document.getElementById('auth-overlay').style.display = 'none';
}

/**
 * Show error message
 */
function showAuthError(message) {
    const errorDiv = document.getElementById('auth-error');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';

    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

/**
 * Show success message
 */
function showAuthSuccess() {
    const step2 = document.getElementById('auth-step-2');
    step2.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
            <div style="font-size: 4rem; margin-bottom: 1rem;">✅</div>
            <h2 style="color: var(--color-copper); margin-bottom: 1rem;">¡Autenticación Exitosa!</h2>
            <p style="color: var(--color-charcoal); opacity: 0.8;">Cargando aplicación...</p>
        </div>
    `;
}

/**
 * Logout function
 */
function logout() {
    sessionStorage.removeItem(AUTH_SESSION_KEY);
    sessionStorage.removeItem(GITHUB_PAT_KEY);
    showLoginScreen();
    showToast('Sesión cerrada correctamente', 'info');
}

/**
 * Get stored GitHub PAT
 */
function getGitHubPAT() {
    return sessionStorage.getItem(GITHUB_PAT_KEY);
}

/**
 * Get stored GitHub repo
 */
function getGitHubRepo() {
    return localStorage.getItem('github_repo');
}

// Initialize auth when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    // Setup auth form listeners
    document.getElementById('auth-password-form').addEventListener('submit', handlePasswordSubmit);
    document.getElementById('auth-github-form').addEventListener('submit', handleGitHubPATSubmit);

    // Initialize authentication
    initializeAuth();
});
