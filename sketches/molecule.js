
function MoleculeResponder() {

   this.doI(
      function() {
         var node = this.graph.nodes[this.I];
         if (node.d === undefined)
            node.d = newVec(0,0,0);
         node.d.copy(this.graph.p).sub(node.p);
      },
      function() {                                             // Drag on a node to move it.
         this.graph.nodes[this.I].p.copy(this.graph.p);
      }
   );

   this.simulate = function() {
      var l = this.graph.linkCount + Math.floor((this.graph.links.length - this.graph.linkCount) * random());
      var link = this.graph.links[l];
      var i = link.i;
      var j = link.j;

      var a = this.graph.nodes[i].p;
      var b = this.graph.nodes[j].p;
      var d = a.distanceTo(b);
      this.graph.adjustDistance(a, b, d + random(), 0.1 / (d * d), i != this.I && i != this.J, j != this.I && j != this.J);
   }
}
MoleculeResponder.prototype = new GraphResponder;

function Molecule() {

   this.clone = function() {
      var sketch = Sketch.prototype.clone.call(this);
      sketch.graph = this.graph.clone();
      sketch.graph.linkCount = this.graph.linkCount;
      sketch.graph.setResponder(Object.create(this.graph.R));
      sketch.isCopy = true;
      return sketch;
   }

   this.labels = 'ethane water'.split(' ');
   this.is3D = true;

   this.createTime = time;

   this.graph = new VisibleGraph();
   this.graph.setResponder(new MoleculeResponder());
   var sq3 = Math.sqrt(3)/2;
   var hd = 0.7;
   var hx = lerp(hd, 0.5, 1);

   this.setup = function() {
      this.graph.clear();

      switch (this.labels[this.selection]) {
      case 'water':

         this.graph.addNode( 0.0,  0.0,  0.0, 'O');

         this.graph.addNode(-0.5,  0.35,  0.0, 'H');
         this.graph.addNode( 0.5,  0.35,  0.0, 'H');

         this.graph.addLink(0, 1);
         this.graph.addLink(0, 2);

	 break;

      case 'ethane':

         this.graph.addNode( -0.5,  0.0,  0.0, 'C');
         this.graph.addNode(  0.5,  0.0,  0.0, 'C');

         this.graph.addNode( -hx,  3/4 * hd,   sq3/2 * hd, 'H');
         this.graph.addNode( -hx,  0.0     ,  -sq3   * hd, 'H');
         this.graph.addNode( -hx, -3/4 * hd,   sq3/2 * hd, 'H');

         this.graph.addNode(  hx,  3/4 * hd,  -sq3/2 * hd, 'H');
         this.graph.addNode(  hx,  0.0     ,   sq3   * hd, 'H');
         this.graph.addNode(  hx, -3/4 * hd,  -sq3/2 * hd, 'H');

         this.graph.addLink(0, 1);

         this.graph.addLink(0, 2, 0.5);
         this.graph.addLink(0, 3, 0.5);
         this.graph.addLink(0, 4, 0.5);

         this.graph.addLink(1, 5, 0.5);
         this.graph.addLink(1, 6, 0.5);
         this.graph.addLink(1, 7, 0.5);

	 break;
      }

      this.graph.linkCount = this.graph.links.length;

      for (var i = 0 ; i < this.graph.nodes.length - 1 ; i++)
      for (var j = i + 1 ; j < this.graph.nodes.length ; j++)
         if (this.graph.findLink(i, j) == -1)
            this.graph.addLink(i, j, 0.1);
   }

   this.onMove    = function(point) { return this.graph.onMove   (point); }
   this.onPress   = function(point) { return this.graph.onPress  (point); }
   this.onDrag    = function(point) { return this.graph.onDrag   (point); }
   this.onRelease = function(point) { return this.graph.onRelease(point); }

   this.render = function() {

      if (this.isCopy !== undefined) {
         root.add(this.mesh = this.createMesh());
	 this.isCopy = undefined;
      }

      this.code = null;
      var graph = this.graph;
      graph.pixelSize = this.computePixelSize();
      var nodes = graph.nodes;
      var links = graph.links;
      var R = graph.R;

      for (var i = 0 ; i < nodes.length ; i++) {
         var node = nodes[i];
	 switch (node.type) {
	 case 'C': node.r = 0.3; break;
	 case 'O': node.r = 0.3; break;
	 case 'H': node.r = 0.2; break;
	 }
      }

      // DURING THE INITIAL SKETCH, DRAW EACH LINK.

      this.duringSketch(function() {
         for (var l = 0 ; l < this.graph.linkCount ; l++)
            this.drawLink(nodes[links[l].i].p, nodes[links[l].j].p);
      });

      // AFTER SKETCH IS DONE, DO FANCIER PROCESSING AND RENDERING.

      this.afterSketch(function() {

         while (graph.removedNodes.length > 0)
            mesh.remove(graph.removedNodes.pop().g);    // REMOVE GEOMETRY FOR ANY DEAD NODES

         while (graph.removedLinks.length > 0)
            mesh.remove(graph.removedLinks.pop().g);    // REMOVE GEOMETRY FOR ANY DEAD LINKS

         if (R.clickType == 'none') {
            //R.simulate();                                    // CALL ANY USER DEFINED SIMULATION.
            graph.updatePositions();
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
         for (var l = 0 ; l < this.graph.linkCount ; l++)
            this.renderLink(links[l]);                       // RENDER EACH 3D LINK.

         this.setOpacity(this.fade());
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

   this.createMesh = function() {
      mesh = new THREE.Mesh();
      mesh.setMaterial(this.netMaterial());
      return mesh;
   }

   function createPhongMaterial(rgb) {
      var material = new THREE.MeshPhongMaterial();
      material.color = material.emissive = new THREE.Color(rgb);
      return material;
   }

   this.materials = {
      C    : createPhongMaterial(0x080808),
      H    : createPhongMaterial(0x404040),
      N    : createPhongMaterial(0x002040),
      O    : createPhongMaterial(0x600000),
      link : createPhongMaterial(0x202020),
   }

   this.renderNode = function(node) {
      if (node.g === undefined)
         this.mesh.add(node.g = this.graph.newNodeMesh(this.materials[node.type]));
      var r = sCurve(Math.min(1, time - this.createTime)) * node.r;
      node.g.scale.set(r,r,r);
      node.g.position.copy(node.p);
   }

   this.renderLink = function(link) {
      if (link.g === undefined)
         this.mesh.add(link.g = this.graph.newLinkMesh(this.materials.link, 0.05));
      link.g.placeStick(this.graph.nodes[link.i].p, this.graph.nodes[link.j].p);
   }

   this.netMaterial = function() {
      if (this._netMaterial === undefined)
         this._netMaterial = this.shaderMaterial();
      return this._netMaterial;
   }

   this.setOpacity = function(f) {
      if (f < 1)
         for (var prop in this.materials) {
            var material = this.materials[prop];
            material.transparent = true;
            material.opacity = sCurve(f);
         }
   }

//////////////////////////////////////////////////

}
Molecule.prototype = new Sketch;
addSketchType('Molecule');

