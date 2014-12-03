function Jointed() {
   this.labels = 'jointed'.split(' ');
   this.joints = [{p:[0,1]},{p:[0,0]},{p:[-.5,-1]},{p:[.5,-1]}];
   this.links = [[0,1],[1,2],[1,3]];

   var J = -1, isCreatingLink = false, p = [0,0], travel, jSelected = -1;

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
      var x = b[0] - a[0], y = b[1] - a[1];
      return sqrt(x * x + y * y);
   }

   this.findJoint = function(p) {
      for (var j = 0 ; j < this.joints.length ; j++)
         if (this.distance(p, this.joints[j].p) < .1)
	    return j;
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
      for (var j = i + 1 ; j < this.joints.length ; j++) 
         if (this.findLink(i, j) >= 0)
	    this.lengths.push({ i:i, j:j, d:this.distance(this.joints[i].p, this.joints[j].p) });;
   }
   this.computeLengths();

   this.mouseDown = function(x,y) {
      p = mTransform([x,y]);
      travel = 0;
      if (jSelected == -1 && (isCreatingLink = ((J = this.findJoint(p)) == -1))) {
         J = this.joints.length;
         this.joints.push({p:p});
      }
   }
   this.mouseDrag = function(x,y) {
      var px = p[0], py = p[1];
      p = mTransform([x,y]);
      travel += this.distance(p, [px,py]);
      if (jSelected != -1)
         this.joints[jSelected].p = p;
      else if (! isCreatingLink)
         this.joints[J].p = p;  
   }
   this.mouseUp = function(x,y) {
      if (jSelected != -1) {
         if (travel < .1) {
            var j = this.findJoint(p);
	    if (j == jSelected)
	       this.removeJoint(jSelected);
	    else if (j == -1) {
	       var joint = this.joints[jSelected];
	       joint.f = [p[0] - joint.p[0], p[1] - joint.p[1]];
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
         var j = this.findJoint(p);
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

   this.render = function() {
      lineWidth(len(m.transform([0.05,0,0,0])));
      this.afterSketch(function() {

         if (jSelected == -1) {
            var fx = 0, fy = 0;
            for (var j = 0 ; j < this.joints.length ; j++) {
               var joint = this.joints[j];
	       if (joint.f !== undefined) {
	          fx += joint.f[0];
	          fy += joint.f[1];
	       }
            }
	    var epsilon = 0.1;
            for (var j = 0 ; j < this.joints.length ; j++) {
               var joint = this.joints[j];
	       joint.p[0] -= epsilon * fx / this.joints.length;
	       joint.p[1] -= epsilon * fy / this.joints.length;
	       if (joint.f !== undefined) {
	          joint.p[0] += epsilon * joint.f[0];
	          joint.p[1] += epsilon * joint.f[1];
	       }
	    }

	    for (var rep = 0 ; rep < 10 ; rep++)
            for (var n = 0 ; n < this.lengths.length ; n++) {
	       var L = this.lengths[n];
	       adjustDistance2D(this.joints[L.i].p, this.joints[L.j].p, L.d, 0.5, L.i != J, L.j != J);
	    }
	 }

         for (var j = 0 ; j < this.joints.length ; j++) {
            var joint = this.joints[j];

	    if (joint.f !== undefined) {
	       var x = joint.p[0] + joint.f[0];
	       var y = joint.p[1] + joint.f[1];
	       _g.save();
	       _g.strokeStyle = 'yellow';
	       _g.lineWidth = 2;
	       mLine(joint.p, [x,y]);
	       _g.restore();
	    }

	    mFillCurve(makeOval(joint.p[0] - .1, joint.p[1] - .1, .2, .2));
         }

	 if (isCreatingLink)
	    mLine(this.joints[J].p, p);
      });
      for (var l = 0 ; l < this.links.length ; l++) {
         var link = this.links[l];
         mLine(this.joints[link[0]].p, this.joints[link[1]].p);
      }
      if (jSelected != -1) {
         color('red');
         var joint = this.joints[jSelected];
	 mFillCurve(makeOval(joint.p[0] - .1, joint.p[1] - .1, .2, .2));
      }
   }
}
Jointed.prototype = new Sketch;
addSketchType('Jointed');

