function() {
   this.label = 'cubic';
   this.setSketchText(0, '1.0', [-1.15, .9], .07);
   this.setSketchText(1, '0.0', [-1.15, .3], .07);
   this.setSketchText(2, '0.0', [-1.15,-.3], .07);
   this.setSketchText(3, '0.0', [-1.15,-.9], .07);
   this.func = function(C, t) { return C[0] * t * t * t +
                                       C[1] * t * t +
                                       C[2] * t +
                                       C[3] ; }

   this.render = function() {
      var C = [];
      for (var n = 0 ; n < 4 ; n++)
         C.push(parseFloat(this.sketchTexts[n].value));

      lineWidth(1);
      mLine([-1,-1],[1,-1]);
      lineWidth(3);
      var curve = [];
      for (var t = 0 ; t <= 1.001; t += .01)
         curve.push([t*2-1, this.func(C, t)*2-1]);
      color('red');
      mCurve(curve);
      color(isBlackBackground() ? 'cyan' : 'blue');
      this.afterSketch(function() {
         color(defaultPenColor);
         lineWidth(1);
         mLine([-1,-1],[-1,1]);
         color(isBlackBackground() ? 'cyan' : 'blue');
         textHeight(this.mScale(.15));
         mText('a =', [-1.65, .9], 0,.5);
         mText('b =', [-1.65, .3], 0,.5);
         mText('c =', [-1.65,-.3], 0,.5);
         mText('d =', [-1.65,-.9], 0,.5);
	 for (var i = 0 ; i < 4 ; i++)
	    if (this.inValues[i] !== undefined)
	       this.sketchTexts[i].setValue(roundedString(this.inValues[i]));
         color('red');
         mText('at' + EXP_3 + ' + bt' + EXP_2 + ' + ct + d', [0,-1.2], .5, .5);
      });
   }
}
