//test moment.js
// var test = moment("12/05/2018", "DD/MM/YYYY");
// var mese = test.format("MM");

$(document).ready(function(){
    $.ajax({
        'url':"http://157.230.17.132:4021/sales",
        'method':'GET',
        'success': function(data) {

            ottieniVenditeMese(data);
            ottieniVenditeVenditore(data)
        },
        'error': function() {
            console.log('errore');    
        }
    })


    function ottieniVenditeMese(data) {
        var venditePerMese = {
            'January': 0,
            'February': 0,
            'March': 0,
            'April': 0,
            'May': 0,
            'June': 0,
            'July': 0,
            'August': 0,
            'September': 0,
            'October': 0,
            'November': 0,
            'December': 0
        };

        for (let index = 0; index < data.length; index++) {
            var singoloEvento = data[index];
            var singolaVendita = singoloEvento.amount;
            var formatoData = moment(data[index].date, "DD/MM/YYYY");
            var meseVendita = formatoData.format("MMMM");
            if (venditePerMese.hasOwnProperty(meseVendita)) {
                venditePerMese[meseVendita] += singolaVendita
            }
        }
        var mesi = Object.keys(venditePerMese);
        var vendite = Object.values(venditePerMese);
        generaLine(mesi,vendite); 
    }

    function ottieniVenditeVenditore(data) {
        var venditePerVenditore = {};
        var totaleVendite = 0;
        for (let index = 0; index < data.length; index++) {
            var singoloEvento = data[index];
            var singolaVendita = singoloEvento.amount;
            var nomeVenditore = data[index].salesman;
            if (!venditePerVenditore.hasOwnProperty(nomeVenditore)) {
                venditePerVenditore[nomeVenditore] = singolaVendita
            } else {
                venditePerVenditore[nomeVenditore] += singolaVendita
            }
            totaleVendite += singolaVendita;
        }

        for (const nomeVenditore in venditePerVenditore) {
            var element = venditePerVenditore[nomeVenditore]
            element = ((venditePerVenditore[nomeVenditore] / totaleVendite)) * 100;
            venditePerVenditore[nomeVenditore] = element.toString().slice(0,5);
        }     

        var nomi = Object.keys(venditePerVenditore); 
        var vendite = Object.values(venditePerVenditore);
        generaPie(nomi,vendite);
    }

    function generaLine(mesi,vendite) {
        var ctx = $('#myChart_bar')[0].getContext('2d');
        var myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: mesi,
                datasets: [{
                    label: 'Total Sales',
                    data: vendite,
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)',
                        'rgba(255, 99, 180, 1)',
                        'rgba(20, 162, 235, 1)',
                        'rgba(255, 100, 86, 1)',
                        'rgba(0, 192, 192, 1)',
                        'rgba(153, 0, 255, 1)',
                        'rgba(255, 159, 0, 1)'
                    ],
                    borderWidth: 1,
                    lineTension: 0
                }],
            },
            options: {
                title: {
                    display: true,
                    text: 'Monthly amount of sales'
                },
                legend: {
                    display: false,
                },
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            }
        })
    }

    function generaPie(nomi,vendite) {
        var ctx = $('#myChart_pie')[0].getContext('2d');
        var myChart = new Chart( ctx, {
            type: 'pie',
            data: {
                labels: nomi,
                datasets: [{
                    label: 'Total Sales',
                    data: vendite,
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
                title: {
                    display: true,
                    text: 'Salesman\'s Sales'
                },
                legend: {
                    display: false,
                },
            }
        })
    }
})