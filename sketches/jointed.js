/*
   Problem -- right now we can't specify forces properly after object is rotated,
   because distance along pixel ray is not specified accurately.

   Translate/rotate/scale/etc on one joint.
   Text for a joint (eg: atomic symbol).
   Joints do not knock into each other.
   Procedural "shaders" for movement: swim, walk, symmetry, electric charge repulsion, etc.
   Eg: ethane molecule.

   DONE To do -- change rendering to use THREE.js ball and stick model.
*/

function Jointed() {
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
   this.labels = 'jointed'.split(' ');
   this.joints = [{p:nv(0,1,0)},{p:nv(0,0,0)},{p:nv(-.5,-1,0)},{p:nv(.5,-1,0)}];
   this.links = [[0,1],[1,2],[1,3]];
   this.is3D = true;

   this.myShaderMaterial = function() {
      if (this.myMaterial === undefined)
         this.myMaterial = this.shaderMaterial();
      return this.myMaterial;
   }

   var I = -1, I_ = -1, J = -1, p = nv(0,0,0), q = nv(0,0,0), travel;

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

   this.findJoint = function(pix) {
      for (var j = 0 ; j < this.joints.length ; j++) {
         var joint = this.joints[j];
         if (this.pixelDistance(pix, joint.pix) < 5 * renderScale)
            return j;
      }
      return -1;
   }

   this.removeJoint = function(j) {
      var joint = this.joints[j];
      if (joint.g !== undefined)
         jointed.remove(joint.g);
      this.joints.splice(j, 1);
      for (var l = 0 ; l < this.links.length ; l++)
         if (this.links[l][0] == j || this.links[l][1] == j)
            this.removeLink(l);
      for (var l = 0 ; l < this.links.length ; l++)
         for (var n = 0 ; n < 2 ; n++)
            if (this.links[l][n] > j)
               this.links[l][n]--;
   }

   this.removeLink = function(l) {
      var link = this.links[l];
      if (link.g !== undefined)
         jointed.remove(link.g);
      this.links.splice(l, 1);
   }

   this.computeLengths = function() {
      this.lengths = [];
      for (var i = 0 ; i < this.joints.length - 1 ; i++)
      for (var j = i + 1 ; j < this.joints.length ; j++) {
         var l = this.findLink(i, j);
         if (l >= 0) {
            var link = this.links[l];
            var d = this.distance(this.joints[i].p, this.joints[j].p);
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

////////////////////////////////////////////////////////////////////////////////

   this.onPress = function() {
      var joint = this.joints[I];
      if (joint.d === undefined)
         joint.d = nv(0,0,0);
      this.joints[I].d.set(p.x - joint.p.x, p.y - joint.p.y, p.z - joint.p.z);
   }

   this.onPressB = function() {
      I = this.joints.length;
      this.joints.push({p:nv(p.x,p.y,p.z)});
   }

   this.onDrag = function() {
      this.joints[I].p.copy(p);
   }

   this.onDragB = function() { }

   this.onRelease = function() { }

   this.onReleaseB = function() { }

   this.onClick = function() { }

   this.onClickB = function() { }

//////////

   this.onClickPress = function() { }

   this.onClickPressJ = function() { }

   this.onClickPressB = function() { }

//////////

   this.onClickDrag = function() {
      this.joints[I_].p.copy(p);
   }

   this.onClickDragJ = function() {
      this.joints[J].p.copy(p);
   }

   this.onClickDragB = function() { }

//////////

   this.onClickRelease = function() { }

   this.onClickReleaseJ = function() {
      this.links.push([J, I_, .03]);
   }

   this.onClickReleaseB = function() { }

//////////

   this.onClickClick = function() {
      this.removeJoint(I_);
   }

   this.onClickClickJ = function() {
      var l = this.findLink(J, I_);
      if (l == -1)
         this.links.push([I_, J]);
      else
         this.removeLink(l);
   }

   this.onClickClickB = function() {
      var joint = this.joints[I_];
      if (joint.f === undefined)
         joint.f = nv(0,0,0);
      joint.f.set(p.x - joint.p.x, p.y - joint.p.y, p.z - joint.p.z);
   }

////////////////////

   this.mouseDown = function(x,y) {
      pixelToPoint(x, y, p);
      travel = 0;
      if (I_ == -1) {
         I = this.findJoint([x,y]);
         if (I != -1)
            this.onPress();
         else
            this.onPressB();
      }
      else {
         J = this.findJoint([x,y]);
         if (J == I_)
            this.onClickPress();
         else if (J != -1)
            this.onClickPressJ();
          else
            this.onClickPressB();
      }
   }

   this.mouseDrag = function(x,y) {
      q.copy(p);
      pixelToPoint(x, y, p);
      travel += this.distance(p, q);
      if (I_ == -1)
         if (I != -1)
            this.onDrag();
         else
            this.onDragB();
      else
         if (J == I_)
            this.onClickDrag();
         else if (J != -1)
            this.onClickDragJ();
         else
            this.onClickDragB();
   }

   this.mouseUp = function(x,y) {
      if (I_ == -1) {
         if (travel >= .1) {
	    J = this.findJoint([x,y]);
	    if (I != -1)
               this.onRelease();
            else
               this.onReleaseB();
         }
	 else {
	    if (I != -1) {
               I_ = I;
	       this.onClick();
            }
	    else
	       this.onClickB();
	 }
      }
      else {
         if (travel >= .1)
            if (J == I_)
               this.onClickRelease();
            else if (J != -1)
               this.onClickReleaseJ();
            else
               this.onClickReleaseB();
         else
            if (J == I_)
               this.onClickClick();
            else if (J != -1)
               this.onClickClickJ();
            else
               this.onClickClickB();
         this.computeLengths();
         I_ = -1;
      }
      J = -1;
   }

   var renderScale = 1;

   function drawJoint(p, r) {
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
         if (I_ == -1) {

            for (var j = 0 ; j < this.joints.length ; j++) {
               var joint = this.joints[j];
               if (joint.d !== undefined) {
                  joint.p.x += .1 * joint.d.x;
                  joint.p.y += .1 * joint.d.y;
                  joint.p.z += .1 * joint.d.z;
                  joint.d.x -= .1 * joint.d.x;
                  joint.d.y -= .1 * joint.d.y;
                  joint.d.z -= .1 * joint.d.z;
               }
            }

            var fx = 0, fy = 0, fz = 0;
            for (var j = 0 ; j < this.joints.length ; j++) {
               if (j == J) continue;
               var joint = this.joints[j];
               if (joint.f !== undefined) {
                  fx += joint.f.x;
                  fy += joint.f.y;
                  fz += joint.f.z;
               }
            }
            var epsilon = 0.1;
            for (var j = 0 ; j < this.joints.length ; j++) {
               var joint = this.joints[j];
               joint.p.x -= epsilon * fx / this.joints.length;
               joint.p.y -= epsilon * fy / this.joints.length;
               joint.p.z -= epsilon * fz / this.joints.length;
               if (j == J) continue;
               if (joint.f !== undefined) {
                  joint.p.x += epsilon * joint.f.x;
                  joint.p.y += epsilon * joint.f.y;
                  joint.p.z += epsilon * joint.f.x;
               }
            }

            for (var rep = 0 ; rep < 10 ; rep++)
            for (var n = 0 ; n < this.lengths.length ; n++) {
               var L = this.lengths[n];
               adjustDistance(this.joints[L.i].p, this.joints[L.j].p, L.d, L.w/2, L.i != J, L.j != J);
            }
         }
      });

      this.afterSketch(function() {

         for (var j = 0 ; j < this.joints.length ; j++) {
            var joint = this.joints[j];
            var x = joint.p.x, y = joint.p.y, z = joint.p.z;
            joint.pix = mTransform([x, y, z]);

            if (joint.g === undefined) {
               var geometry = new THREE.SphereGeometry(1, 16, 8);
               joint.g = new THREE.Mesh(geometry, this.myShaderMaterial());
               jointed.add(joint.g);
               joint.g.scale = nv(.1,.1,.1);
               joint.g.quaternion = new THREE.Quaternion();
               joint.g.position = nv(0,0,0);
            }
            joint.g.position.copy(joint.p);
            //joint.g.getMatrix().identity().translate(x, y, z).scale(.1);

            if (joint.f !== undefined) {
               _g.save();
               _g.strokeStyle = 'yellow';
               _g.lineWidth = 2;
               mLine([x,y,z], [ joint.p.x + joint.f.x,
                                joint.p.y + joint.f.y,
                                joint.p.z + joint.f.z ]);
               _g.restore();
            }

            color('cyan');
            drawJoint(joint.p, j == J ? 1 : .01);
         }

         if (I_ != -1) {
            color('red');
            drawJoint(this.joints[I_].p, 1);
         }
      });

      for (var l = 0 ; l < this.links.length ; l++) {
         var link = this.links[l];
         var r = link.length == 2 ? 3 : .3;
         var aJoint = this.joints[link[0]];
         var bJoint = this.joints[link[1]];
         var a = aJoint.p;
         var b = bJoint.p;

         this.duringSketch(function() {
            drawLink(a, b, r);
         });

         this.afterSketch(function() {
            if (bJoint.g !== undefined) {
               if (link.g === undefined) {
                  var geometry = new THREE.BoxGeometry(2, 2, 2);
                  link.g = new THREE.Mesh(geometry, this.myShaderMaterial());
                  link.g.scale.x = .01 * r;
                  link.g.scale.y = .01 * r;
                  jointed.add(link.g);
               }
               link.g.position.x = (a.x + b.x) / 2;
               link.g.position.y = (a.y + b.y) / 2;
               link.g.position.z = (a.z + b.z) / 2;
               link.g.lookAt(b);
               link.g.scale.z = a.distanceTo(b) / 2;
            }
         });
      }
   }

   var jointed;

   this.createMesh = function() {
      jointed = new THREE.Mesh();
      jointed.setMaterial(this.myShaderMaterial());
      return jointed;
   }
}
Jointed.prototype = new Sketch;
addSketchType('Jointed');

