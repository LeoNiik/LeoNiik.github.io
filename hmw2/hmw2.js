

var probability = .7;

var n = 5
var m = 10
var STEP;
var canvas;

var ctx;

//result vector
var attackersSuccesses;

// var attackers;


//Graphics widths and heights
var PADDING = 50;
var plotWidth = 100;
var plotHeight = 500;
var lineChartWidth = 1000;
var lineChartHeight = 500;

var heightDiff = Math.abs(lineChartHeight - plotHeight)

// Coordinates from where the plot begins
var lineChartX = PADDING/2; // Punto di partenza del line chart
var lineChartY = PADDING; 
var plotChartX = lineChartWidth+lineChartX; // Punto di partenza del plot chart
var plotChartY = PADDING; 


var lineWidth = 3;

function drawLineChartArea(ctx) {
    ctx.beginPath();
    // Disegna il rettangolo partendo dalle coordinate lineChartX, lineChartY
    ctx.rect(lineChartX, lineChartY, lineChartWidth, lineChartHeight);
    ctx.stroke();
}

function drawPlotChartArea(x, y, width, height, ctx) {
    ctx.strokeStyle = 'black';
    ctx.beginPath();
    // Disegna il rettangolo partendo dalle coordinate plotChartX, plotChartY
    ctx.rect(x, y, width, height);
    ctx.stroke();
}

function DrawAxis(ctx) {
    ctx.fillStyle = 'black';  // Colore del testo
    ctx.font = "12px Arial";  // Font per le etichette
    ctx.lineWidth = 2

    drawLineChartArea(ctx);
    drawPlotChartArea(plotChartX, plotChartY, plotWidth, plotHeight, ctx);

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
    ctx = canvas.getContext('2d');
    canvas.id = "CursorLayer";
    canvas.width = PADDING+lineChartWidth+plotWidth+2*PADDING;
    canvas.height = lineChartHeight+2*PADDING;
    canvas.style.zIndex = 8;
    canvas.style.position = "absolute";
    canvas.border = '1px'
    
    
    var div = document.getElementById('canvadiv');
    div.appendChild(canvas);
    cursorLayer = document.getElementById("CursorLayer");
    ctx = ctx
    m = document.getElementById('servers').value;
    n = document.getElementById('attackers').value;

    drawLineChartArea(ctx);

    drawPlotChartArea(plotChartX, plotChartY, plotWidth, plotHeight, ctx);
});

function initializeAttackers(n,m) {
    const attackers = [];
    for (let i = 0; i < n; i++) {
        attackers.push(new Attacker(i,Number(m)+1));
    }
    return attackers;
}

function recursiveAverage(arr, sum = 0, index = 0) {
    if (index === arr.length) {
        return sum / arr.length;
    }
    return recursiveAverage(arr, sum + arr[index], index + 1);
}

async function sim(){
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#000000'
    
    m = document.getElementById('servers').value;
    n = document.getElementById('attackers').value;
    probability = document.getElementById('succrate').value/100;
    STEP = lineChartWidth/m
    // plotChartY = PADDING - plotHeight/m

    
    DrawAxis(ctx);
    let attackers = initializeAttackers(n,m);
    attackersSuccesses = []
    
    for(let i = 0;i<n; i++){
        drawTrajectory(ctx, attackers[i]);
        plotFrequencyDistributionAtStep(attackers, Math.floor(Number(m)/2));
        plotFrequencyDistributionAtStep(attackers, m)
        await sleep(100);
    }
    // for(let j=0;j<m;j++){
    //     await drawTrajectoryStep(ctx, attackers);        
    // }
    // plotFrequencyDistributionAtStep(attackers, Math.floor(Number(m)/2));
    // plotFrequencyDistributionAtStep(attackers, m)
    // plotFrequencyDistributionAtStep(attackers, m)
    // mean = recursiveAverage(attackersSuccesses).toFixed(5);
    // document.getElementById('mean').innerText = mean 
}

function plotFrequencyDistributionAtStep(attackers, atStep){
    attackers.forEach(element => {
        if(element.successesPerStep[atStep]!=0)
            attackersSuccesses.push(element.successesPerStep[atStep]);
    });
    plotFrequencyDistribution(attackersSuccesses, false, atStep);
    attackersSuccesses = [];

}
function cleanPlotChartArea(xPos, plotChartY, plotWidth, plotHeight, ctx){
    ctx.clearRect(xPos, plotChartY, plotWidth, plotHeight);

}
function plotFrequencyDistribution(arr, relative, numAttack) {
    // Disegna i dati di frequenza nel rettangolo del plot chart

    let xPos = lineChartX+ numAttack*STEP;
    cleanPlotChartArea(xPos, plotChartY, plotWidth, plotHeight, ctx);
    
    drawPlotChartArea(xPos, plotChartY, plotWidth, plotHeight, ctx);

    let frequencies = count(arr);
    
    let maxVal = arrMax(frequencies);
    let barHeightUnit = 5//plotHeight/(Number(m));  // Altezza di una unità di frequenza
    console.log(frequencies, arr)
    let barWidthUnit = relative ? plotWidth/m : plotWidth/maxVal;
    // Disegna le barre corrispondenti alle frequenze dei valori

    for (let i = 0; i < frequencies.length; i++) {
        let freq = frequencies[i] || 0;  // Se il valore non esiste, usa 0
        let barWidth = freq * barWidthUnit;  // Altezza della barra in base alla frequenza 
        
        let yInit = lineChartY + lineChartHeight/2
        let yPos = yInit + i*STEP/4 - (numAttack-i)*(STEP/4) 
        
        ctx.strokeStyle = 'blue';
        drawLine(xPos, yPos,xPos + barWidth, yPos , ctx);
    }

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

function arrMax(arr){
    let max = 0;
    arr.forEach((elem)=>{
        if (elem>max)
            max = elem
    });
    return max;
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
class Attacker {
    constructor(id, nserv) {
        // Fields
        this.id = id;
        this.step = 0;         // Represents the current step or action
        this.successesPerStep = Array.from({ length: nserv }, () => 0);
        this.successes = 0
        this.color = getRandomColor();
    }

    // Method to increase step by 1 (or a specific amount)
    incrementStep(amount = 1) {
        if (this.successesPerStep[this.step] === undefined) {
            this.successesPerStep[this.step] = 0;
        }
        this.step += amount;
        this.successesPerStep[this.step] += this.successes;   
    }

    
    getCoords(nAtt = this.step){
        if (this.successesPerStep[this.step] === undefined) {
            this.successesPerStep[this.step] =  0;
        }
        return {x : nAtt * STEP, y: this.successesPerStep[nAtt]*STEP/4 - (nAtt-this.successesPerStep[nAtt])*(STEP/4)}
    }

    // Method to record a success (increment successes by 1 or a specific amount)
    recordSuccess(amount = 1) {
        if (this.successesPerStep[this.step] === undefined) {
            this.successesPerStep[this.step] = 0;
        }
        this.successes+=amount
    }
}
function drawTrajectory(ctx, attacker){
    let baseX = lineChartX; // Inizia dal rettangolo del line chart
    let baseY = lineChartY+ lineChartHeight/2;
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = attacker.color
    for(let i =0 ; i<m; i++){

        let coords = attacker.getCoords()
        if(Math.random()>probability){       
            drawLine(baseX+coords.x,baseY+coords.y,baseX+coords.x+STEP,baseY+coords.y-STEP/4, ctx);
        }
        else{
            attacker.recordSuccess()
            drawLine(baseX+coords.x,baseY+coords.y,baseX+coords.x+STEP,baseY+coords.y+STEP/4, ctx);
        }
        attacker.incrementStep()
    }

}
function drawTrajectoryStep(ctx, attackers){
    let baseX = lineChartX; // Inizia dal rettangolo del line chart
    let baseY = lineChartY+ lineChartHeight/2;
    ctx.lineWidth = lineWidth;
    attackers.forEach(element => {
        ctx.strokeStyle = element.color

        let coords = element.getCoords()
        if(Math.random()>probability){       
            drawLine(baseX+coords.x,baseY+coords.y,baseX+coords.x+STEP,baseY+coords.y-STEP/4, ctx);
        }
        else{
            element.recordSuccess()
            drawLine(baseX+coords.x,baseY+coords.y,baseX+coords.x+STEP,baseY+coords.y+STEP/4, ctx);
        }
        element.incrementStep()
        // console.log(coords.x/STEP , coords.y/(STEP/4))
    });

    
    
}

function drawLine(xi, yi, xf, yf, ctx){
    ctx.beginPath();

    ctx.moveTo(xi,canvas.height-yi);
    ctx.lineTo(xf,canvas.height-yf);

    // Draw the Path
    ctx.stroke();
    ctx.closePath();
}

// dev(n) = dev(n-1) + (x(n)- x(n-1))*(x(n)-mean(n))

