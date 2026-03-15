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

        // 1. Alle Sektionen verstecken
        sections.forEach(sec => sec.classList.remove('active'));

        // 2. Ziel-Sektion anzeigen
        document.getElementById(targetId).classList.add('active');

        // 3. Auf Mobile: Sidebar nach Klick schließen
        if (window.innerWidth <= 500) {
            sidebar.classList.remove('active');
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
