// Ball object - multiple balls can be created by instantiating new objects
function Ball(svg, x, y, id, color, aoa, weight, link, logo) {
    this.posX = x; // cx
    this.posY = y; // cy
    this.color = color;
    this.radius = weight; // radius and weight same
    this.jumpSize = 1; // equivalent of speed default to 1
    this.svg = svg; // parent SVG
    this.id = id; // id of ball
    this.aoa = aoa; // initial angle of attack
    this.weight = weight;
    this.link = link;
    this.logo = logo;

    if (!this.aoa)
        this.aoa = Math.PI / 7;
    if (!this.weight)
        this.weight = 10;
    this.radius = this.weight;

    this.data = [this.id]; // allow us to use d3.enter()
    this.logodata = [this.id + 'logo'];
    this.logoid = this.id + 'logo';
    this.linkdata = [this.id + 'link'];
    this.linkid = this.id + 'link';

    var thisobj = this; // i like to use thisobj instead of this. this many times not reliable particularly handling evnet

    // **** aoa is used only here -- earlier I was using to next move position.
    // Now aoa and speed together is velocity 
    this.vx = Math.cos(thisobj.aoa) * thisobj.jumpSize; // velocity x
    this.vy = Math.sin(thisobj.aoa) * thisobj.jumpSize; // velocity y
    this.initialVx = this.vx;
    this.initialVy = this.vy;
    this.initialPosX = this.posX;
    this.initialPosY = this.posY;

    // when speed changes, go to initial setting
    this.GoToInitialSettings = function (newjumpSize) {
        thisobj.posX = thisobj.initialPosX;
        thisobj.posY = thisobj.initialPosY;
        thisobj.vx = Math.cos(thisobj.aoa) * newjumpSize; // velocity x
        thisobj.vy = Math.sin(thisobj.aoa) * newjumpSize; // velocity y
        thisobj.Draw();
    }

    this.Draw = function () {
        var svg = thisobj.svg;

        var ball = svg.selectAll('#' + thisobj.id)
                    .data(thisobj.data)
        ;
        
        
        ball.enter()
        	.append("a")
    		.attr("xlink:href", thisobj.link)
        	.append("svg:image")
        	.attr("id", thisobj.id)
			.attr("xlink:href", thisobj.logo)
            //.style("fill", thisobj.color)
        ;
        
        ball
            //.transition()//.duration(50)
            .attr("x", thisobj.posX - thisobj.radius)
        	.attr("y", thisobj.posY - thisobj.radius)
			.attr('width', thisobj.radius*2)
			.attr('height', thisobj.radius*2)
        ;
		// Text
        /*
        var text = svg.selectAll('#' + thisobj.textid)
                    .data(thisobj.textdata)
        ;
        svg.select("#"+thisobj.textid).remove();
        svg
        	.append("svg:text")
        	.attr("x", thisobj.posX)
        	.attr("y", thisobj.posY)
        	.attr("id", thisobj.textid)
        	.attr("text-anchor", "middle")
            .text(function(d){return "Resume"})
            .style("fill", "black")
        ;
        */

        
    }
    
    this.Move = function () {
        var svg = thisobj.svg;

        //thisobj.posX += Math.cos(thisobj.aoa) * thisobj.jumpSize;
        //thisobj.posY += Math.sin(thisobj.aoa) * thisobj.jumpSize;

        thisobj.posX += thisobj.vx;
        thisobj.posY += thisobj.vy;

        if (parseInt(svg.attr('width')) <= (thisobj.posX + thisobj.radius)) {
            thisobj.posX = parseInt(svg.attr('width')) - thisobj.radius - 1;
            thisobj.aoa = Math.PI - thisobj.aoa;
            thisobj.vx = -thisobj.vx;
        }

        if ( thisobj.posX < thisobj.radius) {
            thisobj.posX = thisobj.radius+1;
            thisobj.aoa = Math.PI - thisobj.aoa;
            thisobj.vx = -thisobj.vx;
        }

        if (parseInt(svg.attr('height')) < (thisobj.posY + thisobj.radius)) {
            thisobj.posY = parseInt(svg.attr('height')) - thisobj.radius - 1;
            thisobj.aoa = 2 * Math.PI - thisobj.aoa;
            thisobj.vy = -thisobj.vy;
        }

        if (thisobj.posY < thisobj.radius) {
            thisobj.posY = thisobj.radius+1;
            thisobj.aoa = 2 * Math.PI - thisobj.aoa;
            thisobj.vy = -thisobj.vy;
        }

        // **** NOT USING AOA except during initilization. Just left this for future reference ***** 
        if (thisobj.aoa > 2 * Math.PI)
            thisobj.aoa = thisobj.aoa - 2 * Math.PI;
        if (thisobj.aoa < 0)
            thisobj.aoa = 2 * Math.PI + thisobj.aoa;

        thisobj.Draw();

    }
    
    
}


function CheckCollision(ball1, ball2) {
    var absx = Math.abs(parseFloat(ball2.posX) - parseFloat(ball1.posX));
    var absy = Math.abs(parseFloat(ball2.posY) - parseFloat(ball1.posY));

    // find distance between two balls.
    var distance = (absx * absx) + (absy * absy);
    distance = Math.sqrt(distance);
    // check if distance is less than sum of two radius - if yes, collision
    if (distance < (parseFloat(ball1.radius) + parseFloat(ball2.radius))) {
        return true;
    }
    return false;
}


var balls = []; // global array representing balls
var color = d3.scale.category20();


function ProcessCollision(ball1, ball2) {

    if (ball2 <= ball1)
        return;
    if (ball1 >= (balls.length-1) || ball2 >= balls.length )
        return;

    ball1 = balls[ball1];
    ball2 = balls[ball2];

    if ( CheckCollision(ball1, ball2) ) {
        // intersection point
        var interx = ((ball1.posX * ball2.radius) + ball2.posX * ball1.radius)
        / (ball1.radius + ball2.radius);
        var intery = ((ball1.posY * ball2.radius) + ball2.posY  * ball1.radius)
        / (ball1.radius + ball2.radius);

        // show collision effect for 500 miliseconds
        var intersectBall = svg.select('#' + ball1.id + '_intersect');
        intersectBall.attr({ 'cx': interx, 'cy': intery, 'r': 5 ,'fill': 'black' })
                    .transition()
                    .duration(500)
                    .attr('r', 0);

        // calculate new velocity of each ball.
        var vx1 = (ball1.vx * (ball1.weight - ball2.weight)
            + (2 * ball2.weight * ball2.vx )) / (ball1.weight + ball2.weight);
        var vy1 = (ball1.vy * (ball1.weight - ball2.weight)
            + (2 * ball2.weight * ball2.vy)) / (ball1.weight + ball2.weight);
        var vx2 = (ball2.vx * (ball2.weight - ball1.weight)
            + (2 * ball1.weight * ball1.vx)) / (ball1.weight + ball2.weight);
        var vy2 = (ball2.vy * (ball2.weight - ball1.weight)
            + (2 * ball1.weight * ball1.vy)) / (ball1.weight + ball2.weight);

        //set velocities for both balls
        ball1.vx = vx1;
        ball1.vy = vy1;
        ball2.vx = vx2;
        ball2.vy = vy2;

        //ensure one ball is not inside others. distant apart till not colliding
        while (CheckCollision(ball1, ball2)) {
            ball1.posX += ball1.vx;
            ball1.posY += ball1.vy;

            ball2.posX += ball2.vx;
            ball2.posY += ball2.vy;
        }
        ball1.Draw();
        ball2.Draw();
    }
}
function Initialize(containerId) {
    var height = document.getElementById(containerId).clientHeight;
    var width = document.getElementById(containerId).clientWidth;
    gContainerId = containerId;
    gCanvasId = containerId + '_canvas';
    gTopGroupId = containerId + '_topGroup';
    var svg = d3.select("#" + containerId).append("svg")
        .attr("id", gCanvasId)
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("id", gTopGroupId)
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", width)
        .attr("height", height)
        //.style("fill", "none")
    //.attr("transform", "translate(" + 1 + "," + 1 + ")")
    ;
    
    balls.push(new Ball(svg, Math.random()*width, Math.random()*height, 'n0', 'DimGray', Math.PI / Math.random()*3,50, "https://github.com/mogryzko/","https://cdn.freebiesupply.com/logos/large/2x/github-icon-logo-png-transparent.png"));
    balls.push(new Ball(svg, Math.random()*width, Math.random()*height, 'n1', 'DimGray', Math.PI / Math.random()*3,50, "https://www.slideshare.net/slideshow/embed_code/key/MFwhazQ1VHL9QC","https://cdn2.iconfinder.com/data/icons/project-management-16/48/30-512.png"));
    balls.push(new Ball(svg, Math.random()*width, Math.random()*height, 'n2', 'DimGray', Math.PI / Math.random()*3,50, "https://www.linkedin.com/in/mogryzko/","https://www.pinclipart.com/picdir/big/221-2213428_other-linkedin-icon-png-transparent-background-images-instagram.png"));
    balls.push(new Ball(svg, Math.random()*width, Math.random()*height, 'n3', 'DimGray', Math.PI / Math.random()*3,50, "mailto:m.ogryzko@columbia.com","https://www.pinclipart.com/picdir/big/123-1236933_envelope-message-send-mail-packet-letter-email-email.png"));
    

    for (var i = 0; i < balls.length; ++i) {
        balls[i].Draw();
    }
    return svg;
}

var startStopFlag = null;
function StartStopGame() {
    if (startStopFlag == null) {
        d3.timer(function () {
            for (var i = 0; i < balls.length; ++i) {
                var r = balls[i].Move();
                for (var j = i + 1; j < balls.length; ++j) {
                    ProcessCollision(i, j);
                }
            }
            if (startStopFlag == null)
                return true;
            else
                return false;
        }, 500);
        startStopFlag = 1;
        //document.getElementById('startStop').innerHTML = 'Stop';
    }
    else {
        startStopFlag = null;
        //document.getElementById('startStop').innerHTML = 'Start';
    }
}
// I always like to handle ESC key
d3.select('body')
        .on('keydown', function () {
            if (balls.length == 0)
                return;
            console.log(d3.event);
            if (d3.event.keyCode == 27) { // if ESC key - toggle start stop
                StartStopGame();
            }
        });


function OnSpeedChange() {
    var o = document.getElementById('speed');
    if (startStopFlag != null)
        startStopFlag = null; // by setting startStopFlag to null, callback of d3.timer will return true and animation will stop

    setTimeout(function () { // go to initial position set new speed (ideally should not go to initial position)
        for (var i = 0; i < balls.length; ++i) {
            var o = document.getElementById('speed');
            newjumpSize = o.options[o.selectedIndex].value;
            balls[i].GoToInitialSettings(parseInt(newjumpSize));
        }
        setTimeout(function () {
            StartStopGame();
        }, 1000);
    }, 500);
}
function OnNumberOfBallsChanged() {
    var o = document.getElementById('numberOfBalls');
    numberOfBalls = o.options[o.selectedIndex].value;
    balls = balls.slice(0, 6);

    d3.selectAll('.ball').remove();
    //keep pushing as many balls you want..
    for (var i = 6; i < numberOfBalls; ++i) {
        balls.push(new Ball(svg, 101, 101, 'n'+(i+1).toString(), color(i), Math.PI / (i+1), (i%2)==0?10 : (10+i)));
    }
}



var svg = Initialize('chart');
StartStopGame();
// Draw for the first time to initialize.
	//redraw();
// Redraw based on the new size whenever the browser window is resized.
//window.addEventListener("resize", Initialize('chart'));
