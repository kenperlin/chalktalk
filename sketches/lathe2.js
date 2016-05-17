function() {
   this.label = 'lathe2';

   this.computeStatistics = function() {

      // GET STATISTICS ON POSITION AND SIZE OF CENTRAL AXIS (1ST STROKE).

      var axisX = this.size * S(0).x;
      var axisY = this.size * S(0).y;
      var axisR = this.size * S(0).height / 2;

      // USE AXIS INFO TO CONVERT 4TH STROKE INTO A PROFILE.

      this.profile = [];
      var stroke = this.sketchTrace[3];
      for (var i = 0 ; i < stroke.length ; i++)
         this.profile.push( [ (stroke[i][0]-axisX) / axisR, (stroke[i][1]-axisY) / axisR ] );
   }

   this.render = function() {
      this.duringSketch(function() {
         mLine([0,1],[0,-1]);
         mLine([0,-1],[1,-1]);
         mLine([0,-1],[-1,-1]);
         mLine([.5,1],[.5,-1]);

         // MORPH TO THE PROFILE THAT THE USER DREW, NOT TO THE GLYPH VERSION.

         if (this.xyz.length == 3)
            this.trace[3] = this.sketchTrace[3];
      });
      m.rotateX(PI/2);
      var that = this;

      window._latheSketchInValue0 = this.inValue[0];

      var profileFunction = function(t) { return sample(that.profile, t); }

      if (typeof window._latheSketchInValue0 == 'function')
         profileFunction = new Function('t', 'var count = ' + (++that.functionCount) + ';'
	                                   + 'var p = window._latheSketchInValue0(t);\n'
					   + 'return [1+p[0], -p[1]];\n');

      mRevolved(32, 64, profileFunction);
   }
   this.functionCount = 0;
}

