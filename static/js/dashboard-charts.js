function graphLoad() {
    (async function () {
        let activeTab = JSON.parse(document.getElementById('active_page').textContent);
        let recentCVEChart;
        if (activeTab !== 'dashboard') {
            return
        }
        recentCVEChart = Object.values(Chart.instances).filter((c) => c.canvas.id === 'recent-cve-activity').pop()
        if (typeof recentCVEChart !== 'undefined') {
            recentCVEChart.destroy();
        }

        let textColor = window.getComputedStyle(document.body).getPropertyValue('--color-text');
        let backgroundColor = window.getComputedStyle(document.body).getPropertyValue('--color-background');
        let smallFontSize = window.getComputedStyle(document.body).getPropertyValue('--chart-font-size');
        let largeFontSize = window.getComputedStyle(document.body).getPropertyValue('--chart-title-font-size');
        let fontFamily = window.getComputedStyle(document.body).getPropertyValue('--font-family');
        let fontWeight = window.getComputedStyle(document.body).getPropertyValue('--font-weight-regular');
        let labelPadding = 0;

        function addAlpha(color, opacity) {
            // coerce values so it is between 0 and 1.
            let newOpacity = Math.round(Math.min(Math.max(opacity ?? 1, 0), 1) * 255);
            return color + newOpacity.toString(16).toUpperCase();
        }

        function format_date(original) {
            let dateString = (new Date(Date.parse(original))).toUTCString();
            return dateString.substring(0, dateString.length - 18);
        }

        let getOrCreateTooltip = (chart) => {
            let tooltipEl = chart.canvas.parentNode.querySelector('div');

            if (!tooltipEl) {
                tooltipEl = document.createElement('div');

                let table = document.createElement('table');
                table.style.margin = '0px';

                tooltipEl.appendChild(table);
                chart.canvas.parentNode.appendChild(tooltipEl);
            }
            tooltipEl.style.borderRadius = '5px 0px 5px 5px';
            tooltipEl.style.color = textColor;
            tooltipEl.style.opacity = '1';
            tooltipEl.style.pointerEvents = 'none';
            tooltipEl.style.position = 'absolute';
            tooltipEl.style.transform = 'translate(-100%, 0)';
            tooltipEl.style.transition = 'top .1s ease, left .1s ease, opacity .1s ease';
            tooltipEl.style.background = addAlpha(backgroundColor, 0.85);

            return tooltipEl;
        };

        let externalTooltipHandler = (context) => {
            // Tooltip Element
            const {chart, tooltip} = context;
            const tooltipEl = getOrCreateTooltip(chart);

            // Hide if no tooltip
            if (tooltip.opacity === 0) {
                tooltipEl.style.opacity = '0';
                return;
            }

            // Set Text
            if (tooltip.body) {
                const titleLines = tooltip.title || [];
                const bodyLines = tooltip.body.map(b => b.lines);

                const tableHead = document.createElement('thead');

                titleLines.forEach(title => {
                    const tr = document.createElement('tr');
                    tr.style.borderWidth = 0;

                    const th = document.createElement('th');
                    th.style.borderWidth = 0;
                    let text = document.createTextNode(title);
                    text.data = format_date(text.data)
                    th.appendChild(text);
                    tr.appendChild(th);
                    tableHead.appendChild(tr);
                });

                const tableBody = document.createElement('tbody');
                bodyLines.forEach((body, i) => {
                    const colors = tooltip.labelColors[i];
                    const tr = document.createElement('tr');
                    tr.style.backgroundColor = 'inherit';
                    tr.style.borderWidth = 0;
                    tr.style.whiteSpace = 'nowrap';

                    const td = document.createElement('td');
                    td.style.borderWidth = 0;

                    const text = document.createTextNode(body);

                    td.appendChild(text);
                    tr.appendChild(td);
                    tableBody.appendChild(tr);
                });

                const tableRoot = tooltipEl.querySelector('table');

                // Remove old children
                while (tableRoot.firstChild) {
                    tableRoot.firstChild.remove();
                }

                // Add new children
                tableRoot.appendChild(tableHead);
                tableRoot.appendChild(tableBody);
            }

            const {offsetLeft: positionX, offsetTop: positionY} = chart.canvas;

            tooltipEl.style.opacity = 1;
            tooltipEl.style.left = positionX + tooltip.caretX + 'px';
            tooltipEl.style.top = positionY + tooltip.caretY + 'px';
            tooltipEl.style.font = tooltip.options.bodyFont.string;
            tooltipEl.style.fontFamily = fontFamily;
            tooltipEl.style.fontSize = smallFontSize;
            tooltipEl.style.fontWeight = fontWeight;
            tooltipEl.style.padding = tooltip.options.padding + 'px ' + tooltip.options.padding + 'px';
        };


        function getBarColor(riskColor, isForecast) {
            return isForecast ? addAlpha(riskColor, 0.50) : riskColor;
        }


        const data = JSON.parse(document.getElementById('cve_data').textContent);

        let noneColors = [];
        let lowColors = [];
        let mediumColors = [];
        let highColors = [];
        let criticalColors = [];

        for (let i = 0; i < data.length; i++) {
            noneColors.push(getBarColor('#41beff', data[i].isForecast));
            lowColors.push(getBarColor('#41ff80', data[i].isForecast));
            mediumColors.push(getBarColor('#ffd941', data[i].isForecast));
            highColors.push(getBarColor('#ff8d41', data[i].isForecast));
            criticalColors.push(getBarColor('#ff4145', data[i].isForecast));
        }

        Chart.defaults.font.family = fontFamily;
        Chart.defaults.font.weight = fontWeight;
        Chart.defaults.font.size = smallFontSize;
        Chart.defaults.color = addAlpha(textColor, 0.75);
        recentCVEChart = new Chart(
            document.getElementById('recent-cve-activity'),
            {
                type: 'bar',
                data: {
                    labels: data.map(row => row.dateRange),
                    datasets: [
                        {
                            label: 'None',
                            data: data.map(row => row.none),
                            backgroundColor: noneColors
                        },
                        {
                            label: 'Low',
                            data: data.map(row => row.low),
                            backgroundColor: lowColors,
                        },
                        {
                            label: 'Medium',
                            data: data.map(row => row.medium),
                            backgroundColor: mediumColors,
                        },
                        {
                            label: 'High',
                            data: data.map(row => row.high),
                            backgroundColor: highColors,
                        },
                        {
                            label: 'Critical',
                            data: data.map(row => row.critical),
                            backgroundColor: criticalColors,
                        },
                    ]
                },
                options: {
                    normalized: true,
                    maintainAspectRatio: false,
                    responsive: true,
                    interaction: {
                        mode: 'point',
                        intersect: false,
                    },
                    plugins: {
                        title: {
                            display: false
                        },
                        legend: {
                            display: true,
                            labels: {
                                usePointStyle: true,
                                pointStyle: 'circle',
                            }
                        },
                        tooltip: {
                            enabled: false,
                            position: 'nearest',
                            external: externalTooltipHandler
                        }
                    },
                    scales: {
                        x: {
                            stacked: true,
                            grid: {
                                color: addAlpha(textColor, 0.25)
                            },
                            title: {
                                display: true,
                                text: 'Date',
                                color: textColor,
                                padding: labelPadding,
                                font: {
                                    size: largeFontSize,
                                    weight: 700,
                                },
                            },
                            ticks: {
                                callback: function (value, index, ticks) {
                                    return format_date(data[index].dateRange)
                                }
                            }
                        },
                        y: {
                            stacked: true,
                            grid: {
                                color: addAlpha(textColor, 0.25)
                            },
                            title: {
                                display: true,
                                text: 'CVEs Published',
                                color: textColor,
                                padding: labelPadding,
                                font: {
                                    size: largeFontSize,
                                    weight: 700,
                                },
                            },
                            font: {
                                size: 32,
                            },
                        }
                    },
                    onClick: event => clickHandler(event),
                    onHover: event => hoverHandler(event),
                }
            }
        )

        function clickHandler(evt) {
            const points = recentCVEChart.getElementsAtEventForMode(evt, 'nearest', {intersect: true}, true);
            if (points.length) {
                const firstPoint = points[0];
                let date = data[firstPoint.index].dateRange;
                let distanceFromEnd = recentCVEChart.data.datasets.length - firstPoint.datasetIndex
                let keyIndex = Object.keys(data[firstPoint.index]).length - distanceFromEnd
                const severity = Object.keys(data[firstPoint.index])[keyIndex];
                console.log(severity);

                const isForecast = data[firstPoint.index].isForecast;
                if (!isForecast) {
                    let min_cvss = '0.0';
                    let max_cvss = '10.0';
                    switch (severity.toLowerCase()) {
                        case 'none':
                            min_cvss = '0.0';
                            max_cvss = '0.0';
                            break
                        case 'low':
                            min_cvss = '0.1';
                            max_cvss = '3.9';
                            break
                        case 'medium':
                            min_cvss = '4.0';
                            max_cvss = '6.9';
                            break
                        case 'high':
                            min_cvss = '7.0';
                            max_cvss = '8.9';
                            break
                        case 'critical':
                            min_cvss = '9.0';
                            max_cvss = '10.0';
                            break
                    }
                    sessionStorage.setItem('pub_from', date); sessionStorage.setItem('pub_to', date);
                    sessionStorage.setItem('min_cvss', min_cvss); sessionStorage.setItem('max_cvss', max_cvss);
                    if(sessionStorage.getItem('cve_search')){ sessionStorage.removeItem('cve_search'); }
                    if(sessionStorage.getItem('sort_by')){ sessionStorage.removeItem('sort_by'); }
                    if(sessionStorage.getItem('order')){ sessionStorage.removeItem('order'); }
                    if(sessionStorage.getItem('mod_from')){ sessionStorage.removeItem('mod_from'); }
                    if(sessionStorage.getItem('mod_to')){ sessionStorage.removeItem('mod_to'); }
                    let url = `/app/database`;
                    htmx.ajax('GET', url, {target: '#content'})
                }
            }
        }

        function hoverHandler(evt) {
            const points = recentCVEChart.getElementsAtEventForMode(evt, 'nearest', {intersect: true}, true);
            if (points.length) {
                const firstPoint = points[0];
                const isForecast = data[firstPoint.index].isForecast;
                if (!isForecast) {
                    document.getElementById('recent-cve-activity').style.cursor = 'pointer';
                }
                //Tooltip display
            } else {
                document.getElementById('recent-cve-activity').style.cursor = 'default';
            }
        }
    })();
}

