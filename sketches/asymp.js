function() {
   this.label = 'asymp';
   this.mode = 0;
   this.onClick = function() { this.mode++; }

   this.render = function() {

      function lump(t) {
         if (t <= -1 || t >= 1)
	    return 0;
         return pow(.5 + .5 * cos(PI * t), 10);
      }

      var c = [];
      for (var i = 0 ; i < 200 ; i++) {
         var x = (i - 100) / 100;
         var y = noise2(3 * x, 0) / 3;
	 if (this.mode >= 3 && x > -.6 && x < -.4)
	    y += 4 * lump((x + .5) / .1);
	 if (this.mode >= 4 && x > .4 && x < .6)
	    y += 4 * lump((x - .5) / .1);
         c.push([x, y]);
	 if (i == 100) {
	    mCurve(c);
	    c = [c[c.length-1]];
	 }
      }
      mCurve(c);

      if (this.mode >= 1)
         mStickFigure([-.5,-.1], .0625);
      if (this.mode >= 2)
         mStickFigure([ .5,-.1], .0625);
      if (this.mode >= 5) {
         lineWidth(1);
	 c = [];
         for (i = 0 ; i < 200 ; i++) {
	    var t = i / 200;
	    x = mix(-.47, .48, t);
	    y = .6 + sin(60 * t) / 60;
	    c.push([x,y]);
	 }
	 mCurve(c);
      }
         
   }
}
