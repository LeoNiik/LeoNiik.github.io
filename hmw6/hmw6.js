

function main() {
    // Get the canvas and context
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    // Set the canvas size
    let format = 16/9;
    let width = 800;
    let height = width/format;
    //no canvas border
    canvas.width = width;
    canvas.height = height;
    canvas.style.border = '0px';


    let intervals = document.getElementById('intervals').value;

    //for the value of intervals we have to check if it is a number
    if (isNaN(intervals)) {
        console.log(intervals, "Please insert a number");
        return;
    }

    // create intervals text inputs

    let text = '';
    for (let i = 0; i < intervals; i++) {
        text += `<input type="text" id="int${i}" value="${(1/intervals).toFixed(2)}"placeholder="Insert value">`;
    }
    document.getElementById('inputs').innerHTML = text;
    //wait for the user to insert the values
    document.getElementById('inputs').innerHTML += '<button onclick="generate()">Generate</button>';
}
function generate() {
    
    // take the values of the intervals
    let values = [];
    let intervals = document.getElementById('intervals').value;
    for (let i = 0; i < intervals; i++) {
        let value = document.getElementById(`int${i}`).value;
        values.push(parseFloat(value));
    }
    //assert that the values are numbers and sums up to 1
    let sum = 0;
    for (let i = 0; i < intervals; i++) {
        if (isNaN(values[i])) {
            console.log(`interval ${i}`,"Please insert a number");
            return;
        }
        sum += values[i];
    }

    if (sum !== 1.0) {
        console.log(sum ,"The sum of the values must be 1");
        return;
    }

    // create new histogram
    //define coordinates of hist in variables
    let width = 9/10*canvas.width;
    let height = 9/10*canvas.height;
    let padding = {x : (canvas.width - width)/2, y : (canvas.height - height)/2};
    let y = padding.y;
    let x = padding.x;
    let hist = new Histogram(x, y, width, height, ctx);
    let result = generateFromDistribution(values, 1000);
    console.log(values);
    
    hist.plotHorizontal(count(result), 1, intervals);

}

function generateFromDistribution(distribution, n){
    let values =[];
    let cdf = []
    let cf = 0;
    for (let i = 0; i < distribution.length; i++) {
        const element = distribution[i];
        cdf.push(cf = cf + element);
    }
    //generate n numbers
    for (let i = 0; i < n; i++) {
        let rand = Math.random();

        if(rand < cdf[0]){
            values.push(0);
            continue;
        }
        for (let j = 0; j < cdf.length; j++) {
            if(rand > cdf[j] && rand < cdf[j+1])
            {
                values.push(j+1);
                break; 
            }
        }
        // console.log(rand.toFixed(2), values[values.length-1]);
    }
    // plotFrequencyDistribution(values, 10, 'abs');
    return values;
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

    // Function to plot the vertical histogram
    plotVertical(frequencies, scaleFactor, intervals) {
        let maxVal = arrMax(frequencies); // Find the maximum
        let barHeightUnit = (this.height) / maxVal;

        // Clean chart area
        this.cleanChartArea();
        this.drawChartArea();

        for (let i = 0; i < intervals; i++) {
            let freq = frequencies[i] || 0;  // If the value does not exist, use 0
            let barHeight = freq * barHeightUnit;  // Height of the bar based on the frequency

            let xIntervals = this.width / intervals;
            let xInit = this.x + xIntervals; // Initial x position

            let xPlot = xInit + i * xIntervals;

            let path = new Path2D();
            this.ctx.lineWidth = 7;
            this.ctx.strokeStyle = 'yellow';
            drawPathLine(xPlot - xIntervals / 2 - this.ctx.lineWidth, this.y + this.height, xPlot - xIntervals / 2 - this.ctx.lineWidth, this.y + this.height - barHeight, path, this.height);
            this.ctx.stroke(path);
        }
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

