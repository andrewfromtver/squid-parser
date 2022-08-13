// users tab
const showUsers = (jsonData) => {
    let tableRows = ''
    tableRows = `
        <table class="fl-table" id="users-table">
            <thead>
                <th>#</th>
                <th>Client Identity</th>
            </thead>
            <tbody class="table-data">
    `
    let count = 1
    jsonData.forEach(e => {
        tableRows += `
                <tr class="active-row" 
                    onclick="showUserReport('${e}')"
                >
                    <td>${count}</td>
                    <td>${e}</td>
                </tr>
        `
        count ++
    })
    tableRows += `
            </tbody>
        </table>
        <div class="table-placeholder"></div>
    `
    document.querySelector('.table-wrapper').innerHTML = tableRows
    scrollToElement(document.querySelector('#users-table'), 'start')
}
const getUniqueUsers = (jsonData) => {
    let usersArray = []
    jsonData.forEach(e => {
        if (!usersArray.includes(e.client_identity) && e.client_identity) {
            usersArray.push(e.client_identity)
        }
    })
    let usersEventsQty = []
    usersArray.forEach(user => {
        let qty = 0
        jsonData.forEach(e => {
            if (e.client_identity === user) qty ++
        })
        usersEventsQty.push({
            username: user,
            userEventsQty: qty
        })
    })
    let result = []

    usersEventsQty.sort((a,b) => b.userEventsQty - a.userEventsQty).forEach(e => {
        result.push(e.username)
    })
    return result
}
const countEachUserEvents = (usersArray, jsonData) => {
    let result = []
    usersArray.forEach(user => {
        let eventsQty = 0
        let passedEvents = 0

        jsonData.forEach(e => {
            if (e.client_identity === user) {
                eventsQty ++
                if (e.result_and_status && e.result_and_status.includes('200')) {
                    passedEvents ++
                }
            }
        })
        result.push({
            username: user, 
            totalQty: eventsQty, 
            passedQty: passedEvents,
            blockedQty: eventsQty - passedEvents
        })
    })
    return result
}
const renderUsersEventsReport = (type, length = reportLenth) => {
    document.querySelector('.chart-button-bar')
        .onclick = () => {renderUsersEventsReport('bar')}
    document.querySelector('.chart-button-line')
        .onclick = () => {renderUsersEventsReport('line')}
    document.querySelector('.chart-button-radar').
        onclick = () => {renderUsersEventsReport('radar')}
    document.querySelector('.chart-button-table')
        .onclick = () => {renderUsersEventsReport('table')}
    if (type === 'bar' || type === 'line' || type === 'radar') {
        if (!document.querySelector('#users-table')) {
            document.querySelector('.table-wrapper').innerHTML = ''
            document.querySelector('#table').style = ''
        }
        document.querySelectorAll('button').forEach(button => {
            if (button.id !== 'table') button.style = ''
        })
        document.querySelector('#' + type)
            .style = 'background-color: #324960; box-shadow: 0 0 4px #324960;'
        document.querySelector('.chart').innerHTML = `
            <h2>Top ${length} most active users</h2>
            <canvas id="chartCanvas"></canvas>
        `
        let total = []
        let passed = []
        let blocked = []
        countEachUserEvents(getUniqueUsers(squidLog).slice(0, length), squidLog)
            .forEach(user => {
                total.push(user.totalQty)
                passed.push(user.passedQty)
                blocked.push(user.blockedQty)
            })
        const chartData = {
            labels: getUniqueUsers(squidLog).slice(0, length),
            datasets: [
                {
                    label: 'Total',
                    data: total,
                    backgroundColor: '#324960'
                },
                {
                    label: 'Passed',
                    data: passed,
                    backgroundColor: '#4FC3A1'
                },
                {
                    label: 'Blocked',
                    data: blocked,
                    backgroundColor: '#ccc'
                }
            ]
        }
        const config = {
            type: type,
            data: chartData,
            options: {
                scales: {
                    y: {
                    beginAtZero: true,
                    ticks: {
                        display: false
                    }
                    },
                    x: {
                        ticks: {
                            display: false
                        }
                    }
                }
            }
        }
        const myChart = new Chart(
            document.getElementById('chartCanvas'),
            config
        )
    }
    if (type === 'table') {
        if (document.querySelector('#users-table')) {
            document.querySelector('.table-wrapper').innerHTML = ''
            document.querySelector('#table').style = ''
        }
        else {
            document.querySelector('#table')
                .style = 'background-color: #324960; box-shadow: 0 0 4px #324960;'
            showUsers(getUniqueUsers(squidLog).slice(0, length))
        }
    }
}
const showUserReport = (user) => {
    let userData = squidLog.filter(e => e.client_identity === user)
    document.querySelector('.table-placeholder').innerHTML = `
        <form class="settings-popup">
            <label>SQUID access.log parser [user = ${user}]</label>
            <br>
            <div class="filters-bar">
                <input 
                    id="timestamp-from" 
                    type="datetime-local" 
                    oninput="filterUserData('${user}')"
                >
                <input 
                    id="timestamp-to" 
                    type="datetime-local" 
                    oninput="filterUserData('${user}')"
                >
                <input 
                    id="url-pattern" 
                    type="text" 
                    oninput="filterUserData('${user}')"
                    placeholder="URI filter"
                >
            </div>
            <br>
            <div>
                <table class="popup-table">
                    <thead>
                        <th>Timestamp</th>
                        <th>Ping</th>
                        <th>Client IP</th>
                        <th>Size</th>
                        <th>Result & status</th>
                        <th>URI</th>
                    </thead>
                    <tbody class="parsed-data"></tbody>
                </table>
            </div>
            <label id="events-counter">Total events - ${userData.length}</label>
            <button>Close</button>
        </form>
    `
    let tableRows = ''
    userData.reverse().forEach(e => {
        if (e.request_method !== 'NONE') {
            tableRows += `
            <tr>
                <td>${convertTime(e.timestamp.replace('.', ''))}</td>
                <td>${e.response_time}</td>
                <td>${e.client_address}</td>
                <td>${e.transfer_size}</td>
                <td>${e.result_and_status}</td>
                <td>${e.URI}</td>
            </tr>
            `
        }
    })
    document.querySelector('.parsed-data').innerHTML = tableRows
    scrollToElement(document.querySelector('.filters-bar'))
}
const filterUserData = (user) => {
    let from = +new Date(document.querySelector('#timestamp-from')
        .value) || 0
    let to = +new Date(document.querySelector('#timestamp-to')
        .value) || Infinity
    let pattern = document.querySelector('#url-pattern')
        .value || ''

    console.log(from, to, pattern)
    
    let userData = squidLog.filter(e => e.client_identity === user)
        .filter(e => Number(e.timestamp.replace('.', '')) > from && Number(e.timestamp.replace('.', '')) < to)

    if (pattern) userData = userData.filter(e => e.URI.toLowerCase().includes(pattern.toLowerCase()))
    let tableRows = ''
    if (userData.length > 0) {
        userData.reverse().forEach(e => {
            if (e.request_method !== 'NONE') {
                tableRows += `
                <tr>
                    <td>${convertTime(e.timestamp.replace('.', ''))}</td>
                    <td>${e.response_time}</td>
                    <td>${e.client_address}</td>
                    <td>${e.transfer_size}</td>
                    <td>${e.result_and_status}</td>
                    <td>${e.URI}</td>
                </tr>
                `
            }
        })
    }
    else {
        tableRows += `
        <tr>
            <td colspan="6" style="text-align: center;"> ¯\\_(ツ)_/¯ </td>
        </tr>
        `
    }
    document.querySelector('.parsed-data').innerHTML = tableRows
    document.querySelector('#events-counter').innerText = `Total events - ${userData.length}`
}
