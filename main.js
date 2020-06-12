$(document).ready(function(){
    
    //chiamata ajax per recuperare i dati da aggregare
    const url = "http://157.230.17.132:4021/sales";
    ajaxCallGeneral();

    function ajaxCallGeneral() {
        $.ajax({
            'url': url,
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
        var venditePerMese = {};

        for (let index = 1; index <= 12; index++) {
            nomeMese = moment(index,'M').format('MMMM');
            venditePerMese[nomeMese] = 0;
        }

        for (let index = 0; index < data.length; index++) {
            var singoloEvento = data[index];
            var singolaVendita = parseFloat(singoloEvento.amount);
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
        if($('#date option').length == 1) {
            generaSelectDate(mesi);
        }
    }

    function ottieniVenditeVenditore(data) {
        var venditePerVenditore = {};
        var totaleVendite = 0;
        for (let index = 0; index < data.length; index++) {
            var singoloEvento = data[index];
            var singolaVendita = parseFloat(singoloEvento.amount);
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
        if($('#salesman option').length == 1) {
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

            var meseVendita = moment(data[index].date, "DD/MM/YYYY").quarter();
            
            if (meseVendita == 1) {
                venditePerTrimestre.Q1++;
            } else if ( meseVendita == 2) {
                venditePerTrimestre.Q2++;
            } else if ( meseVendita == 3) {
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
        $('.line-wrapper').empty();
        $('.line-wrapper').append('<canvas id="myChart_line"></canvas>');
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
                tooltips: {
                enabled: true,
                mode: 'single',
                callbacks: {
                    label: function(tooltipItems, data) { 
                        return tooltipItems.yLabel + ' €';
                    }
                }
            },
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
        var template = Handlebars.compile($('#date-wrapper').html());
        for (let index = 0; index < mesi.length; index++) {
            $('#date').append(template({'mese': mesi[index]}));
            // $('#date').append('<option value="'+ mesi[index] + '">'+ mesi[index] +'</option>');
        }
    }

    //con chart.js
    function generaPie(nomi,vendite) {

        $('.pie-wrapper').empty();
        $('.pie-wrapper').append('<canvas id="myChart_pie"></canvas>');
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
                tooltips: {
                    callbacks: {
                        label: function( tootltipItem, data){
                            var nomeVenditore = data.labels[tootltipItem.index];
                            var percentualeVendite = data.datasets[tootltipItem.datasetIndex].data[tootltipItem.index];
                            return nomeVenditore + ': ' + percentualeVendite + '%';
                        }
                    },
                },
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
        var template = Handlebars.compile($('#salesman-wrapper').html());
        for (let index = 0; index < nomi.length; index++) {
            $('#salesman').append(template({'nome': nomi[index]}));
            // $('#salesman').append('<option value="'+ nomi[index] + '">'+ nomi[index] +'</option>');
        }
    }

    function generaBar(trimestri,vendite) {
        $('.bar-wrapper').empty();
        $('.bar-wrapper').append('<canvas id="myChart_bar"></canvas>');
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
        if ($('#salesman').val() != 'none' && $('#date').val() != 'none') {
            var valoreVendita = $('input').val();
            var venditore = $('#salesman').val();
            var meseLettere = $('#date').val();
            var onlyMonth = moment().month(meseLettere).format("MM");
            var date = "01/"+ onlyMonth +"/2017";
            if (valoreVendita > 0) {
                $('input').val('')
                $('#salesman').val('none')
                $('#date').val('none')
                $.ajax({
                    'url': url,
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
            }
        }
    })
})




