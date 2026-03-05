/***********************************************************************
*! \file:                   main.cpp
*  \projekt:                USB_HID
*  \created on:             2023 09 01
*  \author:                 R. Gräber
*  \version:                0
*  \history:                -
*  \brief
***********************************************************************/

/***********************************************************************
* Includes
***********************************************************************/

/***********************************************************************
* Informations
***********************************************************************/
////https://www.w3schools.com/tags/tryit.asp?filename=tryhtml5_summary
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

/***********************************************************************
* Local Funtions
***********************************************************************/

// --- 1. Echtzeit-Uhr und Datum ---
function updateClock() {
    const now = new Date();
    
    // Optionen für die Formatierung
    const options = { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
    };
    
    // In das span-Element schreiben
    const timeString = now.toLocaleString('de-DE', options);
    document.getElementById('datetime').textContent = timeString;
}

// Jede Sekunde aktualisieren
setInterval(updateClock, 1000);
updateClock(); // Erstaufruf beim Laden


// --- 2. Sidebar Toggle (Mobile) ---
const menuToggle = document.getElementById('menu-toggle');
const sidebar = document.getElementById('sidebar');

menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('active');
});


// --- 3. Untermenü (Akkordeon) Logik ---
const submenuButtons = document.querySelectorAll('.submenu-btn');

submenuButtons.forEach(button => {
    button.addEventListener('click', () => {
        const parent = button.parentElement;

        // Alle anderen Menüs schließen
        document.querySelectorAll('.has-submenu').forEach(item => {
            if (item !== parent) {
                item.classList.remove('open');
            }
        });

        // Das aktuelle Menü umschalten
        parent.classList.toggle('open');
    });
});