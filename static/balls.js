// Ball object - multiple balls can be created by instantiating new objects
function Ball(svg, x, y, id, color, aoa, weight, link, logo) {
    this.posX = x; // cx
    this.posY = y; // cy
    this.color = color;
    this.radius = weight; // radius and weight same
    this.jumpSize = 2; // equivalent of speed default to 1
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
    this.element = null; // Store reference to DOM element

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

        // Only create the element if it doesn't exist yet
        if (!thisobj.element) {
            var ball = svg.selectAll('#' + thisobj.id)
                        .data(thisobj.data);
            
            var link = ball.enter()
                .append("a")
                .attr("xlink:href", thisobj.link)
                .attr("target", "_blank"); // Open link in a new tab
            
            link.append("svg:image")
                .attr("id", thisobj.id)
                .attr("xlink:href", thisobj.logo);
            
            thisobj.element = svg.select('#' + thisobj.id);
        }
        
        // Just update position without transitions
        thisobj.element
            .attr("x", thisobj.posX - thisobj.radius)
            .attr("y", thisobj.posY - thisobj.radius)
            .attr('width', thisobj.radius*2)
            .attr('height', thisobj.radius*2);
    }
    
    this.Move = function () {
        // Update position
        thisobj.posX += thisobj.vx;
        thisobj.posY += thisobj.vy;

        // Get width and height once to avoid repeated DOM access
        var width = parseInt(svg.attr('width'));
        var height = parseInt(svg.attr('height'));

        // Handle boundary collisions
        if (width <= (thisobj.posX + thisobj.radius)) {
            thisobj.posX = width - thisobj.radius - 1;
            thisobj.vx = -thisobj.vx;
        }

        if (thisobj.posX < thisobj.radius) {
            thisobj.posX = thisobj.radius + 1;
            thisobj.vx = -thisobj.vx;
        }

        if (height < (thisobj.posY + thisobj.radius)) {
            thisobj.posY = height - thisobj.radius - 1;
            thisobj.vy = -thisobj.vy;
        }

        if (thisobj.posY < thisobj.radius) {
            thisobj.posY = thisobj.radius + 1;
            thisobj.vy = -thisobj.vy;
        }

        // Only update the DOM when we need to
        thisobj.Draw();
    }
}

// Optimize collision detection with a faster distance calculation
function CheckCollision(ball1, ball2) {
    var dx = ball2.posX - ball1.posX;
    var dy = ball2.posY - ball1.posY;
    
    // Use squared distance to avoid expensive sqrt operation
    var distanceSquared = dx * dx + dy * dy;
    var radiusSum = ball1.radius + ball2.radius;
    
    // Compare squared distances
    return distanceSquared < (radiusSum * radiusSum);
}

var balls = []; // global array representing balls
var color = d3.scale.category20();
var lastFrameTime = 0;
var frameInterval = 16; // ~60fps

function ProcessCollision(ball1, ball2) {
    if (ball2 <= ball1)
        return;
    if (ball1 >= (balls.length-1) || ball2 >= balls.length)
        return;

    ball1 = balls[ball1];
    ball2 = balls[ball2];

    if (CheckCollision(ball1, ball2)) {
        // Calculate new velocities of each ball
        var vx1 = (ball1.vx * (ball1.weight - ball2.weight)
            + (2 * ball2.weight * ball2.vx)) / (ball1.weight + ball2.weight);
        var vy1 = (ball1.vy * (ball1.weight - ball2.weight)
            + (2 * ball2.weight * ball2.vy)) / (ball1.weight + ball2.weight);
        var vx2 = (ball2.vx * (ball2.weight - ball1.weight)
            + (2 * ball1.weight * ball1.vx)) / (ball1.weight + ball2.weight);
        var vy2 = (ball2.vy * (ball2.weight - ball1.weight)
            + (2 * ball1.weight * ball1.vy)) / (ball1.weight + ball2.weight);

        // Set velocities for both balls
        ball1.vx = vx1;
        ball1.vy = vy1;
        ball2.vx = vx2;
        ball2.vy = vy2;

        // Ensure one ball is not inside the other - move them apart
        var count = 0; // Prevent infinite loops
        while (CheckCollision(ball1, ball2) && count < 5) {
            ball1.posX += ball1.vx * 0.5;
            ball1.posY += ball1.vy * 0.5;
            ball2.posX += ball2.vx * 0.5;
            ball2.posY += ball2.vy * 0.5;
            count++;
        }
        
        // Only update the DOM when needed
        ball1.Draw();
        ball2.Draw();
    }
}

function Initialize(containerId) {
    var container = document.getElementById(containerId);
    var height = container.clientHeight;
    var width = container.clientWidth;
    gContainerId = containerId;
    gCanvasId = containerId + '_canvas';
    gTopGroupId = containerId + '_topGroup';
    var svg = d3.select("#" + containerId).append("svg")
        .attr("id", gCanvasId)
        .attr("width", "100%")
        .attr("height", "100%")
        .style("position", "absolute")
        .style("top", 0)
        .style("left", 0)
        .append("g")
        .attr("id", gTopGroupId)
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", width)
        .attr("height", height);
    
    // Reduce number of balls for better performance and ensure they don't overlap
    const positions = [];
    const radius = 50; // Ball radius
    const minDistance = radius * 2; // Minimum distance between ball centers
    
    function getValidPosition(width, height) {
        let x, y, isValid;
        do {
            x = Math.random() * width;
            y = Math.random() * height;
            isValid = true;
            
            // Check distance from all existing positions
            for (let pos of positions) {
                const dx = x - pos.x;
                const dy = y - pos.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < minDistance) {
                    isValid = false;
                    break;
                }
            }
        } while (!isValid);
        
        positions.push({x, y});
        return {x, y};
    }

    // Create balls with non-overlapping positions
    const pos1 = getValidPosition(width, height);
    balls.push(new Ball(svg, pos1.x, pos1.y, 'n0', 'DimGray', Math.PI / Math.random()*3, radius, "https://github.com/mogryzko/", "https://cdn.freebiesupply.com/logos/large/2x/github-icon-logo-png-transparent.png"));
    
    const pos2 = getValidPosition(width, height);
    balls.push(new Ball(svg, pos2.x, pos2.y, 'n1', 'DimGray', Math.PI / Math.random()*3, radius, "static/max-ogryzko-resume.pdf", "https://cdn2.iconfinder.com/data/icons/project-management-16/48/30-512.png"));
    
    const pos3 = getValidPosition(width, height);
    balls.push(new Ball(svg, pos3.x, pos3.y, 'n2', 'DimGray', Math.PI / Math.random()*3, radius, "https://www.linkedin.com/in/mogryzko/", "https://www.pinclipart.com/picdir/big/221-2213428_other-linkedin-icon-png-transparent-background-images-instagram.png"));
    
    const pos4 = getValidPosition(width, height);
    balls.push(new Ball(svg, pos4.x, pos4.y, 'n3', 'DimGray', Math.PI / Math.random()*3, radius, "mailto:m.ogryzko@columbia.com", "https://www.pinclipart.com/picdir/big/123-1236933_envelope-message-send-mail-packet-letter-email-email.png"));
    for (var i = 0; i < balls.length; ++i) {
        balls[i].Draw();
    }
    return svg;
}

var startStopFlag = null;
function StartStopGame() {
    if (startStopFlag == null) {
        // Use requestAnimationFrame for better performance
        function animate(timestamp) {
            if (startStopFlag === null) return;
            
            // Throttle frame rate for better performance
            if (timestamp - lastFrameTime >= frameInterval) {
                lastFrameTime = timestamp;
                
                for (var i = 0; i < balls.length; ++i) {
                    balls[i].Move();
                    // Only check collisions with balls ahead in the array
                    for (var j = i + 1; j < balls.length; ++j) {
                        ProcessCollision(i, j);
                    }
                }
            }
            
            requestAnimationFrame(animate);
        }
        
        startStopFlag = 1;
        requestAnimationFrame(animate);
    }
    else {
        startStopFlag = null;
    }
}

// Handle ESC key
d3.select('body')
    .on('keydown', function() {
        if (balls.length == 0)
            return;
        
        if (d3.event.keyCode == 27) { // if ESC key - toggle start stop
            StartStopGame();
        }
    });

function OnSpeedChange() {
    var o = document.getElementById('speed');
    if (startStopFlag != null)
        startStopFlag = null;

    setTimeout(function() {
        for (var i = 0; i < balls.length; ++i) {
            var o = document.getElementById('speed');
            var newjumpSize = o.options[o.selectedIndex].value;
            balls[i].GoToInitialSettings(parseInt(newjumpSize));
        }
        setTimeout(function() {
            StartStopGame();
        }, 500);
    }, 250);
}

function OnNumberOfBallsChanged() {
    var o = document.getElementById('numberOfBalls');
    var numberOfBalls = o.options[o.selectedIndex].value;
    balls = balls.slice(0, 4); // Keep only essential balls

    d3.selectAll('.ball').remove();
    
    // Limit the number of additional balls for better performance
    var maxAdditionalBalls = Math.min(numberOfBalls - 4, 2);
    for (var i = 0; i < maxAdditionalBalls; ++i) {
        balls.push(new Ball(svg, 101, 101, 'n'+(i+5).toString(), color(i), Math.PI / (i+1), (i%2)==0?10 : (10+i)));
    }
}

var svg = Initialize('chart');
StartStopGame();
