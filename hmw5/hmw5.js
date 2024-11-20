


var n = 5
var m = 10
var STEP;
// var canvas;

let probability;
let ctx;
let ctx2;
//result vector
var attackersSuccesses;

let parameters = {}
// number of intervals


//Graphics widths and heights
var PADDING = 50;
var plotWidth = 100;
var plotHeight = 500;
var lineChartWidth = 1000;
var lineChartHeight = 500;

var N = lineChartWidth/10;
var lambda = (1)/N;

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

function ChangeInterface(value){
    parameters = {};
    let setParams = [];
    switch (value) {
        case "bernoulli":
            //PARAMETERS ARE p(probabilty)
            setParams = ["attackers", "intervals", "time", "probability"];
        
            break;
        case "poisson":
            //PARAMETERS ARE lambda(probabilty),
            setParams = ["attackers", "intervals", "time", "lambda"];
        
            break;
        default:
            break;

    }
    const sliderdivs = document.querySelectorAll('.slidecontainer');
    for (const sliderdiv of sliderdivs) {
        let slider = sliderdiv.querySelector('.slider');
        let sliderValue = sliderdiv.querySelector('.sliderlabel');

        //if i dont need the parameter dont show the slider
        if(!setParams.includes(slider.id)){

            sliderdiv.style.display = "none";
        }else{
            sliderdiv.style.display = "block";
            sliderValue.textContent = slider.value;
            parameters[slider.id] = slider.value;
            if(slider.id === "intervals"){
                //intervals max is half of the linechart width
                slider.max = lineChartWidth/2;

                //time slider is 2/3 of the intervals
                let timesliderdiv = document.getElementById("timeslider");
                let timeSlider = timesliderdiv.querySelector('.slider');
                let timeLabel = timesliderdiv.querySelector('.sliderlabel');
                timeSlider.max = Math.floor(Number(slider.value)*2/3).toString();
                timeSlider.value = Math.floor(Number(slider.value)/3).toString();
                

                // parameters["lambda"] = Number(parameters["intervals"])/2;

                //update the parameter time
                parameters["time"] = timeSlider.value;
                timeLabel.textContent = timeSlider.value; 
            }
        }

    }        
            
}

// Function to add event listeners to the radio buttons
function simChoiceListeners()
{
    const radioButtons = document.querySelectorAll('.radio-box input[type="radio"][name="sim"]');
    for( let button of radioButtons){
            let value = button.value;
            button.addEventListener("change",() => ChangeInterface(value));
    }
}

document.addEventListener('DOMContentLoaded', async (event) => {
    const sliderdivs = document.querySelectorAll('.slidecontainer');
    
    simChoiceListeners();
    ChangeInterface("poisson");
    // Aggiorna il valore del label quando lo slider cambia
    sliderdivs.forEach(sliderdiv => {
        let slider = sliderdiv.querySelector('.slider');
        let sliderValue = sliderdiv.querySelector('.sliderlabel');

        slider.addEventListener('input', function() {
            sliderValue.textContent = slider.value;
            parameters[slider.id] = slider.value;
            if(slider.id === "lambda"){
                slider.max = Number(parameters["intervals"]);
            }
            if(slider.id === "intervals"){
                let timesliderdiv = document.getElementById("timeslider");
                let timeSlider = timesliderdiv.querySelector('.slider');
                let timeLabel = timesliderdiv.querySelector('.sliderlabel');
                timeSlider.max = Math.floor(Number(slider.value)*2/3).toString();
                timeSlider.value = Math.floor(Number(slider.value)/3).toString();
                parameters["time"] = timeSlider.value;
                timeLabel.textContent = timeSlider.value; 
            } 
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
    DrawAxis(ctx);



});

// Function to initialize the attackers
function initializeAttackers(n,m) {
    const attackers = [];
    for (let i = 0; i < n; i++) {
        attackers.push(new Attacker(i,Number(m)+1));
    }
    return attackers;
}

// Function to calculate mean and variance using Welford's method
function welfordVariance(arr, mode) {
    let mean = 0;
    let M2 = 0;  // Sum of squared differences
    let n = 0;   // Count of elements
    let atStep = arr.length;
    for (let x of arr) {

        if(mode === "rel") 
            x = 1/atStep * (x);
        if(mode === "norm")
            x = 1/Math.sqrt(atStep) * (x);

        
        n += 1;
        let delta = x - mean;       // Difference between current element and mean
        mean += delta / n;          // Update mean
        let delta2 = x - mean;      // Difference after updating the mean
        M2 += delta * delta2;       // Update the sum of squared differences
    }

    // Variance is M2 divided by the number of elements
    let variance = M2 / n;

    return { mean, variance };
}


async function sim(){
    let ctx = canvas.getContext('2d');
    // console.log(ctx);    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#000000'
    // let timeSlider = document.getElementById('') 
    n = Number(parameters["attackers"]) || 50;
    t = Number(parameters["time"]) || 16;
    lambda = Number(parameters["lambda"]);
    N = Number(parameters["intervals"]);
    if(parameters["lambda"] === undefined)
        probability = Number(parameters["probability"])/100; 
    else 
        probability = lambda/N;
    console.log(parameters);
    
    let selectedMode = document.querySelector('input[name="mode"]:checked').value;
    let selectedSim = document.querySelector('input[name="mode"]:checked').value;

    let sim = selectedSim;
    let mode = selectedMode;

    //define the step
    STEP = lineChartWidth/N;

    // console.log(mode, sim);
    DrawAxis(ctx);

    let attackers = initializeAttackers(n,N);
    let AllPaths = []
    attackersSuccesses = []
    
    for(let i = 0;i<n; i++){
        
        let newPath = drawTrajectoryRelative(ctx, attackers[i], mode);
        AllPaths.push(newPath);
        ctx.stroke(newPath);
        
    }

    let statistics = plotHistograms(ctx, attackers, N, t, mode);
    console.log(statistics);
    let statsTimet = statistics[t];
    document.getElementById('meant').innerText = statsTimet.mean.toFixed(5);
    document.getElementById('variancet').innerText = statsTimet.variance.toFixed(5);
    
    
    let statsTimen = statistics[N];
    document.getElementById('mean').innerText = statsTimen.mean.toFixed(5);
    document.getElementById('variance').innerText = statsTimen.variance.toFixed(5);
    return;

}

function plotHistograms(ctx, attackers, nIntervals, t, mode) {
    
    let histTimeT = new Histogram(STEP * t + lineChartX, plotChartY, plotWidth, plotHeight, ctx);
    let successesTimeT = getAttackersSuccessesAtStep(attackers, t);

    histTimeT.plotEMS(count(successesTimeT), mode, t);
    
    let histTimeN = new Histogram(STEP * N + lineChartX, plotChartY, plotWidth, plotHeight, ctx);
    let successesTimeN = getAttackersSuccessesAtStep(attackers, N);
    let countTimeN = count(successesTimeN);
    

    histTimeN.plotEMS(countTimeN, mode, nIntervals);
    return getStatistics([successesTimeT, successesTimeN], mode, [t, N]);
}


function getStatistics(successes, mode, time){
    //time is list of steps
    //successes is a list of lists of successes

    let stats = {};
    console.assert(successes.length === time.length, "The number of successes and the number of steps must be the same");
    for (let i = 0; i < successes.length; i++) {
        const element = successes[i];
        stats[time[i]] = welfordVariance(element, mode);
    }

    return stats;
}

function getAttackersSuccessesAtStep(attackers, atStep){
    let attackersSuccesses = [];
    attackers.forEach(element => {
        let val = element.successesPerStep[atStep];
        if(val !== undefined){
            
            attackersSuccesses.push(val);
        }
    });
    return attackersSuccesses;
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

//Future implementation
class Chart {

    constructor(xPos, yPos, width, height, ctx){
        this.x = xPos;
        this.y = yPos;
        this.width = width;
        this.height = height;
        this.ctx = ctx;
    }
    

    cleanChartArea(){
        // this.ctx.strokeStyle = '';
        this.ctx.fillStyle = 'white';
        // this.ctx.clearRect(this.x, this.y, this.width, this.height);
        this.ctx.fillRect(this.x, this.y, this.width, this.height);
    }   
    
    drawChartArea() {
        this.ctx.strokeStyle = 'black';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.rect(this.x, this.y, this.width, this.height);
        this.ctx.stroke();
        this.ctx.closePath();
        }   
}

class Histogram extends Chart {

    constructor(xPos, yPos, width, height, ctx) {
        super(xPos,yPos,width, height, ctx)
    }

    //
    plotHorizontal = (frequencies, scaleFactor, intervals) => {
    
        let maxVal = arrMax(frequencies); //find the maximum
        let barWidthUnit = (this.width)/maxVal;
        // let xPlot = this.xPos + numAttack*step;    

        //clean chart area
        
        this.cleanChartArea();
        this.drawChartArea();

        for (let i = 0; i < intervals; i++) {
            
            let freq = frequencies[i] || 0;  // Se il valore non esiste, usa 0
            let barWidth = freq * barWidthUnit;  // Altezza della barra in base alla frequenza 

            let yIntervals = this.height/intervals;

            let yInit =  - this.y + yIntervals; //still wondering why i have to subtract the y
            
            let yPlot = yInit + i*yIntervals;
            
            this.ctx.fillStyle = 'yellow';
            // console.log("yplot", yPlot,"yInit", yIni t);
            

            //INTERVALS LINES 
            // let intLines = new Path2D();
            // this.ctx.strokeStyle = 'black';
            // drawPathLine(this.x, yPlot, this.x + this.width, yPlot, intLines, this.height); 
            // this.ctx.stroke(intLines);
            
            let path = new Path2D();
            this.ctx.lineWidth = 7;
            this.ctx.strokeStyle = 'yellow';
            drawPathLine(this.x, yPlot - yIntervals/2 - this.ctx.lineWidth, this.x + barWidth, yPlot - yIntervals/2 - this.ctx.lineWidth, path, this.height);
            this.ctx.stroke(path);
            // drawRect(this.x, (yPlot - yIntervals/2 + yIntervals/4)*scaleFactor, barWidth, yIntervals/2, this.ctx, this.height);
            // break;
        }
    }
    //function to plot the vertical histogram
    plotVertical(frequencies, scaleFactor, step){
        let maxVal = arrMax(frequencies); //find the maximum
        let barWidthUnit = (this.height-1)/maxVal;
        // let xPlot = this.xPos + numAttack*step;    
        
        ctx.lineWidth = 7;
        ctx.strokeStyle = 'yellow';
        let Histogram = [];

        for (let i = 0; i < frequencies.length; i++) {

            let freq = frequencies[i] || 0;  // Se il valore non esiste, usa 0
            let barWidth = freq * barWidthUnit;  // Altezza della barra in base alla frequenza 
            let xInit = this.xPos + this.width/2
            let xPlot = xInit + i*scaleFactor - (numAttack-i)*scaleFactor
            let entry = new Path2D();
            
            drawPathLine(xPlot, this.yPos, xPlot, this.yPos + barWidth , entry, canvas.height);
            Histogram.push(entry);
            ctx.stroke(entry);
        }
        return Histogram;
    }

    plotEMS(frequencies,mode, nsteps){
            //cleans and redraw the area
        this.cleanChartArea();
        this.drawChartArea();

        let maxVal = arrMax(frequencies); //find the maximum
        
        let scaleFactor = STEP/4;

        if(mode === "rel")
            scaleFactor = (this.height/(2*nsteps));
        if(mode === "norm")
            scaleFactor = Math.sqrt(this.height)/(2*Math.sqrt(nsteps));

        let barWidthUnit = (this.width-1)/maxVal;
        let xPos = this.x;

        let Histogram = [];
        this.ctx.lineWidth = 7;
        this.ctx.strokeStyle = 'yellow';

        for (let i = 0; i < frequencies.length; i++) {

            let freq = frequencies[i] || 0;  // Se il valore non esiste, usa 0
            let barWidth = freq * barWidthUnit;  // Altezza della barra in base alla frequenza 
            
            let yInit = -this.y + lineChartHeight/2;
            let yPos = yInit + i*scaleFactor - (nsteps-i)*scaleFactor
            let entry = new Path2D();
            console.log("ypos", yPos, "xpos", xPos);
            drawPathLine(xPos, yPos,xPos + barWidth, yPos , entry, this.height);
            Histogram.push(entry);
            this.ctx.stroke(entry);
        }
        return Histogram;
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

    
    getCoords(nAtt = this.step, mode = "abs"){

        if (this.successesPerStep[this.step] === undefined) {
            this.successesPerStep[this.step] =  0;
        }

        
        let scaleFactor = STEP/4;
        if(mode === "rel")
            scaleFactor = (lineChartHeight/(2*nAtt)); 
        if(mode === "norm")
            scaleFactor = (Math.sqrt(lineChartHeight)/(2*Math.sqrt(nAtt)));  // 1/nAtt relative frequency // 1/sqrt(nAtt)

        if(nAtt==0)
            return {x : 0, y: 0}

        return {x : nAtt * STEP, y: this.successesPerStep[nAtt]*scaleFactor - (nAtt-this.successesPerStep[nAtt])*scaleFactor}
    }

    // Method to record a success (increment successes by 1 or a specific amount)
    recordSuccess(amount = 1) {
        this.successes+=amount;
    }
}

function drawTrajectoryRelative(ctx, attacker, mode) {

    let baseX = lineChartX; // Coordinate base del grafico
    let baseY = lineChartY + lineChartHeight/2;
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = attacker.color;

    // Creiamo un nuovo Path2D per memorizzare il percorso della traiettoria
    let path = new Path2D();

    for (let i = 1; i <= N; i++) {
        
        let prevCoords = attacker.getCoords(i - 1, mode); // Coordinate al tempo i-1
        let randomJump = (Math.random() > probability) ? -1 : 1; 
        if (randomJump > 0) {
            attacker.recordSuccess(); // Registra un successo se l'attacco ha successo
        }
        // Aggiorniamo il passo dell'attaccante
        attacker.incrementStep();

        let currCoords = attacker.getCoords(i, mode);     // Coordinate al tempo i

        let startX = baseX + prevCoords.x;
        let startY = baseY + (prevCoords.y); // Invertito per disegnare dal basso verso l'alto
        let endX = baseX + currCoords.x;
        let endY = baseY + (currCoords.y);   // Invertito per lo stesso motivo
        drawPathLine(startX, startY, endX, endY, path, canvas.height);
    }

    return path;
}


function reDrawTrajectories(ctx, paths, attackers, time){
    ctx.lineWidth = lineWidth;
    for(let i= 0 ; i<time; i++){
        ctx.strokeStyle = attackers[i].color;
        ctx.stroke(paths[i]);
    }
}

function drawLine(xi, yi, xf, yf, ctx){
    ctx.beginPath();

    ctx.moveTo(xi,canvas.height-yi);
    ctx.lineTo(xf,canvas.height-yf);

    // Draw the Path
    ctx.stroke();
    ctx.closePath();
}

function drawRect(x, y, rwidth, rheight, ctx, canvaheight){
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'yellow';
    //invert y
    ctx.fillRect(x, canvaheight - y, rwidth, rheight);
}

function drawPathLine(xi, yi, xf, yf, path, height){
    path.moveTo(xi, height-yi);
    path.lineTo(xf, height-yf);
}

// dev(n) = dev(n-1) + (x(n)- x(n-1))*(x(n)-mean(n))

