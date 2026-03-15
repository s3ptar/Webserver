/***********************************************************************
*! \file:                   javascript
*  \projekt:                Basic Webiseite
*  \created on:             2026 03 15
*  \author:                 R. Gräber
*  \version:                0
*  \history:                -
*  \brief                   Basis CSS
***********************************************************************/

/***********************************************************************
* Includes
***********************************************************************/

/***********************************************************************
* Informations
***********************************************************************/

/***********************************************************************
* Declarations
***********************************************************************/

/***********************************************************************
* Constant
***********************************************************************/

/***********************************************************************
* Global Variable
***********************************************************************/

/***********************************************************************
* local Variable
***********************************************************************/
// Beispieldaten
var tableData = [
    {id:1, name:"Web-App Alpha", progress:100, status:"Abgeschlossen", date:"01.01.2024"},
    {id:2, name:"E-Commerce Shop", progress:45, status:"In Arbeit", date:"15.02.2024"},
    {id:3, name:"Portfolio Design", progress:15, status:"Geplant", date:"20.03.2024"},
    {id:4, name:"Datenbank Migration", progress:80, status:"Testphase", date:"05.01.2024"},
];
/***********************************************************************
* Constant
***********************************************************************/
// --- 2. Sidebar Toggle ---
const menuToggle = document.getElementById('menu-toggle');
const sidebar = document.getElementById('sidebar');

// --- 3. Content Umschalten (SPA Logik) ---
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('.content-section');

// --- 4. Untermenü (Akkordeon) ---
const submenuButtons = document.querySelectorAll('.submenu-btn');

/***********************************************************************
*! \fn          initTable()
*  \brief       only init
*  \param       none
*  \exception   none
*  \return      none
***********************************************************************/
function initTable() {
    // Nur initialisieren, wenn noch nicht geschehen
    if (!table) {
        table = new Tabulator("#example-table", {
            data: tableData,
            layout: "fitColumns",
            placeholder: "Lade Daten...",
            columns: [
                {title:"Projektname", field:"name", widthGrow:2},
                {title:"Fortschritt", field:"progress", formatter:"progress", sorter:"number"},
                {title:"Status", field:"status", hozAlign:"center"},
            ],
        });
    } else {
        // Wenn sie schon existiert, nur neu zeichnen
        setTimeout(() => { table.redraw(true); }, 50);
    }
}

/***********************************************************************
*! \fn          function updateClock()
*  \brief       Uhrzeit & Datum
*  \param       none
*  \exception   none
*  \return      none
***********************************************************************/
function updateClock() {
    const now = new Date();
    const options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    document.getElementById('datetime').textContent = now.toLocaleString('de-DE', options);
}
setInterval(updateClock, 1000);
updateClock();

/***********************************************************************
*! \fn          addEventListener
*  \brief       Sidebar Toggle
*  \param       none
*  \exception   none
*  \return      none
***********************************************************************/
menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('active');
});

/***********************************************************************
*! \fn          navLinks.forEach
*  \brief       Content Umschalten (SPA Logik)
*  \param       none
*  \exception   none
*  \return      none
***********************************************************************/
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault(); // Verhindert das Springen der Seite
        
        const targetId = link.getAttribute('data-target');

        // --- HIGHLIGHT LOGIK ---
        // 1. Entferne die aktive Klasse von allen Links
        navLinks.forEach(l => l.classList.remove('active-link'));
        // 2. Füge sie dem aktuell geklickten Link hinzu
        link.classList.add('active-link');

        // 1. Alle Sektionen verstecken
        sections.forEach(sec => sec.classList.remove('active'));

        // 2. Ziel-Sektion anzeigen
        document.getElementById(targetId).classList.add('active')

        // 3. Auf Mobile: Sidebar nach Klick schließen
        if (window.innerWidth <= 500) {
            sidebar.classList.remove('active');
        }

         // KRITISCH: Wenn die Tabelle sichtbar wird, muss Tabulator das Layout neu berechnen
        if(targetId === "Example1") {
			table.redraw(true);
            console.log("draw");
        }
    });
});


/***********************************************************************
*! \fn          navLinks.forEach
*  \brief       CUntermenü (Akkordeon)
*  \param       none
*  \exception   none
*  \return      none
***********************************************************************/
submenuButtons.forEach(button => {
    button.addEventListener('click', () => {
        const parent = button.parentElement;
        document.querySelectorAll('.has-submenu').forEach(item => {
            if (item !== parent) item.classList.remove('open');
        });
        parent.classList.toggle('open');
    });
});


/***********************************************************************
*! \fn          navLinks.forEach
*  \brief       Tabelle erstellen
*  \param       none
*  \exception   none
*  \return      none
***********************************************************************/
var table = new Tabulator("#example-table", {
    height:"311px",
    columns:[
    {title:"Name", field:"name"},
    {title:"Progress", field:"progress", sorter:"number"},
    {title:"Gender", field:"gender"},
    {title:"Rating", field:"rating"},
    {title:"Favourite Color", field:"col"},
    {title:"Date Of Birth", field:"dob", hozAlign:"center"},
    ],
});

