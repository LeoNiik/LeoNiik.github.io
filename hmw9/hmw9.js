let canvas;
let ctx;

function main() {
    // Get the canvas and context
    canvas = document.getElementById('canvas1');
    ctx = canvas.getContext('2d');

    // Set the canvas size
    // let format = 13/8;
    let width = 1400;
    let height = 600;
    // let height = width/format;
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
        text += `<input type="text" id="int${i}" value="${(100/intervals)}"placeholder="Insert value">`;
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
        values.push(Number(value));
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

    if (sum !== 100) {
        console.log(sum ,"The sum of the values must be 1");
        return;
    }

    values = values.map((elem)=>elem/100);

    //define coordinates of hist in variables
    let width = 5/10*canvas.width;
    let height = 8/10*canvas.height;
    let padding = {x : (canvas.width - width)/2, y : (canvas.height - height)/2};
    let y = padding.y;
    let x = padding.x;
    // let hist = new Histogram(x, y, width, height, ctx);

    nsamples = document.getElementById('nsamples').value || 1000;
    nvalues = document.getElementById('nvalues').value || 100;
    samples = new Array(nsamples);
    for (let i = 0; i < nsamples; i++) {
        samples[i] = generateFromDistribution(values, nvalues);
    }

    //means and deviances of the samples
    let means = [];
    let devs = [];
    

    //calculate the mean and the deviation for each sample
    for (let s of samples) {
        let { mean, variance } = welfordVariance(s);
        means.push(mean.toFixed(4));
        devs.push(variance.toFixed(4));
    }

    //variance of the means and devs
    let meanStats = welfordVariance(means);
    let devStats = welfordVariance(devs);

    //Determine the distribution of the variances 
    let devDist = count(devs);
    let devIntervals = 10; 
    console.log(devDist);
    //not use x, y
    // Assuming devDist is an object with variance values as keys and their counts as values
    let a = Object.keys(devDist).map(Number); // Convert keys to numbers
    let b = Object.values(devDist);          // Get counts

    // Get min and max from 'a' for range calculation
    let max = Math.max(...a);
    let min = Math.min(...a);

    // Divide the range into `devIntervals` equal parts
    let constant = (max - min) / devIntervals; // Interval width
    let intervalBounds = [];                   // To store interval boundaries

    for (let i = 0; i <= devIntervals; i++) {
        intervalBounds.push(min + i * constant); // Create intervals
    }


    let val = []; // To store which interval each variance falls into

    for (let i = 0; i < a.length; i++) {
        let variance = a[i];
        let count = b[i];

        // Find which interval the variance falls into
        let intervalIndex = -1; // Default if no interval is found
        for (let j = 0; j < intervalBounds.length - 1; j++) {
            if (variance >= intervalBounds[j] && variance < intervalBounds[j + 1]) {
                intervalIndex = j; // Assign interval index
                break;
            }
        }

        // Handle edge case where variance equals max
        if (variance === max) {
            intervalIndex = devIntervals - 1;
        }

        if (intervalIndex !== -1) {
            val[intervalIndex] = count || undefined; // Initialize if not exists
            // val.push({ interval: intervalIndex + 1, count: count }); // Store interval and count
        } else {
            console.warn(`Variance ${variance} did not fit into any interval`);
        }
    }


    let labels = []; 
    for(let i = 0 ; i < intervalBounds.length -1; i++){
        labels.push(`[${intervalBounds[i].toFixed(5)}-${intervalBounds[i+1].toFixed(5)}]`);
    }
    console.log(val, labels);
    //plot the histogram of the variances
    let hist = new Histogram(x, y, width, height, ctx);
    hist.plotHorizontal(val, devIntervals, labels);
    


    

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

function welfordVariance(arr) {
    let mean = 0;
    let M2 = 0;  // Sum of squared differences
    let n = 0;   // Count of elements
    for (let x of arr) {
        
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
    plotHorizontal = (frequencies, intervals, labels = undefined) => {
    
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
            console.log(labels[i]);
            if(labels === undefined) continue;
            this.ctx.font = "20px Arial";
            this.ctx.fillStyle = 'black';
            this.ctx.fillText(labels[i] || "~", this.x - 200, this.height - (yPlot - yIntervals/2 - this.ctx.lineWidth));
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

