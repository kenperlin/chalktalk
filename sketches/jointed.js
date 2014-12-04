/*
   Problem -- right now we can't specify forces properly after object is rotated,
   because distance along pixel ray is not specified accurately.

   To do -- change rendering to use THREE.js ball and stick model.
*/

function Jointed() {
   this.labels = 'jointed'.split(' ');
   this.joints = [{p:[0,1,0]},{p:[0,0,0]},{p:[-.5,-1,0]},{p:[.5,-1,0]}];
   this.links = [[0,1],[1,2],[1,3]];
   this.is3D = true;

   var J = -1, isCreatingLink = false, p = [0,0,0], travel, jSelected = -1;

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
      var x = b[0] - a[0], y = b[1] - a[1], z = b[2] - a[2];
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
         if (this.pixelDistance(pix, joint.pix) < .075 * renderScale)
            return j;
      }
      return -1;
   }

   this.removeJoint = function(j) {
      this.joints.splice(j, 1);
      for (var l = 0 ; l < this.links.length ; l++)
         if (this.links[l][0] == j || this.links[l][1] == j)
            this.links.splice(l, 1);
      for (var l = 0 ; l < this.links.length ; l++)
         for (var n = 0 ; n < 2 ; n++)
            if (this.links[l][n] > j)
               this.links[l][n]--;
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

   this.mouseMove = function(x,y) {
      J = this.findJoint([x,y]);
   }

   this.mouseDown = function(x,y) {
      p = mTransform([x,y]);
      J = this.findJoint([x,y]);
      travel = 0;
      if (jSelected == -1) {
         isCreatingLink = J == -1;
         if (isCreatingLink) {
            J = this.joints.length;
            this.joints.push({p:p});
         }
      }
   }

   this.mouseDrag = function(x,y) {
      var px = p[0], py = p[1], pz = p[2];
      p = mTransform([x,y]);
      travel += this.distance(p, [px,py,pz]);
      if (jSelected != -1) {
         if (J != -1)
            this.joints[J].p = p;
         else
            this.joints[jSelected].p = p;
      }
      else if (! isCreatingLink)
         this.joints[J].p = p;  
   }

   this.mouseUp = function(x,y) {
      if (jSelected != -1) {
         if (travel >= .1) {
	    if (J != -1) {
	       this.links.push([J, jSelected, .03]);
	    }
	 }
         else {
            var j = this.findJoint([x,y]);
            if (j == jSelected)
               this.removeJoint(jSelected);
            else if (j == -1) {
               var joint = this.joints[jSelected];
               joint.f = [p[0] - joint.p[0], p[1] - joint.p[1], p[2] - joint.p[2]];
            }
            else {
               var l = this.findLink(j, jSelected);
               if (l == -1)
                  this.links.push([j, jSelected]);
               else
                  this.links.splice(l, 1);
            }
         }
         this.computeLengths();
         jSelected = -1;
      }
      else if (isCreatingLink) {
         var j = this.findJoint([x,y]);
         if (j == -1) {
            j = J++;
            this.joints.push({p:p});
         }
         if (j != J) {
            this.links.push([j, J]);
            this.computeLengths();
         }
         isCreatingLink = false;
      }
      else if (travel < .1)
         jSelected = J;
      J = -1;
   }

   var renderScale = 1;

   function drawJoint(p) {
      _g.save();
      lineWidth(.15 * renderScale);
      mLine([p[0]-.001,p[1],p[2]],[p[0]+.001,p[1],p[2]]);
      _g.restore();
   }

   function drawLink(a, b, w) {
      if (w === undefined) w = 1;
      _g.save();
      lineWidth(w * .03 * renderScale);
      mLine(a, b);
      _g.restore();
   }

   this.render = function() {

      var a = m._m();
      renderScale = sqrt(a[0]*a[0]+a[1]*a[1]+a[2]*a[2] +
                         a[4]*a[4]+a[5]*a[5]+a[6]*a[6] +
                         a[8]*a[8]+a[9]*a[9]+a[10]*a[10]);
      lineWidth(.04 * renderScale);
      this.afterSketch(function() {
         if (jSelected == -1 && ! isCreatingLink) {
            var fx = 0, fy = 0, fz = 0;
            for (var j = 0 ; j < this.joints.length ; j++) {
	       if (j == J) continue;
               var joint = this.joints[j];
               if (joint.f !== undefined) {
                  fx += joint.f[0];
                  fy += joint.f[1];
                  fz += joint.f[2];
               }
            }
            var epsilon = 0.1;
            for (var j = 0 ; j < this.joints.length ; j++) {
               var joint = this.joints[j];
               joint.p[0] -= epsilon * fx / this.joints.length;
               joint.p[1] -= epsilon * fy / this.joints.length;
               joint.p[2] -= epsilon * fz / this.joints.length;
	       if (j == J) continue;
               if (joint.f !== undefined) {
                  joint.p[0] += epsilon * joint.f[0];
                  joint.p[1] += epsilon * joint.f[1];
                  joint.p[2] += epsilon * joint.f[2];
               }
            }

            for (var rep = 0 ; rep < 10 ; rep++)
            for (var n = 0 ; n < this.lengths.length ; n++) {
               var L = this.lengths[n];
               adjustDistance(this.joints[L.i].p, this.joints[L.j].p, L.d, L.w/2, L.i != J, L.j != J);
            }
         }
      });

      for (var l = 0 ; l < this.links.length ; l++) {
         var link = this.links[l];
         drawLink(this.joints[link[0]].p, this.joints[link[1]].p, link.length == 2 ? 1 : .1);
      }

      this.afterSketch(function() {
         if (isCreatingLink)
            drawLink(this.joints[J].p, p);

         for (var j = 0 ; j < this.joints.length ; j++) {
            var joint = this.joints[j];
            joint.pix = mTransform(joint.p);

            if (joint.f !== undefined) {
               _g.save();
               _g.strokeStyle = 'yellow';
               _g.lineWidth = 2;
               mLine(joint.p, [ joint.p[0] + joint.f[0],
                                joint.p[1] + joint.f[1],
                                joint.p[2] + joint.f[2] ]);
               _g.restore();
            }

            color(j == J ? 'cyan' : 'white');
            drawJoint(joint.p);
         }

         if (jSelected != -1) {
            color('red');
            drawJoint(this.joints[jSelected].p);
         }
      });
   }
}
Jointed.prototype = new Sketch;
addSketchType('Jointed');

