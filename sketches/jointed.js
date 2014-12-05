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

   this.mouseDown = function(x,y) {
      p = mTransform([x,y]);
      J = this.findJoint([x,y]);
      if (J != -1) {
         var joint = this.joints[J];
         if (joint.d === undefined)
            joint.d = [0,0];
         this.joints[J].d = [p[0]-joint.p[0], p[1] - joint.p[1]];
      }
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
                  this.removeLink(l);
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

   function drawJoint(p, r) {
      _g.save();
      lineWidth(r * 16 * renderScale);
      mLine([p[0]-.001,p[1],p[2]],[p[0]+.001,p[1],p[2]]);
      _g.restore();
   }

   function drawLink(a, b, radius) {
      if (radius === undefined) radius = 1;
      _g.save();
      lineWidth(radius * renderScale);
      mLine(a, b);
      _g.restore();
   }

   this.render = function() {
      this.code = null;

      var a = m._m();
      renderScale = this.scale() * (this.xyz.length < 3 ? 1 : [2]);
      lineWidth(4 * renderScale);
      this.afterSketch(function() {
         if (jSelected == -1 && ! isCreatingLink) {

            for (var j = 0 ; j < this.joints.length ; j++) {
               var joint = this.joints[j];
               if (joint.d !== undefined) {
                  joint.p[0] += .1 * joint.d[0];
                  joint.p[1] += .1 * joint.d[1];
                  joint.d[0] -= .1 * joint.d[0];
                  joint.d[1] -= .1 * joint.d[1];
               }
            }

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

      this.afterSketch(function() {
         if (isCreatingLink)
            drawLink(this.joints[J].p, p);

         for (var j = 0 ; j < this.joints.length ; j++) {
            var joint = this.joints[j];
            joint.pix = mTransform(joint.p);

            if (joint.g === undefined) {
               joint.g = jointed.addGlobe(16, 8);
               jointed.setMaterial(this.shaderMaterial());
            }
            joint.g.getMatrix().identity().translate(joint.p[0],joint.p[1],joint.p[2]).scale(.1);

            if (joint.f !== undefined) {
               _g.save();
               _g.strokeStyle = 'yellow';
               _g.lineWidth = 2;
               mLine(joint.p, [ joint.p[0] + joint.f[0],
                                joint.p[1] + joint.f[1],
                                joint.p[2] + joint.f[2] ]);
               _g.restore();
            }

            color('cyan');
            drawJoint(joint.p, j == J ? 1 : .01);
         }

         if (jSelected != -1) {
            color('red');
            drawJoint(this.joints[jSelected].p, 1);
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
                  link.g = jointed.addOpenCylinder(8);
                  jointed.setMaterial(this.shaderMaterial());
               }
               var x  = (a[0] + b[0]) / 2, y  = (a[1] + b[1]) / 2, z  = (a[2] + b[2]) / 2;
               var dx = (b[0] - a[0]) / 2, dy = (b[1] - a[1]) / 2, dz = (b[2] - a[2]) / 2;
               link.g.getMatrix().identity().translate(x, y, z)
                                            .aimY(bJoint.g.getMatrix())
                                            .scale(.01 * r, sqrt(dx*dx+dy*dy+dz*dz), .01 * r);
            }
         });
      }
   }

   var jointed;

   this.createMesh = function() {
      jointed = new THREE.Mesh();
      jointed.setMaterial(this.shaderMaterial());
      return jointed;
   }
}
Jointed.prototype = new Sketch;
addSketchType('Jointed');

