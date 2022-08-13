// global vars
let reportLenth = 5
let dataSourse = `http://${window.location.hostname}/squid-agent/squid.json`
let version = '0.0.1'
let squidLog = []

// service functions
const showPopupSettings = () => {
	event.preventDefault()
	if (!document.querySelector('.esc-closable')) {
		document.querySelector('.ui-components').innerHTML += `
			<div class="popup-placeholder esc-closable">
				<form class="settings-popup">
					<label>Squid agent protocol</label>
					<select id="protocol">
						<option value="http">HTTP</option>
						<option value="https">HTTPS</option>
					</select>
					<label>Squid agent json destination</label>
					<input id="host" type="text" placeholder="[HOST]:[PORT]/[PATH]/squid.json">
					<label>Report length</label>
					<input id="report-length" type="number" placeholder="from 3 to 30 rows">
					<button>Ok</button>
				</form>
			</div>
		`
		document.querySelector('#protocol').value = dataSourse.split('://')[0]
		document.querySelector('#host').value = dataSourse.split('://')[1]
		document.querySelector('#report-length').value = reportLenth
		document.querySelector('#report-length').oninput = () => {
			let length = document.querySelector('#report-length').value
			if (length > 2 && length < 31) {
				document.querySelector('#report-length').style = ''
				reportLenth = length
				localStorage.setItem('reportLength', length)
			}
			else {
				document.querySelector('#report-length')
					.style = 'background-color: #FF9494;'
				}
		}
		document.querySelector('#host').oninput = () => {
			let host = document.querySelector('#host').value
			let protocol = document.querySelector('#protocol').value
			if (host) {
				document.querySelector('#host').style = ''
				dataSourse = protocol + '://' + host
				localStorage.setItem('dataSourse', dataSourse)
			}
			else {
				document.querySelector('#host')
					.style = 'background-color: #FF9494;'
			}
		}
		document.querySelector('#protocol').onchange = () => {
			let host = document.querySelector('#host').value
			let protocol = document.querySelector('#protocol').value
			if (host) {
				document.querySelector('#host').style = ''
				dataSourse = protocol + '://' + host
				localStorage.setItem('dataSourse', dataSourse)
			}
		}
	}
}
const getStatus = (type) => {
    let inner1 = `
        SQUID log parser v-${version}, 
        Report length: ${reportLenth} rows,
        Data source: ${dataSourse}
    `
    let inner2 = `
        SQUID log parser v-${version} 
    `
    type === 'long' 
		? document.querySelector('#statusbar').innerHTML = inner1 
		: document.querySelector('#statusbar').innerHTML = inner2
}
const initApp = () => {
	document.querySelector('#app').innerHTML = `
		<header>
			<div>
				<img onclick="renderUsersEventsReport('bar')" src="./assets/users.svg" alt="users_stat">
				<p>Top users</p>
			</div>
			<div>
				<img onclick="renderUrlsReport('bar')" src="./assets/uri.svg" alt="uri_stat">
				<p>Top urls</p>
			</div>
			<div>
				<img onclick="renderTransfersReport('bar')" src="./assets/files.svg" alt="transfers_stat">
				<p>Top transfers</p>
			</div>
			<div>
				<img onclick="showPopupSettings()" src="./assets/settings.svg" alt="settings">
				<p>Settings</p>
			</div>
		</header>
		<div id="chartArea"></div>
		<footer>
			<p id="statusbar"></p>
		</footer>
	`
	document.documentElement.clientWidth > 840 
		? getStatus('long') 
		: getStatus('short')
	window.addEventListener("resize", () => {
		document.documentElement.clientWidth > 840 
			? getStatus('long') 
			: getStatus('short')
	})
	let chart = `
		<div class="chart">
			<canvas id="chartCanvas"></canvas>
		</div>
	`
	let controllButtons = `
		<div class="chart__buttons">
				<button class="chart-button-bar" id="bar">Bar chart</button>
				<button class="chart-button-line" id="line">Line chart</button>
				<button class="chart-button-radar" id="radar">Radar chart</button>
				<button class="chart-button-table" id="table">Table data</button>
		</div>
	`
	let dataTable = `
		<div class="table-wrapper"></div>
	`
	document.querySelector('#chartArea').innerHTML = controllButtons
	document.querySelector('#chartArea').innerHTML += chart
	document.querySelector('#app').innerHTML += dataTable
	renderUsersEventsReport('bar')
}
const listeningMode = () => {
	document.querySelector('#app').innerHTML = `
		<div class="popup-placeholder">
			<form class="settings-popup">
				<h2>SQUID parser can't generate reports now</h2>
				<p style="color: #FF9494;" class="error-msg">
					Please wait until your proxy server collects enough logs
				</p>
				<button>Reload</button>
			</form>
		</div>
	`
}
const convertTime = (unixTime) => {
    let dateObject = new Date(Number(unixTime))
    return dateObject.toUTCString()
}
const scrollToElement = (element, position = 'center') => {
    element.scrollIntoView({block: position, behavior: "smooth"})
}

// init app
window.onload = () => {
	if (localStorage.getItem('reportLength')) {
		reportLenth = localStorage.getItem('reportLength')
	}
	if (localStorage.getItem('dataSourse')) {
		dataSourse = localStorage.getItem('dataSourse')
	}	
	document.addEventListener('keydown', function(event){
		if(event.key === "Escape"){
			if (document.querySelector('.esc-closable')) {
				document.querySelector('.esc-closable').remove()
			}
		}
	})

	fetch(dataSourse)
		.then(e => e.json())
		.then(e => {
			setTimeout(() => {
				squidLog = e
				squidLog.length > 2 ? initApp() : listeningMode()
			}, 1500)
		})
		.catch(e => {
			document.querySelector('#app').innerHTML = `
				<div class="popup-placeholder">
					<form class="settings-popup">
						<h2>SQUID parser can't access to you proxy logs</h2>
						<p style="color: #FF9494;" class="error-msg">
							${String(e).replace(/>/g, '&gt;').replace(/</g, '&lt;')} please check settings in parser config
						</p>
						<button onclick="showPopupSettings()">Settings</button>
					</form>
				</div>
			`
		})
}
