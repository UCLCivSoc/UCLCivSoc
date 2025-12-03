// Authentication Utility using Firebase Google Sign-In
// Requires: firebase-app, firebase-auth scripts to be loaded first

function checkAuth(callback) {
    if (!firebase.apps.length) {
        if (typeof CIVSOC_CONFIG !== 'undefined') {
            firebase.initializeApp(CIVSOC_CONFIG.firebaseConfig);
        } else {
            console.error("CIVSOC_CONFIG is missing!");
            return;
        }
    }

    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            console.log("User logged in:", user.email);
            if (callback) callback(user);
        } else {
            console.log("User not logged in. Redirecting to login...");
            redirectToLogin();
        }
    });
}

function redirectToLogin() {
    // Simple overlay or redirect
    // For now, let's use a Google Sign In prompt directly if possible, 
    // or overlay a login button if user interaction is needed (browser popup blockers).
    
    // We'll create a full-screen overlay forcing login.
    const overlay = document.createElement('div');
    overlay.id = 'auth-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = '#0f0f13';
    overlay.style.zIndex = '9999';
    overlay.style.display = 'flex';
    overlay.style.flexDirection = 'column';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.color = 'white';
    
    overlay.innerHTML = `
        <h2 style="margin-bottom: 20px;">Restricted Access</h2>
        <p style="color: #aaa; margin-bottom: 30px;">Committee Login Required</p>
        <button id="google-login-btn" style="
            background: #4285F4; color: white; border: none; 
            padding: 12px 24px; border-radius: 4px; font-weight: bold; 
            cursor: pointer; font-size: 16px; display: flex; align-items: center; gap: 10px;
        ">
            Sign in with Google
        </button>
        <p id="auth-error" style="color: red; margin-top: 20px; display: none;"></p>
    `;
    
    document.body.appendChild(overlay);
    
    document.getElementById('google-login-btn').addEventListener('click', () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithPopup(provider)
            .then((result) => {
                // Auth successful
                overlay.remove();
                // Optional: reload or just let the callback fire (onAuthStateChanged will fire)
            })
            .catch((error) => {
                const errEl = document.getElementById('auth-error');
                errEl.innerText = error.message;
                errEl.style.display = 'block';
            });
    });
}

// Log out function
function logout() {
    firebase.auth().signOut().then(() => {
        location.reload();
    });
}
