// urls tab
const showUrls = (jsonData) => {
    let tableRows = ''
    tableRows = `
        <table class="fl-table" id="urls-table">
            <thead>
                <th>#</th>
                <th>URI</th>
            </thead>
            <tbody class="table-data">
    `
    let count = 1
    jsonData.forEach(e => {
        tableRows += `
                <tr>
                    <td>${count}</td>
                    <td>${e}</td>
                </tr>
        `
        count ++
    })
    tableRows += `
            </tbody>
        </table>
    `
    document.querySelector('.table-wrapper').innerHTML = tableRows
    scrollToElement(document.querySelector('#urls-table'), 'start')
}
const getUniqueUrls = (jsonData) => {
    let urisArray = []
    jsonData.forEach(e => {
        if (!urisArray.includes(e.URI) && e.URI) {
            urisArray.push(e.URI)
        }
    })
    let urisEventsQty = []
    urisArray.forEach(uri => {
        let qty = 0
        jsonData.forEach(e => {
            if (e.URI === uri) qty ++
        })
        urisEventsQty.push({
            uri: uri,
            uriEventsQty: qty
        })
    })
    let result = []
    urisEventsQty.sort((a,b) => b.uriEventsQty - a.uriEventsQty).forEach(e => {
        if (!e.uri.includes('error')) result.push(e.uri)
    })
    return result
}
const countEachUrlEvents = (uriArray, jsonData) => {
    let result = []
    uriArray.forEach(uri => {
        let eventsQty = 0
        let passedEvents = 0
        jsonData.forEach(e => {
            if (e.URI === uri) {
                eventsQty ++
                if (e.result_and_status && e.result_and_status.includes('200')) {
                    passedEvents ++
                }
            }
        })
        result.push({
            uri: uri, 
            totalQty: eventsQty, 
            passedQty: passedEvents,
            blockedQty: eventsQty - passedEvents
        })
    })
    return result
}
const renderUrlsReport = (type, length = reportLenth) => {
    document.querySelector('.chart-button-bar')
        .onclick = () => {renderUrlsReport('bar')}
    document.querySelector('.chart-button-line')
        .onclick = () => {renderUrlsReport('line')}
    document.querySelector('.chart-button-radar')
        .onclick = () => {renderUrlsReport('radar')}
    document.querySelector('.chart-button-table')
        .onclick = () => {renderUrlsReport('table')}
    if (type === 'bar' || type === 'line' || type === 'radar') {
        if (!document.querySelector('#urls-table')) {
            document.querySelector('.table-wrapper').innerHTML = ''
            document.querySelector('#table').style = ''
        }
        document.querySelectorAll('button').forEach(button => {
            if (button.id !== 'table') button.style = ''
        })
        document.querySelector('#' + type)
            .style = 'background-color: #324960; box-shadow: 0 0 4px #324960;'
        document.querySelector('.chart').innerHTML = `
            <h2>Top ${length} most popular urls</h2>
            <canvas id="chartCanvas"></canvas>
        `
        let total = []
        let passed = []
        let blocked = []
        countEachUrlEvents(getUniqueUrls(squidLog).slice(0, length), squidLog)
            .forEach(uri => {
                total.push(uri.totalQty)
                passed.push(uri.passedQty)
                blocked.push(uri.blockedQty)
            })
        const chartData = {
            labels: getUniqueUrls(squidLog).slice(0, length),
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
                },
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
        if (document.querySelector('#urls-table')) {
            document.querySelector('.table-wrapper').innerHTML = ''
            document.querySelector('#table').style = ''
        }
        else {
            document.querySelector('#table')
                .style = 'background-color: #324960; box-shadow: 0 0 4px #324960;'
            showUrls(getUniqueUrls(squidLog).slice(0, length))
        }
    }
}
