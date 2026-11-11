// ============================================
// hotel-common.js
// Har page mein include karo
// ============================================

window.API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5001/api');

// Token check
const _token = localStorage.getItem('token');
if (!_token && !window.location.pathname.includes('auth-signin')) {
    window.location.href = '/auth-signin-basic.html';
}

// Components load karne ka function
async function loadComponent(file, placeholderId) {
    try {
        const res = await fetch('/' + file);
        const html = await res.text();
        const el = document.getElementById(placeholderId);
        if (el) {
            el.innerHTML = html;
            // Component ke scripts run karo
            el.querySelectorAll('script').forEach(oldScript => {
                const newScript = document.createElement('script');
                newScript.textContent = oldScript.textContent;
                document.body.appendChild(newScript);
                oldScript.remove();
            });
        }
    } catch(err) {
        console.error('Error loading component:', file, err);
    }
}

// Page load hone per dono components load karo
document.addEventListener('DOMContentLoaded', async function() {
    await loadComponent('navbar.html', 'navbar-placeholder');
    await loadComponent('sidebar.html', 'sidebar-placeholder');
});