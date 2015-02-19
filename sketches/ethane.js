
function EthaneResponder() {

   this.doI(
      function() {                                             // Drag on a node to move it.
         var node = this.graph.nodes[this.I];
         if (node.d === undefined)
            node.d = newVec(0,0,0);
         var p = this.graph.p;
         node.d.set(p.x - node.p.x, p.y - node.p.y, p.z - node.p.z);
      },
      function() {
         this.graph.nodes[this.I].p.copy(this.graph.p);
      }
   );

   this.simulate = function() {
      var nodes = this.graph.nodes;
      var nn = nodes.length - 2;
      var i = 2 + Math.floor(nn * random());
      var j = 2 + Math.floor(nn * random());
      if (i != j) {
         var a = nodes[i].p;
         var b = nodes[j].p;
	 var d = a.distanceTo(b);
	 this.graph.adjustDistance(a, b, d + 0.5, 0.2 / (d * d), i != this.I && i != this.J, j != this.I && j != this.J);
      }
   }
}
EthaneResponder.prototype = new GraphResponder;

function Ethane() {
   this.label = 'ethane';
   this.is3D = true;

   this.createTime = time;

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
      var graph = this.graph;
      graph.pixelSize = this.computePixelSize();
      var nodes = graph.nodes;
      var links = graph.links;
      var R = graph.R;

      for (var i = 0 ; i < nodes.length ; i++)
         nodes[i].r = i < 2 ? 0.3 : 0.2;

      // DURING THE INITIAL SKETCH, DRAW EACH LINK.

      this.duringSketch(function() {
         for (var l = 0 ; l < 7 ; l++)
            this.drawLink(nodes[links[l].i].p, nodes[links[l].j].p);
      });

      // AFTER SKETCH IS DONE, DO FANCIER PROCESSING AND RENDERING.

      this.afterSketch(function() {

         while (graph.removedNodes.length > 0)
            mesh.remove(graph.removedNodes.pop().g);    // REMOVE GEOMETRY FOR ANY DEAD NODES

         while (graph.removedLinks.length > 0)
            mesh.remove(graph.removedLinks.pop().g);    // REMOVE GEOMETRY FOR ANY DEAD LINKS

         if (R.clickType == 'none') {
            R.simulate();                                    // CALL ANY USER DEFINED SIMULATION.
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

   function createPhongMaterial(rgb) {
      var material = new THREE.MeshPhongMaterial();
      material.color = material.emissive = new THREE.Color(rgb);
      return material;
   }

   this.carbonMaterial = createPhongMaterial(0x080808);
   this.hydrogenMaterial = createPhongMaterial(0x404040);
   this.linkMaterial = createPhongMaterial(0x202020);

   this.renderNode = function(node) {
      if (node.g === undefined)
	 mesh.add(node.g = this.graph.newNodeMesh(node.r < 0.25 ? this.hydrogenMaterial : this.carbonMaterial));
      var r = sCurve(Math.min(1, time - this.createTime)) * node.r;
      node.g.scale.set(r,r,r);
      node.g.position.copy(node.p);
   }

   this.renderLink = function(link) {
      if (link.g === undefined)
         mesh.add(link.g = this.graph.newLinkMesh(this.linkMaterial, 0.05));
      link.g.placeStick(this.graph.nodes[link.i].p, this.graph.nodes[link.j].p);
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

