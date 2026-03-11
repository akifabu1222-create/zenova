// Auth integration for index.html

// Check if user is logged in
function checkAuth() {
    const isLoggedIn = localStorage.getItem('zenovaLoggedIn') === 'true';
    const userData = JSON.parse(localStorage.getItem('zenovaUser') || '{}');
    
    const authButton = document.getElementById('authButton');
    
    if (!authButton) return; // Element topilmasa chiqish
    
    if (isLoggedIn && userData.username) {
        // User is logged in - show profile button
        const username = userData.username;
        const firstLetter = username.charAt(0).toUpperCase();
        
        authButton.innerHTML = `
            <a href="profile.html" class="user-profile">
                <div class="user-avatar">${firstLetter}</div>
                <span>${username}</span>
            </a>
        `;
    } else {
        // User is not logged in - show login button
        authButton.innerHTML = `
            <a href="auth.html" class="auth-button">
                🔐 KIRISH
            </a>
        `;
    }
}

// Run on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkAuth);
} else {
    checkAuth();
}