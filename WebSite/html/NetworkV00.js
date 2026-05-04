const canvas = document.getElementById('graphCanvas');
const ctx = canvas.getContext('2d');

const CONFIG = { 
    BASE_SIZE: 50, 
    PADDING: 30, 
    LINE_HEIGHT: 14, 
    STORAGE_KEY: 'infra_designer_v2' 
};


// 1. Datenstruktur mit verschachtelter Gruppe
let elements = [
    { 
        id: "G1", isGroup: true, name: "Haupt-Rechenzentrum", 
        x: 300, y: 250, width: 450, height: 350, 
        children: [
            { id: "S1", type: "circle", relX: -150, relY: -100, radius: 25, color: '#4facfe', label: "Main Server" },
            // UNTERGRUPPE INNERHALB VON G1
            { 
                id: "G2", isGroup: true, name: "Sub-Netz (G2)", 
                relX: 80, relY: 40, width: 220, height: 150, 
                children: [
                    { id: "DB1", type: "circle", relX: -50, relY: 0, radius: 20, color: '#f093fb', label: "Database für einen blabla blab" },
                    { id: "FW1", type: "rect", relX: 50, relY: 0, w: 60, h: 40, color: '#f6ad55', label: "Firewall" }
                ]
            },
			{ 
                id: "G3", isGroup: true, name: "Sub-Netz (G3)", 
                relX: 80, relY: 40, width: 220, height: 150, 
                children: [
                    { id: "DB3", type: "circle", relX: -50, relY: 0, radius: 20, color: '#f093fb', label: "Database für einen blabla blab" },
                    { id: "FW3", type: "rect", relX: 50, relY: 0, w: 60, h: 40, color: '#f6ad55', label: "Firewall" }
                ]
            }
        ]
    },
    { 
        id: "C1", isGroup: false, type: "circle", x: 700, y: 250, radius: 30, color: '#00f2fe', label: "Cloud" 
    },
    { 
        id: "EXT1", isGroup: false, type: "rect", x: 100, y: 450, w: 100, h: 40, color: '#68d391', label: "External App" 
    }
];

const connections = [
    { from: "S1", to: "DB1", label: "Query", color: "#4facfe" },
    { from: "FW1", to: "C1", label: "External;Sync", color: "#f6ad55" }
];

let dragTarget = null;


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

// --- HILFSFUNKTIONEN ---

// Findet Element und berechnet absolute Position rekursiv
function getAbsPos(id, list = elements, parentX = 0, parentY = 0) {
    for (let el of list) {
        const curX = (el.relX !== undefined) ? parentX + el.relX : el.x;
        const curY = (el.relY !== undefined) ? parentY + el.relY : el.y;

        if (el.id === id) return { x: curX, y: curY, obj: el };

        if (el.children) {
            const found = getAbsPos(id, el.children, curX, curY);
            if (found) return found;
        }
    }
    return null;
}

// Prüft Kollision (Hit-Detection) für Kreise und Rechtecke
function isHit(mouse, obj, x, y) {
    if (obj.type === "rect" || obj.isGroup) {
        const w = obj.isGroup ? obj.width : obj.w;
        const h = obj.isGroup ? obj.height : obj.h;
        return mouse.x > x - w/2 && mouse.x < x + w/2 &&
               mouse.y > y - h/2 && mouse.y < y + h/2;
    } else {
        //const r = obj.radius || 25;
        //return Math.hypot(mouse.x - x, mouse.y - y) < r;
		const half = CONFIG.BASE_SIZE / 2;
		return mouse.x > x - half && mouse.x < x + half &&
           mouse.y > y - half && mouse.y < y + half;
    }
}

function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

// --- EVENT HANDLING ---

canvas.addEventListener('mousedown', (e) => {
	
    const pos = getMousePos(e);
    dragTarget = null;
	// V01
	function findHandle(list, px=0, py=0) {
        for (let el of list) {
            const x = el.relX !== undefined ? px + el.relX : el.x;
            const y = el.relY !== undefined ? py + el.relY : el.y;
            
            if (el.isGroup) {
                // Check auf das 10x10 Pixel Quadrat unten rechts
                if (pos.x > x + el.width/2 - 10 && pos.x < x + el.width/2 &&
                    pos.y > y + el.height/2 - 10 && pos.y < y + el.height/2) {
                    return { type: 'resize', obj: el, startX: pos.x, startW: el.width, startY: pos.y, startH: el.height };
                }
                const hit = findHandle(el.children, x, y);
                if (hit) return hit;
            }
        }
        return null;
    }

    const handle = findHandle(elements);
    if (handle) {
        dragTarget = handle;
        return;
    }

    // Tiefensuche nach dem am weitesten vorne liegenden Element (Rekursiv)
    function findDragTarget(list, parentX = 0, parentY = 0) {
        for (let i = list.length - 1; i >= 0; i--) {
            const el = list[i];
            const x = (el.relX !== undefined) ? parentX + el.relX : el.x;
            const y = (el.relY !== undefined) ? parentY + el.relY : el.y;

            // Zuerst Kinder prüfen (tiefere Ebene = höhere Priorität)
            if (el.children) {
                const childHit = findDragTarget(el.children, x, y);
                if (childHit) return childHit;
            }

            // Dann das Element selbst prüfen
            if (isHit(pos, el, x, y)) {
                return { obj: el, parent: (el.relX !== undefined ? {x: parentX, y: parentY, w: 0, h: 0, obj: list} : null), px: parentX, py: parentY };
            }
        }
        return null;
    }

    const hit = findDragTarget(elements);
    if (hit) {
        // Spezialfall: Wenn wir ein Kind greifen, brauchen wir das tatsächliche Parent-Objekt für die Grenzen
        let parentObj = null;
        function findParent(list) {
            for (let el of list) {
                if (el.children && el.children.includes(hit.obj)) { parentObj = el; return; }
                if (el.children) findParent(el.children);
            }
        }
        if (hit.parent) findParent(elements);
        dragTarget = { ...hit, actualParent: parentObj };
    }
});

/*#########################V00#############################
window.addEventListener('mousemove', (e) => {
    if (!dragTarget) return;
    const pos = getMousePos(e);
    const el = dragTarget.obj;

    if (!dragTarget.parent) {
        // Root-Elemente bewegen
        el.x = pos.x;
        el.y = pos.y;
    } else {
        // Kind-Elemente bewegen (relativ zum Parent mit Clamping)
        let newRelX = pos.x - dragTarget.px;
        let newRelY = pos.y - dragTarget.py;

        const p = dragTarget.actualParent;
        const halfW = el.isGroup ? el.width/2 : (el.type === "rect" ? el.w/2 : el.radius);
        const halfH = el.isGroup ? el.height/2 : (el.type === "rect" ? el.h/2 : el.radius);

        const limX = p.width / 2 - halfW;
        const limY = p.height / 2 - halfH;

        el.relX = Math.max(-limX, Math.min(limX, newRelX));
        el.relY = Math.max(-limY, Math.min(limY, newRelY));
    }
    draw();
});*/

window.addEventListener('mousemove', (e) => {
    if (!dragTarget) return;
    const pos = getMousePos(e);
    const el = dragTarget.obj;
	const half = CONFIG.BASE_SIZE / 2;
	

    if (dragTarget.type === 'resize') {
        const el = dragTarget.obj;
        // Differenz zwischen Start-Mausklick und aktueller Position berechnen
        const diffX = (pos.x - dragTarget.startX) * 2; // *2, da von Mitte aus skaliert wird
        const diffY = (pos.y - dragTarget.startY) * 2;

        //el.width = Math.max(50, dragTarget.startW + diffX);
        //el.height = Math.max(50, dragTarget.startH + diffY);
		dragTarget.obj.width = Math.max(50, dragTarget.startW + diffX);
        dragTarget.obj.height = Math.max(50, dragTarget.startH + diffY);
    } else {


        if (!dragTarget.actualParent) {
            // Root-Elemente: x und y sind absolute Canvas-Koordinaten
            dragTarget.obj.x = Math.round(pos.x);
            dragTarget.obj.y = Math.round(pos.y);
        } else {
            // Kind-Elemente: relX und relY sind relativ zur Mitte des Parents
            const p = dragTarget.actualParent;
			//const limX = p.width / 2 - half;
			//const limY = p.height / 2 - half;
            //let newRelX = pos.x - dragTarget.px;
            //let newRelY = pos.y - dragTarget.py;
    
            // Clamping (Berechnung der Grenzen)
            //let hw, hh;
 
			if (dragTarget.obj.isGroup) { 
			    hw = dragTarget.obj.width / 2; hh = dragTarget.obj.height / 2; 
			}
            //else if (el.type === "icon") { hw = hh = (el.size || 40) / 2; }
            //else { hw = hh = (el.radius || 25); }
			else { hw = hh = half}
    
            const limX = p.width / 2 - hw;
            const limY = p.height / 2 - hh;
    
            // Werte begrenzen und im Objekt speichern
            //el.relX = Math.round(Math.max(-limX, Math.min(limX, newRelX)));
            //el.relY = Math.round(Math.max(-limY, Math.min(limY, newRelY)));
			let min_pos = Math.min(limX, pos.x - dragTarget.px);
			let max_pos = Math.max(-limX, min_pos)
			let newRX = Math.round(max_pos);
			dragTarget.obj.relX = newRX;
			dragTarget.obj.relY = Math.round(Math.max(-limY, Math.min(limY, pos.y - dragTarget.py)));

        }
	}
    
    draw(); // Canvas neu zeichnen
});

// ####################### V00 ###########################
//window.addEventListener('mouseup', () => dragTarget = null);

window.addEventListener('mouseup', () => {
    if (dragTarget) {
		//fehler bei local storage
        //saveToLocalStorage(); // Jetzt erst die gesamte Struktur persistent speichern
		save();
		
        console.log("Struktur aktualisiert:", elements); // Zur Kontrolle in der Konsole
    }
    dragTarget = null;
});



// --- AUTO LAYOUT ---

function layoutGroup(g) {
    if(!g.children || g.children.length === 0) 
		return;
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
		if(c.isGroup){
			//for groups
			c.relX = Math.round(-(g.width/2) + c.width/2 + 75 + (col * (0 + CONFIG.PADDING + 0)));
            c.relY = Math.round(-(g.height/2) + c.height/2 + 40 + (row * (c.height/2 + CONFIG.PADDING + 15)));
		}else{
			//objects
            c.relX = Math.round(-(g.width/2) + 50 + (col * spacingX));
            c.relY = Math.round(-(g.height/2) + 40 + (row * spacingY));
		}
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

// --- ZEICHEN-LOGIK ---

function auto_layout(list, parentX = 0, parentY = 0){
	
	// select each element
	list.forEach(el => {
		
		if (el.isGroup) {
			auto_layout(el.children, x, y);
		}else{
		}
		
	});
	
	
}


function draw() {
	
	
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 1. Verbindungen
    connections.forEach(conn => {
        const i1 = getAbsPos(conn.from);
        const i2 = getAbsPos(conn.to);
        if (i1 && i2) {
            ctx.beginPath();
            ctx.strokeStyle = conn.color || "#cbd5e0";
            ctx.lineWidth = 2;
            ctx.moveTo(i1.x, i1.y);
            ctx.lineTo(i2.x, i2.y);
            ctx.stroke();
            
            ctx.fillStyle = conn.color || "#718096";
            ctx.font = "italic 11px Arial";
            ctx.textAlign = "center";
            //ctx.fillText(conn.label, (i1.x + i2.x)/2, (i1.y + i2.y)/2 - 5);
			//const textStartY = y + half + 15;
			drawMultilineText(ctx, conn.label, (i1.x + i2.x)/2, (i1.y + i2.y)/2 - 5, 10);
        }
    });

    // 2. Elemente rekursiv zeichnen
    drawRecursive(elements);
}

function drawRecursive(list, parentX = 0, parentY = 0) {
    list.forEach(el => {
        const x = (el.relX !== undefined) ? parentX + el.relX : el.x;
        const y = (el.relY !== undefined) ? parentY + el.relY : el.y;

        if (el.isGroup) {
            const rx = x - el.width / 2;
            const ry = y - el.height / 2;
            ctx.fillStyle = "rgba(0, 0, 0, 0.04)";
            ctx.strokeStyle = (dragTarget && dragTarget.obj === el) ? "#4facfe" : "#cbd5e0";
            ctx.lineWidth = 2;
            ctx.fillRect(rx, ry, el.width, el.height);
            ctx.strokeRect(rx, ry, el.width, el.height);
            
            ctx.fillStyle = "#a0aec0";
            ctx.font = "bold 12px Arial";
            ctx.textAlign = "center";
            ctx.fillText(el.name, x, ry - 10);
			
			// Resize-Handle (unten rechts)
            ctx.fillStyle = "#cbd5e0";
            ctx.fillRect(x + el.width/2 - 10, y + el.height/2 - 10, 10, 10);

            drawRecursive(el.children, x, y);
        } else {
            drawShape(x, y, el);
        }
    });
}

function drawShape(x, y, obj) {
    const s = CONFIG.BASE_SIZE;
    const half = s / 2;

    if (obj.type === "icon") {
        const img = icons[obj.iconKey];
        if (img) {
            ctx.drawImage(img, x - half, y - half, s, s);
        }
    } else {
        // Fallback: Kreis (Radius ist die Hälfte der BASE_SIZE)
        ctx.beginPath();
        ctx.arc(x, y, half, 0, Math.PI * 2);
        ctx.fillStyle = obj.color || "#4facfe";
        ctx.fill();
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    // Label unter dem Objekt
    ctx.fillStyle = "#2d3748";
    ctx.font = "bold 12px Arial";
    ctx.textAlign = "center";
    
    const textStartY = y + half + 15;
    drawMultilineText(ctx, obj.label, x, textStartY, CONFIG.LINE_HEIGHT);
}

function drawMultilineText(ctx, text, x, y, lineHeight, maxLength=13) {
    // Teilt den Text bei Leerzeichen auf
     
	lines = [];
	
	if (text.length < maxLength){
		lines = text.split(';');
	}else{
	
	    // ------------------- neuer teil ------------------------------
	    
	    while (text.length > 0) {
            if (text.length <= maxLength) {
                lines.push(text);
                break;
            }
	    	// Finde das letzte Leerzeichen innerhalb der 50-Zeichen-Grenze
            let splitIndex = text.lastIndexOf(' ', maxLength);
	    	// Falls kein Leerzeichen gefunden wurde, erzwinge den Split bei maxLength
            if (splitIndex === -1) {
              splitIndex = maxLength;
            }
	    	lines.push(text.substring(0, splitIndex).trim());
            text = text.substring(splitIndex).trim();
	    }
	}
	
	//--------------------------------------------------------------

    
    lines.forEach((line, index) => {
        // Zeichnet jede Zeile einzeln, jeweils um 'lineHeight' nach unten versetzt
        ctx.fillText(line, x, y + (index * lineHeight));
    });
}
autoLayoutAll();
draw();