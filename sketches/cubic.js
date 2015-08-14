function() {
   this.label = 'cubic';
   this.setSketchText(0, '1.0', [-.65, .9], .07);
   this.setSketchText(1, '0.0', [-.65, .3], .07);
   this.setSketchText(2, '0.0', [-.65,-.3], .07);
   this.setSketchText(3, '0.0', [-.65,-.9], .07);
   this.func = function(C, t) { return C[0] * t * t * t +
                                       C[1] * t * t +
                                       C[2] * t +
                                       C[3] ; }

   this.render = function() {
      var C = [];
      for (var n = 0 ; n < 4 ; n++)
         C.push(parseFloat(this.sketchTexts[n].value));

      lineWidth(1);
      mLine([-1,0],[1,0]);
      lineWidth(3);
      var curve = [];
      for (var t = -1 ; t <= 1.001; t += .02)
         curve.push([t, this.func(C, t)]);
      color('red');
      mCurve(curve);
      color(backgroundColor == 'black' ? 'cyan' : 'blue');
      this.afterSketch(function() {
         color(defaultPenColor);
         lineWidth(1);
         mLine([0,-1],[0,1]);
         color(backgroundColor == 'black' ? 'cyan' : 'blue');
         textHeight(this.mScale(.15));
         mText('a =', [-1.15, .9], 0,.5);
         mText('b =', [-1.15, .3], 0,.5);
         mText('c =', [-1.15,-.3], 0,.5);
         mText('d =', [-1.15,-.9], 0,.5);
         color('red');
         mText('at' + EXP_3 + ' + bt' + EXP_2 + ' ct + d', [0,-1.2], .5, .5);
      });
   }
}
