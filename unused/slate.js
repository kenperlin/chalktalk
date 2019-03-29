function() {
   this.label = 'slate';
   this._x = 0;
   this._y = 0;
   this._c = [];
   this._isPressed = false;
   this.render = function() {
      mClosedCurve([[1,.7],[-1,.7],[-1,-.7],[1,-.7]]);
      this.afterSketch(function() {
         for (var n = 0 ; n < this._c.length ; n++)
            mCurve(this._c[n]);
      });
   }
   this.output = function() {
      this._c.isPressed = this._isPressed;
      return this._c;
   }
   this.onPress = function(p) {   // Press to start a new stroke.
      this._isPressed = true;
      this._c.push([]);
      this.onDrag(p);
   }
   this.onDrag = function(p) {    // Drag to extend a stroke.
      this._c[this._c.length-1].push([p.x,p.y]);
   }
   this.onRelease = function(p) {
      var i, j;
      if (this._c.length > 0) {
         let A = this._c[this._c.length - 1];
	 if (A.length == 1) {     // Click on a stroke to remove it.
	    this._c.pop();
            if (this._c.length == 1)
	       this._c.splice(0, 1);
            else
	       for (i = 0 ; i < this._c.length ; i++) {
	          let B = this._c[i]; 
	          for (j = 0 ; j < B.length ; j++) {
	             let dx = B[j][0] - A[0][0];
	             let dy = B[j][1] - A[0][1];
		     if (dx * dx + dy * dy < 0.001) {
		        this._c.splice(i, 1);
		        return;
		     }
	          }
	       }
         }
	 else {                  // Make nearly straight lines straight.
            let Ax = A[0][0], Bx = A[A.length-1][0];
            let Ay = A[0][1], By = A[A.length-1][1];
            let sum = 0;
	    for (i = 1 ; i < A.length - 1 ; i++) {
	       let ax = Ax - A[i][0], ay = Ay - A[i][1];
	       let bx = Bx - A[i][0], by = By - A[i][1];
               let dx = bx - ax, dy = by - ay;
               let aa = ax * ax + ay * ay;
               let ad = ax * dx + ay * dy;
               let dd = dx * dx + dy * dy;
	       sum += aa - ad * ad / dd;
	    }
	    let lsq = (Bx - Ax) * (Bx - Ax) + (By - Ay) * (By - Ay);
            if ( sum < .001 * (A.length - 2) * lsq)
	       for (i = 1 ; i < A.length - 1 ; i++) {
	          let t = i / (A.length - 1);
		  A[i][0] = mix(Ax, Bx, t);
		  A[i][1] = mix(Ay, By, t);
	       }
	 }
      }
      this._isPressed = false;
   }
}

