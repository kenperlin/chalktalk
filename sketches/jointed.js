function Jointed() {
   this.labels = 'jointed'.split(' ');
   this.joints = [[0,1],[0,0],[-.5,-1],[.5,-1]];
   this.links = [[0,1],[1,2],[1,3]];

   var J = -1, isCreatingLink = false, p = [0,0], travel, jClick = -1;

   this.findLink = function(i, j) {
      if (i != j)
         for (var l = 0 ; l < this.lengths ; l++) {
            var link = this.links[l];
	    if (link[0] == i && link[1] == j)
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
         if (this.distance(p, this.joints[j]) < .1)
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
      for (var j = i + 1 ; j < this.joints.length ; j++) {
         var l = this.findLink(i, j);
	 var w = 1;
	 if (l == -1) {
	    w = 0;
	    for (var n = 0 ; n < this.joints.length ; n++)
	       if (this.findLink(i, n) != -1 || this.findLink(j, n)) {
	          w = .03;
		  break;
               }
         }
	 if (w > 0) {
	    var d = this.distance(this.joints[i], this.joints[j]);
	    this.lengths.push({ i:i, j:j, d:d, w:w });
         }
      }
   }
   this.computeLengths();

   this.mouseDown = function(x,y) {
      p = mTransform([x,y]);
      travel = 0;
      if (jClick == -1 && (isCreatingLink = ((J = this.findJoint(p)) == -1))) {
         J = this.joints.length;
         this.joints.push(p);
      }
   }
   this.mouseDrag = function(x,y) {
      var px = p[0], py = p[1];
      p = mTransform([x,y]);
      travel += this.distance(p, [px,py]);
      if (jClick != -1)
         this.joints[jClick] = p;
      else if (! isCreatingLink)
         this.joints[J] = p;  
   }
   this.mouseUp = function(x,y) {
      if (jClick != -1) {
         if (travel < .1)
	    this.removeJoint(jClick);
         this.computeLengths();
         jClick = -1;
      }
      else if (isCreatingLink) {
         var j = this.findJoint(p);
	 if (j == -1) {
	    j = J++;
	    this.joints.push(p);
         }
	 if (j != J) {
	    this.links.push([j, J]);
	    this.computeLengths();
         }
         isCreatingLink = false;
      }
      else if (travel < .1)
	 jClick = J;
      J = -1;
   }

   this.render = function() {
      this.afterSketch(function() {
         if (jClick == -1)
	    for (var rep = 0 ; rep < 10 ; rep++)
            for (var n = 0 ; n < this.lengths.length ; n++) {
	       var L = this.lengths[n];
	       adjustDistance2D(this.joints[L.i], this.joints[L.j], L.d, L.w, L.i != J, L.j != J);
	    }

         for (var j = 0 ; j < this.joints.length ; j++) {
            var joint = this.joints[j];
	    mFillCurve(makeOval(joint[0] - .1, joint[1] - .1, .2, .2));
         }

	 if (isCreatingLink)
	    mLine(this.joints[J], p);
      });
      for (var l = 0 ; l < this.links.length ; l++) {
         var link = this.links[l];
         mLine(this.joints[link[0]], this.joints[link[1]]);
      }
      if (jClick != -1) {
         color('red');
         var joint = this.joints[jClick];
	 mFillCurve(makeOval(joint[0] - .1, joint[1] - .1, .2, .2));
      }
   }
}
Jointed.prototype = new Sketch;
addSketchType('Jointed');

