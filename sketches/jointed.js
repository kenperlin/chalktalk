function Jointed() {
   this.labels = 'jointed'.split(' ');
   this.joints = [[0,1],[0,0],[-.5,-1],[.5,-1]];
   this.links = [[0,1],[1,2],[1,3]];

   var J = -1, isCreatingLink = false;

   this.findLink = function(i, j) {
      for (var l = 0 ; l < this.lengths ; l++) {
         var link = this.links[l];
	 if (link[0] == i && link[1] == j)
	    return l;
      }
      return -1;
   }

   this.findJoint = function(p) {
      for (var j = 0 ; j < this.joints.length ; j++) {
         var joint = this.joints[j];
         var x = p[0] - joint[0];
         var y = p[1] - joint[1];
         var d = sqrt(x * x + y * y);
         if (d < .1)
	    return j;
      }
      return -1;
   }

   this.computeLengths = function() {
      this.lengths = [];
      for (var i = 0 ; i < this.joints.length - 1 ; i++)
      for (var j = i + 1 ; j < this.joints.length ; j++) {
         var a = this.joints[i];
         var b = this.joints[j];
	 var x = b[0] - a[0], y = b[1] - a[1];
	 var d = sqrt(x * x + y * y);
	 this.lengths.push({i:i, j:j, d:d, w:this.findLink(i, j) == -1 ? .1 : 1});
      }
   }
   this.computeLengths();

   this.mouseDown = function(x,y) {
      var p = mTransform([x,y]);
      if (isCreatingLink = ((J = this.findJoint(p)) == -1)) {
         J = this.joints.length;
         this.joints.push(p);
      }
   }
   this.mouseDrag = function(x,y) {
      if (! isCreatingLink) {
         var p = mTransform([x,y]);
         this.joints[J] = p;  
      }
   }
   this.mouseUp = function(x,y) {
      if (isCreatingLink) {
         var p = mTransform([x,y]);
         var j = this.findJoint(p);
	 if (j != J) {
	    this.links.push([j, J]);
	    this.computeLengths();
         }
      }
      J = -1;
   }

   this.render = function() {
      this.afterSketch(function() {
         for (var n = 0 ; n < this.lengths.length ; n++) {
	    var L = this.lengths[n];
	    adjustDistance2D(this.joints[L.i], this.joints[L.j], L.d, L.w, L.i != J, L.j != J);
	 }

         for (var j = 0 ; j < this.joints.length ; j++) {
            var joint = this.joints[j];
	    mFillCurve(makeOval(joint[0] - .1, joint[1] - .1, .2, .2));
         }
      });
      for (var l = 0 ; l < this.links.length ; l++) {
         var link = this.links[l];
         mLine(this.joints[link[0]], this.joints[link[1]]);
      }
   }
}
Jointed.prototype = new Sketch;
addSketchType('Jointed');

