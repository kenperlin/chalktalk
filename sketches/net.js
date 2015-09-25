function() {

   function NetResponder() {

      this.setup = function() {
         this.graph.isUpdating = function() {
            return this.R.clickType == 'none';
         }
      }

      this.defaultNodeRadius = 0.1;

      this.doI(
         function() {                                       // Drag on a node to move it.
            var node = this.graph.nodes[this.I];
            if (node.d === undefined)
               node.d = newVec3();
            node.d.copy(this.graph.p).sub(node.p);
         },
         function() {
            this.graph.nodes[this.I].p.copy(this.graph.p);
         }
      );

      this.doI_I(                                           // Click on a node and then
         null,
         function() {                                       // drag it to move it while the simulation pauses.
            this.graph.nodes[this.I_].p.copy(this.graph.p);
         },
         function() {
            this.graph.computeLengths();                   
         },
         function() {                                       // Double click on a node to remove it.
            this.graph.removeNode(this.I_);
            this.graph.computeLengths();
         }
      );

      this.doI_J(                                           // Click on node I, then
         null,
         function() {                                       // drag node J while the simulation pauses.
            this.graph.nodes[this.J].p.copy(this.graph.p);
         },
         function() {                                       // upon release, create a springy link.
            this.graph.removeLink(this.graph.findLink(this.I_, this.J));
            this.graph.addLink(this.I_, this.J, 0.03);
            this.graph.computeLengths();
         },
         function() {                                       // Click node I, then click other node J.
            var l = this.graph.findLink(this.I_, this.J);
            if (l == -1)
               this.graph.addLink(this.I_, this.J);         // If there was no link betw I and J, create one.
            else
               this.graph.removeLink(l);                    // If there was a link betw I and J, remove it.
            this.graph.computeLengths();
         }
      );

      this.doB_B(
         function() {                                       // Click on bg twice to create a new node,
            var p = this.graph.p;
            this.isCreatingNode = p.distanceTo(this.clickPoint) < this.defaultNodeRadius;
            if (this.isCreatingNode)
               this.newJ = this.graph.addNode(p.x, p.y, p.z);
         },
         function() {                                       // and optionally drag.
            if (this.isCreatingNode)
               this.graph.nodes[this.newJ].p.copy(this.graph.p);
         },
         function() {
            this.isCreatingNode = false;
         },
         function() {
            this.isCreatingNode = false;
         }
      );

      this.doB_J(
         function() {                                       // After clicking on the background
            var node = this.graph.nodes[this.J];
            node.r_at_click = node.r;
         },
         function() {                                       // drag on a node to do a gesture on that node.
            var node = this.graph.nodes[this.J];
            var a = this.clickPoint.distanceTo(node.p);
            var b = this.clickPoint.distanceTo(this.graph.p);
            node.r = node.r_at_click * b / a;
         }
      );
   }
   NetResponder.prototype = new GraphResponder;

   this.label = 'net';
   this.is3D = true;

   this.graph = new VisibleGraph(this);
   this.graph.setResponder(new NetResponder());

   this.graph.clear();

   this.graph.addNode(  0, 1, 0);
   this.graph.addNode(  0, 0, 0);
   this.graph.addNode(-.5,-1, 0);
   this.graph.addNode( .5,-1, 0);

   this.graph.addLink(0, 1);
   this.graph.addLink(1, 2);
   this.graph.addLink(1, 3);

   this.graph.computeLengths();

   this.onMove    = function(point) { return this.graph.onMove   (point); }
   this.onPress   = function(point) { return this.graph.onPress  (point); }
   this.onDrag    = function(point) { return this.graph.onDrag   (point); }
   this.onRelease = function(point) { return this.graph.onRelease(point); }

   this.render = function() {
      this.code = null;
      var graph = this.graph;
      graph.pixelSize = this.computePixelSize();
      var nodes = graph.nodes;
      var links = graph.links;
      var R = graph.R;

      // DURING THE INITIAL SKETCH, DRAW EACH LINK.

      this.duringSketch(function() {
         for (var l = 0 ; l < links.length ; l++)
            this.drawLink(nodes[links[l].i].p, nodes[links[l].j].p);
      });

      // AFTER SKETCH IS DONE, DO FANCIER PROCESSING AND RENDERING.

      this.afterSketch(function() {

         while (graph.removedNodes.length > 0) 
            mesh.remove(graph.removedNodes.pop().g);         // REMOVE GEOMETRY FOR ANY DEAD NODES.

         while (graph.removedLinks.length > 0) 
            mesh.remove(graph.removedLinks.pop().g);         // REMOVE GEOMETRY FOR ANY DEAD LINKS.

         graph.update();

         color('cyan');
         for (var j = 0 ; j < nodes.length ; j++) {
            var node = nodes[j];
            if (node.pix === undefined)
               node.pix = newVec3();
            node.pix.copy(node.p).applyMatrix4(this.pointToPixelMatrix);
            this.renderNode(node);                           // RENDER THE 3D NODE OBJECT.
            if (j == R.J)
               this.drawNode(node.p, node.r);                // HIGHLIGHT SECOND JOINT IN A TWO JOINT GESTURE.
            this.drawNode(node.p, node.r * (j==R.J?1:.01));  // HIGHLIGHT SECOND JOINT IN A TWO JOINT GESTURE.
         }

         this.meshBounds = [];
         for (var j = 0 ; j < nodes.length ; j++) {
            var node = nodes[j], p = node.p, r = node.r;
            for (var a = -r ; a <= r ; a += r + r)
            for (var b = -r ; b <= r ; b += r + r)
            for (var c = -r ; c <= r ; c += r + r)
               this.meshBounds.push([p.x + a, p.y + b, p.z + c]);
         }
         this.extendBounds(this.meshBounds);

         color('red');
         if (R.I_ != -1) {
            var node = nodes[R.I_];                          // HIGHLIGHT JOINT THAT WAS JUST CLICKED ON.
            this.drawNode(node.p, node.r);
         }

         if (R.clickType == 'B' && ! R.isCreatingNode)       // AFTER A CLICK OVER BACKGROUND,
            this.drawNode(R.clickPoint, 0.05);               // SHOW THAT A SECOND CLICK WOULD CREATE A NEW JOINT.
         for (var l = 0 ; l < links.length ; l++)
            this.renderLink(links[l]);                       // RENDER EACH 3D LINK.
      });
   }

////////////// CANVAS DRAWING STUFF //////////////

   this.drawNode = function(p, r) {
      _g.save();
      lineWidth(r * 320 * this.graph.pixelSize);
      mLine([p.x-.001,p.y,p.z],[p.x+.001,p.y,p.z]);
      _g.restore();
   }

   this.drawLink = function(a, b, radius) {
      if (radius === undefined) radius = 1;
      _g.save();
      lineWidth(2 * radius * this.graph.pixelSize);
      mLine([a.x,a.y,a.z], [b.x,b.y,b.z]);
      _g.restore();
   }

///////////////// THREE.js STUFF /////////////////

   var mesh;

   this.createMesh = function() {
      mesh = new THREE.Mesh();
      this.netMaterial = this.shaderMaterial();
      mesh.setMaterial(this.netMaterial);
      return mesh;
   }

   this.renderNode = function(node) {
      if (this.mesh === undefined)
         return;
      node.r = this.graph.R.defaultNodeRadius;
      if (node.g === undefined)
         this.mesh.add(node.g = this.graph.newNodeMesh(this.netMaterial, node.r));
      node.g.position.copy(node.p);
   }

   this.renderLink = function(link) {
      if (this.mesh === undefined)
         return;
      if (link.g === undefined)
         this.mesh.add(link.g = this.graph.newLinkMesh(this.netMaterial, 0.03 * Math.sqrt(link.w)));
      link.g.placeStick(this.graph.nodes[link.i].p, this.graph.nodes[link.j].p);
   }

//////////////////////////////////////////////////

}

