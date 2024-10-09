

var probability = .7;

var n = 5
var m = 10
var STEP;
var canvas;

var absoluteCTX;
var RelativeCTX;
var attackersSuccesses;

var PADDING = 50;
var plotWidth = 400;
var plotHeight = 500;
var lineChartWidth = 1000;
var lineChartHeight = 500;

var heightDiff = Math.abs(lineChartHeight - plotHeight)

var lineChartX = PADDING/2; // Punto di partenza del line chart
var lineChartY = PADDING; 
var plotChartX = lineChartWidth + 2*PADDING; // Punto di partenza del plot chart
var plotChartY = PADDING; 

var lineWidth = 5;

function drawLineChartArea(ctx) {
    ctx.beginPath();
    // Disegna il rettangolo partendo dalle coordinate lineChartX, lineChartY
    ctx.rect(lineChartX, lineChartY, lineChartWidth, lineChartHeight);
    ctx.stroke();
}

function drawPlotChartArea(ctx) {
    ctx.beginPath();
    // Disegna il rettangolo partendo dalle coordinate plotChartX, plotChartY
    ctx.rect(plotChartX, plotChartY-lineWidth, plotWidth, plotHeight+lineWidth);
    ctx.stroke();
}

function DrawAxis(ctx) {
    ctx.fillStyle = 'black';  // Colore del testo
    ctx.font = "12px Arial";  // Font per le etichette
    ctx.lineWidth = 2
    // Disegna rettangolo del Line Char
    drawLineChartArea(ctx);

    // Disegna rettangolo del Plot Chart
    drawPlotChartArea(ctx);
    // Aggiungi etichette sugli assi per entrambi i grafici
    drawAxisLabels(ctx, 'Servers', 'Penetrated', lineChartX -40, -10, true);
    drawAxisLabels(ctx, 'Frequency', 'Frequency', plotChartX -40, -10, false);
    drawXScalelineChart(RelativeCTX);
    drawYScalelineChart(RelativeCTX);
    drawYAxisScale(absoluteCTX,m);
    // drawXAxisScale(absoluteCTX,n);

}

document.addEventListener('DOMContentLoaded', async (event) => {
    const sliderdivs = document.querySelectorAll('.slidecontainer');
    
    // Aggiorna il valore del label quando lo slider cambia
    sliderdivs.forEach(sliderdiv => {
        let slider = sliderdiv.querySelector('.slider');
        let sliderValue = sliderdiv.querySelector('.sliderlabel')
        sliderValue.textContent = slider.value;
        slider.addEventListener('input', function() {
            sliderValue.textContent = slider.value;
        });
    });

    canvas = document.createElement('canvas');
    absoluteCTX = canvas.getContext('2d');
    canvas.id = "CursorLayer";
    canvas.width = PADDING+lineChartWidth+plotWidth+2*PADDING;
    canvas.height = lineChartHeight+2*PADDING;
    canvas.style.zIndex = 8;
    canvas.style.position = "absolute";
    canvas.border = '1px'
    // canvas.style.border = "1px solid";
    
    
    var div = document.getElementById('canvadiv');
    div.appendChild(canvas);
    cursorLayer = document.getElementById("CursorLayer");
    RelativeCTX = absoluteCTX
    m = document.getElementById('servers').value;
    n = document.getElementById('attackers').value;
    // plotChartY = PADDING - plotHeight/m
    // plotHeight = 500+plotHeight/m
    drawLineChartArea(RelativeCTX);

    // Disegna rettangolo del Plot Chart
    drawPlotChartArea(RelativeCTX);
    // DrawExternalCanvas(absoluteCTX);


    // RelativeCTX.clearRect(0, 0, canvas.width, canvas.height);

});

function drawAxisLabels(ctx, xLabel, yLabel, xPosition, yPosition, isLineChart) {
    ctx.fillStyle = 'black';
    ctx.font = "16px Arial";
    
    // Label per asse X (in fondo)
    ctx.fillText(xLabel, xPosition + (isLineChart ? lineChartWidth / 2 : plotWidth / 2) - 40, yPosition + 30);
    
    // Label per asse Y (sul lato sinistro, ruotata di 90 gradi)
    ctx.save();
    ctx.translate(xPosition, yPosition + (isLineChart ? lineChartHeight / 2 : plotHeight / 2));  // Posizionamento
    ctx.rotate(-Math.PI / 2);  // Ruota di 90 gradi per l'etichetta verticale
    ctx.fillText(yLabel, 0, 0);
    ctx.restore();
}

function recursiveAverage(arr, sum = 0, index = 0) {
    // Base case: if the array is fully processed, return the average
    if (index === arr.length) {
        return sum / arr.length;
    }

    // Recursive case: add the current element to the sum and move to the next index
    return recursiveAverage(arr, sum + arr[index], index + 1);
}

async function sim(){
    
    RelativeCTX.clearRect(0, 0, canvas.width, canvas.height);
    RelativeCTX.strokeStyle = '#000000'
    
    m = document.getElementById('servers').value;
    n = document.getElementById('attackers').value;
    probability = document.getElementById('succrate').value/100;
    STEP = lineChartWidth/m
    // plotChartY = PADDING - plotHeight/m

    attackersSuccesses = []
    
    DrawAxis(RelativeCTX);
    for(let j=0;j<n;j++){
        RelativeCTX.strokeStyle = getRandomColor();
        await drawTrajectory(RelativeCTX);
    }
    plotFrequencyDistribution(attackersSuccesses);
    mean = recursiveAverage(attackersSuccesses).toFixed(5);
    document.getElementById('mean').innerText = mean 
}


function plotFrequencyDistribution(arr) {
    // Disegna i dati di frequenza nel rettangolo del plot chart
    let frequencies = count(arr);
    let maxVal = arrMax(frequencies)

    let barHeightUnit = 5//plotHeight/(Number(m));  // Altezza di una unità di frequenza
    let barWidthUnit = plotWidth/maxVal;
    // Disegna le barre corrispondenti alle frequenze dei valori
    for (let i = 0; i < frequencies.length; i++) {
        let freq = frequencies[i] || 0;  // Se il valore non esiste, usa 0
        let barWidth = freq * barWidthUnit;  // Altezza della barra in base alla frequenza
        let yPos = plotHeight - i * STEP/2 + PADDING - barHeightUnit + 1
        console.log(freq) 
        absoluteCTX.fillStyle = 'blue';
        // Disegna il rettangolo delle barre con l'asse Y che rappresenta il valore e X la frequenza
        absoluteCTX.fillRect(plotChartX,yPos , barWidth, barHeightUnit-2);
    }

    drawXAxisScale(absoluteCTX, frequencies, maxVal);  // Disegna la scala dell'asse X
    drawYAxisScale(absoluteCTX, m);  // Disegna la scala dell'asse Y con i valori possibili
}

// Funzione per contare le occorrenze dei valori in arr
function count(arr) {
    let c = [];
    for (let i = 0; i < arr.length; i++) {
        let value = arr[i];
        if (!c[value]) {
            c[value] = 0;  // Inizializza il conteggio per questo valore
        }
        c[value]++;  // Incrementa il conteggio
    }
    return c;
}

// Disegna la scala dell'asse Y con i valori possibili
function drawYAxisScale(ctx, maxVal) {
    ctx.fillStyle = 'black';
    ctx.font = "12px Arial";
    ctx.lineWidth = 1;

    // Disegna una scala sull'asse Y con i valori possibili
    let numXDivisions = Number(maxVal);
    for (let i = 0; i <= numXDivisions; i++) {
        let yValue = (maxVal/numXDivisions) * i
        let yPosition = (plotHeight + PADDING) - (plotHeight/numXDivisions) * i;
        
        // Disegna il valore numerico dell'asse Y
        ctx.fillText(yValue.toFixed(0), plotChartX - 20, yPosition);

        // Linea di riferimento
        if(i!=0){

            ctx.beginPath();
            ctx.moveTo(plotChartX, yPosition);
            ctx.lineTo(plotChartX + plotWidth, yPosition);
            ctx.strokeStyle = '#CCCCCC';
            ctx.stroke();
        }
    }
}

function arrMax(arr){
    let max = 0;
    arr.forEach((elem)=>{
        if (elem>max)
            max = elem
    });
    return max;
}
// Disegna la scala dell'asse X con le frequenze
function drawXAxisScale(ctx, freq, maxVal) {
    ctx.fillStyle = 'black';
    ctx.font = "12px Arial";
    ctx.lineWidth = 1;

    // Numero di divisioni sull'asse X
    let numXDivisions = 10;

    freq.forEach( (elem) => {
        let xValue = elem;
        let xPosition = plotChartX + (plotWidth / maxVal) * elem;
        
        // Disegna il valore numerico sull'asse X
        ctx.fillText(xValue.toFixed(0), xPosition -( (elem==maxVal)?15:5), plotHeight + PADDING + 20);

        // Linea di riferimento verticale (opzionale)
        ctx.beginPath();
        ctx.moveTo(xPosition, plotHeight + PADDING);
        ctx.lineTo(xPosition, plotChartY-lineWidth);
        ctx.strokeStyle = '#CCCCCC';
        ctx.stroke();
    })

}

function drawXScalelineChart(ctx){
    let stepSize = lineChartWidth/m;  // Dimensione di ogni step sul grafico
    ctx.fillStyle = 'black';  // Colore del testo
    ctx.font = "12px Arial";  // Font per le etichette
    ctx.lineWidth = 2
    for (let i = 0; i <= m; i++) {
        let xPos = i * stepSize;  // Posizione orizzontale dell'etichetta

        // Disegna la linea di "tick mark" sotto ogni step
        ctx.beginPath();
        ctx.moveTo(xPos+lineChartX, lineChartHeight+lineChartY-5);  // Inizio del "tick mark" (parte inferiore del grafico)
        ctx.lineTo(xPos+lineChartX, lineChartHeight + lineChartY+ 5);  // Fine del "tick mark" (leggermente sotto)
        ctx.stroke();

        // Disegna l'etichetta numerica sotto ogni "tick mark"
        ctx.fillText(i, xPos , lineChartHeight + lineChartY+ 25);  // Offset leggero per centrare il numero
    }
    
}

function drawYScalelineChart(ctx) {
    let stepSize = lineChartHeight / m;  // Dimensione dello step verticale sul grafico
    ctx.fillStyle = 'black';  // Colore del testo
    ctx.font = "12px Arial";  // Font per le etichette
    ctx.lineWidth = 2;
    
    for (let i = 1; i <= m; i++) {
        let yPos = lineChartHeight - (i * stepSize);  // Posizione verticale delle etichette e dei tick

        // Disegna la linea di "tick mark" accanto all'asse Y
        ctx.beginPath();
        ctx.moveTo(lineChartX - 5, yPos + lineChartY);  // Inizio del "tick mark" (a sinistra dell'asse Y)
        ctx.lineTo(lineChartX + 5, yPos + lineChartY);  // Fine del "tick mark" (leggermente a destra)
        ctx.stroke();

        // Disegna l'etichetta numerica accanto a ogni "tick mark"
        ctx.fillText(i, lineChartX - 25, yPos + lineChartY + 5);  // Posiziona le etichette a sinistra dell'asse Y
    }
}



function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function drawTrajectory(ctx){
    let currX = lineChartX; // Inizia dal rettangolo del line chart
    let CurrY = lineChartY+ heightDiff;
    ctx.lineWidth = 5;
    ctx.beginPath();
    let countSuccess = 0
    for(let i = 0;i<m;i++){
        if(Math.random()>probability){
            //not penetrated 
            // horizontal line
            if(CurrY!=lineChartY+ heightDiff)
                drawLine(currX,CurrY,currX+STEP,CurrY, ctx);
            currX+=STEP;
        }
        else{
            //penetrated 
            //vertical line    
            drawLine(currX,CurrY,currX+STEP,CurrY+STEP/2, ctx);
            CurrY+=STEP/2;
            currX+=STEP;
            countSuccess++;
        }    
    }
    attackersSuccesses.push(countSuccess)
    
}

function drawLine(xi, yi, xf, yf, ctx){

    ctx.moveTo(xi,canvas.height-yi);
    ctx.lineTo(xf,canvas.height-yf);

    // Draw the Path
    ctx.stroke();
}



