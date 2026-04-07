/***********************************************************************
*! \file:                   javascript.js
*  \projekt:                webserial
*  \created on:             2023 10 15
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
//https://www.dyclassroom.com/c/c-pointers-and-two-dimensional-array
/* Startet ein Intervall, das alle 1 Sekunde ausgeführt wird
let counter = 0;
const intervalId = setInterval(() => {
    counter++;
    console.log(`Zähler: ${counter}`);

    // Bedingung zum Stoppen
    if (counter >= 5) {
        clearInterval(intervalId); // Intervall stoppen
        console.log("Intervall gestoppt.");
    }
}, 1000);*/
/***********************************************************************
* Declarations
***********************************************************************/

/***********************************************************************
* Test Data
***********************************************************************/
var date_for_wifi = [
    {id:1, ssid:"WifiEins", pass:"IstGeheim", comment:"Home", mode:"AP"},
    {id:2, ssid:"WifiDeins", pass:"AuchGeheim", comment:"Garten", mode:"STA"},
];

/***********************************************************************
* Constant
***********************************************************************/


/***********************************************************************
* Global Variable
***********************************************************************
// --- 2. Sidebar Toggle ---
const menuToggle = document.getElementById('menu-toggle');
const sidebar = document.getElementById('sidebar');

// --- 3. Content Umschalten (SPA Logik) ---
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('.content-section');

// --- 4. Untermenü (Akkordeon) ---
const submenuButtons = document.querySelectorAll('.submenu-btn');*/
menuToggle = document.getElementById('menu-toggle');
sidebar = document.getElementById('sidebar');

// --- 3. Content Umschalten (SPA Logik) ---
navLinks = document.querySelectorAll('.nav-link');
sections = document.querySelectorAll('.content-section');

// --- 4. Untermenü (Akkordeon) ---
submenuButtons = document.querySelectorAll('.submenu-btn');

ctx = document.getElementById('id_chart_table');
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


var active_section = "";
var data_table;
var tabellen_daten;

/***********************************************************************
* Constant
***********************************************************************/

/***********************************************************************
* Local Funtions
***********************************************************************/

/***********************************************************************
*! \fn          draw_chart()
*  \brief       build log table
*  \param       none
*  \exception   none
*  \return      none
***********************************************************************/
function draw_chart() {

    //check if canvas in use    
	
	if (typeof dataChart !== 'undefined'){
		dataChart.destroy();
	}
		
	switch (active_section){
		
	    case "example":{
            dataChart = new Chart(ctx, {
			    type: 'bar', // Typ: bar, line, pie, radar, etc.
				data: {
					labels: ['Rot', 'Blau', 'Gelb', 'Grün'],
					datasets: [{
						label: 'Stimmenanzahl',
						data: [12, 19, 3, 5],
						backgroundColor: [
							'rgba(255, 99, 132, 0.2)',
							'rgba(54, 162, 235, 0.2)',
							'rgba(255, 206, 86, 0.2)',
							'rgba(75, 192, 192, 0.2)'
						],
						borderColor: [
							'rgba(255, 99, 132, 1)',
							'rgba(54, 162, 235, 1)',
							'rgba(255, 206, 86, 1)',
							'rgba(75, 192, 192, 1)'
						],
						borderWidth: 1
					}]
				},
				options: {
					scales: {
						y: {
							beginAtZero: true
						}
					}
				}
			});
		    break;
		}
		default:{
		}
	}
		
}

/***********************************************************************
*  \brief       async function fetchSensorData
*  \param       none
*  \exception   none
*  \return      none
***********************************************************************/
// 1. FUNKTION: Daten vom Server ABRUFEN (GET)
async function fetchSensorData() {
    try {
        const response = await fetch('/api/wifidata');
        const data = await response.json();
        console.log("Sensor-Daten erhalten:", data);
        
        // Beispiel: Daten im HTML anzeigen
        // document.getElementById('status').innerText = `Temperatur: ${data.temperatur}°C, Luftfeuchte: ${data.feuchtigkeit}%`;
		data_table.setData(data); // Tabulator mit neuen Daten aktualisieren
		//data_table.redraw(true);
    } catch (error) {
        console.error("Fehler beim Abrufen der Daten:", error);
    }
}

/***********************************************************************
*! \fn          init_data_table()
*  \brief       build log table
*  \param       none
*  \exception   none
*  \return      none
***********************************************************************/
function init_data_table() {
    if (typeof data_table  !== 'undefined') {
		
		switch (active_section){
			
			case "example":{
                // load first table data
				tabellen_daten = [
					{Time:"2026-01-01", message:"Web-App Alpha",  status:"Abgeschlossen"},
				];
				data_table = new Tabulator("#id_data_table", {
					data: tabellen_daten,
					layout: "fitColumns",
					placeholder: "Lade Daten...",
					rowHeader:{formatter:"rownum", headerSort:false, hozAlign:"center", resizable:true, frozen:true},
					columns: [
						{title:"timestamp", field:"Time", widthGrow:2},
						{title:"message", field:"message"},
						{title:"Status", field:"status"},
					],
				});
			    break;
			}
			case "wifi":{
                // load first table data
                //fetchSensorData(); // Beispiel: Daten vom Server abrufen
				data_table = new Tabulator("#id_data_table", {
					data: date_for_wifi,
					history:true,
					layout: "fitColumns",
					placeholder: "Lade Daten...",
					rowHeader:{formatter:"rownum", headerSort:false, hozAlign:"center", resizable:true, frozen:true},
					columns: [
						{title:"SSID Name", field:"ssid", widthGrow:2, editor:"input", editorParams:{type:"password"}},
						{title:"Password", field:"pass", editor:"input"},
						{title:"Modus", field:"mode", editor:"list", editorParams:{values:{"ap":"AP", "sta":"Client"}}},
						{title:"Kommentar", field:"comment", editor:"input"},
					],
				});
				fetchSensorData();
			    break;
			}
			default:{
			}
		}
		
        setTimeout(() => { data_table.redraw(true); }, 50);
    } else {
        // Wenn sie schon existiert, nur neu zeichnen
        setTimeout(() => { data_table.redraw(true); }, 50);
    }
}


/***********************************************************************
*! \fn          get_periodic_data()
*  \brief       collect data from host
*  \param       none
*  \exception   none
*  \return      none
***********************************************************************/
function get_periodic_data() {
	
		switch (active_section){
			
			case "target_id_data_table":{
				//console.log("target_id_data_table");
				// Beispieldaten
				var tabellen_daten = [
					{Time:new Date().toISOString(), message:"Web-App Alpha",  status:"Abgeschlossen"},
				];
				data_table.addRow(tabellen_daten);
			    break;
			}
			default:{
				console.log("nothing to do");
			}
						
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

 /***********************************************************************
*! \fn          function Start(status)
*  \brief       AFTER PAGE LOADS CALL YOUR SCRIPTS HERE
*  \param       status - status from page load dunction
*  \exception   none
*  \return      none
***********************************************************************/   
function Start(status) {

    init_site();

    setInterval(updateClock, 1000);
	
	//setInterval(get_periodic_data, 5000); 
    
}


/***********************************************************************
*! \fn          page load
*  \brief       JAVASCRIPT PAGE LOADER
*  \author      Stokely Web Page loader, 2022
*  \param       none
*  \exception   none
*  \return      status from loaded page
***********************************************************************/ 
if (document.readyState) {

    if (document.readyState === "complete" || document.readyState === "loaded") {

        Start("Browser Loader : Document : readyState : complete");

    } else {
       if (window.addEventListener) {

            // Never try and call 'DOMContentLoaded' unless the web page is still in an early loading state.
            if (document.readyState === 'loading' || document.readyState === 'uninitialized') {
                window.addEventListener('DOMContentLoaded', function () {

                // Most modern browsers will have the DOM ready after this state.
                if (document.readyState === "interactive") {
                    Start("Browser Loader : Document : DOMContentLoaded : interactive");

                    } else if (document.readyState === "complete" || document.readyState === "loaded") {
                        Start("Browser Loader : Document : DOMContentLoaded : complete");
                    } else {
                        Start("Browser Loader : Document : DOMContentLoaded : load");
                    }
                }, false);
            } else {
// FALLBACK LOADER : If the readyState is late or unknown, go ahead and try and wait for a full page load event. Note: This function below was required for Internet Explorer 9-10 to work because of non-support of some readyState values! IE 4-9 only supports a "readyState" of "complete".
                if (document.readyState === 'complete' || document.readyState === "loaded") {
                    Start("Browser Loader : Document : readyState : complete");
                } else {
                    window.addEventListener('load', function () {
                        Start('Browser Loader : Window : Event : load');
                    }, false);
                }
            }
        // If 'addEventListener' is not be supported in the browser, try the 'onreadystate' event. Some browsers like IE have poor support for 'addEventListener'.
        } else {
            // Note: document.onreadystatechange may have limited support in some browsers.
            if (document.onreadystatechange) {
                document.onreadystatechange = function () {
                    if (document.readyState === "complete" || document.readyState === "loaded"){
                        Start("Browser Loader : Document : onreadystatechange : complete");
                    } 
                    // OPTIONAL: Because several versions of Internet Explorer do not support "interactive" or get flagged poorly, avoid this call when possible.
                    //else if (document.readyState === "interactive") {
                    //Start("Browser Loader : Document : onreadystatechange : interactive");
                    //}
                }
            } else {
            // Note: Some browsers like IE 3-8 may need this more traditional version of the loading script if they fail to support "addeventlistener" or "onready             state". "window.load" is a very old and very reliable page loader you should always fall back on.
                window.onload = function() {
                    Start("Browser Loader : Window : window.onload (2)");
                };
            }
        }
    }
} else {
    // LEGACY FALLBACK LOADER. If 'document.readyState' is not supported, use 'window.load'. It has wide support in very old browsers as well as all modern ones.     Browsers Firefox 1-3.5, early Mozilla, Opera < 10.1, old Safari, and some IE browsers do not fully support 'readyState' or its values. "window.load" is a very     old and very reliable page loader you should always fall back on.
    window.onload = function () {
        Start("Browser Loader : Window : window.onload (1)");
    };
}


/***********************************************************************
*! \fn          navLinks.forEach
*  \brief       Tabelle erstellen
*  \param       none
*  \exception   none
*  \return      none
***********************************************************************/
function init_site(){
	
	// --- 2. Sidebar Toggle ---
    menuToggle = document.getElementById('menu-toggle');
	
	/***********************************************************************
	*  \brief       EventListener menuToggle
	***********************************************************************/
	
	menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
	});
    sidebar = document.getElementById('sidebar');

    // --- 3. Content Umschalten (SPA Logik) ---
    navLinks = document.querySelectorAll('.nav-link');
    sections = document.querySelectorAll('.content-section');

    // --- 4. Untermenü (Akkordeon) ---
    submenuButtons = document.querySelectorAll('.submenu-btn');

    // --- undo button ---
	document.getElementById("history-undo").addEventListener("click", function(){
        data_table.undo();
    });
	
	//tabellen_daten
	
	data_table = new Tabulator("#id_data_table", {
    data: tableData,
        layout: "fitColumns",
        placeholder: "Lade Daten...",
        columns: [/*
            {title:"Projektname", field:"name", widthGrow:2},
            {title:"Fortschritt", field:"progress", formatter:"progress", sorter:"number"},
            {title:"Status", field:"status", hozAlign:"center"},
						*/
						{title:"SSID Name", field:"ssid", widthGrow:2},
						{title:"Password", field:"pass"},
						{title:"Kommentar", field:"comment"},
					
        ],
	});
	/*
	data_table = new Tabulator("#id_data_table", {
		data: tableData,
        layout: "fitColumns",
        placeholder: "Lade Daten...",
        columns: [
            {title:"Projektname", field:"name", widthGrow:2},
            {title:"Fortschritt", field:"progress", formatter:"progress", sorter:"number"},
            {title:"Status", field:"status", hozAlign:"center"},
        ],
	});*/
	
	
	ctx = document.getElementById('id_chart_table').getContext('2d');


	/***********************************************************************
	*  \brief       EventListener submenu
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
	*  \brief       navLinks menuToggle
	***********************************************************************/
	navLinks.forEach(link => {
		link.addEventListener('click', (e) => {
			e.preventDefault(); // Verhindert das Springen der Seite
        
			const targetId = link.getAttribute('data-target');
			//console.log(link.getAttribute('data-target'));
			//console.log(link.getAttribute('data-content'));
			active_section = link.getAttribute('data-content');

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
			if(targetId === "target_id_data_table") {
				
				init_data_table();
				
			}
			if(targetId === "target_id_chart") {
				
			    draw_chart();
								
			}

		});
	});
	
}

/*****************************************************************************************/

