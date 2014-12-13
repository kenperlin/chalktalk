
function newVec(x,y,z) { return new THREE.Vector3(x,y,z); }
function vecToString(v) { return "(" + v.x + "," + v.y + "," + v.z + "}"; }

function Graph() {
   this.nodes = [];
   this.links = [];
}

Graph.prototype = {
   tmp: newVec(0,0,0),

   clear: function() {
      this.nodes = [];
      this.links = [];
   },

   addNode: function(x,y,z) {
      this.nodes.push({p:newVec(x,y,z)});
      return this.nodes.length - 1;
   },

   addLink: function(i, j, w) {
      if (w === undefined)
         w = 1;
      this.links.push({i:i, j:j, w:w});
      return this.links.length - 1;
   },

   adjustDistance: function(A, B, d, e, isAdjustingA, isAdjustingB) {
      this.tmp.copy(B).sub(A).multiplyScalar( e * (d / A.distanceTo(B) - 1) );
      if (isAdjustingA)
         A.sub(this.tmp);
      if (isAdjustingB)
         B.add(this.tmp);
   },

   adjustNodePositions: function() {
      for (var j = 0 ; j < this.nodes.length ; j++) {
         var node = this.nodes[j];
         if (node.d !== undefined) {
            this.tmp.copy(node.d).multiplyScalar(0.1);
            node.p.add(this.tmp);
            this.tmp.negate();
            node.d.add(this.tmp);
         }
      }
   },

   nodesAvoidEachOther: function() {
      for (var i = 0 ; i < this.nodes.length-1 ; i++)
         for (var j = i+1 ; j < this.nodes.length ; j++) {
            var a = this.nodes[i];
            var b = this.nodes[j];
            if (a.r !== undefined && b.r !== undefined) {
               var d = a.p.distanceTo(b.p);
               if (d < a.r + b.r) {
                  var t = (a.r + b.r) / d;
                  this.tmp.copy(a.p).lerp(b.p,.5);
                  a.p.lerp(this.tmp, 1 - t);
                  b.p.lerp(this.tmp, 1 - t);
               }
            }
         }
   },

   adjustEdgeLengths: function() {
      var R = this.R;
      for (var rep = 0 ; rep < 10 ; rep++)
         for (var n = 0 ; n < this.lengths.length ; n++) {
            var L = this.lengths[n];
            var a = this.nodes[L.i];
            var b = this.nodes[L.j];
            this.adjustDistance(a.p, b.p, L.d, L.w/2, L.i != R.I && L.i != R.J, L.j != R.I && L.j != R.J);
         }
   },

   updatePositions: function() {
      this.adjustNodePositions(); // Adjust position as needed after mouse press on a node.
      this.nodesAvoidEachOther(); // Make sure nodes do not intersect.
      this.adjustEdgeLengths();   // Coerce all links to be the proper length.
   },

   findLink: function(i, j) {
      if (i != j)
         for (var l = 0 ; l < this.links.length ; l++) {
            var link = this.links[l];
            if (link.i == i && link.j == j || link.i == j && link.j == i)
               return l;
         }
      return -1;
   },

   removeNode: function(j) {
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
   },

   removeLink: function(l) {
      if (l < 0 || l >= this.links.length)
         return;

      this.links.splice(l, 1);
   },

   computeLengths: function() {
      this.lengths = [];
      for (var i = 0 ; i < this.nodes.length - 1 ; i++)
      for (var j = i + 1 ; j < this.nodes.length ; j++) {
         var l = this.findLink(i, j);
         if (l >= 0) {
            var link = this.links[l];
            var d = this.nodes[i].p.distanceTo(this.nodes[j].p);
            this.lengths.push({ i:i, j:j, d:d, w:link.w });;
         }
      }
   },
};

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

function VisibleGraph() {
   this.p = newVec(0,0,0);
   this.q = newVec(0,0,0);
   this.pix = newVec(0,0,0);
   this.travel = 0;
   this.pixelSize = 1;

   this.setResponder = function(R) {
      this.R = R;
      R.graph = this;
   }

   this.findNodeAtPixel = function(pix) {
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
      this.pix.set(x,y,0);
      this.p.copy(this.pix).applyMatrix4(pixelToPointMatrix);
      this.travel = 0;
      switch (R.clickType) {
      case 'B':
         R.J = this.findNodeAtPixel(this.pix);
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
         R.J = this.findNodeAtPixel(this.pix);
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
         R.I = this.findNodeAtPixel(this.pix);
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
      this.q.copy(this.p);
      this.pix.set(x,y,0);
      this.p.copy(this.pix).applyMatrix4(pixelToPointMatrix);
      this.travel += this.p.distanceTo(this.q);
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
      this.pix.set(x,y,0);
      R.K = this.findNodeAtPixel(this.pix);
      switch (R.clickType) {
      case 'B':
         R.clickType = 'none';
         if (this.travel >= .1) {
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
         if (this.travel >= .1)
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
         if (this.travel >= .1) {
            switch (R.actionType) {
            case 'I': R.onRelease(); break;
            case 'B': R.onReleaseB(); break;
            }
         }
         else {
            R.clickPoint.copy(this.p);
            switch (R.actionType) {
            case 'I':
               R.I_ = R.I;
               R.clickType = 'J';
               R.onClick();
               break;
            case 'B':
               R.clickType = 'B';
               R.onClickB();
               break;
            }
         }
         R.I = -1;
         R.J = -1;
         break;
      }
      R.J = -1;
      R.K = -1;
   }
}
VisibleGraph.prototype = new Graph;

