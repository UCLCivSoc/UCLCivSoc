/**
 * UCL CivSoc Website - Shared Layout Components
 * This file allows us to update the footer (and other common elements) in one place.
 */

async function fetchSponsors() {
    if(!window.firebase) return;
    const db = firebase.firestore();
    const sGrid = document.getElementById('sponsor-grid');
    const sCol = document.getElementById('sponsor-col');
    if(!sGrid || !sCol) return;

    try {
        const snap = await db.collection('sponsors').orderBy('createdAt', 'desc').get();
        if(!snap.empty) {
            sGrid.innerHTML = '';
            snap.forEach(doc => {
                const s = doc.data();
                // Create sponsor tile
                const a = document.createElement('a');
                a.href = s.url;
                a.target = '_blank';
                a.className = 'sponsor-item';
                // Inline style for simplicity, or add to CSS
                a.innerHTML = `<img src="${s.logo}" alt="${s.name}" title="${s.name}" style="max-height:60px; max-width:100%; object-fit:contain; filter:brightness(0) invert(1); opacity:0.7; transition:0.3s;">`;
                
                // Hover effect logic
                a.onmouseenter = () => a.firstChild.style.opacity = '1';
                a.onmouseleave = () => a.firstChild.style.opacity = '0.7';

                sGrid.appendChild(a);
            });
            sCol.style.display = 'block';
        }
    } catch(e) {
        console.error("Failed to load sponsors", e);
    }
}

function renderFooter(containerId, options = {}) {
    const rootPath = options.rootPath || '';
    const withPillars = options.withPillars || false;
    
    // Default image paths
    const imgPath = (path) => `${rootPath}${path}`;

    // Pillars HTML
    const pillarsHTML = withPillars ? `
        <div class="greek-column pillar-left" onclick="damagePillar('left', this)" title="Load Bearing Column A">
            <div class="column-capital"></div>
            <div class="column-shaft"></div>
            <div class="column-base"></div>
        </div>
        <div class="greek-column pillar-right" onclick="damagePillar('right', this)" title="Load Bearing Column B">
            <div class="column-capital"></div>
            <div class="column-shaft"></div>
            <div class="column-base"></div>
        </div>
    ` : '';

    const html = `
    <footer>
        ${pillarsHTML}

        <div class="footer-content">
            <div class="footer-col">
                <h3>UCL CivSoc</h3>
                <p>The official society for Civil, Environmental & Geomatic Engineering students at UCL.</p>
                <a href="https://studentsunionucl.org/clubs-societies/civil-engineering-society" target="_blank" class="join-btn-footer">
                    Become a Member for £0 !
                </a>
            </div>

            <div class="footer-col">
                <h3>Connect</h3>
                <div class="social-links">
<a href="https://www.instagram.com/uclcivsoc/">Instagram</a>
                    <a href="https://www.linkedin.com/company/ucl-civil-engineering-society/posts/?feedView=all">LinkedIn</a>
                    <a href="https://chat.whatsapp.com/FyZ1POz8QzxLmMkpISIjqx">WhatsApp</a>
                    <a href="mailto:su.civil.engineering@ucl.ac.uk">Email Us</a>
                </div>
            </div>

            <div class="footer-col" id="sponsor-col" style="display:none;">
                <h3>Sponsored By</h3>
                <div class="sponsor-grid" id="sponsor-grid" style="display:flex; gap:20px; flex-wrap:wrap; align-items:center;">
                </div>
            </div>
        </div>

        <div class="copyright">
            &copy; 2025 UCL Civil Engineering Society. Not officially affiliated with UCL CEGE Dept.
        </div>
    </footer>
    `;

    const container = document.getElementById(containerId);
    if (container) {
        container.outerHTML = html;
        // Trigger fetch after render
        setTimeout(fetchSponsors, 500);
    } else {
        console.error(`Footer container #${containerId} not found.`);
    }
}
