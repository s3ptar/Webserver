const canvas = document.getElementById('graphCanvas');
const ctx = canvas.getContext('2d');

const CONFIG = { 
    BASE_SIZE: 50, 
    PADDING: 30, 
    LINE_HEIGHT: 14, 
    STORAGE_KEY: 'infra_designer_v2' 
};

const iconPaths = {
    pc: 'https://cdn-icons-png.flaticon.com/512/3067/3067260.png',
    monitor: 'https://cdn-icons-png.flaticon.com/512/3474/3474360.png',
    cloud: 'https://cdn-icons-png.flaticon.com/512/414/414927.png',
    database: 'https://cdn-icons-png.flaticon.com/512/2906/2906274.png'
};

let icons = {};
let elements = [];
let dragTarget = null;

// Initialisierung & Icon Loader
function init() {
    let loaded = 0;
    const keys = Object.keys(iconPaths);
    keys.forEach(k => {
        const img = new Image();
        img.src = iconPaths[k];
        img.onload = () => { 
            if(++loaded === keys.length) { 
                load(); 
                draw(); 
            } 
        };
        icons[k] = img;
    });
}

// --- DATA HANDLING ---

function load() {
    const stored = localStorage.getItem(CONFIG.STORAGE_KEY);
    if(stored) {
        elements = JSON.parse(stored);
        sanitizeElements(elements); 
    }
    updateParentList();
}

function save() { 
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(elements)); 
}

/**
 * Stellt sicher, dass alle Elemente Koordinaten haben.
 * Falls nicht (z.B. nach manuellem JSON-Edit), werden Standardwerte gesetzt.
 */
function sanitizeElements(list) {
    list.forEach(el => {
        if (el.isGroup) {
            if (el.x === undefined) el.x = 150;
            if (el.y === undefined) el.y = 150;
            if (el.children) sanitizeElements(el.children);
        } else {
            if (el.x === undefined && el.relX === undefined) {
                el.x = 100; el.y = 100;
                if (el.relX === undefined) { el.relX = 0; el.relY = 0; }
            }
        }
    });
}

// --- RENDERING ---

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    render(elements);
}

function render(list, px=0, py=0) {
    list.forEach(el => {
        const x = el.relX !== undefined ? px + el.relX : el.x;
        const y = el.relY !== undefined ? py + el.relY : el.y;

        if (el.isGroup) {
            const hw = el.width/2, hh = el.height/2;
            ctx.fillStyle = "rgba(0,0,0,0.03)";
            ctx.strokeStyle = "#cbd5e0";
            ctx.lineWidth = 1;
            ctx.strokeRect(x - hw, y - hh, el.width, el.height);
            ctx.fillRect(x - hw, y - hh, el.width, el.height);
            
            ctx.fillStyle = "#64748b";
            ctx.font = "bold 12px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(el.name.toUpperCase(), x, y - hh - 10);
            
            render(el.children, x, y);
        } else {
            drawShape(x, y, el);
        }
    });
}

function drawShape(x, y, obj) {
    const s = CONFIG.BASE_SIZE;
    if (obj.type === "icon" && icons[obj.iconKey]) {
        ctx.drawImage(icons[obj.iconKey], x - s/2, y - s/2, s, s);
    } else {
        ctx.beginPath();
        ctx.arc(x, y, s/2, 0, Math.PI * 2);
        ctx.fillStyle = obj.color || "#4facfe";
        ctx.fill();
        ctx.strokeStyle = "white"; ctx.lineWidth = 2; ctx.stroke();
    }
    
    ctx.fillStyle = "#1e293b";
    ctx.font = "11px sans-serif";
    ctx.textAlign = "center";
    
    // Zeilenumbruch bei Leerzeichen
    const lines = obj.label.split(' ');
    lines.forEach((line, i) => {
        ctx.fillText(line, x, y + s/2 + 15 + (i * CONFIG.LINE_HEIGHT));
    });
}

// --- AUTO LAYOUT ---

function layoutGroup(g) {
    if(!g.children || g.children.length === 0) return;
    const spacingX = CONFIG.BASE_SIZE + CONFIG.PADDING;
    const spacingY = CONFIG.BASE_SIZE + CONFIG.PADDING + 15;
    const cols = Math.max(1, Math.floor((g.width - 40) / spacingX));
    
    const rows = Math.ceil(g.children.length / cols);
    const reqH = (rows * spacingY) + 40;
    
    // Gruppe wächst automatisch mit
    if(g.height < reqH) g.height = reqH;

    g.children.forEach((c, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        c.relX = Math.round(-(g.width/2) + 40 + (col * spacingX));
        c.relY = Math.round(-(g.height/2) + 40 + (row * spacingY));
    });
}

function autoLayoutAll() {
    const process = (list) => list.forEach(el => {
        if(el.isGroup) { 
            process(el.children); 
            layoutGroup(el); 
        }
    });
    process(elements);
    save(); 
    draw();
}

// --- UI ACTIONS ---

function toggleGroupFields() {
    const type = document.getElementById('creationType').value;
    const groupFields = document.getElementById('groupFields');
    groupFields.style.display = (type === 'group') ? 'flex' : 'none';
}

function addNewElement() {
    const id = document.getElementById('objId').value;
    const label = document.getElementById('objLabel').value;
    const type = document.getElementById('creationType').value;
    const pId = document.getElementById('objParent').value;
    
    if(!id || !label) return alert("ID und Label benötigt!");

    let newEl;
    if(type === 'group') {
        newEl = { 
            id, isGroup: true, name: label, 
            width: parseInt(document.getElementById('groupW').value) || 300, 
            height: parseInt(document.getElementById('groupH').value) || 200, 
            children: [] 
        };
    } else {
        newEl = { id, label, isGroup: false, type, iconKey: document.getElementById('objIcon').value, color: '#4facfe' };
    }

    if(pId === 'root') {
        newEl.x = 150; newEl.y = 150; elements.push(newEl);
    } else {
        const p = findById(elements, pId);
        if(p) { 
            p.children.push(newEl); 
            layoutGroup(p); 
        }
    }
    updateParentList(); save(); draw();
}

function findById(list, id) {
    for(let el of list) {
        if(el.id === id) return el;
        if(el.children) { const f = findById(el.children, id); if(f) return f; }
    }
    return null;
}

function updateParentList() {
    const sel = document.getElementById('objParent');
    sel.innerHTML = '<option value="root">Hauptebene</option>';
    const add = (list, depth=0) => list.forEach(el => {
        if(el.isGroup) {
            const opt = document.createElement('option');
            opt.value = el.id;
            opt.textContent = "—".repeat(depth) + " " + el.name;
            sel.appendChild(opt);
            add(el.children, depth + 1);
        }
    });
    add(elements);
}

// --- EXPORT / IMPORT ---

function exportData() {
    const blob = new Blob([JSON.stringify(elements, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); 
    a.href = url; 
    a.download = 'infra_config.json'; 
    a.click();
}

function importData(e) {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        try {
            elements = JSON.parse(ev.target.result);
            sanitizeElements(elements);
            autoLayoutAll();
            updateParentList();
            save(); 
            draw();
        } catch(err) {
            alert("Ungültiges JSON Format");
        }
    };
    reader.readAsText(file);
}

function clearData() { 
    if(confirm("Wirklich alles löschen?")) { 
        elements = []; 
        save(); 
        updateParentList(); 
        draw(); 
    } 
}

// --- MOUSE EVENTS ---

canvas.onmousedown = (e) => {
    const rect = canvas.getBoundingClientRect();
    const m = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    
    const hitTest = (list, px=0, py=0) => {
        for(let i = list.length-1; i >= 0; i--) {
            const el = list[i];
            const x = el.relX !== undefined ? px + el.relX : el.x;
            const y = el.relY !== undefined ? py + el.relY : el.y;
            
            if(el.children) { 
                const h = hitTest(el.children, x, y); 
                if(h) return h; 
            }
            
            const isOver = el.isGroup ? 
                (Math.abs(m.x - x) < el.width/2 && Math.abs(m.y - y) < el.height/2) :
                (Math.hypot(m.x - x, m.y - y) < CONFIG.BASE_SIZE/2);
            
            if(isOver) return { 
                obj: el, 
                offset: { x: x - m.x, y: y - m.y }, 
                px: (el.relX!==undefined?px:0), 
                py: (el.relY!==undefined?py:0) 
            };
        }
        return null;
    };
    dragTarget = hitTest(elements);
};

window.onmousemove = (e) => {
    if(!dragTarget) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    
    if(dragTarget.obj.relX !== undefined) {
        dragTarget.obj.relX = Math.round(mx + dragTarget.offset.x - dragTarget.px);
        dragTarget.obj.relY = Math.round(my + dragTarget.offset.y - dragTarget.py);
    } else {
        dragTarget.obj.x = Math.round(mx + dragTarget.offset.x);
        dragTarget.obj.y = Math.round(my + dragTarget.offset.y);
    }
    draw();
};

window.onmouseup = () => { 
    if(dragTarget) save(); 
    dragTarget = null; 
};

// Start
init();