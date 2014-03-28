/*
	Puppy trail: Start with the arrow_on_path anim with svg. Add a trail on a canvas, positioned below the svg scene.

	Use a canvas for that, instead of svg, since a trail will amount to a lot of data. Too much for vectors, if you don't need them. 
	In this case, store it as pixel-data is more suitable.

	Drawing the trail, I'll use line segments, like in spiro. To align the segments use the trick of spiro, to cut the last line segment and cut it in half.

	Quality: It appears the browser has no time for anti-aliasing, during the animation.

  It might be nice to animate iterations (GSAP?)
*/

var done = false;

window.onload = function() {

	Canvas.init( 'trailCanvas' , 800, 800, 800/800 );
	
	Leader.init();
	Puppy.init();
	Puppy.speed = 0.05;
	Puppy.maxSpeed = 4;
	Puppy.lineWidth = 4;

	// requestAnimationFrame(run);
	// Use setinterval to use lower frame rate so browser has time to draw and antialias!
	setInterval(run, 1000/20);
	TweenMax.to( Puppy, 6, {speed: Puppy.maxSpeed, ease: Linear.easeNone, onComplete: function() { done = true; } });
}

var iterations = 1;

function run () {
  // if ( !done ) {
  // 	requestAnimationFrame(run);
  // }
  // else {
  // 	Leader.mascotte.style.display = 'none';
  // 	Puppy.mascotte.style.display = 'none';
  // }

  for ( var i = 0; i < iterations; i++ ) {
	  Leader.move();
  	Puppy.update();
  };
  
  Puppy.draw();
  Leader.draw();
}

var Leader = {
	
	position: null,
	curve: null,
	t:0.5,// parameter 0->1 to parametrize position on curve
	dt: 0,// step size
	D: 0,
	vision: 5,// how many steps to look ahead for rotation
	mascotte: null,


	init: function () {
		this.mascotte = document.getElementById('arrow');
		this.curve = document.getElementById('curve');
		this.D = this.curve.getTotalLength();
		this.dt = 100/this.D;
	},

	move: function () {

		this.t = (this.t + this.dt/iterations) % 1;

		// To calculate angle get one point ahead, and one you just passed
		var p0 = this.curve.getPointAtLength(((1+this.t - 0.5 * this.vision * this.dt) % 1) * this.D);
		var p1 = this.curve.getPointAtLength(((this.t + this.vision * this.dt) % 1) * this.D);
		this.angle = 90 + Math.atan2 ( p1.y - p0.y, p1.x - p0.x ) * (180 / Math.PI);

		var temp = this.curve.getPointAtLength(((1+this.t - 3 * this.vision * this.dt) % 1) * this.D);
		
		// Something for the puppy to orientate to, so it doesn't get to his goal too fast
		this.passedPoint = new Vector (temp.x, temp.y); //.multiply(0.5 + 0.5 * frames/maxFrames); 

		this.p = new Vector (this.curve.getPointAtLength(this.t * this.D).x, this.curve.getPointAtLength(this.t * this.D).y); //.divide(2);
	},

	draw: function () {

		this.mascotte.setAttribute( "transform",	"translate("+this.p.x+","+this.p.y+") rotate("+this.angle+")" ); 

	}
}

var Puppy = {

	/* We want to draw Puppy with subframe precision, so we collect points in an array, and render them once per frame */
	points: [],

	loose: false,
	minDist: 5,
	maxDist: 300,
	trailOpacity: 0,

	init: function () {
		this.p = new Vector(400, 400);
		// setTimeout( function() { Puppy.trailOpacity = 0.2; },3000/iterations );
		this.mascotte = document.getElementById('arrow').cloneNode();
		this.mascotte.style.fill = "#fff";
		document.getElementById ('racetrack').appendChild ( this.mascotte );

		// setInterval( this.break.bind(this), 11000);

	},

	break: function () {
		this.loose = false;
		// Take a break;
		setTimeout( function() { Puppy.loose = true; }, 3500 );
	},
	
	update: function () {
		// Calculate vector and distance between leader and puppy
		var diff = Leader.passedPoint.subtract(this.p);
		var dist = diff.length();

		if ( this.loose ) {
			if ( dist < this.minDist ) {
				this.loose = false;
			}
			else {
				this.p = this.p.add(diff.divide(3*iterations/this.speed));
				// getting tired:
				// this.speed *= (1 + 0.001/iterations); // Not exactly...
			} 
		}
		else if ( dist > this.maxDist ) {
			this.loose = true;
			TweenMax.to( this, 1, {trailOpacity: 1, ease: Power1.easeInOut });
		}

		// Determine angle of line through leader and Puppy
		var p1 = Leader.passedPoint;
		var p0 = this.p;
		
		this.angle = 90 + Math.atan2 ( p1.y - p0.y, p1.x - p0.x ) * (180 / Math.PI);
		
		this.points.push ( this.p );

	},

	draw: function () {
		// 1. Update svg
		this.mascotte.setAttribute( "transform",	"translate("+this.p.x+","+this.p.y+") rotate("+this.angle+") scale(0.75)" ); 

		if ( this.points.length < 2 ) {
			return;
		}

		// Tweak the points array a bit: leave the last half line segment for the next path
		var transp = this.points[this.points.length - 1];
		this.points[this.points.length - 1] = (this.points[this.points.length - 2].add( transp )).divide(2);

		Canvas.path ( this.points, {lineWidth: this.lineWidth, globalAlpha: this.trailOpacity });

		this.points.push ( transp );
		this.points = this.points.slice ( -2 );	// Just keep the last 2	

	}


}

var Canvas = {

	init: function ( el_id, w, h, scale ) {

		this.elem = document.getElementById( el_id );
		this.elem.width = w;
		this.elem.height = h;
		this.scale = scale;
		this.ctx = this.elem.getContext('2d');
		this.ctx.lineWidth = 2;
		this.ctx.strokeStyle = '#fff';
		this.ctx.globalAlpha = 0.3;
		this.ctx.translate(1/2, 1/2);
		
	},

	clear: function () {
		this.ctx.clearRect(-this.elem.width/2, -this.elem.height/2, this.elem.width, this.elem.height);
	},

	path: function ( points, style ) {
		for ( var s in style ) {
			this.ctx[s] = style[s];
		}

		this.ctx.beginPath();

		// Transfer points to the coordinate system of the canvas
		var p =  points[0].multiply ( this.scale );
		this.ctx.moveTo ( p.x, p.y );
		
		for ( var i = 1; i < points.length; i++ ) {
			p =  points[i].multiply ( this.scale );
			this.ctx.lineTo ( p.x, p.y );
		}
		
		this.ctx.stroke();
	},

	circle: function ( p, r, c) {
		this.ctx.globalAlpha = 0.2;
		this.ctx.beginPath();
		this.ctx.fillStyle = c;
		p = p.multiply ( this.scale );
		r = r * this.scale;
	  this.ctx.arc(p.x, p.y,r,0,Math.PI*2,true);
  	this.ctx.fill();		
  	this.ctx.closePath();
	},

	line: function ( p, q , ga) {
		this.ctx.globalAlpha = ga;
		this.ctx.beginPath();
		p = p.multiply ( this.scale )
		q = q.multiply ( this.scale )
		this.ctx.moveTo ( p.x, p.y );
		this.ctx.lineTo ( q.x, q.y );
		this.ctx.stroke();
	}
}