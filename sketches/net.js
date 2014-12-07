/*
   Problem -- right now we can't specify forces properly after object is rotated,
   because distance along pixel ray is not specified accurately.

   Translate/rotate/scale/etc on one node.
   Text for a node (eg: atomic symbol).
   Nodes do not knock into each other.
   Procedural "shaders" for movement: swim, walk, symmetry, electric charge repulsion, etc.
   Eg: ethane molecule.

   DONE Create separate responder object.
   DONE Change rendering to use THREE.js ball and stick model.
*/

function Net() {
   function nv(x,y,z) { return new THREE.Vector3(x,y,z); }
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

   this.distance = function(a, b) {
      var x = b.x - a.x, y = b.y - a.y, z = b.z - a.z;
      return sqrt(x * x + y * y + z * z);
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
            var d = this.distance(this.nodes[i].p, this.nodes[j].p);
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
   
      this.onClickDrag = function() {
         this.net.nodes[this.I_].p.copy(p);
      }
      this.onClickDragJ = function() {
         this.net.nodes[this.J].p.copy(p);
      }
      this.onClickReleaseJ = function() {
         this.net.removeLink(this.net.findLink(this.I_, this.J));
         this.net.links.push([this.I_, this.J, .03]);
         this.net.computeLengths();
      }
      this.onClickClick = function() {
         this.net.removeNode(this.I_);
         this.net.computeLengths();
      }
      this.onClickClickJ = function() {
         var l = this.net.findLink(this.I_, this.J);
         if (l == -1)
            this.net.links.push([this.I_, this.J]);
         else
            this.net.removeLink(l);
         this.net.computeLengths();
      }
      this.onClickClickB = function() {
         var node = this.net.nodes[this.I_];
         if (node.f === undefined)
            node.f = nv(0,0,0);
         node.f.set(p.x - node.p.x, p.y - node.p.y, p.z - node.p.z);
      }
   
      // RESPONSES AFTER CLICKING ON THE BACKGROUND.
   
      this.onClickBPressB = function() {
         if (this.net.distance(this.clickPoint, p) < .1) {
            this.J = this.net.nodes.length;
            this.net.nodes.push({p:nv(p.x,p.y,p.z)});
         }
      }
      this.onClickBDragJ = function() {
         if (this.J != -1)
            this.net.nodes[this.J].p.copy(p);
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
         if (R.J != -1)
            R.onClickBPressJ();
         else
            R.onClickBPressB();
         break;
      case 'J':
         R.J = this.findNode([x,y]);
         if (R.J == R.I_)
            R.onClickPress();
         else if (R.J != -1)
            R.onClickPressJ();
         else
            R.onClickPressB();
         break;
      default:
         R.I = this.findNode([x,y]);
         if (R.I != -1)
            R.onPress();
         else
            R.onPressB();
         break;
      }
   }

   this.mouseDrag = function(x,y) {
      q.copy(p);
      pixelToPoint(x, y, p);
      travel += this.distance(p, q);
      switch (R.clickType) {
      case 'B':
         if (R.J != -1)
            R.onClickBDragJ();
         else
            R.onClickBDragB();
         break;
      case 'J':
         if (R.J == R.I_)
            R.onClickDrag();
         else if (R.J != -1)
            R.onClickDragJ();
         else
            R.onClickDragB();
         break;
      default:
         if (R.I != -1)
            R.onDrag();
         else
            R.onDragB();
         break;
      }
   }

   this.mouseUp = function(x,y) {
      switch (R.clickType) {
      case 'B':
         R.clickType = 'none';
         R.J = this.findNode([x,y]);
         if (travel >= .1) {
            if (R.J != -1)
               R.onClickBReleaseJ();
            else
               R.onClickBReleaseB();
         }
         else {
            if (R.J != -1)
               R.onClickBClickJ();
            else
               R.onClickBClickB();
         }
         R.J = -1;
         break;
      case 'J':
         R.clickType = 'none';
         if (travel >= .1)
            if (R.J == R.I_)
               R.onClickRelease();
            else if (R.J != -1)
               R.onClickReleaseJ();
            else
               R.onClickReleaseB();
         else
            if (R.J == R.I_)
               R.onClickClick();
            else if (R.J != -1)
               R.onClickClickJ();
            else
               R.onClickClickB();
         R.J = -1;
         R.I_ = -1;
         break;
      default:
         if (travel >= .1) {
            R.J = this.findNode([x,y]);
            if (R.J == R.I)
               R.onRelease();
            else if (R.J != -1)
               R.onReleaseJ();
            else
               R.onReleaseB();
         }
         else {
            if (R.I != -1) {
               R.I_ = R.I;
               R.onClick();
               R.clickType = 'J';
            }
            else {
               R.onClickB();
               R.clickType = 'B';
            }
            R.clickPoint.copy(p);
         }
         R.I = -1;
         R.J = -1;
         break;
      }
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

            for (var j = 0 ; j < this.nodes.length ; j++) {
               var node = this.nodes[j];
               if (node.d !== undefined) {
                  node.p.x += .1 * node.d.x;
                  node.p.y += .1 * node.d.y;
                  node.p.z += .1 * node.d.z;
                  node.d.x -= .1 * node.d.x;
                  node.d.y -= .1 * node.d.y;
                  node.d.z -= .1 * node.d.z;
               }
            }

            var fx = 0, fy = 0, fz = 0;
            for (var j = 0 ; j < this.nodes.length ; j++) {
               if (j == R.J) continue;
               var node = this.nodes[j];
               if (node.f !== undefined) {
                  fx += node.f.x;
                  fy += node.f.y;
                  fz += node.f.z;
               }
            }
            var epsilon = 0.1;
            for (var j = 0 ; j < this.nodes.length ; j++) {
               var node = this.nodes[j];
               node.p.x -= epsilon * fx / this.nodes.length;
               node.p.y -= epsilon * fy / this.nodes.length;
               node.p.z -= epsilon * fz / this.nodes.length;
               if (j == R.J) continue;
               if (node.f !== undefined) {
                  node.p.x += epsilon * node.f.x;
                  node.p.y += epsilon * node.f.y;
                  node.p.z += epsilon * node.f.x;
               }
            }

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

         if (R.clickType == 'B' && R.J == -1) {
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

///////////////// THREE.js STUFF

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
      link.g.position.x = (a.x + b.x) / 2;
      link.g.position.y = (a.y + b.y) / 2;
      link.g.position.z = (a.z + b.z) / 2;
      link.g.lookAt(b);
      link.g.scale.z = a.distanceTo(b) / 2;
   }
}
Net.prototype = new Sketch;
addSketchType('Net');

