define(["utility/Utils"], function (Utils) {

	var CT = require('core');

	CT.UI = function(canvas,args){



	}



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
			// this.setVectors();
			this.addEventListeners();
			// this.drawVectors();
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

			this.graph = new CT.Graph();
			this.graph.addNode(10,10,0);
			this.graph.addNode(100,20,0);
			this.graph.addNode(20,100,0);
			this.graph.addLink(0,1,.01);
			this.graph.addLink(1,2,.01);
			this.graph.addLink(2,0,.01);


			console.log(this.graph);
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
				this.standin[i].position = this.graph.nodes[i].p;
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

			if(!this._drawLine)
			this.graph.setI();

			this.scene.children.forEach(function(obj){
				if(typeof obj.outValue !== 'undefined'){
					that.ctx.save();
					that.ctx.translate(obj.position.x,obj.position.y);
					that.ctx.arc(0,0, 5, 0, 2 * Math.PI, false);
					that.ctx.fillStyle = "#f000ff";
					that.ctx.fill();
					that.ctx.stroke();
					that.ctx.font = "bold 16px Arial";
					that.ctx.fillText(obj.outValue, 0, 0);
					
					that.ctx.restore();
					for(var i = 0 ; i < that.graph.nodes.length-1 ; i++){
						that.ctx.beginPath();

					      that.ctx.moveTo(that.graph.nodes[i].p.x,   that.graph.nodes[i].p.y);
					      that.ctx.lineTo(that.graph.nodes[i+1].p.x, that.graph.nodes[i+1].p.y);
					      that.ctx.stroke();

					}


				}
			});

			this.graph.update();



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
				// that.VisibleGraph.mouseDrag(mousePos.x,mousePos.y);

				if (that._drawLine) {
					var vec = new THREE.Vector3(mousePos.x,mousePos.y,0);
					var q = 0;
					var q2= 1;
					for(var i = 0 ; i < that.standin.length ; i++){
						if(vec.distanceTo(that.standin[i].position)<40){
							q=i+1;
							if(q>that.standin.length-1)
								q=0;
							q2=i+2;
							if(q2>that.standin.length-1)
								q2=0;
							that.graph.setI(i);
							that.standin[i].position.x = mousePos.x;
							that.standin[i].position.y = mousePos.y;
							// that.standin[1].outValue = Math.random();
							// that.standin[i].evalCode("x*y",that.standin[q].outValue,that.standin[q2].outValue);	
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

		},

		paintColors:function(f){

		
		},

		update:function(){

			if(this._drawLine)
				console.log(this.ctrls);
		},

	}

	return CT;

});
