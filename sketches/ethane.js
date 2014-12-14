
function EthaneResponder() {

   this.defaultNodeRadius = 0.1;

// RESPONSES NOT AFTER A CLICK.

   // Drag on a node to move it.

   this.onPress = function() {
      var node = this.graph.nodes[this.I];
      if (node.d === undefined)
         node.d = newVec(0,0,0);
      var p = this.graph.p;
      node.d.set(p.x - node.p.x, p.y - node.p.y, p.z - node.p.z);
   }
   this.onDrag = function() {
      this.graph.nodes[this.I].p.copy(this.graph.p);
   }

// RESPONSES AFTER CLICKING ON A JOINT.

   // Click on a node and then drag it to move it while the simulation pauses.

   this.onClickDrag = function() {
      this.graph.nodes[this.I_].p.copy(this.graph.p);
   }
   this.onClickRelease = function() {
      this.graph.computeLengths();
   }

   // Double click on a node to remove it.

   this.onClickClick = function() {
      this.graph.removeNode(this.I_);
      this.graph.computeLengths();
   }

   // Click on a node and then drag a different node. The simulation will pause.

   this.onClickDragJ = function() {
      this.graph.nodes[this.J].p.copy(this.graph.p);
   }

   // then when the second node is released, create a springy link between them.

   this.onClickReleaseJ = function() {
      this.graph.removeLink(this.graph.findLink(this.I_, this.J));
      this.graph.addLink(this.I_, this.J, 0.03);
      this.graph.computeLengths();
   }

   // Click on a node then click on another node to toggle a link between them.

   this.onClickClickJ = function() {
      var l = this.graph.findLink(this.I_, this.J);
      if (l == -1)
         this.graph.addLink(this.I_, this.J);
      else
         this.graph.removeLink(l);
      this.graph.computeLengths();
   }

// RESPONSES AFTER CLICKING ON THE BACKGROUND.

   // Click on the background, then click in the same place to create a new node,

   this.onClickBPressB = function() {
      var p = this.graph.p;
      this.isCreatingNode = p.distanceTo(this.clickPoint) < this.defaultNodeRadius;
      if (this.isCreatingNode)
         this.newJ = this.graph.addNode(p.x, p.y, p.z);
   }

   // then optionally drag to move the new node.

   this.onClickBDragB = function() {
      if (this.isCreatingNode)
         this.graph.nodes[this.newJ].p.copy(this.graph.p);
   }
   this.onClickBReleaseB = function() {
      this.isCreatingNode = false;
   }

   this.onClickBClickB = function() {
      this.isCreatingNode = false;
   }

   // Click on the background and then drag on a node to do a gesture on that node.

   this.onClickBPressJ = function() {
      var node = this.graph.nodes[this.J];
      node.r_at_click = node.r;
   }
   this.onClickBDragJ = function() {
      var node = this.graph.nodes[this.J];
      var a = this.clickPoint.distanceTo(node.p);
      var b = this.clickPoint.distanceTo(this.graph.p);
      node.r = node.r_at_click * b / a;
   }

   this.simulate = function() {
      var nodes = this.graph.nodes;
      var nn = nodes.length - 2;
      var i = 2 + Math.floor(nn * random());
      var j = 2 + Math.floor(nn * random());
      if (i != j) {
         var a = nodes[i].p;
         var b = nodes[j].p;
	 var d = a.distanceTo(b);
	 this.graph.adjustDistance(a, b, d + 0.5, 0.1 / (d * d), i != this.I && i != this.J, j != this.I && j != this.J);
      }
   }
}
EthaneResponder.prototype = new GraphResponder;

function Ethane() {
   this.labels = 'ethane'.split(' ');
   this.is3D = true;

   this.graph = new VisibleGraph();
   this.graph.setResponder(new EthaneResponder());
   this.graph.clear();
   var sq3 = Math.sqrt(3)/2;
   var hd = 0.7;

   this.graph.addNode( -0.5,  0.0,  0.0);
   this.graph.addNode(  0.5,  0.0,  0.0);

   var hx = lerp(hd, 0.5, 1);
   this.graph.addNode( -hx,  3/4 * hd,   sq3/2 * hd);
   this.graph.addNode( -hx,  0.0     ,  -sq3   * hd);
   this.graph.addNode( -hx, -3/4 * hd,   sq3/2);

   this.graph.addNode(  hx,  3/4 * hd,  -sq3/2 * hd);
   this.graph.addNode(  hx,  0.0     ,   sq3   * hd);
   this.graph.addNode(  hx, -3/4 * hd,  -sq3/2 * hd);

   this.graph.addLink(0, 1);

   this.graph.addLink(0, 2, 0.5);
   this.graph.addLink(0, 3, 0.5);
   this.graph.addLink(0, 4, 0.5);

   this.graph.addLink(1, 5, 0.5);
   this.graph.addLink(1, 6, 0.5);
   this.graph.addLink(1, 7, 0.5);

   for (var i = 0 ; i < this.graph.nodes.length - 1 ; i++)
   for (var j = i + 1 ; j < this.graph.nodes.length ; j++)
      if (this.graph.findLink(i, j) == -1)
         this.graph.addLink(i, j, 0.1);

   this.mouseMove = function(x,y) { return this.graph.mouseMove(x, y); }
   this.mouseDown = function(x,y) { return this.graph.mouseDown(x, y); }
   this.mouseDrag = function(x,y) { return this.graph.mouseDrag(x, y); }
   this.mouseUp   = function(x,y) { return this.graph.mouseUp  (x, y); }

   this.render = function() {
      this.code = null;
      this.graph.pixelSize = this.computePixelSize();
      var nodes = this.graph.nodes;
      var links = this.graph.links;
      var R = this.graph.R;

      for (var i = 0 ; i < nodes.length ; i++)
         nodes[i].r = i < 2 ? 0.3 : 0.15;

      // DURING THE INITIAL SKETCH, DRAW EACH LINK.

      this.duringSketch(function() {
         for (var l = 0 ; l < 7 ; l++)
            this.drawLink(nodes[links[l].i].p, nodes[links[l].j].p);
      });

      // AFTER SKETCH IS DONE, DO FANCIER PROCESSING AND RENDERING.

      this.afterSketch(function() {

         while (this.graph.removedNodes.length > 0)
            mesh.remove(this.graph.removedNodes.pop().g);    // REMOVE GEOMETRY FOR ANY DEAD NODES

         while (this.graph.removedLinks.length > 0)
            mesh.remove(this.graph.removedLinks.pop().g);    // REMOVE GEOMETRY FOR ANY DEAD LINKS

         if (R.clickType == 'none') {
            R.simulate();                                    // CALL ANY USER DEFINED SIMULATION.
            this.graph.updatePositions();
         }
         color('cyan');
         for (var j = 0 ; j < nodes.length ; j++) {
            var node = nodes[j];
            if (node.pix === undefined)
               node.pix = newVec(0,0,0);
            node.pix.copy(node.p).applyMatrix4(pointToPixelMatrix);
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
         for (var l = 0 ; l < 7 ; l++)
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
      mesh.setMaterial(this.netMaterial());
      return mesh;
   }

   this.renderNode = function(node) {
      if (node.g === undefined) {
         node.g = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 8), this.netMaterial());
         node.g.quaternion = new THREE.Quaternion();
         node.r = this.graph.R.defaultNodeRadius;
         mesh.add(node.g);
      }
      node.g.scale.set(node.r,node.r,node.r);
      node.g.position.copy(node.p);
   }

   this.renderLink = function(link) {
      if (link.g === undefined) {
         link.g = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), this.netMaterial());
         link.g.scale.x = link.g.scale.y = 0.03 * Math.sqrt(link.w);
         mesh.add(link.g);
      }
      var a = this.graph.nodes[link.i].p;
      var b = this.graph.nodes[link.j].p;
      link.g.position.copy(a).lerp(b, 0.5);
      link.g.lookAt(b);
      link.g.scale.z = a.distanceTo(b) / 2;
   }

   this.netMaterial = function() {
      if (this._netMaterial === undefined)
         this._netMaterial = this.shaderMaterial();
      return this._netMaterial;
   }

//////////////////////////////////////////////////

}
Ethane.prototype = new Sketch;
addSketchType('Ethane');

