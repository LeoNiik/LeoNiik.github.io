

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

function drawChartArea(x, y, width, height, ctx) {
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    ctx.beginPath();
    // Disegna il rettangolo partendo dalle coordinate plotChartX, plotChartY
    ctx.rect(x, y, width, height);
    ctx.stroke();
}

function DrawAxis(ctx) {
    ctx.fillStyle = 'black';  // Colore del testo
    ctx.font = "12px Arial";  // Font per le etichette
    ctx.lineWidth = 2

    drawChartArea(lineChartX, lineChartY, lineChartWidth, lineChartHeight,ctx);
    drawChartArea(plotChartX, plotChartY, plotWidth, plotHeight, ctx);

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
    DrawAxis(ctx);
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
    let AllPaths = []
    attackersSuccesses = []
    
    for(let i = 0;i<n; i++){

        let newPath = drawTrajectoryRelative(ctx, attackers[i]);
        AllPaths.push(newPath);
        ctx.stroke(newPath);
        // reDrawTrajectories(ctx,AllPaths, attackers, i);
        
        // await sleep(10);
    }
    plotFrequencyDistributionAtStep(attackers, Math.floor(Number(m)/2));
    plotFrequencyDistributionAtStep(attackers, m)
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
        if(element.successesPerStep[atStep]!== undefined)
            attackersSuccesses.push(element.successesPerStep[atStep]);
    });
    plotFrequencyDistribution(attackersSuccesses, true, atStep);
    attackersSuccesses = [];

}
function cleanPlotChartArea(xPos, plotChartY, plotWidth, plotHeight, ctx){
    ctx.clearRect(xPos, plotChartY, plotWidth, plotHeight);

}
function plotFrequencyDistribution(arr, relative, numAttack) {
    // Disegna i dati di frequenza nel rettangolo del plot chart

    let xPos = lineChartX+ numAttack*STEP;
    cleanPlotChartArea(xPos, plotChartY, plotWidth, plotHeight, ctx);
    
    drawChartArea(xPos, plotChartY, plotWidth, plotHeight, ctx);

    let frequencies = count(arr);
    
    let maxVal = arrMax(frequencies);
    let barHeightUnit = 5//plotHeight/(Number(m));  // Altezza di una unità di frequenza
    // console.log(frequencies, arr)
    let scale = relative ?  (lineChartHeight/(2*numAttack)) : STEP/4
    let barWidthUnit = plotWidth/maxVal;
    // Disegna le barre corrispondenti alle frequenze dei valori
    ctx.lineWidth = 7
    ctx.strokeStyle = 'yellow';

    for (let i = 0; i < frequencies.length; i++) {
        let freq = frequencies[i] || 0;  // Se il valore non esiste, usa 0
        let barWidth = freq * barWidthUnit;  // Altezza della barra in base alla frequenza 
        
        let yInit = lineChartY + lineChartHeight/2
        let yPos = yInit + i*scale - (numAttack-i)*scale

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


class Chart {

    constructor(xPos, yPos, width, height, ctx){
        this.x = xPos;
        this.y = yPos;
        this.width = width;
        this.height = height;
        this.ctx = ctx;
    }

    cleanChartArea(){
        this.ctx.clearRect(this.x, this.y, this.width, this.height);
    
    }   
    
    drawPlotChartArea() {
        this.ctx.strokeStyle = 'black';
        this.ctx.beginPath();
        this.ctx.rect(this.x, this.y, this.width, this.height);
        this.ctx.stroke();
    }

    
}

class Attacker {
    constructor(id, nserv) {
        // Fields
        this.id = id;
        this.step = 0;         // Represents the current step or action
        this.successesPerStep = Array.from({ length: nserv }, () => undefined);
        this.successes = 0
        this.color = 'grey'//getRandomColor();
    }

    // Method to increase step by 1 (or a specific amount)
    incrementStep(amount = 1) {
        this.step += amount;
        if (this.successesPerStep[this.step] === undefined) {
            this.successesPerStep[this.step] = 0;
        }
        this.successesPerStep[this.step] += this.successes;   
    }

    
    getCoords(nAtt = this.step, rel = false){

        if (this.successesPerStep[this.step] === undefined) {
            this.successesPerStep[this.step] =  0;
        }
        if(rel){
            if(nAtt==0)
                return {x : 0, y: 0}

            let insuccesses = nAtt - this.successesPerStep[nAtt]
            let relFactor = (this.successesPerStep[nAtt]/nAtt)*lineChartHeight/2 - (insuccesses/nAtt) * lineChartHeight/2;


            return {x : nAtt * STEP, y: relFactor}
        }
        return {x : nAtt * STEP, y: this.successesPerStep[nAtt]*STEP/4 - (nAtt-this.successesPerStep[nAtt])*(STEP/4)}
    }

    // Method to record a success (increment successes by 1 or a specific amount)
    recordSuccess(amount = 1) {
        this.successes+=amount;
    }
}
// function drawTrajectory(ctx, attacker){
//     let baseX = lineChartX; // Inizia dal rettangolo del line chart
//     let baseY = lineChartY+ lineChartHeight/2;
//     ctx.lineWidth = lineWidth;
//     ctx.strokeStyle = attacker.color
//     for(let i =0 ; i<m; i++){

//         let coords = attacker.getCoords(i,false)
//         // console.log(coords.x/STEP, coords.y/(STEP/4), (coords.x)/STEP + 1, coords.y, attacker.step)

//         if(Math.random()>probability){       
//             drawLine(baseX+coords.x,baseY+coords.y,baseX+coords.x+STEP,baseY+coords.y-STEP/4, ctx);
//         }
//         else{
//             attacker.recordSuccess()
//             drawLine(baseX+coords.x,baseY+coords.y,baseX+coords.x+STEP,baseY+coords.y+STEP/4, ctx);
//         }
//         attacker.incrementStep()
//     }

// }

function drawTrajectory(ctx, attacker) {
    let baseX = lineChartX;
    let baseY = lineChartY + lineChartHeight / 2;
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = attacker.color;

    // Creiamo un nuovo oggetto Path2D per memorizzare il percorso della traiettoria
    let path = new Path2D();

    for (let i = 0; i < m; i++) {
        let coords = attacker.getCoords(i, false); //coordinate al tempo i
        
        let randomJump = (Math.random() > probability) ? -1 : 1; 
        if(randomJump > 0) 
            attacker.recordSuccess();

        let startX = baseX + coords.x;
        let startY = baseY + coords.y;
        
        let endX = startX + STEP;
        let endY = startY + (randomJump*(STEP/4));
        console.log((startX - baseX)/STEP, (startY - baseY)/(STEP/4), (endX - baseX)/STEP, (endY - baseY)/(STEP/4));
        drawPathLine(startX, startY, endX, endY, path);
        attacker.incrementStep();
    }
    return path
}


function drawTrajectoryRelative(ctx, attacker) {
    let baseX = lineChartX; // Coordinate base del grafico
    let baseY = lineChartY + lineChartHeight/2;
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = attacker.color;

    // Creiamo un nuovo Path2D per memorizzare il percorso della traiettoria
    let path = new Path2D();

    for (let i = 1; i <= m; i++) {
        // Otteniamo le coordinate relative al passo precedente (i-1) e al passo attuale (i)
        let prevCoords = attacker.getCoords(i - 1, true); // Coordinate al tempo i-1

        let randomJump = (Math.random() > probability) ? -1 : 1; 
        if (randomJump > 0) {
            attacker.recordSuccess(); // Registra un successo se l'attacco ha successo
        }

        // Aggiorniamo il passo dell'attaccante
        attacker.incrementStep();

        let currCoords = attacker.getCoords(i, true);     // Coordinate al tempo i
        // console.log(prevCoords, currCoords)
        // Calcoliamo le coordinate assolute a partire da baseX e baseY
        //come capire se andare verso l-alto o verso il basso
        let startX = baseX + prevCoords.x;
        let startY = baseY + (prevCoords.y); // Invertito per disegnare dal basso verso l'alto
        let endX = baseX + currCoords.x;
        let endY = baseY + (currCoords.y);   // Invertito per lo stesso motivo
        
        // Aggiungiamo la linea al percorso Path2D
        drawPathLine(startX, startY, endX, endY, path);
        // Simuliamo un attacco con probabilità di successo
    }

    // Disegniamo il percorso una volta che tutte le linee sono state aggiunte
    return path;
}


function createSinglePath(s) {
    
    currentPathNumber = s;
    const myPath = new Path2D();
    
    let sumOfJumps = 0;
    let previousY_Variate = y_Origin;

    myPath.moveTo(x_Origin, y_Origin);   //visualmente facciamo partire la path dall'origine

    for (let t = 1; t <= n; t++) {

        sumOfJumps += myRandomJump();
        let myProcessValue = myVariate(sumOfJumps, t);

        const ascissa_t = My2dUtilities.transformX(t / n, 0, 1, rectChart.x, rectChart.width);

        //const ascissa_t = My2dUtilities.transformX(t, 0, n, rectChart.x, rectChart.width);
        const ordinata = My2dUtilities.transformY(myProcessValue, myVariate_MinView, myProcessValue_Range, rectChart.y, rectChart.height);

        //scalino mantenendo quota precedente
        myPath.lineTo(ascissa_t, previousY_Variate);
        //salva quota per prossimo scalino
        previousY_Variate = ordinata;
        
        myPath.lineTo(ascissa_t, ordinata);
    }

    return myPath;

}


function reDrawTrajectories(ctx, paths, attackers, time){
    ctx.lineWidth = lineWidth;
    for(let i= 0 ; i<time; i++){
        ctx.strokeStyle = attackers[i].color;
        ctx.stroke(paths[i]);
    }
}


function drawTrajectoryStep(ctx, attackers){
    let baseX = lineChartX; // Inizia dal rettangolo del line chart
    let baseY = lineChartY+ lineChartHeight/2;
    ctx.lineWidth = lineWidth;
    attackers.forEach(element => {
        ctx.strokeStyle = element.color
        
        let coords = element.getCoords(true)
        // console.log(coords)
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

function drawPathLine(xi, yi, xf, yf, path){
    path.moveTo(xi,canvas.height-yi);
    path.lineTo(xf,canvas.height-yf);
}

// dev(n) = dev(n-1) + (x(n)- x(n-1))*(x(n)-mean(n))

