// --- GLOBAL VARIABLES ---
let db; let storage;
let currentState = "CLOSED";
let submissionDeadline, votingDeadline, resultsDeadline;
let currentCategory = "individual";

// --- SUBMISSION STATE ---
let uploadedImageFiles = null; // Only tracking images now

const grid = document.getElementById('entries-grid');
let allEntries = [];

// --- MOCK DATA ---
let mockEntries = [
    { id: "1", type: "individual", title: "The Vertigo Tower", author: "Alice Chen", software: "Revit", votes: 142, img: "https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=800&q=80", desc: "Biophilic design." },
    { id: "2", type: "individual", title: "Eco-Spire 2025", author: "Ben Miller", software: "Rhino", votes: 128, img: "https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?auto=format&fit=crop&w=800&q=80", desc: "Net-zero." },
    { id: "3", type: "team", title: "The Hive", author: "Team Bees", software: "Blender", votes: 200, img: "https://images.unsplash.com/photo-1506146332389-18140dc7b2fb?auto=format&fit=crop&w=600&q=80", desc: "Hexagonal." }
];

document.addEventListener('DOMContentLoaded', () => {
    if (typeof CONFIG === 'undefined') return console.error("Config missing");

    calculateStateFromDate();
    setupUIBasedOnState();
    startTimer();
    renderPrizes();
    
    // INITIALIZE DRAG & DROP (Images Only)
    setupDragDrop('drop-zone-img', 'inp-file');

    if(currentState === "SUBMITTING" && !sessionStorage.getItem('introPlayed')) {
        playIntroSequence();
        sessionStorage.setItem('introPlayed', 'true');
    }

    if (CONFIG.firebaseConfig && CONFIG.firebaseConfig.apiKey) {
        try {
            firebase.initializeApp(CONFIG.firebaseConfig);
            db = firebase.firestore();
            storage = firebase.storage();
            listenForUpdates(); 
        } catch (e) { console.error(e); useMockData(); }
    } else { useMockData(); }
});

// --- DRAG & DROP LOGIC ---
function setupDragDrop(zoneId, inputId) {
    const zone = document.getElementById(zoneId);
    const input = document.getElementById(inputId);
    if (!zone || !input) return;

    // Prevent browser from opening file
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(evt => {
        zone.addEventListener(evt, (e) => { e.preventDefault(); e.stopPropagation(); }, false);
    });

    // Styles
    ['dragenter', 'dragover'].forEach(evt => zone.addEventListener(evt, () => zone.classList.add('dragover'), false));
    ['dragleave', 'drop'].forEach(evt => zone.addEventListener(evt, () => zone.classList.remove('dragover'), false));

    // Drop Event
    zone.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            input.files = files; // Sync input
            handleFileSelection(files);
        }
    });

    // Click Event
    input.addEventListener('change', () => {
        if (input.files.length > 0) handleFileSelection(input.files);
    });
}

function handleFileSelection(files) {
    uploadedImageFiles = files;
    const count = files.length;
    const label = count > 1 ? `${count} Files Selected` : files[0].name;
    const display = document.getElementById('file-name-display');
    display.innerText = "Selected: " + label;
    display.style.color = "#500778";
    display.style.fontWeight = "bold";
    
    updatePreview();
}

// --- PREVIEW LOGIC ---
function updatePreview() {
    const title = document.getElementById('inp-title').value || "Project Title";
    const type = document.getElementById('inp-category').value;
    const desc = document.getElementById('inp-desc').value || "Description preview...";
    
    let author = "Author Name";
    if (type === 'individual') {
        author = document.getElementById('inp-author').value || "Author Name";
    } else {
        const tName = document.getElementById('inp-team-name').value;
        if (tName) author = tName;
    }

    document.getElementById('prev-title').innerText = title;
    document.getElementById('prev-author').innerText = author;
    document.getElementById('prev-desc').innerText = desc;

    // Image Preview
    const gallery = document.getElementById('prev-gallery');
    
    gallery.innerHTML = "";
    gallery.className = "preview-gallery";

    if (uploadedImageFiles && uploadedImageFiles.length > 0) {
        if(uploadedImageFiles.length > 1) gallery.classList.add('multi-img');
        
        // Show up to 5 images in preview
        Array.from(uploadedImageFiles).slice(0, 5).forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = document.createElement('img');
                img.src = e.target.result;
                gallery.appendChild(img);
            }
            reader.readAsDataURL(file);
        });
    } else {
        gallery.innerHTML = `<img src="../images/website/civsoclogo.png" id="prev-img-main" style="opacity:0.3; object-fit:contain;">`;
    }
}

// --- SUBMIT LOGIC (No PDF) ---
// --- NEW: Upload Logic using Cloudinary ---
async function uploadToCloudinary(file) {
    const url = `https://api.cloudinary.com/v1_1/${CONFIG.cloudinary.cloudName}/image/upload`;
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CONFIG.cloudinary.uploadPreset);

    try {
        const res = await fetch(url, { method: 'POST', body: formData });
        const data = await res.json();
        return data.secure_url; // Returns the web link to the image
    } catch (error) {
        console.error("Cloudinary Error:", error);
        throw new Error("Image upload failed");
    }
}

// --- SUBMIT LOGIC ---
async function submitEntry() {
    if(currentState !== "SUBMITTING") return showToast("Submissions Closed", "error");
    
    const type = document.getElementById('inp-category').value;
    const title = document.getElementById('inp-title').value;
    const software = document.getElementById('inp-software').value;
    const desc = document.getElementById('inp-desc').value;
    const pledge = document.getElementById('inp-pledge').checked;
    
    // Get inputs
    const imageFiles = document.getElementById('inp-file').files; // From input
    const urlImg = document.getElementById('inp-img-url').value; // From URL paste

    // Determine Author
    let authorName = "";
    if(type === 'individual') {
        authorName = document.getElementById('inp-author').value;
    } else {
        const tName = document.getElementById('inp-team-name').value;
        const members = document.getElementById('inp-members').value;
        if(!tName || !members) return showToast("Team details missing", "error");
        authorName = `${tName} (${members})`;
    }

    // Priority: 1. Dragged Files, 2. Selected Files, 3. URL
    const finalFiles = uploadedImageFiles || (imageFiles.length > 0 ? imageFiles : null);
    const hasImage = finalFiles || (urlImg.length > 5);

    if(!title || !authorName || !software || !hasImage) return showToast("Missing fields or image", "error");
    if(!pledge) return showToast("Please certify originality", "error");

    if (currentCategory !== type) switchCategory(type);

    showToast("Uploading Images... Please wait.");

    try {
        let finalImageUrls = [];

        // CASE A: File Upload (Send to Cloudinary)
        if (finalFiles) {
            // Limit to 5 images
            const filesToUpload = Array.from(finalFiles).slice(0, 5);
            
            // Upload all images in parallel
            const uploadPromises = filesToUpload.map(file => uploadToCloudinary(file));
            finalImageUrls = await Promise.all(uploadPromises);
        } 
        // CASE B: URL Paste
        else {
            finalImageUrls = [urlImg];
        }

        // Prepare Data
        const entryData = { 
            title, 
            author: authorName, 
            software, 
            desc, 
            type, 
            images: finalImageUrls, // Saves the Cloudinary Links
            pdf: "" // PDF removed as requested
        };

        // Save to Database (or Grid if Demo)
        saveEntry(entryData, !!db);

    } catch (e) {
        console.error(e);
        showToast("Error: " + e.message, "error");
    }
}

function saveEntry(data, real=false) {
    const entry = { id: Date.now().toString(), ...data, votes: 0, timestamp: Date.now() };
    // Add 'img' for backwards compatibility
    entry.img = (entry.images && entry.images.length > 0) ? entry.images[0] : "";

    if (real) {
        db.collection(CONFIG.collection_id || "competitions").add(entry).then(() => { 
            showToast("Submitted!"); 
            closeUploadModal(true); 
        });
    } else {
        mockEntries.push(entry); 
        renderGrid(mockEntries); 
        showToast("Entry Added (Demo Mode)"); 
        closeUploadModal(true);
    }
}

// --- HELPERS ---
function readFile(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
    });
}

function toggleTeamFields() {
    const type = document.getElementById('inp-category').value;
    document.getElementById('field-individual').style.display = type === 'team' ? 'none' : 'block';
    document.getElementById('field-team').style.display = type === 'team' ? 'block' : 'none';
    updatePreview();
}

function clearInputs() {
    document.getElementById('inp-title').value = "";
    document.getElementById('inp-author').value = "";
    document.getElementById('inp-team-name').value = "";
    document.getElementById('inp-members').value = "";
    document.getElementById('inp-software').value = "";
    document.getElementById('inp-desc').value = "";
    document.getElementById('inp-file').value = "";
    document.getElementById('inp-pledge').checked = false;
    document.getElementById('file-name-display').innerText = "Click to Select Images";
    document.getElementById('file-name-display').style.color = "#666";
    uploadedImageFiles = null;
    updatePreview();
}

function openUploadModal() { document.getElementById('upload-modal').style.display='flex'; setTimeout(()=>document.getElementById('upload-modal').classList.add('show'),10); }
function closeUploadModal(force) { document.getElementById('upload-modal').classList.remove('show'); setTimeout(()=> { document.getElementById('upload-modal').style.display='none'; if(force) clearInputs(); },300); }
function closeDetailModal() { document.getElementById('detail-modal').classList.remove('show'); setTimeout(()=>document.getElementById('detail-modal').style.display='none',300); }
function showToast(msg, type="default") { const t = document.createElement('div'); t.className=`toast ${type}`; t.innerHTML=msg; document.getElementById('toast-container').appendChild(t); setTimeout(()=>t.remove(),3000); }

// --- CORE LOGIC ---
function openDetail(entry) {
    const gallery = document.getElementById('modal-gallery');
    gallery.innerHTML = ""; 
    if (entry.images && entry.images.length > 0) {
        entry.images.forEach(imgUrl => {
            const img = document.createElement('img'); img.src = imgUrl; img.className = 'modal-gallery-img'; gallery.appendChild(img);
        });
    } else if (entry.img) gallery.innerHTML = `<img src="${entry.img}" class="modal-gallery-img">`;

    document.getElementById('modal-title').innerText = entry.title;
    document.getElementById('modal-software').innerText = entry.software;
    document.getElementById('modal-desc').innerText = entry.desc;
    document.getElementById('modal-cat-badge').innerText = entry.type.toUpperCase();
    document.getElementById('modal-author').innerText = getDisplayAuthor(entry.author);
    
    const btn = document.getElementById('modal-vote-btn');
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);

    const voted = localStorage.getItem(`voted_${entry.id}`);
    if(currentState !== "VOTING") { newBtn.innerText = "Voting Closed"; newBtn.className = "modal-action-btn disabled"; }
    else if(voted) { newBtn.innerText = "✓ Voted"; newBtn.className = "modal-action-btn disabled"; }
    else { newBtn.innerText = "▲ Cast Vote"; newBtn.className = "modal-action-btn"; newBtn.onclick = () => handleVote(entry.id); }

    const modal = document.getElementById('detail-modal');
    modal.style.display = 'flex'; setTimeout(()=>modal.classList.add('show'),10);
}

function handleVote(id) {
    const collectionName = CONFIG.collection_id || "competitions";
    if(db) db.collection(collectionName).doc(id).update({ votes: firebase.firestore.FieldValue.increment(1) });
    else { const i = mockEntries.find(e=>e.id===id); if(i) i.votes++; renderGrid(mockEntries); }
    localStorage.setItem(`voted_${id}`, 'true');
    showToast("Vote Registered!");
    closeDetailModal();
}

// --- STATE & RESULTS ---
function calculateStateFromDate() {
    if (!CONFIG.end_date) return;
    votingDeadline = new Date(CONFIG.end_date);
    submissionDeadline = new Date(votingDeadline.getTime() - (7 * 24 * 60 * 60 * 1000));
    resultsDeadline = new Date(votingDeadline.getTime() + (CONFIG.results_duration_days * 24 * 60 * 60 * 1000));
    const now = new Date();
    if (now < submissionDeadline) currentState = "SUBMITTING";
    else if (now < votingDeadline) currentState = "VOTING";
    else if (now < resultsDeadline) currentState = "RESULTS";
    else currentState = "ARCHIVED";
}

function startTimer() {
    const timerEl = document.getElementById('countdown-timer');
    if(!timerEl || currentState === "ARCHIVED" || currentState === "RESULTS") { if(timerEl) timerEl.style.display = 'none'; return; }
    const targetDate = currentState === "SUBMITTING" ? submissionDeadline : votingDeadline;
    const label = currentState === "SUBMITTING" ? "Submissions close:" : "Voting closes:";
    function update() {
        const now = new Date();
        const diff = targetDate - now;
        if (diff <= 0) return location.reload();
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        timerEl.innerHTML = `<span style="opacity:0.7; font-size:0.9rem; margin-right:5px;">${label}</span> ${d}d ${h}h`;
    }
    update(); setInterval(update, 60000);
}

function setupUIBasedOnState() {
    const statusDiv = document.getElementById('status-indicator');
    const submitBtn = document.getElementById('hero-submit-btn');
    const gridEl = document.getElementById('entries-grid');
    const resultsEl = document.getElementById('results-view');
    if (!statusDiv) return;
    document.body.classList.remove('results-mode');
    if(resultsEl) resultsEl.style.display = 'none';
    if(currentState === "SUBMITTING") {
        statusDiv.innerHTML = '<span class="status-badge status-open">● Submissions Open</span>';
        if(submitBtn) submitBtn.style.display = "inline-flex";
        if(gridEl) gridEl.style.display = "grid"; 
    } else if (currentState === "VOTING") {
        statusDiv.innerHTML = '<span class="status-badge status-voting">● Voting Open</span>';
        if(submitBtn) submitBtn.style.display = "none";
        if(gridEl) gridEl.style.display = "grid"; 
    } else if (currentState === "RESULTS") {
        document.body.classList.add('results-mode');
        statusDiv.innerHTML = '<span class="status-badge status-results">● Results Live</span>';
        if(submitBtn) submitBtn.style.display = "none";
        if(gridEl) gridEl.style.display = "none";
        if(resultsEl) resultsEl.style.display = "block";
    }
}

function renderResults(data) {
    const filtered = data.filter(e => e.type === currentCategory);
    const sorted = [...filtered].sort((a, b) => b.votes - a.votes);
    const podium = sorted.slice(0, 3);
    const runnersUp = sorted.slice(3, 5);
    const findByAuthor = (t) => { if(!t)return null; return data.find(e => e.author.toLowerCase().includes(t.toLowerCase())); };
    const categoryConfig = CONFIG.manual_winners[currentCategory] || {};
    const techWinner = findByAuthor(categoryConfig.technical);
    const creativeWinner = findByAuthor(categoryConfig.creative);
    const podiumGrid = document.getElementById('podium-grid');
    podiumGrid.innerHTML = '';
    const displayOrder = [1, 0, 2]; 
    const rankStyles = [{ label: "1st Place", class: "gold" }, { label: "2nd Place", class: "silver" }, { label: "3rd Place", class: "bronze" }];
    const prizesList = CONFIG.prizes[currentCategory];
    displayOrder.forEach(rankIndex => {
        if(podium[rankIndex]) {
            const entry = podium[rankIndex];
            const style = rankStyles[rankIndex];
            const prizeObj = prizesList[rankIndex]; 
            const prizeVal = prizeObj ? prizeObj.value : "";
            const coverImg = (entry.images && entry.images.length > 0) ? entry.images[0] : entry.img;
            const div = document.createElement('div');
            div.className = `winner-card ${style.class}`;
            div.innerHTML = `
                <div class="crown-icon"><i class="fas fa-crown"></i></div>
                <div class="winner-img-box"><img src="${coverImg}"></div>
                <div class="winner-info">
                    <div class="win-badge">${style.label}</div>
                    <div class="win-title">${entry.title}</div>
                    <div class="win-author">${entry.author}</div>
                    <div class="win-votes">${entry.votes} Votes</div>
                    <div style="margin-top:5px; color:#F6BE00; font-weight:bold;">${prizeVal}</div>
                </div>`;
            div.querySelector('img').onclick = () => openDetail(entry);
            podiumGrid.appendChild(div);
        }
    });
    const commGrid = document.getElementById('committee-grid');
    commGrid.innerHTML = '';
    if(techWinner) commGrid.appendChild(createSpecialCard(techWinner, "Most Technical", "fas fa-drafting-compass", "tech"));
    if(creativeWinner) commGrid.appendChild(createSpecialCard(creativeWinner, "Most Creative", "fas fa-paint-brush", "creative"));
    const runGrid = document.getElementById('runners-up-grid');
    runGrid.innerHTML = '';
    runnersUp.forEach(entry => {
        runGrid.appendChild(createSpecialCard(entry, "Honorable Mention", "fas fa-award", "hm"));
    });
}

function createSpecialCard(entry, label, icon, type) {
    const prizeObj = CONFIG.prizes[currentCategory].find(p => p.label.includes(label) || (label==="Honorable Mention" && p.label==="Honorable Mention"));
    const val = prizeObj ? prizeObj.value : "";
    const coverImg = (entry.images && entry.images.length > 0) ? entry.images[0] : entry.img;
    const div = document.createElement('div');
    div.className = `special-card type-${type}`;
    div.onclick = () => openDetail(entry);
    div.innerHTML = `
        <div class="sp-img"><img src="${coverImg}"></div>
        <div class="sp-info">
            <div class="sp-label"><i class="${icon}"></i> ${label} <span style="color:#fff; opacity:0.7;">- ${val}</span></div>
            <div class="sp-title">${entry.title}</div>
            <div class="sp-author">${entry.author}</div>
        </div>`;
    return div;
}
function getDisplayAuthor(realName) { if (!CONFIG.blind_voting) return realName; if (currentState === "RESULTS") return realName; return "Anonymous Entry"; }
function switchCategory(cat) { currentCategory = cat; document.getElementById('tab-ind').className = cat === 'individual' ? 'cat-btn active' : 'cat-btn'; document.getElementById('tab-team').className = cat === 'team' ? 'cat-btn active' : 'cat-btn'; renderPrizes(); if(currentState === "RESULTS") renderResults(allEntries); else renderGrid(allEntries); }
function renderPrizes() { const container = document.getElementById('prizes-display'); if(!container || !CONFIG.prizes[currentCategory]) return; const prizeList = CONFIG.prizes[currentCategory]; container.innerHTML = prizeList.map(p => `<div class="prize-tag ${p.class}"><i class="fas fa-${p.icon}"></i> ${p.label}: ${p.value}</div>`).join(''); }
function useMockData() { allEntries = mockEntries; if(currentState === "RESULTS") renderResults(allEntries); else renderGrid(allEntries); }
function listenForUpdates() { const collectionName = CONFIG.collection_id || "competitions"; db.collection(collectionName).onSnapshot((snapshot) => { allEntries = []; snapshot.forEach(doc => allEntries.push({ id: doc.id, ...doc.data() })); if(currentState === "RESULTS") renderResults(allEntries); else renderGrid(allEntries); }); }
function renderGrid(data) { if (!grid) return; grid.innerHTML = ''; const filtered = data.filter(e => e.type === currentCategory); if(filtered.length === 0) { grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:4rem; color:#999;">No entries yet.</div>`; return; } if(currentState === "VOTING" && CONFIG.blind_voting) filtered.sort(() => Math.random() - 0.5); else filtered.sort((a,b) => b.votes - a.votes); filtered.forEach(entry => grid.appendChild(createCard(entry))); }
function playIntroSequence() { const overlay = document.getElementById('intro-sequence'); const w1 = document.getElementById('word-1'); const w2 = document.getElementById('word-2'); const w3 = document.getElementById('word-3'); if (!overlay || !w1) return; overlay.style.display = 'block'; setTimeout(() => { w1.classList.add('active'); }, 100); setTimeout(() => { w1.classList.remove('active'); w2.classList.add('active'); }, 1200); setTimeout(() => { w2.classList.remove('active'); w3.classList.add('active'); }, 2400); setTimeout(() => { overlay.style.transition = "opacity 0.5s"; overlay.style.opacity = "0"; setTimeout(() => { overlay.style.display = 'none'; }, 500); }, 4000); }function createCard(entry) {
    const card = document.createElement('div');
    card.className = "entry-card";
    card.onclick = () => openDetail(entry);
    
    // Image handling
    const imgBox = document.createElement('div');
    imgBox.className = "entry-img-box";
    const img = document.createElement('img');
    img.className = "entry-img";
    
    // Handle multiple images or legacy single image
    if (entry.images && entry.images.length > 0) {
        img.src = entry.images[0];
    } else if (entry.img) {
        img.src = entry.img;
    } else {
        img.src = "../images/website/civsoclogo.png"; // Fallback
    }
    imgBox.appendChild(img);
    card.appendChild(imgBox);

    // Info section
    const info = document.createElement('div');
    info.className = "entry-info";

    const title = document.createElement('div');
    title.className = "entry-title";
    title.innerText = entry.title;
    info.appendChild(title);

    const meta = document.createElement('div');
    meta.className = "entry-meta";
    meta.innerHTML = `<i class="fas fa-user-circle"></i> ${getDisplayAuthor(entry.author)}`;
    info.appendChild(meta);

    // Footer with vote count
    const footer = document.createElement('div');
    footer.className = "card-footer";
    
    const voteBadge = document.createElement('div');
    voteBadge.className = "vote-badge";
    // Check if voted
    const hasVoted = localStorage.getItem(`voted_${entry.id}`);
    const voteText = hasVoted ? "✓ Voted" : `${entry.votes} Votes`;
    voteBadge.innerText = voteText;
    
    footer.appendChild(voteBadge);
    info.appendChild(footer);

    card.appendChild(info);

    return card;
}
