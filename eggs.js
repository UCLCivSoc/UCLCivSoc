/* ==========================================================================
   CIVSOC EASTER EGGS MODULE (v10.0 - Final Physics Fix)
   ========================================================================== */

// --- 1. TOAST SYSTEM ---
function showToast(message, type = 'default') {
    const container = document.getElementById('toast-container');
    if(!container) return;
    const toast = document.createElement('div');
    toast.className = `custom-toast toast-${type}`;
    toast.innerHTML = message;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.transition = "0.5s"; toast.style.opacity = "0";
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

// --- 2. BLUEPRINT MODE ---
function toggleBlueprintMode() {
    document.body.classList.toggle('blueprint-mode');
    if(document.body.classList.contains('blueprint-mode')) {
        showToast("📐 BLUEPRINT MODE ACTIVATED", "blueprint");
    } else {
        showToast("📐 RENDER MODE RESTORED", "default");
    }
}

// --- 3. STRUCTURAL FAILURE (PHYSICS) ---
let leftPillarHealth = 3;
let rightPillarHealth = 3;
let leftPillarBroken = false;
let rightPillarBroken = false;
let engineRunning = false; 

function damagePillar(side, element) {
    if(element.classList.contains('damaged')) return; 

    if (side === 'left') leftPillarHealth--;
    if (side === 'right') rightPillarHealth--;

    // Shake effect
    element.style.transition = "0.1s";
    element.style.transform = `translateX(${Math.random()*4-2}px)`;
    setTimeout(() => element.style.transform = "none", 100);
    playCrackSound(200);

    if (side === 'left' && leftPillarHealth <= 0) breakPillar(side, element);
    if (side === 'right' && rightPillarHealth <= 0) breakPillar(side, element);
}

function breakPillar(side, element) {
    element.classList.add('damaged');
    playCrackSound(80);
    
    // Global Shake
    document.body.style.transition = "0.1s";
    document.body.style.transform = `translate(${Math.random()*10-5}px, ${Math.random()*10-5}px)`;
    setTimeout(() => document.body.style.transform = "none", 100);

    if (side === 'left') leftPillarBroken = true;
    if (side === 'right') rightPillarBroken = true;

    if (leftPillarBroken && rightPillarBroken && !engineRunning) {
        engineRunning = true;
        setTimeout(initStructuralFailure, 800);
    }
}

function playCrackSound(freq) {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.value = freq; 
    osc.frequency.exponentialRampToValueAtTime(10, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
}

function initStructuralFailure() {
    showToast("⚠️ CRITICAL FAILURE: EVACUATE", "danger");
    document.getElementById('repair-btn').style.display = 'block';

    // CRITICAL FIX: Disable text selection so dragging works
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none'; // Safari
    document.body.style.touchAction = 'none'; // Mobile Dragging
    document.body.style.cursor = 'grab'; // Visual Cue

    // Freeze page height
    document.body.style.height = document.body.scrollHeight + 'px';
    document.documentElement.style.height = document.body.scrollHeight + 'px';

    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.19.0/matter.min.js";
    script.onload = () => startPhysicsEngine();
    document.head.appendChild(script);
}

function startPhysicsEngine() {
    const { Engine, Runner, Bodies, Composite, Mouse, MouseConstraint, Events } = Matter;
    const engine = Engine.create();
    const world = engine.world;

    const elements = document.querySelectorAll('.card, h1, .subtitle, .nav-btn, .logo-container, .ticket-section, .next-event-container');
    const bodiesDomPairs = [];

    const width = window.innerWidth;
    
    // FIND FOOTER POSITION TO SET FLOOR
    const footer = document.querySelector('footer');
    const footerTop = footer.getBoundingClientRect().top + window.scrollY;
    
    // Boundaries
    const wallThickness = 500; 
    
    // Floor: Sits exactly at the top of the footer
    const ground = Bodies.rectangle(width / 2, footerTop + (wallThickness/2), width, wallThickness, { isStatic: true, friction: 1 });
    
    const height = footerTop * 2; 
    const wallLeft = Bodies.rectangle(-wallThickness/2, height/2, wallThickness, height * 2, { isStatic: true });
    const wallRight = Bodies.rectangle(width + (wallThickness/2), height/2, wallThickness, height * 2, { isStatic: true });
    
    Composite.add(world, [ground, wallLeft, wallRight]);

    // Convert Elements
    elements.forEach(el => {
        const rect = el.getBoundingClientRect();
        if(rect.width === 0 || rect.height === 0) return;

        const absX = rect.left + window.scrollX + rect.width/2;
        const absY = rect.top + window.scrollY + rect.height/2;

        // Ghost Placeholder
        const ghost = el.cloneNode(true);
        ghost.style.visibility = 'hidden'; 
        ghost.id = ""; 
        el.parentNode.insertBefore(ghost, el);

        // Physics Body
        const body = Bodies.rectangle(absX, absY, rect.width, rect.height, { 
            restitution: 0.2, // Low bounce
            friction: 0.8, // High friction
            density: 0.002 
        });
        
        // Initial Impulse
        Matter.Body.setVelocity(body, { x: (Math.random()-0.5)*2, y: (Math.random())*2 });
        Matter.Body.setAngularVelocity(body, (Math.random()-0.5)*0.05);

        bodiesDomPairs.push({ body: body, element: el });
        Composite.add(world, body);

        // Visual Detach
        el.style.position = 'absolute';
        el.style.left = '0'; el.style.top = '0';
        el.style.width = rect.width + 'px'; 
        el.style.height = rect.height + 'px';
        el.style.margin = '0'; 
        el.style.zIndex = '1000'; 
        el.style.pointerEvents = "none"; // Pass clicks to physics mouse
    });

    // Mouse Interaction
    const mouse = Mouse.create(document.body);
    const mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: { 
            stiffness: 0.2, // Tighter spring for better control
            damping: 0.05,
            render: { visible: false } 
        }
    });
    Composite.add(world, mouseConstraint);

    // SCROLL SYNC
    Events.on(engine, 'beforeUpdate', function() {
        mouse.offset.x = window.scrollX;
        mouse.offset.y = window.scrollY;
    });

    // Re-enable scrolling
    mouse.element.removeEventListener("mousewheel", mouse.mousewheel);
    mouse.element.removeEventListener("DOMMouseScroll", mouse.mousewheel);

    const runner = Runner.create();
    Runner.run(runner, engine);

    function update() {
        bodiesDomPairs.forEach(pair => {
            const { x, y } = pair.body.position;
            const angle = pair.body.angle;
            
            pair.element.style.transform = `translate3d(${x - pair.element.offsetWidth/2}px, ${y - pair.element.offsetHeight/2}px, 0) rotate(${angle}rad)`;
        });
        requestAnimationFrame(update);
    }
    update();
}