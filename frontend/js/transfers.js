// top transfers
const showTransfers = (jsonData) => {
    let tableRows = ''
    tableRows = `
        <table class="fl-table" id="transfers-table">
            <thead>
                <th>Timestamp</th>
                <th>Response time</th>
                <th>Client IP address</th>
                <th>Transfer Size</th>
                <th>URI</th>
                <th>Client Identity</th>
            </thead>
            <tbody class="table-data">
    `
    jsonData.forEach(e => {
        if (e.request_method !== 'NONE') {
            tableRows += `
                <tr>
                    <td>${e.timestamp}</td>
                    <td>${e.response_time}</td>
                    <td>${e.client_address}</td>
                    <td>${e.transfer_size}</td>
                    <td>${e.URI}</td>
                    <td>${e.client_identity}</td>
                </tr>
            `
        }
    })
    tableRows += `
            </tbody>
        </table>
    `
    document.querySelector('.table-wrapper').innerHTML = tableRows
    scrollToElement(document.querySelector('#transfers-table'), 'start')
}
const getUniqueTransfers = (jsonData) => {
    let transferArray = []
    jsonData.forEach(e => {
        if (e.transfer_size && !transferArray.includes(e.transfer_size)) {
            transferArray.push(e.transfer_size)
        }
    })
    let result = []
    transferArray.sort((a,b) => b - a).forEach(e => {
        result.push(e)
    })
    return result
}
const renderTransfersReport = (type, length = reportLenth) => {
    document.querySelector('.chart-button-bar')
        .onclick = () => {renderTransfersReport('bar')}
    document.querySelector('.chart-button-line')
        .onclick = () => {renderTransfersReport('line')}
    document.querySelector('.chart-button-radar')
        .onclick = () => {renderTransfersReport('radar')}
    document.querySelector('.chart-button-table')
        .onclick = () => {renderTransfersReport('table')}
    if (type === 'bar' || type === 'line' || type === 'radar') {
        if (!document.querySelector('#transfers-table')) {
            document.querySelector('.table-wrapper').innerHTML = ''
            document.querySelector('#table').style = ''
        }
        document.querySelectorAll('button').forEach(button => {
            if (button.id !== 'table') button.style = ''
        })
        document.querySelector('#' + type)
            .style = 'background-color: #324960; box-shadow: 0 0 4px #324960;'
        document.querySelector('.chart').innerHTML = `
            <h2>Top ${length} most heaviest transfers</h2>
            <canvas id="chartCanvas"></canvas>
        `
        let uriArray = []
        let tempArray = getUniqueTransfers(squidLog).slice(0, length)
        squidLog.forEach(e => {
            tempArray.forEach(transfer => {
                if (!uriArray.includes(e.URI) && e.transfer_size === transfer) {
                    uriArray.push(e.URI)
                }
            })
        })
        const chartData = {
            labels: uriArray,
            datasets: [
                {
                    data: tempArray,
                    backgroundColor: '#324960'
                }
            ]
        }
        const config = {
            type: type,
            data: chartData,
            options: {
                plugins: {
                    legend: {
                        display: false
                    }
                },
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
        if (document.querySelector('#transfers-table')) {
            document.querySelector('.table-wrapper').innerHTML = ''
            document.querySelector('#table').style = ''
        }
        else {
            document.querySelector('#table')
                .style = 'background-color: #324960; box-shadow: 0 0 4px #324960;'
            showTransfers(squidLog.sort((a,b) => b.transfer_size - a.transfer_size).slice(0, length))
        }
    }
}
