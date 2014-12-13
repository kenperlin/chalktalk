/*
   Should gradually drift toward origin (adjust translation accordingly) so rotation is always around center.

   Problem -- deleting a joint seems to leave links that should not be there.

   Create nested Graphs (that is, a node can be a Graph).

   Put Graph method definitions into prototype.

   Translate/rotate/scale/etc a node.
   Text for a node (eg: atomic symbol).
   Procedural "shaders" for movement: swim, walk, symmetry, electric charge repulsion, etc.
   Eg: ethane molecule, with repelling H atoms.

   DONE Bug whereby bounding box is clearly too big -- maybe there are phantom nodes?
   DONE findNode should pick the front-most one.
   DONE Create a Graph base class, that knows only about node, links, and basic extensible bahavior -- not rendering.
   DONE Nodes do not knock into each other.
   DONE Gesture to scale a node.
   DONE Create separate responder object.
   DONE Change rendering to use THREE.js ball and stick model.
*/

function nv(x,y,z) { return new THREE.Vector3(x,y,z); }

function GraphResponder() {
   this.clickType = 'none';
   this.clickPoint = new THREE.Vector3(0,0,0);
   this.graph;
   this.I = -1;
   this.I_ = -1;
   this.J = -1;
   this.K = -1;
   this.onPress = function() { }
   this.onPressB = function() { }
   this.onDrag = function() { }
   this.onDragB = function() { }
   this.onRelease = function() { }
   this.onReleaseJ = function() { }
   this.onReleaseB = function() { }
   this.onClick = function() { }
   this.onClickB = function() { }
   this.onClickPress = function() { }
   this.onClickPressJ = function() { }
   this.onClickPressB = function() { }
   this.onClickDrag = function() { }
   this.onClickDragJ = function() { }
   this.onClickDragB = function() { }
   this.onClickRelease = function() { }
   this.onClickReleaseJ = function() { }
   this.onClickReleaseB = function() { }
   this.onClickClick = function() { }
   this.onClickClickJ = function() { }
   this.onClickClickB = function() { }
   this.onClickBPressB = function() { }
   this.onClickBPressJ = function() { }
   this.onClickBDragB = function() { }
   this.onClickBDragJ = function() { }
   this.onClickBReleaseB = function() { }
   this.onClickBReleaseJ = function() { }
   this.onClickBClickJ = function() { }
   this.onClickBClickB = function() { }
   this.simulate = function() { }
};

////////////////////////////////////////////////

function Graph() {
   function v2s(v) { return "(" + v.x + "," + v.y + "," + v.z + ")"; }

   this.addNode = function(x,y,z) {
      this.nodes.push({p:nv(x,y,z)});
   }

   this.addLink = function(i, j) {
      this.links.push({i:i, j:j});
   }

   this.nodes = [];
   this.links = [];

   var tmp = nv(0,0,0);

   this.adjustDistance = function(A, B, d, e, isAdjustingA, isAdjustingB) {
      tmp.copy(B).sub(A).multiplyScalar( e * (d / A.distanceTo(B) - 1) );
      if (isAdjustingA)
         A.sub(tmp);
      if (isAdjustingB)
         B.add(tmp);
   }

   this.adjustNodePositions = function() {
      for (var j = 0 ; j < this.nodes.length ; j++) {
         var node = this.nodes[j];
         if (node.d !== undefined) {
            tmp.copy(node.d).multiplyScalar(0.1);
            node.p.add(tmp);
            tmp.negate();
            node.d.add(tmp);
         }
      }
   }

   this.nodesAvoidEachOther = function() {
      for (var i = 0 ; i < this.nodes.length-1 ; i++)
         for (var j = i+1 ; j < this.nodes.length ; j++) {
            var a = this.nodes[i];
            var b = this.nodes[j];
            if (a.r !== undefined && b.r !== undefined) {
               var d = a.p.distanceTo(b.p);
               if (d < a.r + b.r) {
                  var t = (a.r + b.r) / d;
                  tmp.copy(a.p).lerp(b.p,.5);
                  a.p.lerp(tmp, 1 - t);
                  b.p.lerp(tmp, 1 - t);
               }
            }
         }
   }

   this.adjustEdgeLengths = function() {
      var R = this.R;
      for (var rep = 0 ; rep < 10 ; rep++)
         for (var n = 0 ; n < this.lengths.length ; n++) {
            var L = this.lengths[n];
            var a = this.nodes[L.i];
            var b = this.nodes[L.j];
            this.adjustDistance(a.p, b.p, L.d, L.w/2, L.i != R.I && L.i != R.J, L.j != R.I && L.j != R.J);
         }
   }

   this.updatePositions = function() {
      this.adjustNodePositions(); // Adjust position as needed after mouse press on a node.
      this.nodesAvoidEachOther(); // Make sure nodes do not intersect.
      this.adjustEdgeLengths();   // Coerce all links to be the proper length.
   }

   this.findLink = function(i, j) {
      if (i != j)
         for (var l = 0 ; l < this.links.length ; l++) {
            var link = this.links[l];
            if (link.i == i && link.j == j || link.i == j && link.j == i)
               return l;
         }
      return -1;
   }

   this.removeNode = function(j) {
      if (j < 0 || j >= this.nodes.length)
         return;

      for (var l = 0 ; l < this.links.length ; l++) {
         var link = this.links[l];
         if (link.i == j || link.j == j)
            this.removeLink(l--);
      }

      for (var l = 0 ; l < this.links.length ; l++) {
         var link = this.links[l];
	 if (link.i > j)
	    link.i--;
	 if (link.j > j)
	    link.j--;
      }

      this.nodes.splice(j, 1);
   }

   this.removeLink = function(l) {
      if (l < 0 || l >= this.links.length)
         return;

      this.links.splice(l, 1);
   }

   this.computeLengths = function() {
      this.lengths = [];
      for (var i = 0 ; i < this.nodes.length - 1 ; i++)
      for (var j = i + 1 ; j < this.nodes.length ; j++) {
         var l = this.findLink(i, j);
         if (l >= 0) {
            var link = this.links[l];
            var d = this.nodes[i].p.distanceTo(this.nodes[j].p);
            var w = link.w === undefined ? 1 : link.w;
            this.lengths.push({ i:i, j:j, d:d, w:w });;
         }
      }
   }
   this.computeLengths();
}

function VisibleGraph() {
   var p = nv(0,0,0), q = nv(0,0,0), pix = nv(0,0,0), travel;
   this.pixelSize = 1;

   this.findNode = function(pix) {
      var zNearest = -Number.MAX_VALUE;
      var jNearest = -1;
      for (var j = 0 ; j < this.nodes.length ; j++) {
         var node = this.nodes[j];
         var d = 10;
         if (node.r !== undefined)
            d *= node.r * 10;
         var dx = pix.x - node.pix.x;
         var dy = pix.y - node.pix.y;
         if (Math.sqrt(dx * dx + dy * dy) < d * this.pixelSize && node.pix.z > zNearest) {
            jNearest = j;
	    zNearest = node.pix.z;
         }
      }
      return jNearest;
   }

   this.mouseMove = function(x,y) {
   }

   this.mouseDown = function(x,y) {
      var R = this.R;
      pix.set(x,y,0);
      p.copy(pix).applyMatrix4(pixelToPointMatrix);
      travel = 0;
      switch (R.clickType) {
      case 'B':
         R.J = this.findNode(pix);
         R.actionType = R.J != -1 ? 'J' : 'B';
         switch (R.actionType) {
         case 'J':
            R.onClickBPressJ();
            break;
         case 'B':
            R.onClickBPressB();
            break;
         }
         break;
      case 'J':
         R.J = this.findNode(pix);
         R.actionType = R.J == R.I_ ? 'I' : R.J != -1 ? 'J' : 'B';
         switch (R.actionType) {
         case 'I':
            R.onClickPress();
            break;
         case 'J':
            R.onClickPressJ();
            break;
         case 'B':
            R.onClickPressB();
            break;
         }
         break;
      default:
         R.I = this.findNode(pix);
         R.actionType = R.I != -1 ? 'I' : 'B';
         switch (R.actionType) {
         case 'I':
            R.onPress();
            break;
         case 'B':
            R.onPressB();
            break;
         }
         break;
      }
   }

   this.mouseDrag = function(x,y) {
      var R = this.R;
      q.copy(p);
      pix.set(x,y,0);
      p.copy(pix).applyMatrix4(pixelToPointMatrix);
      travel += p.distanceTo(q);
      switch (R.clickType) {
      case 'B':
         switch (R.actionType) {
         case 'J': R.onClickBDragJ(); break;
         case 'B': R.onClickBDragB(); break;
         }
         break;
      case 'J':
         switch (R.actionType) {
         case 'I': R.onClickDrag(); break;
         case 'J': R.onClickDragJ(); break;
         case 'B': R.onClickDragB(); break;
         }
         break;
      default:
         switch (R.actionType) {
         case 'I': R.onDrag(); break;
         case 'B': R.onDragB(); break;
         }
         break;
      }
   }

   this.mouseUp = function(x,y) {
      var R = this.R;
      pix.set(x,y,0);
      R.K = this.findNode(pix);
      switch (R.clickType) {
      case 'B':
         R.clickType = 'none';
         if (travel >= .1) {
            switch (R.actionType) {
            case 'J': R.onClickBReleaseJ(); break;
            case 'B': R.onClickBReleaseB(); break;
            }
         }
         else {
            switch (R.actionType) {
            case 'J': R.onClickBClickJ(); break;
            case 'B': R.onClickBClickB(); break;
            }
         }
         break;
      case 'J':
         R.clickType = 'none';
         if (travel >= .1)
            switch (R.actionType) {
            case 'I': R.onClickRelease(); break;
            case 'J': R.onClickReleaseJ(); break;
            case 'B': R.onClickReleaseB(); break;
            }
         else
            switch (R.actionType) {
            case 'I': R.onClickClick(); break;
            case 'J': R.onClickClickJ(); break;
            case 'B': R.onClickClickB(); break;
            }
         R.J = -1;
         R.I_ = -1;
         break;
      default:
         if (travel >= .1) {
            switch (R.actionType) {
            case 'I': R.onRelease(); break;
            case 'B': R.onReleaseB(); break;
            }
         }
         else {
            switch (R.actionType) {
            case 'I':
               R.I_ = R.I;
               R.onClick();
               R.clickType = 'J';
               break;
            case 'B':
               R.onClickB();
               R.clickType = 'B';
               break;
            }
            R.clickPoint.copy(p);
         }
         R.I = -1;
         R.J = -1;
         break;
      }
      R.J = -1;
      R.K = -1;
   }

   function MyGraphResponder() {
   
// RESPONSES NOT AFTER A CLICK.

      // Drag on a node to move it.
   
      this.onPress = function() {
         var node = this.graph.nodes[this.I];
         if (node.d === undefined)
            node.d = nv(0,0,0);
         node.d.set(p.x - node.p.x, p.y - node.p.y, p.z - node.p.z);
      }
      this.onDrag = function() {
         this.graph.nodes[this.I].p.copy(p);
      }
   
// RESPONSES AFTER CLICKING ON A JOINT.

      // Click on a node and then drag it to move it while the simulation pauses.
   
      this.onClickDrag = function() {
         this.graph.nodes[this.I_].p.copy(p);
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
         this.graph.nodes[this.J].p.copy(p);
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
         this.isCreatingNode = p.distanceTo(this.clickPoint) < .1;
         if (this.isCreatingNode) {
            this.newJ = this.graph.nodes.length;
            this.graph.nodes.push({p:nv(p.x,p.y,p.z)});
         }
      }

      // then optionally drag to move the new node.

      this.onClickBDragB = function() {
         if (this.isCreatingNode)
            this.graph.nodes[this.newJ].p.copy(p);
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
         var b = this.clickPoint.distanceTo(p);
         node.r = node.r_at_click * b / a;
      }
      this.onClickBReleaseJ = function() {
      }
   }
   MyGraphResponder.prototype = new GraphResponder;

   this.R = new MyGraphResponder();
   this.R.graph = this;
}
VisibleGraph.prototype = new Graph;

function Net() {

   this.labels = 'net'.split(' ');
   this.is3D = true;
   this.graph = new VisibleGraph();

   this.graph.nodes = [];
   this.graph.addNode(  0, 1, 0);
   this.graph.addNode(  0, 0, 0);
   this.graph.addNode(-.5,-1, 0);
   this.graph.addNode( .5,-1, 0);

   this.graph.links = [];
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
	       node.pix = nv(0,0,0);
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

