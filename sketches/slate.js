function() {
   this.label = 'slate';
   this._x = 0;
   this._y = 0;
   this._c = [];
   this.render = function() {
      mClosedCurve([[1,.7],[-1,.7],[-1,-.7],[1,-.7]]);
      this.afterSketch(function() {
         for (var n = 0 ; n < this._c.length ; n++)
            mCurve(this._c[n]);
      });
   }
   this.onPress = function(p) {   // Press to start a new stroke.
      this._c.push([]);
      this.onDrag(p);
   }
   this.onDrag = function(p) {    // Drag to extend a stroke.
      this._c[this._c.length-1].push([p.x,p.y]);
   }
   this.onRelease = function(p) { // Click on a stroke to remove it.
      if (this._c.length > 0) {
         var A = this._c[this._c.length - 1];
	 if (A.length == 1) {
	    this._c.pop();
	    for (var i = 0 ; i < this._c.length ; i++) {
	       B = this._c[i]; 
	       for (var j = 0 ; j < B.length ; j++) {
	          var dx = B[j][0] - A[0][0];
	          var dy = B[j][1] - A[0][1];
		  if (dx * dx + dy * dy < 0.001) {
		     this._c.splice(i, 1);
		     return;
		  }
	       }
	    }
         }
      }
   }
}

