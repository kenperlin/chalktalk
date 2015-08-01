function() {
   this.label = 'parametric';
   this.nu = 20;
   this.nv = 10;
   this.is3D = true;
   this.code = [["", 'return [cos(TAU*u),sin(TAU*u),2*v-1];' ]];
   this.render = function(elapsed) {
      try {
         this._func = new Function('u','v', this.code[0][1]);
      } catch(e) { console.log(e); }
      this.duringSketch(function() {
         mCurve(makeOval(-1, -1, 2, 2, 16, PI/2, PI/2 - PI));
         mCurve(makeOval(-1, -1, 2, 2, 16, PI/2, PI/2 + PI));
      });
      this.afterSketch(function() {
         lineWidth(1);
         var du = 1 / this.nu;
         var dv = 1 / this.nv;
         for (var u = 0 ; u < .999 ; u += du)
         for (var v = 0 ; v < .999 ; v += dv)
            mClosedCurve([this._func(u   , v   ),
                          this._func(u+du, v   ),
                          this._func(u+du, v+dv),
                          this._func(u   , v+dv)]);
      });
   }
}
