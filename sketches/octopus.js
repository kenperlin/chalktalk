
function OctopusResponder() {
   this.doI(
      undefined,
      function() {                                             // Drag on a node to move it.
         if (this.I <= this.graph.headLastIndex)
            this.graph.nodes[this.I].p.copy(this.graph.p);
      }
   );

   this.dVec = newVec();
   this.vVec = newVec();
   this.wVec = newVec();
   this.xVec = newVec();
   this.yVec = newVec();

   this.simulate = function() {
      var nodes = this.graph.nodes;

      if (this.I == -1) {

         // KEEP HEAD ABOVE BODY

         var upForce = .1;
         nodes[0].p.y += upForce;
	 var n = nodes.length;
         for (var i = 3 ; i < n ; i++)
            nodes[i].p.y -= upForce / (n - 3);

         // KEEP EYES LEVEL

	 var iUpperEye = nodes[1].p.y >= nodes[2].p.y ? 1 : 2;
	 var iLowerEye = nodes[1].p.y <  nodes[2].p.y ? 1 : 2;
         nodes[iLowerEye].p.y += .01;
         nodes[iUpperEye].p.y -= .01;

	 // FACE FORWARD

	 var t = nodes[2].p.z - nodes[1].p.z;
	 var i = t > 0 ? 1 : 2;
	 if (nodes[3-i].p.z < nodes[0].p.z) i = 3 - i;
	 t = .1 * abs(t);
	 nodes[0].p.z -= t;
	 nodes[i].p.z += t;
      }

      if (nodes[0].g !== undefined) {
	 var D = this.dVec, V = this.vVec, W = this.wVec, X = this.xVec, Y = this.yVec;

         var E = nodes[0].g.matrix.elements;
	 X.set(E[0], E[1], E[2]);
	 Y.set(E[4], E[5], E[6]);

         for (var limb = 0 ; limb < this.graph.nLimbs ; limb++) {
            for (var joint = 1 ; joint < this.graph.nJoints ; joint++) {
	       var P = nodes[this.graph.jointIndex(limb, joint)].p;

               D.copy(P).sub(nodes[0].p);

	       V.copy(D).sub(W.copy(X).multiplyScalar(.5 * D.dot(X) / X.dot(X)))
	                .sub(W.copy(Y).multiplyScalar(.5 * D.dot(Y) / Y.dot(Y)));

	       var t = noise(2*V.x + 100 * this.graph.id, 2*V.y + this.graph.frequency * time, 2*V.z + 100 * limb)
	               * this.graph.amplitude * (joint < this.graph.nJoints - 1 ? .08 : .2);

	       var lenSq = X.lengthSq() + Y.lengthSq();
               P.add(V.copy(X).multiplyScalar(t * X.dot(D) / lenSq))
                .add(V.copy(Y).multiplyScalar(t * Y.dot(D) / lenSq));
	    }
         }
      }
   }
}
OctopusResponder.prototype = new GraphResponder;

function Octopus() {
   this.labels = 'octopus'.split(' ');
   this.is3D = true;

   this.graph = new VisibleGraph();
   this.graph.setResponder(new OctopusResponder());

   var nLimbs = this.graph.nLimbs = 8;
   var nJoints = this.graph.nJoints = 8;

   this.graph.nLimbs = nLimbs;
   this.graph.nJoints = nJoints;

   this.graph.jointRadius = function(joint) {
      return mix(0.08, .015, joint / this.nJoints);
   }

   this.graph.jointIndex = function(limb, joint) {
      return this.headLastIndex + 1 + this.nJoints * limb + joint;
   }

   this.setup = function() {
      this.graph.id = this.id;
      this.graph.clear();

      this.graph.addNode(  0,.5, 0);

      var v = newVec();
      v.set(1, 0, 1).normalize().multiplyScalar(0.55);
      this.graph.addNode(-v.x, .5+v.y, v.z);
      this.graph.addNode( v.x, .5+v.y, v.z);

      this.graph.addNode(0, 0, 0);

      this.graph.headLastIndex = this.graph.nodes.length - 1;

      for (var n = 0 ; n <= this.graph.headLastIndex ; n++)
         this.graph.nodes[n].nm = n == 0 ? 32 : n < 3 ? 16 : 2;

      for (var limb = 0 ; limb < nLimbs ; limb++) {
         var theta = TAU * limb / nLimbs;
         for (var joint = 0 ; joint < nJoints ; joint++) {
	    var t = joint / nJoints;
	    var r = mix(0.20,  1.0, mix(t, t * t * t, .9));
            var y = mix(0.10, -1.0, 1 - (1 - t) * (1 - t));
            this.graph.addNode(r * cos(theta), y, r * sin(theta));

	    if (joint > 0) {
	       var nodeIndex = this.graph.nodes.length - 1;
	       var linkIndex = this.graph.addLink(nodeIndex-1, nodeIndex);
	       this.graph.links[linkIndex].joint = joint;
            }
         }
      }

      var eyeLinkIndex0 = this.graph.addLink(0,1,2);
      var eyeLinkIndex1 = this.graph.addLink(0,2,2);

      this.nNodesToRender = this.graph.nodes.length;
      this.nLinksToRender = this.graph.links.length;

      this.graph.addLink(1,2,2);

      for (var limb = 0 ; limb < nLimbs ; limb++)
      for (var joint = 0 ; joint < nJoints ; joint++) {
         var weight = joint == 0 ? 2 : 0.01;
         var nodeIndex = this.graph.jointIndex(limb, joint);
         for (var i = 0 ; i <= this.graph.headLastIndex ; i++)
            this.graph.addLink(i, nodeIndex, weight);
         this.graph.addLink(nodeIndex, this.graph.jointIndex((limb + 1) % nLimbs, joint), weight);
      }

      this.graph.nodes[0].r = .5;
      this.graph.nodes[1].r = .06;
      this.graph.nodes[2].r = .06;
      this.graph.nodes[3].r = .01;

      for (var limb = 0 ; limb < nLimbs ; limb++)
      for (var joint = 0 ; joint < nJoints ; joint++) {
         var i = this.graph.jointIndex(limb, joint);
         this.graph.nodes[i].r = this.graph.jointRadius(joint);
      }

      for (var n = this.graph.headLastIndex + 1 ; n < this.graph.nodes.length ; n++)
         this.graph.nodes[n].nm = 4;

      for (var n = 0 ; n < this.graph.links.length ; n++)
         this.graph.links[n].nm = 4;
      this.graph.links[eyeLinkIndex0].nm = 16;
      this.graph.links[eyeLinkIndex1].nm = 16;

      this.graph.computeLengths();
   }

   this.mouseMove = function(x,y) { return this.graph.mouseMove(x, y); }
   this.mouseDown = function(x,y) { return this.graph.mouseDown(x, y); }
   this.mouseDrag = function(x,y) { return this.graph.mouseDrag(x, y); }
   this.mouseUp   = function(x,y) { return this.graph.mouseUp  (x, y); }

   this.render = function() {
      this.code = null;
      var graph = this.graph;
      var nodes = graph.nodes;
      var links = graph.links;
      graph.pixelSize = this.computePixelSize();

      graph.amplitude = isDef(this.inValues[0]) ? this.inValues[0] : 1;
      graph.frequency = isDef(this.inValues[1]) ? this.inValues[1] : 1;

      // DURING THE INITIAL SKETCH, DRAW EACH LINK.

      this.duringSketch(function() {
          mCurve(makeSpline([[.4,-.1],[ .5, .7],[   0, 1],[ -.5, .7],[-.4,-.1]]));
	  mCurve(makeSpline([[-.25,0],[-.3,-.5],[-.50,-1]], 6));
	  mCurve(makeSpline([[ .25,0],[ .3,-.5],[ .75,-1]], 6));
      });

      // AFTER SKETCH IS DONE, DO FANCIER PROCESSING AND RENDERING.

      this.afterSketch(function() {

         graph.update();
         for (var j = 0 ; j < this.nNodesToRender ; j++)
            this.renderNode(nodes[j]);
         //for (var j = 0 ; j < this.nLinksToRender ; j++)
         for (var j = 0 ; j < this.graph.links.length ; j++)
            this.renderLink(links[j]);

         this.meshBounds = [];
         for (var j = 0 ; j < this.nNodesToRender ; j++) {
            var node = nodes[j], p = node.p, r = node.r;
            for (var a = -r ; a <= r ; a += r + r)
            for (var b = -r ; b <= r ; b += r + r)
            for (var c = -r ; c <= r ; c += r + r)
               this.meshBounds.push([p.x + a, p.y + b, p.z + c]);
         }
         this.extendBounds(this.meshBounds);
      });
   }

   this.createMesh = function() { return new THREE.Mesh(); }

   this.renderNode = function(node) {
      if (node.g === undefined) {
         var material = node == this.graph.nodes[1] || node == this.graph.nodes[2]
	              ? this.getEyeMaterial() : this.getNodeMaterial();
         this.mesh.add(node.g = this.graph.newNodeMesh(material, node.r, node.nm));
      }

      if (node == this.graph.nodes[0]) {
         var geometry = node.g.geometry;
         var vertices = geometry.vertices;
         for (var i = 0 ; i < vertices.length ; i++) {
            var v = vertices[i];
	    if (v.z > 0) {
	       var r = 1 - .3 * (v.z * v.z);
	       v.x *= r;
	       v.y *= r;
	       v.z = sin(PI * v.z);
	    }
         }
         geometry.computeCentroids();
         geometry.computeVertexNormals();
	 node.g.up.set(0,0,1);
	 node.g.lookAt(this.graph.nodes[3].p);
      }

      node.g.position.copy(node.p);
   }

   this.renderLink = function(link) {
      if (link.g === undefined) {
         var weight = Math.sqrt(link.w);
	 var joint = link.joint === undefined ? 0 : link.joint;
         var radius1 = .8 * weight * this.graph.jointRadius(joint + 1);
         var radius0 = .8 * weight * this.graph.jointRadius(joint);
         this.mesh.add(link.g = this.graph.newLinkMesh(this.getLinkMaterial(), radius1, radius0, link.nm));
      }
      this.graph.placeLinkMesh(link.g, this.graph.nodes[link.i].p, this.graph.nodes[link.j].p);
   }

   this.getNodeMaterial = function() {
      if (this._nodeMaterial === undefined) {
         var r = 1, g = .75, b = .5;
         this._nodeMaterial = new phongMaterial().setAmbient (.05*r,.05*g,.05*b)
	                                         .setDiffuse (.40*r,.40*g,.40*b)
	 			                 .setSpecular(.17*r,.17*g,.17*b,30);
      }
      return this._nodeMaterial;
   }

   this.getLinkMaterial = function() {
      if (this._linkMaterial === undefined) {
         var r = 1, g = 1, b = 1;
         this._linkMaterial = new phongMaterial().setAmbient (.05*r,.05*g,.05*b)
	                                         .setDiffuse (.20*r,.20*g,.20*b)
	 			                 .setSpecular(.17*r,.17*g,.17*b,30);
      }
      return this._linkMaterial;
   }

   this.getEyeMaterial = function() {
      if (this._eyeMaterial === undefined)
         this._eyeMaterial = new phongMaterial().setAmbient(.65,.05,.05)
                                                .setDiffuse(.05,.05,.05)
  		 			        .setSpecular(.2,.2,.2,20);
      return this._eyeMaterial;
   }
}
Octopus.prototype = new Sketch;
addSketchType('Octopus');



