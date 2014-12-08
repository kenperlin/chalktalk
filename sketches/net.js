/*
   Problem -- deleting a joint seems to leave links that should not be there.

   Problem -- right now we can't specify forces properly after object is rotated,
   because distance along pixel ray is not specified accurately.

   Translate/rotate/scale/etc a node.
   Text for a node (eg: atomic symbol).
   Nodes do not knock into each other.
   Procedural "shaders" for movement: swim, walk, symmetry, electric charge repulsion, etc.
   Eg: ethane molecule, with repelling H atoms.

   DONE Create separate responder object.
   DONE Change rendering to use THREE.js ball and stick model.
*/

function Net() {
   function nv(x,y,z) { return new THREE.Vector3(x,y,z); }
   function v2s(v) { return "(" + v.x + "," + v.y + "," + v.z + ")"; }
   var adjustDistance = function(A, B, d, e, isAdjustingA, isAdjustingB) {
      var x = B.x - A.x;
      var y = B.y - A.y;
      var z = B.z - A.z;
      var t = e * (d / Math.sqrt(x * x + y * y + z * z) - 1);
      if (isAdjustingA) {
         A.x -= t * x;
         A.y -= t * y;
         A.z -= t * z;
      }
      if (isAdjustingB) {
         B.x += t * x;
         B.y += t * y;
         B.z += t * z;
      }
   }
   this.labels = 'net'.split(' ');
   this.nodes = [{p:nv(0,1,0)},{p:nv(0,0,0)},{p:nv(-.5,-1,0)},{p:nv(.5,-1,0)}];
   this.links = [[0,1],[1,2],[1,3]];
   this.is3D = true;

   this.myShaderMaterial = function() {
      if (this.myMaterial === undefined)
         this.myMaterial = this.shaderMaterial();
      return this.myMaterial;
   }

   var p = nv(0,0,0), q = nv(0,0,0), travel;

   this.findLink = function(i, j) {
      if (i != j)
         for (var l = 0 ; l < this.links.length ; l++) {
            var link = this.links[l];
            if (link[0] == i && link[1] == j || link[0] == j && link[1] == i)
               return l;
         }
      return -1;
   }

   this.pixelDistance = function(a, b) {
      if (a === undefined || b === undefined) return 100;
      var x = b[0] - a[0], y = b[1] - a[1];
      return sqrt(x * x + y * y);
   }

   this.findNode = function(pix) {
      for (var j = 0 ; j < this.nodes.length ; j++) {
         var node = this.nodes[j];
         if (this.pixelDistance(pix, node.pix) < 5 * renderScale)
            return j;
      }
      return -1;
   }

   this.removeNode = function(j) {
      if (j < 0 || j >= this.nodes.length)
         return;

      var node = this.nodes[j];
      if (node.g !== undefined)
         mesh.remove(node.g);

      this.nodes.splice(j, 1);

      for (var l = 0 ; l < this.links.length ; l++)
         if (this.links[l][0] == j || this.links[l][1] == j)
            this.removeLink(l);

      for (var l = 0 ; l < this.links.length ; l++)
         for (var n = 0 ; n < 2 ; n++)
            if (this.links[l][n] > j)
               this.links[l][n]--;
   }

   this.removeLink = function(l) {
      if (l < 0 || l >= this.links.length)
         return;

      var link = this.links[l];
      if (link.g !== undefined)
         mesh.remove(link.g);

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
            var w = link.length == 2 ? 1 : link[2];
            this.lengths.push({ i:i, j:j, d:d, w:w });;
         }
      }
   }
   this.computeLengths();

   function pixelToPoint(x, y, p) {
      p.x = x;
      p.y = y;
      p.z = 0;
      p.applyMatrix4(pixelToPointMatrix);
   }

   function NetResponder() {
      this.clickType = 'none';
      this.clickPoint = new THREE.Vector3(0,0,0);
      this.net;
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
   };

   function MyNetResponder() {
   
// RESPONSES NOT AFTER A CLICK.

      // Drag on a node to move it.
   
      this.onPress = function() {
         var node = this.net.nodes[this.I];
         if (node.d === undefined)
            node.d = nv(0,0,0);
         node.d.set(p.x - node.p.x, p.y - node.p.y, p.z - node.p.z);
      }
      this.onDrag = function() {
         this.net.nodes[this.I].p.copy(p);
      }
   
// RESPONSES AFTER CLICKING ON A JOINT.

      // Click on a node and then drag it to move it while the simulation pauses.
   
      this.onClickDrag = function() {
         this.net.nodes[this.I_].p.copy(p);
      }

      // Click on a node and then drag a different node. The simulation will pause.

      this.onClickDragJ = function() {
         this.net.nodes[this.J].p.copy(p);
      }

      // then when the second node is released, create a springy link between them.

      this.onClickReleaseJ = function() {
         this.net.removeLink(this.net.findLink(this.I_, this.J));
         this.net.links.push([this.I_, this.J, .03]);
         this.net.computeLengths();
      }

      // Double click on a node to remove it.

      this.onClickClick = function() {
         this.net.removeNode(this.I_);
         this.net.computeLengths();
      }

      // Click on a node then click on another node to toggle a link between them.

      this.onClickClickJ = function() {
         var l = this.net.findLink(this.I_, this.J);
         if (l == -1)
            this.net.links.push([this.I_, this.J]);
         else
            this.net.removeLink(l);
         this.net.computeLengths();
      }

// RESPONSES AFTER CLICKING ON THE BACKGROUND.

      // Click on the background, then click in the same place to create a new node,
   
      this.onClickBPressB = function() {
         this.isCreatingNode = p.distanceTo(this.clickPoint) < .1;
	 if (this.isCreatingNode) {
            this.newJ = this.net.nodes.length;
            this.net.nodes.push({p:nv(p.x,p.y,p.z)});
         }
      }

      // then optionally drag to move the new node.

      this.onClickBDragB = function() {
         if (this.isCreatingNode)
            this.net.nodes[this.newJ].p.copy(p);
      }
      this.onClickBReleaseB = function() {
         this.isCreatingNode = false;
      }

      // Click on the background and then on a node to do a gesture on that node.

      this.onClickBReleaseJ = function() {
	 console.log(v2s(this.clickPoint) + " " + v2s(this.net.nodes[this.J].p) + " " + v2s(p));
      }
   }
   MyNetResponder.prototype = new NetResponder;

   var R = new MyNetResponder();
   R.net = this;

   this.mouseDown = function(x,y) {
      pixelToPoint(x, y, p);
      travel = 0;
      switch (R.clickType) {
      case 'B':
         R.J = this.findNode([x,y]);
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
         R.J = this.findNode([x,y]);
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
         R.I = this.findNode([x,y]);
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
      q.copy(p);
      pixelToPoint(x, y, p);
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
      R.K = this.findNode([x,y]);
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
      R.K = -1;
   }

   var renderScale = 1;

   function drawNode(p, r) {
      _g.save();
      lineWidth(r * 16 * renderScale);
      mLine([p.x-.001,p.y,p.z],[p.x+.001,p.y,p.z]);
      _g.restore();
   }

   function drawLink(a, b, radius) {
      if (radius === undefined) radius = 1;
      _g.save();
      lineWidth(radius * renderScale);
      mLine([a.x,a.y,a.z], [b.x,b.y,b.z]);
      _g.restore();
   }

   this.render = function() {
      this.code = null;

      var a = m._m();
      renderScale = this.scale() * (this.xyz.length < 3 ? 1 : [2]);
      lineWidth(4 * renderScale);
      this.afterSketch(function() {
         if (R.clickType == 'none') {

	    // Make any small adjustments to node position needed after mouse press on a node.

            for (var j = 0 ; j < this.nodes.length ; j++) {
               var node = this.nodes[j];
               if (node.d !== undefined) {
	          q.copy(node.d).multiplyScalar(0.1);
		  node.p.add(q);
	          q.negate();
		  node.d.add(q);
               }
            }

	    // Coerce all links to be the proper length.

            for (var rep = 0 ; rep < 10 ; rep++)
            for (var n = 0 ; n < this.lengths.length ; n++) {
               var L = this.lengths[n];
               adjustDistance(this.nodes[L.i].p, this.nodes[L.j].p, L.d, L.w/2, L.i != R.I && L.i != R.J, L.j != R.I && L.j != R.J);
            }
         }
      });

      this.afterSketch(function() {

         for (var j = 0 ; j < this.nodes.length ; j++) {
            var node = this.nodes[j];
            var x = node.p.x, y = node.p.y, z = node.p.z;
            node.pix = mTransform([x, y, z]);

            this.renderNode(node);

            if (node.f !== undefined) {
               _g.save();
               _g.strokeStyle = 'yellow';
               _g.lineWidth = 2;
               mLine([x,y,z], [ node.p.x + node.f.x,
                                node.p.y + node.f.y,
                                node.p.z + node.f.z ]);
               _g.restore();
            }

            // HIGHLIGHT SECOND JOINT IN A TWO JOINT GESTURE.

            color('cyan');
            drawNode(node.p, j == R.J ? 1 : .01);
         }

         // HIGHLIGHT JOINT THAT WAS JUST CLICKED ON.

         if (R.I_ != -1) {
            color('red');
            drawNode(this.nodes[R.I_].p, 1);
         }

         // AFTER A CLICK OVER BACKGROUND, SHOW THAT A SECOND CLICK AT SAME PLACE WOULD CREATE A NEW JOINT.

         if (R.clickType == 'B' && ! R.isCreatingNode) {
            color('red');
            drawNode(R.clickPoint, 1);
            color('black');
            drawNode(R.clickPoint, 0.8);
         }
      });

      for (var l = 0 ; l < this.links.length ; l++) {
         var link = this.links[l];

         this.duringSketch(function() {
            drawLink(this.nodes[link[0]].p, this.nodes[link[1]].p);
         });

         this.afterSketch(function() {
	    this.renderLink(link);
         });
      }
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
         node.g.scale = nv(.1,.1,.1);
         node.g.quaternion = new THREE.Quaternion();
         node.g.position = nv(0,0,0);
      }
      node.g.position.copy(node.p);
   }

   this.renderLink = function(link) {
      if (link.g === undefined) {
         var geometry = new THREE.BoxGeometry(2, 2, 2);
         link.g = new THREE.Mesh(geometry, this.myShaderMaterial());
         link.g.scale.x =
         link.g.scale.y = link.length == 2 ? .03 : .003;
         mesh.add(link.g);
      }
      var a = this.nodes[link[0]].p;
      var b = this.nodes[link[1]].p;
      link.g.position.copy(a).lerp(b, 0.5);
      link.g.lookAt(b);
      link.g.scale.z = a.distanceTo(b) / 2;
   }

//////////////////////////////////////////////////

}
Net.prototype = new Sketch;
addSketchType('Net');

