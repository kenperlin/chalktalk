
function() {

   function MyResponder() {

      this.p = newVec3();
   
      this.setup = function() {
         this.graph.isUpdating = function() {
            return this.R.clickType == 'none';
         }
      }

      var _p = newVec3();

      this.simulate = function() {
         var V0 = this.graph.choice.value(0);
         var V1 = this.graph.choice.value(1);
         var V2 = this.graph.choice.value(2);
         var V3 = this.graph.choice.value(3);

         var nodes = this.graph.nodes;

	 var t = time;

	 var signal = sin(3 * PI * t);

	 var fwd = (1.5 * t) % 1.0;

         nodes[HEAD].p.x *= 0.9;
	 nodes[HEAD].p.y += .02;

         nodes[R_ANKLE].p.set(-.4, -1 + V3 * max(0, .3 * signal), V3 * (abs( ((1.5 * t + .5)%1) - .5) - .3));
         nodes[L_ANKLE].p.set( .4, -1 + V3 * max(0,-.3 * signal), V3 * (abs( ((1.5 * t     )%1) - .5) - .3));
	 nodes[PELVIS].p.x += 0.05 * V2 * signal;
	 nodes[PELVIS].p.x -= 0.05 * V3 * signal;

	 nodes[CHEST].p.z += .015;
	 nodes[BELLY].p.z -= .01;
	 nodes[PELVIS].p.z -= .03;

	 nodes[CHEST].p.y += .03;
	 nodes[BELLY].p.y += .03;
	 nodes[PELVIS].p.y += .03;

	 nodes[CHEST].p.z *= .9;
	 nodes[BELLY].p.z *= .9;
	 nodes[PELVIS].p.z *= .9;

	 nodes[R_KNEE].p.z += .02;
	 nodes[L_KNEE].p.z += .02;

	 nodes[R_ELBOW].p.z -= .01;
	 nodes[L_ELBOW].p.z -= .01;

	 nodes[R_WRIST].p.x -= .01;
	 nodes[L_WRIST].p.x += .01;
	 nodes[R_WRIST].p.z += .01;
	 nodes[L_WRIST].p.z += .01;
	 nodes[R_WRIST].p.y -= .01;
	 nodes[L_WRIST].p.y -= .01;

	 var dy = nodes[6].p.y - nodes[4].p.y;
	 nodes[ 9].p.y += .05 * dy;
	 nodes[11].p.y -= .05 * dy;
      }
   
      this.defaultNodeRadius = 0.05;
   
      this.doI(            // Drag on a joint to move it.
         function() {
            var node = this.graph.nodes[this.I];
            if (node.d === undefined)
               node.d = newVec3();
            node.d.copy(this.graph.p).sub(node.p);
         },
         function() {
            this.graph.nodes[this.I].p.copy(this.graph.p);
         }
      );
      this.doB(            // Swipe on stickman's background to set a motion state.
         function() {
	    this.p.copy(this.graph.p);
	    this.isDragGesture = false;
	 },
	 undefined,
         function() {
	    if (this.p.distanceTo(this.graph.p) > 0.1)
	       this.graph.choice.state(pieMenuIndex(this.graph.p.x - this.p.x,
	                                            this.p.y - this.graph.p.y));
	 }
      );
   }
   MyResponder.prototype = new GraphResponder;

   this.label = 'stickman';
   this.is3D = true;

   this.keyUp = function(letter) {
      switch (letter) {
      case '0': this.graph.choice.state(0); break;
      case '1': this.graph.choice.state(1); break;
      case '2': this.graph.choice.state(2); break;
      case '3': this.graph.choice.state(3); break;
      }
   }
   
   this.graph = new VisibleGraph();
   this.graph.choice = new Choice();
   this.graph.setResponder(new MyResponder());

   this.graph.clear();

   var names = 'CHEST BELLY PELVIS R_KNEE R_ANKLE L_KNEE L_ANKLE HEAD R_ELBOW R_WRIST L_ELBOW L_WRIST'.split(' ');
   for (var i = 0 ; i < names.length ; i++)
      window[names[i]] = i;

   // STICKMAN'S JOINTS.

   this.graph.addNode(  0,  1 , 0   );  //  CHEST
   this.graph.addNode(  0, .65, 0   );  //  BELLY
   this.graph.addNode(  0, .3 , 0   );  //  PELVIS

   this.graph.addNode(-.2,-.35, 0.2 );  //  R_KNEE
   this.graph.addNode(-.4, -1 , 0   );  //  R_ANKLE

   this.graph.addNode( .2,-.35, 0.2 );  //  L_KNEE
   this.graph.addNode( .4, -1 , 0   );  //  L_ANKLE

   this.graph.addNode(  0,1.4 , 0, 1);  //  HEAD

   this.graph.addNode(-.2, .6 ,-0.2 );  //  R_ELBOW
   this.graph.addNode(-.4, .2 , 0   );  //  R_WRIST

   this.graph.addNode( .2, .6 ,-0.2 );  //  L_ELBOW
   this.graph.addNode( .4, .2 , 0   );  //  L_WRIST

   // STICKMAN'S LIMBS.

   this.graph.addLink(CHEST, BELLY);
   this.graph.addLink(BELLY, PELVIS);

   this.graph.addLink(PELVIS, R_KNEE);
   this.graph.addLink(R_KNEE, R_ANKLE);

   this.graph.addLink(PELVIS, L_KNEE);
   this.graph.addLink(L_KNEE, L_ANKLE);

   this.graph.addLink(CHEST, HEAD);

   this.graph.addLink(CHEST, R_ELBOW);
   this.graph.addLink(R_ELBOW, R_WRIST);

   this.graph.addLink(CHEST, L_ELBOW);
   this.graph.addLink(L_ELBOW, L_WRIST);

   var nodes = this.graph.nodes;
   var links = this.graph.links;

   this.nNodesToRender = nodes.length;
   this.nLinksToRender = links.length;

   // INVISIBLE RESTORATIVE FORCE LINKS.

   this.graph.addLink( 0,  2, 0.3);
   this.graph.addLink( 1,  8, 0.1);
   this.graph.addLink( 1, 10, 0.1);
   this.graph.addLink( 8, 10, 0.1);
   this.graph.addLink( 7,  8, 0.1);
   this.graph.addLink( 7, 10, 0.1);
   this.graph.addLink( 9, 11, 0.03);
   this.graph.addLink( 3,  5, 0.1);

   this.graph.computeLengths();

   this.onMove    = function(point) { return this.graph.onMove   (point); }
   this.onPress   = function(point) { return this.graph.onPress  (point); }
   this.onDrag    = function(point) { return this.graph.onDrag   (point); }
   this.onRelease = function(point) { return this.graph.onRelease(point); }

   var toDraw = [[0,2], [2,4], [2,6], [0,9], [0,11]];

   this.render = function(elapsed) {
      this.graph.choice.update(elapsed);

      this.code = null;
      var graph = this.graph;
      graph.pixelSize = this.computePixelSize();
      var nodes = graph.nodes;
      var links = graph.links;
      var R = graph.R;

      // DURING THE INITIAL SKETCH, DRAW A SIMPLIFIED STICK FIGURE.

      this.duringSketch(function() {
         for (var i = 0 ; i < toDraw.length ; i++)
            mLine(nodes[toDraw[i][0]].p,
                  nodes[toDraw[i][1]].p);
      });

      // AFTER SKETCH IS DONE, DO FANCIER PROCESSING AND RENDERING.

      this.afterSketch(function() {

         graph.update();

         for (var j = 0 ; j < nodes.length ; j++)
            this.renderNode(nodes[j]);                       // RENDER THE 3D NODE OBJECT.

         this.meshBounds = [];
         for (var j = 0 ; j < this.nNodesToRender ; j++) {
            var node = nodes[j], p = node.p, r = node.r;
            for (var a = -r ; a <= r ; a += r + r)
            for (var b = -r ; b <= r ; b += r + r)
            for (var c = -r ; c <= r ; c += r + r)
               this.meshBounds.push([p.x + a, p.y + b, p.z + c]);
         }
         this.extendBounds(this.meshBounds);

         for (var l = 0 ; l < this.nLinksToRender ; l++)
            this.renderLink(links[l]);                       // RENDER EACH 3D LINK.
      });
   }

   // THREE.js STUFF:

   var mesh;

   this.createMesh = function() {
      mesh = new THREE.Mesh();
      mesh.setMaterial(this.myMaterial());
      return mesh;
   }

   this.renderNode = function(node) {
      node.r = this.graph.R.defaultNodeRadius * (node.type == 1 ? 6 : 1);;
      if (node.g === undefined)
         mesh.add(node.g = this.graph.newNodeMesh(this.myMaterial(), node.r));
      node.g.position.copy(node.p);
   }

   this.renderLink = function(link) {
      if (link.g === undefined)
         mesh.add(link.g = this.graph.newLinkMesh(this.myMaterial(), this.graph.R.defaultNodeRadius * Math.sqrt(link.w)));
      link.g.placeStick(this.graph.nodes[link.i].p, this.graph.nodes[link.j].p);
   }

   this.myMaterial = function() {
      if (this._myMaterial === undefined)
         this._myMaterial = new phongMaterial().setAmbient(.5,.5,.5).setDiffuse(.5,.5,.5);
      return this._myMaterial;
   }
}

