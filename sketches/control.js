
function Control() {
   this.labels = "slideX slideY".split(' ');

   this.flip = 1;

   this.computeStatistics = function() {
      var c = this.glyphTrace[1-this.selection];
      var y0 = c[0][1];
      var y1 = c[c.length - 1][1];
	 this.flip = y0 > y1 ? 1 : -1;
   }

   this.lo = 0;
   this.hi = 1;
   this.t = 0.5;

   this.mouseDrag = function(x, y) {
      m.save();
      var sc = this.size / 180;
      this.standardViewInverse();
      var p = m.transform([x,y]);
      p = [p[0]/sc, p[1]/sc];
      this.t = max(0, min(1, p[this.selection] + .5));
      m.restore();
   }

   this.render = function(elapsed) {

      var sc = this.size / 180;

      this.afterSketch(function() {
         if (this.portLocation.length == 0) {
            switch (this.selection) {
            case 0:
               this.addPort("lo", -.62 * sc, 0);
               this.addPort("hi",  .62 * sc, 0);
               break;
            case 1:
               this.addPort("lo", 0, -.62 * sc);
               this.addPort("hi", 0,  .62 * sc);
               break;
            }
            this.addPort("t", 0, 0);
	       this.setDefaultValue("lo", 0);
	       this.setDefaultValue("hi", 1);
         }
      });

      var t = this.t;
      if (this.isInValue("t"))
         t = max(0, min(1, this.getInFloat("t")));

      this.lo = this.isInValue("lo") ? this.getInFloat("lo") : this.getDefaultValue("lo");
      this.hi = this.isInValue("hi") ? this.getInFloat("hi") : this.getDefaultValue("hi");

      this.setOutValue("t", lerp(t, this.lo, this.hi));

      m.save();
      m.scale(sc);

      var x = t - .5;
      switch (this.selection) {
      case 0:
         mLine([-.5,0],[.5,0]);
         mLine([x,-.15*this.flip],[x,.15*this.flip]);
         break;
      case 1:
         mLine([0,-.5*this.flip],[0,.5*this.flip]);
         mLine([-.15,x],[.15,x]);
         break;
      }

      this.afterSketch(function() {
         textHeight(16);
         switch (this.selection) {
         case 0:
            mText(roundedString(this.lo), [-.6,0], 1, .5);
            mText(roundedString(this.hi), [ .6,0], 0, .5);
            break;
         case 1:
            mText(roundedString(this.lo), [0,-.6], .5, 0);
            mText(roundedString(this.hi), [0, .6], .5, 1);
            break;
         }

	    // WHEN BOUNDS ARE INTEGER VALUES, DRAW INTERMEDIATE TICK MARKS.

	    if (this.lo == floor(this.lo) && this.hi == floor(this.hi)) {
	       for (var i = this.lo + 1 ; i < this.hi ; i++) {
	          var tw = i % 10 == 0 ? 0.04 : 0.02;
	          var t = (i - this.lo) / (this.hi - this.lo) - .5;
	          switch (this.selection) {
		  case 0:
		     mLine([t,-tw],[t,tw]);
		     break;
		  case 1:
		     mLine([-tw,t],[tw,t]);
		     break;
	          }
	       }
	    }
      });
      m.restore();
   }
}
Control.prototype = new Sketch;

registerGlyph(sketchTypeToCode('Control', 'slideX'), [ [[-.5,0],[.5,0]], [[0,-.2],[0,.2]] ]);
//registerGlyph(sketchTypeToCode('Control', 'slideY'), [ [[0,-.5],[0,.5]], [[-.2,0],[.2,0]] ]);
