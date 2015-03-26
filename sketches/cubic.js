function() {
   this.label = 'cubic';
   this.setSketchText(0, '8.0', [0,.9], .1);
   this.setSketchText(1, '-12.0', [0,.3], .1);
   this.setSketchText(2, '6.0', [0,-.3], .1);
   this.setSketchText(3, '-1.0', [0,-.9], .1);
   this.func = function(C, t) { return C[0] * t * t * t +
                                       C[1] * t * t +
                                       C[2] * t +
                                       C[3] ; }

   this.render = function() {
      var C = [];
      for (var n = 0 ; n < 4 ; n++)
         C.push(parseFloat(this.sketchTexts[n].value));

      mLine([-1,0],[1,0]);
      var curve = [];
      for (var t = 0 ; t <= 1.001; t += .01)
         curve.push([2*t-1, this.func(C, t)]);
      color('red');
      mCurve(curve);
      color('cyan');
      this.afterSketch(function() {
         textHeight(this.mScale(.15));
	 mText('t'+EXP_3, [1.1, .9], 0,.5);
	 mText('t'+EXP_2, [1.1, .3], 0,.5);
	 mText('t'      , [1.1,-.3], 0,.5);
	 mText('1'      , [1.1,-.9], 0,.5);
      });
   }
}
