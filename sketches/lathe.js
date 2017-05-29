function() {
   this.label = 'lathe';

   this.computeStatistics = function() {
      var axisX = this.size * S(0).x;                   // GET STATISTICS ON POSITION AND SIZE
      var axisY = this.size * S(0).y;                   // OF CENTRAL AXIS (1ST STROKE).
      var axisR = this.size * S(0).height / 2;
      this.profile = [];                                // USE AXIS INFO TO CONVERT
      var stroke = this.sketchTrace[3];                 // 4TH STROKE INTO A PROFILE.
      for (var i = 0 ; i < stroke.length ; i++)
         this.profile.push( [ (stroke[i][0]-axisX) / axisR, (stroke[i][1]-axisY) / axisR ] );
   }

   this.render = function() {
      this.duringSketch(function() {
         mLine([0,1],[0,-1]);
         mLine([0,-1],[1,-1]);
         mLine([0,-1],[-1,-1]);
         mLine([.5,1],[.5,-1]);
         if (this.xyz.length == 3)                // MORPH TO THE PROFILE THAT THE USER DREW,
            this.trace[3] = this.sketchTrace[3];  // RATHER THAN TO THE GLYPH VERSION.
      });
      m.rotateX(PI/2);

      var that = this;
      window._lsiv0 = this.inValue[0];
      mRevolved(128, 128, typeof _lsiv0 == 'function'
         ? new Function('t', 'var p=_lsiv0(t);return [1+p[0],-p[1]];//' + ++that._counter)
         : function(t) { return sample(that.profile, t); });
   }
   this._counter = 0;
}

