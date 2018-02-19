function() {
   this.label = 'param';
   this.nu = 20;
   this.nv = 10;
   this.is3D = true;
   this.code = [["", 'return [\n   cos(2*PI*u),\n   sin(2*PI*u),\n   2*v-1\n];' ]];
   this.mouseDrag = function(x, y) {
      if (this.y0 === undefined)
         this.y0 = y;
      var i0 = floor(this.y0 / 20);
      var i1 = floor(     y  / 20);
      if (i1 != i0) {
         this.nv = max(4, this.nv + (i1 < i0 ? 1 : -1));
	 this.nu = 2 * this.nv;
         this.y0 = y;
      }
   }
   this.mouseUp = function(x, y) {
      delete this.y0;
   }
   this.render = function(elapsed) {
      try {
         this._func = new Function('u','v', this.code[0][1]);
      } catch(e) { console.log(e); }
      this.duringSketch(function() {
         mCurve(makeOval(-1, -1, 2, 2, 16, PI/2, PI/2 - PI));
         mCurve(makeOval(-1, -1, 2, 2, 16, PI/2, PI/2 + PI));
      });
      this.afterSketch(function() {
         var nu = floor(def(this.inValue[0], this.nu));
         var nv = floor(def(this.inValue[1], this.nv));
         lineWidth(1);
         var du = 1 / nu;
         var dv = 1 / nv;
         for (var u = 0 ; u < .999 ; u += du)
         for (var v = 0 ; v < .999 ; v += dv)
            mClosedCurve([this._func(u   , v   ),
                          this._func(u+du, v   ),
                          this._func(u+du, v+dv),
                          this._func(u   , v+dv)]);
      });
   }
}
