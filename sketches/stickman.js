
function() {

   function MyResponder() {

      this.p = newVec3();
   
      this.setup = function() {
         this.graph.isUpdating = function() {
            return this.R.clickType == 'none';
         }
      }

      var _p = newVec3();

      this.tweak = function(part, x, y, z, sx, sy, sz) {
         if (part == this.I || part == this.J)
            return;
         var p = nodes[part].p;
         p.x += x;
         p.y += y;
         p.z += z;
         if (sx !== undefined) p.x *= sx;
         if (sy !== undefined) p.y *= sy;
         if (sz !== undefined) p.z *= sz;
      }

      this.simulate = function() {
         var nodes = this.graph.nodes;

         var V0 = this.graph.choice.getValue(0);
         var V1 = this.graph.choice.getValue(1);
         var V2 = this.graph.choice.getValue(2);
         var V3 = this.graph.choice.getValue(3);

         var freq = 1.5;
         var sine = sin(freq * TAU * time);

         function step(t) { return abs(((t) % 1) - .5) - .3; }

         this.l_travel = V3 * step(freq * time);
         this.l_lift   = V3 * max(0,-.3 * sine);
         this.r_travel = V3 * step(freq * time + .5);
         this.r_lift   = V3 * max(0, .3 * sine);

         nodes[R_ANKLE].p.set(-.4, -1 + this.r_lift, this.r_travel);
         nodes[L_ANKLE].p.set( .4, -1 + this.l_lift, this.l_travel);

         var dy = nodes[L_ANKLE].p.y - nodes[R_ANKLE].p.y;

         this.tweak(BELLY  , 0, .03,-.01, 1, 1, .9);
         this.tweak(CHEST  , 0, .03, .05, 1, 1, .9);
         this.tweak(HEAD   , 0, .02, 0, .9);
         this.tweak(L_ELBOW,-0.005, 0, -.015);
         this.tweak(L_KNEE , 0, 0, .02);
         this.tweak(L_WRIST, 0.01, -.015 - .05 * dy, .01);
         this.tweak(PELVIS , 0.05 * V2 * sine - .05 * V3 * sine, .03, -.03, 1, 1, .9);
         this.tweak(R_ELBOW, 0.005, 0, -.015);
         this.tweak(R_KNEE , 0, 0, .02);
         this.tweak(R_WRIST,-.01 - V1 * (.01 + .01 * sine), -.015 + .05 * dy + V1 * .035, .01 + V1 * .01);
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
               this.graph.choice.setState(pieMenuIndex(this.graph.p.x - this.p.x,
                                                       this.p.y - this.graph.p.y));
         }
      );
   }
   MyResponder.prototype = new GraphResponder;

   this.label = 'stickman';
   this.is3D = true;

   this.keyUp = function(letter) {
      switch (letter) {
      case '0': this.graph.choice.setState(0); break;
      case '1': this.graph.choice.setState(1); break;
      case '2': this.graph.choice.setState(2); break;
      case '3': this.graph.choice.setState(3); break;
      }
   }
   
   this.graph = new VisibleGraph(this);
   this.graph.choice = new Choice();
   this.graph.setResponder(new MyResponder());

   this.graph.clear();

   //             0     1     2      3       4      5       6     7      8       9       10      11
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

   this.graph.addLink(CHEST,   PELVIS,  0.3);
   this.graph.addLink(BELLY,   R_ELBOW, 0.1);
   this.graph.addLink(BELLY,   L_ELBOW, 0.1);
   this.graph.addLink(HEAD,    R_ELBOW, 0.1);
   this.graph.addLink(HEAD,    L_ELBOW, 0.1);
   this.graph.addLink(R_ELBOW, L_ELBOW, 0.05);
   this.graph.addLink(R_KNEE,  L_KNEE,  0.1);

   this.graph.computeLengths();

   this.onMove    = function(point) { return this.graph.onMove   (point); }
   this.onPress   = function(point) { return this.graph.onPress  (point); }
   this.onDrag    = function(point) { return this.graph.onDrag   (point); }
   this.onRelease = function(point) { return this.graph.onRelease(point); }

   var toDraw = [[0,2,4], [2,6], [0,9], [0,11]];

   this.render = function(elapsed) {
      this.graph.choice.update(elapsed);

      this.code = [["signals",""],["lift",""],["travel",""]];
      var graph = this.graph;
      graph.pixelSize = this.computePixelSize();
      var nodes = graph.nodes;
      var links = graph.links;
      var R = graph.R;

      // DURING THE INITIAL SKETCH, DRAW A SIMPLIFIED STICK FIGURE.

      this.duringSketch(function() {
         var c, i, j;
         for (i = 0 ; i < toDraw.length ; i++) {
            c = [];
            for (j = 0 ; j < toDraw[i].length ; j++)
               c.push(nodes[toDraw[i][j]].p);
            mCurve(c);
         }
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
         if (this.meshBounds.length == 0)
            return;

         this.extendBounds(this.meshBounds);

         for (var l = 0 ; l < this.nLinksToRender ; l++)
            this.renderLink(links[l]);                       // RENDER EACH 3D LINK.
      });
   }

   this.output = function() {
      var value = 0;
      if (this == sk() && isCodeWidget && ! isCodeScript()) {
         switch (this.code[codeSelector.selectedIndex][0]) {
         case 'lift'  : value = this.graph.R.r_lift  ; break;
         case 'travel': value = this.graph.R.r_travel; break;
         }
      }
      return value;
   }

   // THREE.js STUFF:

   var mesh;

   this.createMesh = function() {
      mesh = new THREE.Mesh();
      mesh.material = this.shaderMaterial();
      return mesh;
   }

   this.renderNode = function(node) {
      if (this.mesh === undefined)
         return;
      node.r = this.graph.R.defaultNodeRadius * (node.type == 1 ? 6 : 1);;
      if (node.g === undefined)
         this.mesh.add(node.g = this.graph.newNodeMesh(this.mesh.material, node.r));
      node.g.position.copy(node.p);
   }

   this.renderLink = function(link) {
      if (this.mesh === undefined)
         return;
      if (link.g === undefined)
         this.mesh.add(link.g = this.graph.newLinkMesh(this.mesh.material, this.graph.R.defaultNodeRadius * Math.sqrt(link.w)));
      link.g.placeStick(this.graph.nodes[link.i].p, this.graph.nodes[link.j].p);
   }
}

