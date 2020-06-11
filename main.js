$(document).ready(function(){
    //chiamata ajax per recuperare i dati da aggregare
    ajaxCallGeneral();

    function ajaxCallGeneral() {
        $.ajax({
            'url':"http://157.230.17.132:4021/sales",
            'method':'GET',
            'success': function(data) {

                ottieniVenditeMese(data);
                ottieniVenditeVenditore(data);
                ottieniVenditeTrimestre(data);
                
            },
            'error': function() {
                console.log('errore');    
            }
        })
    }

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
            var singolaVendita = parseInt(singoloEvento.amount);
            var formatoData = moment(data[index].date, "DD/MM/YYYY");
            var meseVendita = formatoData.format("MMMM");
            if (venditePerMese.hasOwnProperty(meseVendita)) {
                venditePerMese[meseVendita] += singolaVendita
            }
        }
        var mesi = Object.keys(venditePerMese);
        var vendite = Object.values(venditePerMese);
        
        //genero il grafico line
        generaLine(mesi,vendite); 
        //genero le option della select per i mesi se non sono già state generate
        if($('#date').val() == null) {
            generaSelectDate(mesi);
        }
    }

    function ottieniVenditeVenditore(data) {
        var venditePerVenditore = {};
        var totaleVendite = 0;
        for (let index = 0; index < data.length; index++) {
            var singoloEvento = data[index];
            var singolaVendita = parseInt(singoloEvento.amount);
            var nomeVenditore = data[index].salesman;
            if (!venditePerVenditore.hasOwnProperty(nomeVenditore)) {
                venditePerVenditore[nomeVenditore] = singolaVendita
            } else {
                venditePerVenditore[nomeVenditore] += singolaVendita
            }
            totaleVendite += singolaVendita;
        }

        //rendo il numero espresso in percentuale
        for (const nomeVenditore in venditePerVenditore) {
            var element = venditePerVenditore[nomeVenditore]
            element = ((venditePerVenditore[nomeVenditore] / totaleVendite)) * 100;
            venditePerVenditore[nomeVenditore] = element.toFixed(2);
        }     

        var nomi = Object.keys(venditePerVenditore); 
        var vendite = Object.values(venditePerVenditore);

        //genero il grafico pie
        generaPie(nomi,vendite);
        //genero le option della select dei venditori se non sono già state generate
        if($('#salesman').val() == null) {
            generaSelectNomi(nomi);  
        }      
    }

    function ottieniVenditeTrimestre (data) {
        var venditePerTrimestre = {
            Q1 : 0,
            Q2 : 0,
            Q3 : 0,
            Q4 : 0
        };
        for (let index = 0; index < data.length; index++) {
            var formatoData = moment(data[index].date, "DD/MM/YYYY");
            var meseVendita = formatoData.format("MMMM");
            if (meseVendita == "January" || meseVendita == "February" || meseVendita == "March" ) {
                venditePerTrimestre.Q1++;
            } else if (meseVendita == "April" || meseVendita == "May" || meseVendita == "June" ) {
                venditePerTrimestre.Q2++;
            } else if (meseVendita == "July" || meseVendita == "August" || meseVendita == "September" ) {
                venditePerTrimestre.Q3++;
            } else  {
                venditePerTrimestre.Q4++;
            }
        }
        var trimestri = Object.keys(venditePerTrimestre);
        var numeroVendite = Object.values(venditePerTrimestre);
        generaBar(trimestri,numeroVendite)
    }

    //con chart.js
    function generaLine(mesi,vendite) {
        var ctx = $('#myChart_line')[0].getContext('2d');
        var myChartLine = new Chart(ctx, {
            type: 'line',
            data: {
                labels: mesi,
                datasets: [{
                    label: 'Total Sales',
                    data: vendite,
                    borderColor: 'rgb(30,144,255)',
                    pointBorderColor:'red',
                    pointBackgroundColor: 'red',
                    borderWidth: 2,
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

    function generaSelectDate (mesi) {
        for (let index = 0; index < mesi.length; index++) {
            $('#date').append('<option value="'+ mesi[index] + '">'+ mesi[index] +'</option>');
        }
    }

    //con chart.js
    function generaPie(nomi,vendite) {
        var ctx = $('#myChart_pie')[0].getContext('2d');
        var myChartPie = new Chart( ctx, {
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

    function generaSelectNomi (nomi) {
        for (let index = 0; index < nomi.length; index++) {
            $('#salesman').append('<option value="'+ nomi[index] + '">'+ nomi[index] +'</option>');
        }
    }

    function generaBar(trimestri,vendite) {
        var ctx = $('#myChart_bar')[0].getContext('2d');
        var myChartBar = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: trimestri,
                datasets: [{
                    label: 'Quarter\'s Total Sales',
                    data: vendite,
                    borderColor: 'rgb(30,144,255)',
                    backgroundColor:'rgb(30,144,255)',
                    borderWidth: 2,
                }],
            },
            options: {
                title: {
                    display: true,
                    text: 'Amount of sales for Quarter'
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

//al click apporto le modifiche ai grafici
    $('button').on('click', function(){
        var valoreVendita = parseInt($('input').val());
        var venditore = $('#salesman').val();
        var meseLettere = $('#date').val();
        var onlyMonth = moment().month(meseLettere).format("MM");
        var date = "01/"+ onlyMonth +"/2017";

        $.ajax({
            'url':"http://157.230.17.132:4021/sales",
            'method':'POST',
            'data': {
                "amount": valoreVendita,
                "salesman": venditore,
                "date": date
            },
            'success': function(data) {
                ajaxCallGeneral();
            },
            'error': function() {
                console.log('errore');    
            }
        })  
    })
})




