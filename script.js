/*******************************************************
 * INITIALIZATION & HELPERS
 *******************************************************/

// --- FETCH DATA FROM FIREBASE ---
async function fetchData() {
    if(!window.firebase) {
        // Fallback to static data if firebase not loaded yet
        console.warn("Firebase not loaded, using static data fallback.");
        return;
    }
    const db = firebase.firestore();

    try {
        // 1. POSTS
        const pSnap = await db.collection('posts').get();
        if(!pSnap.empty) {
            // Overwrite global posts array
            // Assuming global scope access or we can attach to window
            window.posts = [];
            pSnap.forEach(doc => window.posts.push({ id: doc.id, ...doc.data() }));
        }

        // 2. COMMITTEE
        const cSnap = await db.collection('committee').get();
        if(!cSnap.empty) {
            window.committee = [];
            cSnap.forEach(doc => window.committee.push({ id: doc.id, ...doc.data() }));
        }

        // 3. REPORTS
        const rSnap = await db.collection('reports').orderBy('createdAt', 'desc').get();
        if(!rSnap.empty) {
            window.reports = [];
            rSnap.forEach(doc => window.reports.push({ id: doc.id, ...doc.data() }));
        }

        // 4. SPONSORS (handled in layout.js mostly, but we can pre-fetch if needed)
        
    } catch(e) {
        console.error("Error fetching data:", e);
    }
}


if (!window.civSocInitialized) {
    window.civSocInitialized = true;

    window.addEventListener('load', async () => {
        const loader = document.getElementById('loader-overlay');
        const hasVisited = sessionStorage.getItem('civsocVisited');

        // Init Firebase if needed (CIVSOC_CONFIG is from firebase-config.js)
        if(typeof CIVSOC_CONFIG !== 'undefined' && firebase.apps.length === 0) {
            firebase.initializeApp(CIVSOC_CONFIG.firebaseConfig);
        }

        await fetchData();

        if (loader) {
            if (hasVisited) loader.style.display = 'none';
            else {
                setTimeout(() => {
                    loader.classList.add('loader-hidden');
                    setTimeout(() => loader.style.display = 'none', 800); 
                    sessionStorage.setItem('civsocVisited', 'true');
                }, 3000); 
            }
        }

        findNextEvent(); 
        renderHomepage(); 
        initReportsAndCommittee();
        
        if(window.location.hash === '#report') switchView('report');
        else if(window.location.hash === '#committee') switchView('committee');
        
        setTimeout(checkDuckMode, 500); 
    });
}

// --- EASTER EGG INPUTS ---
const logoImg = document.querySelector('.nav-logo-img'); 
let clickCount = 0; let clickTimer;
if (logoImg) {
    logoImg.addEventListener('click', (e) => {
        e.stopPropagation(); clickCount++;
        if (clickCount >= 5) window.location.href = 'bridge.html';
        clearTimeout(clickTimer); clickTimer = setTimeout(() => clickCount = 0, 1000);
    });
}
const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let konamiIndex = 0; let keyBuffer = []; 
document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    if (e.key.toLowerCase() === konamiCode[konamiIndex].toLowerCase()) {
        konamiIndex++; if (konamiIndex === konamiCode.length) { toggleDuckMode(); konamiIndex = 0; return; }
    } else { konamiIndex = 0; }
    keyBuffer.push(key); if (keyBuffer.length > 5) keyBuffer.shift(); 
    const bufferStr = keyBuffer.join('');
    if (bufferStr.includes('admin')) { keyBuffer=[]; window.location.href = "admin.html"; }
    if (bufferStr.includes('game')) { keyBuffer=[]; showToast("🕹️ LOADING ARCADE...", "default"); setTimeout(() => window.location.href = "game.html", 1000); }
    if (bufferStr.includes('plan') || bufferStr.includes('cad')) { keyBuffer=[]; toggleBlueprintMode(); }
});

// --- DUCK MODE ---
function checkDuckMode() { if (sessionStorage.getItem('duckMode') === 'true') enableDuckMode(false); }
function toggleDuckMode() { if (sessionStorage.getItem('duckMode') === 'true') disableDuckMode(); else enableDuckMode(true); }
function enableDuckMode(alertUser) {
    sessionStorage.setItem('duckMode', 'true');
    if(alertUser) showToast("🦆 DUCK MODE ACTIVATED!", "duck");
    document.body.style.cursor = "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" style=\"font-size:24px\"><text y=\"24\">🦆</text></svg>'), auto";
    duckifyDOM(document.body); document.addEventListener('click', playDuckSound);
}
function disableDuckMode() { sessionStorage.removeItem('duckMode'); showToast("🚫 DUCK MODE OFF", "default"); setTimeout(() => location.reload(), 1000); }
function playDuckSound() { const audio = new Audio('audio/quack.mp3'); audio.volume = 0.4; audio.cloneNode(true).play().catch(e => {}); }
function duckifyDOM(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: n => n.parentElement.tagName!=='SCRIPT' && n.nodeValue.trim().length>0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT }, false);
    let node; const nodes = []; while(node = walker.nextNode()) nodes.push(node);
    const quacks = ["Quack","Honk","Bread?","Duck"];
    nodes.forEach(n => { n.nodeValue = n.nodeValue.split(/(\s+)/).map(w => (!w.trim() || /[\d]/.test(w)) ? w : quacks[Math.floor(Math.random()*quacks.length)]).join(""); });
}

// --- RENDERERS & HELPERS ---
function formatLongDate(dateStr) {
    if (!dateStr) return ''; const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}
function formatTitle(title) { return title.split(' ').map(w => `<div class="title-word"><span class="initial-letter">${w.charAt(0)}</span>${w.slice(1)}</div>`).join(''); }
function getCalendarLinks(post) {
    if (!post.eventDate) return null;
    const d = post.eventDate.replace(/-/g, '');
    const sT = post.startTime ? post.startTime.replace(':','')+'00' : '180000';
    const eT = post.endTime ? post.endTime.replace(':','')+'00' : '210000';
    const start = `${d}T${sT}`, end = `${d}T${eT}`;
    const title = encodeURIComponent("UCL CivSoc: "+post.title);
    const details = encodeURIComponent(post.summary + "\n\nInfo: https://ucl-civsoc.github.io");
    const loc = encodeURIComponent("UCL Campus");
    return {
        google: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${loc}`,
        outlookPersonal: `https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent&startdt=${post.eventDate}T${post.startTime||'18:00'}:00&enddt=${post.eventDate}T${post.endTime||'21:00'}:00&subject=${title}&body=${details}&location=${loc}`,
        outlookUCL: `https://outlook.office.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent&startdt=${post.eventDate}T${post.startTime||'18:00'}:00&enddt=${post.eventDate}T${post.endTime||'21:00'}:00&subject=${title}&body=${details}&location=${loc}`,
        ics: "data:text/calendar;charset=utf8," + encodeURIComponent(`BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nURL:https://ucl-civsoc.github.io\nDTSTART:${start}\nDTEND:${end}\nSUMMARY:${post.title}\nDESCRIPTION:${post.summary}\nLOCATION:UCL Campus\nEND:VEVENT\nEND:VCALENDAR`)
    };
}
document.addEventListener('click', (e) => {
    if (!e.target.closest('.cal-wrapper')) { document.querySelectorAll('.cal-menu').forEach(el => el.classList.remove('show')); document.querySelectorAll('.cal-btn').forEach(el => el.classList.remove('active')); }
});
function toggleCalendar(btn) {
    const menu = btn.nextElementSibling; const isActive = menu.classList.contains('show');
    document.querySelectorAll('.cal-menu').forEach(el => el.classList.remove('show'));
    if (!isActive) { menu.classList.add('show'); btn.classList.add('active'); }
}

// --- MAIN RENDERER WITH FILLER LOGIC ---
function renderHomepage() {
    const grid = document.getElementById('grid-container');
    const ticker = document.getElementById('ticker-track');
    if (!grid) return;
    grid.innerHTML = '<div class="no-results" id="no-results">No updates.</div>';
    
    // Strict Date Sort: Newest First
    const sortedPosts = [...posts].sort((a, b) => new Date(b.date) - new Date(a.date));

    // GRID FILLER LOGIC
    let currentCol = 0; 
    const maxCols = 4;

    sortedPosts.forEach((post) => {
        // Determine width: UltraMajor=4, Major=2, Normal=1
        let width = 1;
        if(post.isUltraMajor) width = 4;
        else if(post.major) width = 2;

        // If the item doesn't fit in the remaining columns of this row,
        // fill the REST of the row with fillers so the item starts on a new line.
        const remaining = maxCols - currentCol;
        
        if (width > remaining) {
            // Fill the gap
            for(let i=0; i<remaining; i++) {
                createFillerCard(grid);
            }
            // Reset to start of next row
            currentCol = 0;
        }

        createPostCard(grid, post);

        currentCol += width;
        if(currentCol >= maxCols) currentCol = currentCol % maxCols;
    });

    if (ticker) renderTicker(sortedPosts);
}

// FILLER: RANDOM DICTIONARY DEFINITION
function createFillerCard(grid) {
    const definitions = [
        { word: "civil engineering", phonetic: "/ˌsɪv.əl en.dʒɪˈnɪə.rɪŋ/", type: "noun", text: "The art of directing the great sources of power in nature for the use and convenience of man.", author: "Thomas Tredgold, 1828" },
        { word: "engineer", phonetic: "/ˌen.dʒɪˈnɪər/", type: "noun", text: "Scientists investigate that which already is; Engineers create that which has never been.", author: "Theodore von Kármán" },
        { word: "soil mechanics", phonetic: "/sɔɪl məˈkæn.ɪks/", type: "noun", text: "Nature has no contract with the civil engineer. She does not promise to follow his assumptions.", author: "Karl Terzaghi" },
        { word: "structural integrity", phonetic: "/ˈstrʌk.tʃər.əl ɪnˈteɡ.rə.ti/", type: "noun", text: "Structures are either strong or they are not. There is no such thing as a pretty good beam.", author: "J.E. Gordon" },
        { word: "factor of safety", phonetic: "/ˈfæk.tər ɒv ˈseɪf.ti/", type: "noun", text: "Engineering is the art of moulding materials we do not wholly understand... in such a way that the public has no reason to suspect the extent of our ignorance.", author: "Dr. A.R. Dykes" }
    ];
    const def = definitions[Math.floor(Math.random() * definitions.length)];
    const card = document.createElement('div');
    card.className = 'card filler definition-card';
    card.innerHTML = `<div class="def-header"><span class="def-word">${def.word}</span><span class="def-phonetic">${def.phonetic}</span></div><div class="def-body"><p><span class="def-type">${def.type}</span> ${def.text}</p><p class="def-quote">— ${def.author}</p></div>`;
    grid.appendChild(card);
}

function createPostCard(grid, post) {
    const card = document.createElement('div');
    
    // Classes
    let className = `card type-${post.type}`;
    if (post.isUltraMajor) className += ' ultra-major';
    else if (post.major) className += ' major';
    card.className = className;
    
    card.dataset.type = post.type;
    
    // Background Image for Ultra Major
    if (post.isUltraMajor && post.backgroundImage) {
        card.style.setProperty('--bg-image', `url(${post.backgroundImage})`);
        // Fallback for demo if image fails or is placeholder
        if(post.backgroundImage.includes('http')) {
             card.style.backgroundImage = `linear-gradient(90deg, var(--theme-color) 60%, transparent), url(${post.backgroundImage})`;
        }
    }

    const originalIndex = posts.findIndex(p => p.id === post.id);
    card.onclick = () => openArticle(originalIndex);
    
    let labelHTML = '';
    if(post.isUltraMajor) labelHTML = '<span class="major-label">★ FEATURED EVENT</span>';
    else if(post.major) labelHTML = '<span class="major-label">★ MAJOR</span>';

    card.innerHTML = `
        <div class="card-meta"><div class="meta-left"><span class="card-date">${formatLongDate(post.date)}</span>${labelHTML}</div><span class="tag">${post.type}</span></div>
        <div><h2 class="card-title">${post.title}</h2><p class="card-summary">${post.summary}</p><div class="read-more">Read News &rarr;</div></div>
    `;
    grid.appendChild(card);
}

function renderTicker(sortedPosts) {
    const tPosts = sortedPosts.filter(p => p.hasTickets && (!p.eventDate || new Date(p.eventDate) >= new Date().setHours(0,0,0,0)));
    const ticker = document.getElementById('ticker-track');
    const section = document.getElementById('ticket-section');
    if(tPosts.length > 0) {
        section.style.display = 'block';
        ticker.innerHTML = '';
        let loop = []; while(loop.length<12) loop=[...loop,...tPosts];
        loop.forEach(p => {
            const mc = document.createElement('div');
            mc.className = `mini-card type-${p.type}`;
            mc.style.setProperty('--theme-color', `var(--col-${p.type})`);
            mc.onclick = () => openArticle(posts.findIndex(x=>x.id===p.id));
            let bClass = p.ticketStatus==='Sold Out'?'red':(p.ticketStatus==='Selling Fast'?'amber':'green');
            mc.innerHTML = `<div class="status-badge ${bClass}">${p.ticketStatus}</div><h3>${p.title}</h3><span class="tag" style="background:var(--theme-color);color:white;border:none">${p.type}</span>`;
            ticker.appendChild(mc);
        });
    }
}

// ... (Rest of functions findNextEvent, filterGrid, openArticle, etc. remain unchanged) ...
function findNextEvent() {
    const today = new Date(); today.setHours(0,0,0,0);
    const upcoming = posts.filter(p => p.eventDate && new Date(p.eventDate) >= today).sort((a,b) => new Date(a.eventDate) - new Date(b.eventDate));
    const container = document.getElementById('next-event-container');
    if (upcoming.length > 0 && container) {
        container.style.display = ''; container.classList.add('active');
        const next = upcoming[0];
        const diff = Math.ceil((new Date(next.eventDate) - today) / (1000 * 60 * 60 * 24));
        const hero = document.getElementById('next-event-hero');
        if(hero) {
            hero.onclick = () => openArticle(posts.findIndex(p=>p.id===next.id));
            hero.innerHTML = `<div class="next-label">Up Next</div><div class="next-title">${next.title}</div><div class="next-meta"><span class="countdown-badge">${diff===0?'TODAY':`IN ${diff} DAYS`}</span><span>${formatLongDate(next.eventDate)}</span></div>`;
        }
        const list = document.getElementById('next-event-list');
        if(list) {
            list.innerHTML = '';
            upcoming.slice(1,4).forEach(e => {
                const div = document.createElement('div');
                div.className = 'upcoming-small-item';
                div.onclick = () => openArticle(posts.findIndex(p=>p.id===e.id));
                div.innerHTML = `<div class="small-item-date">${formatLongDate(e.eventDate)}</div><div class="small-item-title">${e.title}</div>`;
                list.appendChild(div);
            });
        }
    } else if(container) { container.style.display = 'none'; }
}

function filterGrid(category, btnElement) {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    btnElement.classList.add('active');
    
    let hasVisible = false;
    document.querySelectorAll('.card:not(.filler)').forEach(card => {
        if (category === 'all' || card.dataset.type === category) { card.classList.remove('hidden'); hasVisible = true; }
        else { card.classList.add('hidden'); }
    });
    // Hide fillers if filtered
    document.querySelectorAll('.filler').forEach(f => f.style.display = category==='all'?'flex':'none');

    const noResults = document.getElementById('no-results');
    if (noResults) { if (!hasVisible) noResults.style.display = 'block'; else noResults.style.display = 'none'; }
}

const articleModal = document.getElementById('article-modal');
function openArticle(index) {
    const post = posts[index];
    const typeColor = getComputedStyle(document.documentElement).getPropertyValue(`--col-${post.type}`);
    document.documentElement.style.setProperty('--theme-color', typeColor);
    const words = post.title.split(' ');
    const longest = words.reduce((a,b)=>a.length>b.length?a:b,"");
    const size = Math.min(22, 100/(longest.length*0.7));
    document.documentElement.style.setProperty('--dynamic-font-size', `${size}cqw`);

    let eventTag = post.eventDate ? `<span class="tag event-style">📅 ${formatLongDate(post.eventDate)}${post.startTime?` • ${post.startTime}`:''}</span>` : '';
    let calBtn = post.eventDate ? (() => {
        const l = getCalendarLinks(post);
        return `<div class="cal-wrapper"><div class="cal-btn" onclick="toggleCalendar(this)">📅</div><div class="cal-menu"><a href="${l.outlookUCL}" target="_blank" class="cal-option">Outlook (UCL)</a><a href="${l.google}" target="_blank" class="cal-option">Google</a><a href="${l.ics}" download="${post.title}.ics" class="cal-option">File (.ics)</a></div></div>`;
    })() : '';
    let bookBtn = post.hasTickets ? (post.ticketStatus==='Sold Out' ? `<div class="su-booking-btn sold-out">❌ Sold Out</div>` : `<a href="https://studentsunionucl.org" target="_blank" class="su-booking-btn"><img src="images/website/sulogo.png"> Book Ticket</a>`) : '';

    articleModal.innerHTML = `
        <div class="article-layout">
            <div class="article-left"><button class="close-article-btn" onclick="closeArticle()">← Back</button><div class="article-huge-title">${formatTitle(post.title)}</div><div class="mobile-scroll-hint">Scroll ↓</div></div>
            <div class="article-right"><div class="article-header-meta"><div class="meta-group-left"><span class="tag" style="background:${typeColor};color:white;border:none">${post.type}</span>${eventTag}<span class="article-date">Posted ${formatLongDate(post.date)}</span></div><div style="display:flex;gap:10px;align-items:center">${calBtn}${bookBtn}</div></div><div class="article-body">${post.content}</div></div>
        </div>`;
    articleModal.style.display = 'block'; document.body.style.overflow = 'hidden';
    if(sessionStorage.getItem('duckMode') === 'true') duckifyDOM(articleModal);
}
function closeArticle() { articleModal.style.display = 'none'; document.body.style.overflow = 'auto'; }

function initReportsAndCommittee() {
    const rSide = document.getElementById('report-sidebar');
    if(rSide && typeof reports !== 'undefined') {
        rSide.innerHTML = ''; reports.forEach((r,i) => { const b = document.createElement('button'); b.className=`week-btn ${i===0?'active':''}`; b.innerText=r.label; b.onclick=()=>loadReport(i); rSide.appendChild(b); });
        if(reports.length>0) loadReport(0);
    }
    const cGrid = document.getElementById('committee-grid');
    if(cGrid && typeof committee !== 'undefined') {
        cGrid.innerHTML = ''; committee.forEach(m => {
            const c = document.createElement('div'); c.className = 'member-card';
            let btn = m.linkedin ? `<a href="${m.linkedin}" target="_blank" class="member-email" style="color:#0077b5;border-color:#0077b5">Linked<strong>in</strong></a>` : `<a href="mailto:${m.email}" class="member-email">Email</a>`;
            c.innerHTML = `<div class="member-img-box"><img src="${m.image}" class="member-img"></div><div class="member-info"><div class="member-role">${m.role}</div><div class="member-name">${m.name}</div><div class="member-bio">${m.bio}</div>${btn}</div>`;
            cGrid.appendChild(c);
        });
    }
}
function loadReport(i) {
    document.querySelectorAll('.week-btn').forEach((b,x) => b.classList.toggle('active',x===i));
    const r = reports[i];
    let fin = r.finances.map(f=>`<tr><td>${f.item}<br><small>${f.category}</small></td><td class="amount ${f.type}">${f.amt}</td></tr>`).join('');
    document.getElementById('report-content').innerHTML = `<div class="report-header"><h2>Weekly Report</h2><span class="date">${r.label}</span></div><div class="stat-grid"><div class="stat-box"><span class="stat-number">${r.stats.attendance}</span><span class="stat-label">Present</span></div><div class="stat-box"><span class="stat-number">${r.stats.discussion}</span><span class="stat-label">Topics</span></div><div class="stat-box"><span class="stat-number">${r.stats.decisions}</span><span class="stat-label">Decisions</span></div></div>${fin ? `<div class="data-section"><h3>Treasury</h3><table class="transparency-table">${fin}</table></div>` : ''}<div class="data-section"><h3>Minutes</h3><ul>${r.minutes.map(m=>`<li>${m}</li>`).join('')}</ul></div>`;
}
function switchView(target) {
    const views = ['news-view','report-view','committee-view'];
    views.forEach(v => { if(document.getElementById(v)) document.getElementById(v).style.display = 'none'; });
    const navM = document.getElementById('nav-main-menu'); const navB = document.getElementById('nav-back-menu');
    if(target === 'news') { document.getElementById('news-view').style.display = 'block'; if(navM) navM.style.display = 'flex'; if(navB) navB.style.display = 'none'; } 
    else { if(navM) navM.style.display = 'none'; if(navB) navB.style.display = 'flex'; if(target==='report') document.getElementById('report-view').style.display='block'; if(target==='committee') document.getElementById('committee-view').style.display='block'; }
    if(sessionStorage.getItem('duckMode')==='true') duckifyDOM(document.body);
    window.scrollTo(0,0);
}
const topBtn = document.getElementById("back-to-top-btn");
if(topBtn) { window.addEventListener('scroll', () => { topBtn.classList.toggle("show", document.documentElement.scrollTop > 300); }); }
function scrollToTop() { window.scrollTo({top:0, behavior:'smooth'}); }