/*
   Should gradually drift toward origin (adjust translation accordingly) so rotation is always around center.

   Create nested Graphs (that is, a node can be a Graph).

   Translate/rotate/scale/etc a node.
   Text for a node (eg: atomic symbol).
   Procedural "shaders" for movement: swim, walk, symmetry, electric charge repulsion, etc.
   Eg: ethane molecule, with repelling H atoms.

   DONE Put Graph method definitions into prototype.
   DONE Bug whereby bounding box is clearly too big -- maybe there are phantom nodes?
   DONE findNode should pick the front-most one.
   DONE Create a Graph base class, that knows only about node, links, and basic extensible bahavior -- not rendering.
   DONE Nodes do not knock into each other.
   DONE Gesture to scale a node.
   DONE Create separate responder object.
   DONE Change rendering to use THREE.js ball and stick model.
*/

function NetResponder() {

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
      this.graph.links.push({i:this.I_, j:this.J, w:.03});
      this.graph.computeLengths();
   }

   // Click on a node then click on another node to toggle a link between them.

   this.onClickClickJ = function() {
      var l = this.graph.findLink(this.I_, this.J);
      if (l == -1)
         this.graph.links.push({i:this.I_, j:this.J});
      else
         this.graph.removeLink(l);
      this.graph.computeLengths();
   }

// RESPONSES AFTER CLICKING ON THE BACKGROUND.

   // Click on the background, then click in the same place to create a new node,

   this.onClickBPressB = function() {
      var p = this.graph.p;
      this.isCreatingNode = p.distanceTo(this.clickPoint) < .1;
      if (this.isCreatingNode) {
         this.newJ = this.graph.nodes.length;
         this.graph.nodes.push({p:newVec(p.x,p.y,p.z)});
      }
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
   this.onClickBReleaseJ = function() {
   }
}
NetResponder.prototype = new GraphResponder;

function Net() {

   this.labels = 'net'.split(' ');
   this.is3D = true;

   this.graph = new VisibleGraph();
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

   this.mouseMove = function(x,y) { return this.graph.mouseMove(x, y); }
   this.mouseDown = function(x,y) { return this.graph.mouseDown(x, y); }
   this.mouseDrag = function(x,y) { return this.graph.mouseDrag(x, y); }
   this.mouseUp   = function(x,y) { return this.graph.mouseUp  (x, y); }

   this.render = function() {
      this.code = null;
      this.graph.pixelSize = this.scale() * (this.xyz.length < 3 ? 1 : this.xyz[2]);
      var nodes = this.graph.nodes;
      var links = this.graph.links;
      var R = this.graph.R;

      // DURING THE INITIAL SKETCH, DRAW EACH LINK.

      this.duringSketch(function() {
         for (var l = 0 ; l < links.length ; l++)
            this.drawLink(nodes[links[l].i].p, nodes[links[l].j].p);
      });

      // AFTER SKETCH IS DONE, DO FANCIER PROCESSING AND RENDERING.

      this.afterSketch(function() {

         //////// REMOVE ANY GEOMETRY THAT IS NO LONGER IN THE GRAPH. //////

         for (var i = 0 ; i < mesh.children.length ; i++)
            mesh.children[i].tagForRemoval = true;                 // TAG ALL GEOMETRY OBJECTS FOR REMOVAL.

         for (var i = 0 ; i < nodes.length ; i++)
            if (nodes[i].g !== undefined)
               nodes[i].g.tagForRemoval = undefined;               // UNTAG IF NODE IS STILL IN THE GRAPH.

         for (var i = 0 ; i < links.length ; i++)
            if (links[i].g !== undefined)
               links[i].g.tagForRemoval = undefined;               // UNTAG IF LINK IS STILL IN THE GRAPH.

         for (var i = 0 ; i < mesh.children.length ; i++)
            if (mesh.children[i].tagForRemoval !== undefined)
               mesh.remove(mesh.children[i]);                      // REMOVE ALL OBJECTS THAT ARE STILL TAGGED.

         / //////////////////////////////////////////////////////////////////

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
      mesh.setMaterial(this.myShaderMaterial());
      return mesh;
   }

   this.renderNode = function(node) {
      if (node.g === undefined) {
         var geometry = new THREE.SphereGeometry(1, 16, 8);
         node.g = new THREE.Mesh(geometry, this.myShaderMaterial());
         mesh.add(node.g);
         node.g.quaternion = new THREE.Quaternion();
         node.r = 0.1;
      }
      node.g.scale.set(node.r,node.r,node.r);
      node.g.position.copy(node.p);
   }

   this.renderLink = function(link) {
      if (link.g === undefined) {
         var geometry = new THREE.BoxGeometry(2, 2, 2);
         link.g = new THREE.Mesh(geometry, this.myShaderMaterial());
         var w = link.w === undefined ? 1 : link.w;
         link.g.scale.x = link.g.scale.y = .03 * Math.sqrt(w);
         mesh.add(link.g);
      }
      var a = this.graph.nodes[link.i].p;
      var b = this.graph.nodes[link.j].p;
      link.g.position.copy(a).lerp(b, 0.5);
      link.g.lookAt(b);
      link.g.scale.z = a.distanceTo(b) / 2;
   }

   this.myShaderMaterial = function() {
      if (this.myMaterial === undefined)
         this.myMaterial = this.shaderMaterial();
      return this.myMaterial;
   }

//////////////////////////////////////////////////

}
Net.prototype = new Sketch;
addSketchType('Net');

