define(["utility/Utils"], function (Utils) {

	var CT = require('core');

	CT.UI = function(canvas,args){

		if(!args) args = {};

		this.vectors = args.vectors || [];
		this.ctrls = args.ctrls || [];
		this.ctrlAmount = args.ctrlAmount || 10;
		
		this.setVec = args.setVec || [];
		this.lerpColors = [];

		this._drawLine = false;
		this._moveCtrl = -1;

		this.init();

		this.Utils = util;

		// CT.UI.isDrawing = false;

		// this.staticDrawing = function(){
		// 	return CT.UI.isDrawing;
		// };

	}

	var util = {

		dist:function(a,b){
			var X = Math.abs(a.x - b.x);
			var Y = Math.abs(a.y - b.y);
			return Math.sqrt((X*X)+(Y*Y));
		},

		lerp:function(a,b,t){
			return a + ((b-a)*t);
		},

	};


	CT.UI.prototype = {

		init:function(x,y){

		// document.body.innerHTML += '<canvas id="canvasID"></canvas>'; // the += means we add this to the inner HTML of body
			this.width = x || 300;
			this.height = y || 300;
			var makeString = '<canvas id="canvasID"></canvas>'
			var cDiv = document.getElementById('canvasDiv').innerHTML = makeString ; // replaces the inner HTML of #someBox to a canvas
			// cDiv.width =  this.width;
			// cDiv.height = this.height;
			this.cDiv = document.getElementById('canvasDiv');
			this.c = document.getElementById('canvasID');
			this.c.width = this.width;
			this.c.height = this.height;
			this.ctx = this.c.getContext("2d");
			this.setVectors();
			this.addEventListeners();
			this.drawVectors();
		},

		initScene:function(){

			this.camera = new THREE.OrthographicCamera( 0, this.width, 0, this.height, 1, 10000 )
			this.scene = new THREE.Scene();
			this.renderer = new THREE.WebGLRenderer({alpha : true});
			this.renderer.setClearColor( 0x999999, 1);
			this.renderer.setSize(this.width, this.height);
			console.log(this.cDiv);
			this.cDiv.appendChild(this.renderer.domElement);

			this.camera.position.z = 300;
			this.camera.lookAt(new THREE.Vector3 (0.0, 0.0, 0.0));
			// this.controls = new THREE.OrbitControls( this.camera, this.renderer.domElement);

			//add light
			this.scene.add( new THREE.AmbientLight( 0x222222 ) );
			console.log(Utils.Utils);
			console.log(this);

			this.standin = [];
			for(var i = 0 ; i < 3 ; i++){
				this.standin[i] = new CT.Sketch();//Utils.Utils.sphere(10);
				this.standin[i].outValue = i;
				this.standin[i].add(Utils.Utils.sphere(10));
				this.scene.add(this.standin[i]);
			}
			this.light = new THREE.PointLight( 0xffffff );
			this.light.position.copy( this.camera.position );
			this.scene.add( this.light );
			this.counter = 0;

			this.objects = [];

			this.animate3D();
			this.animate2D();

		},

		animate3D:function(){

			this.renderer.render( this.scene, this.camera );
			// requestAnimationFrame(this.animate.bind(this));
			requestAnimationFrame(this.animate3D.bind(this));

		},

		animate2D:function(){

			var that = this;
			this.background();
			this.scene.children.forEach(function(obj){
				if(typeof obj.outValue !== 'undefined'){
					that.ctx.save();
					that.ctx.beginPath();
					that.ctx.translate(obj.position.x,obj.position.y);
					that.ctx.arc(0,0, 5, 0, 2 * Math.PI, false);
					that.ctx.fillStyle = "#f000ff";
					that.ctx.fill();
					that.ctx.stroke();
					that.ctx.font = "bold 16px Arial";
					that.ctx.fillText(obj.outValue, 0, 0);
					that.ctx.restore();
				}
			});



			requestAnimationFrame(this.animate2D.bind(this));


		},


		addEventListeners:function(){

			var that = this;

			this.c.addEventListener('mousedown', function (evt) {
				that._drawLine = true;
				CT.UI.isDrawing = true;
			}, false);

			this.c.addEventListener('mouseup', function (evt) {
				that._drawLine = false;
				CT.UI.isDrawing = false;
				that._moveCtrl = -1;
			}, false);

			this.c.addEventListener ("mouseout", function (evt) {
				that._drawLine = false;
				CT.UI.isDrawing = false;
				that._moveCtrl = -1;
				console.log('out');
			},false);

			this.c.addEventListener('mousemove', function (evt) {

				var mousePos = that.getMousePos(evt);

				if (that._drawLine) {
					var vec = new THREE.Vector3(mousePos.x,mousePos.y,0);
					var q = 0;
					var q2= 1;
					for(var i = 0 ; i < that.standin.length ; i++){
						console.log(vec.distanceTo(that.standin[i].position)<20);
						if(vec.distanceTo(that.standin[i].position)<20){
							q=i+1;
							if(q>that.standin.length-1)
								q=0;
							q2=i+2;
							if(q2>that.standin.length-1)
								q2=0;
							that.standin[i].position.x = mousePos.x;
							that.standin[i].position.y = mousePos.y;
							// that.standin[1].outValue = Math.random();
							that.standin[i].evalCode("x*y",that.standin[q].outValue,that.standin[q2].outValue);	
							i=that.standin.length;
						}
					}				
				}
			}, false);
		},


		getMousePos:function(evt){
			var rect = this.c.getBoundingClientRect();
			return {
				x: evt.clientX - rect.left,
				y: evt.clientY - rect.top
			};		
		},

		setVectors:function() {

		},

		background:function(color){
			var col = color || "#558899";

			this.ctx.clearRect(0, 0, this.width,this.height);
			this.ctx.fillStyle = col;
			this.ctx.fillRect(0, 0, this.width,this.height);
		},

		drawVectors: function() {

			// this.ctx.clearRect(0, 0, 150, 150);
			// this.ctx.fillStyle = "#558899";
			// this.ctx.fillRect(0, 0, 150, 150);

			for (var i = 1; i < this.vectors.length; i++) {
				this.ctx.beginPath();
				var vec = this.vectors[i - 1];
				this.ctx.lineTo(vec.x, vec.y);
				var vec = this.vectors[i];
				this.ctx.lineTo(vec.x, vec.y);
				this.ctx.stroke();

			}
			for(var i = 0 ; i < this.ctrls.length ; i++){
				ctx.transform(1,0,0,1,this.ctrls[i].x,this.ctrls[i].y);
				this.ctx.beginPath();
				this.ctx.arc(0,0, 5, 0, 2 * Math.PI, false);
				this.ctx.fillStyle = "#ffffff";
				this.ctx.fill();
				this.ctx.stroke();
				this.ctx.restore();
			}
		},

		paintColors:function(f){

			var id = this.ctx.createImageData(this.resX,this.resX); // only do this once per page
			var d  = id.data;                        // only do this once per page
			
			var dat = [];

			colors = [];

			var freq = f || .03;
			var rand = f*12 || 1;
			var rand2 = f*22 || 1;

			for(var i = 0 ; i < this.resX ; i++){
				for(var j = 0 ; j < this.resY ; j++){
					// var r = .6+noise(rand+i*.0271,.5+j*.0231,i*.0191)*.5;//(1+Math.cos(i*Math.PI*2/150))/2;
					// var g = .6+noise(rand+i*.021,j*.021,i*.021)*.5;//*((1+Math.cos(Math.PI*2/3+(i*Math.PI*2)/150))/2);
					// var b = .6+noise(rand+i*.031,j*.031,i*.021)*.5;//(1+Math.cos((Math.PI*2/3)*2+(i*Math.PI*2)/150))/2;//(1+Math.cos(((Math.PI*2/3)*2)+(i*Math.PI*2)/150))/2;
					
					var oi1 = .5+noise(10+i*freq,10+j*freq,freq*j)
					var oi2 = .5+noise(i*freq*rand,j*freq*rand,freq*j);//i+.6+noise(rand+j*freq,.5+j*freq,rand+i*freq)*60.5;
					var oi3 = .5+noise((-rand2+freq+20+i)*freq*rand2,(rand2+20+j)*freq*rand2,freq*j);//i+.6+noise(rand+j*freq,.5+j*freq,i*freq)*60.5;

					var r = ( 2+Math.sin  (oi1*Math.PI*1.5))/3;
					var g = ((2+Math.sin((oi2*Math.PI*1.5)))/3);
					var b = (2+ Math.sin((oi3*Math.PI*1.5)))/3;//(1+Math.cos(((Math.PI*2/3)*2)+(i*Math.PI*2)/150))/2;

					var v = 1;//((1+Math.cos((j/150)*Math.PI))/2);
					dat.push([r*v*255,g*v*255,b*v*255,255]);

				
				}
			}
			
			var q=0;
			for(var i = 0 ; i < d.length ; i++){
				d[i] = 	 dat[q][0];
				d[++i] = dat[q][1];
				d[++i] = dat[q][2];
				d[++i] = dat[q][3];
				q++;
			}

			d[0]   = .5;
			d[1]   = .5;
			d[2]   = .5;
			d[3]   = .5;
			// console.log(d);
			this.imageData = dat;
			this.ctx.putImageData( id, 0, 0 );
		},

		update:function(){

			if(this._drawLine)
				console.log(this.ctrls);
		},

	}

	return CT;

});
