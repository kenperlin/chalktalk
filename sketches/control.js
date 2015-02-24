function() {
   this.labels = "slidex slidey".split(' ');

   this.disableClickToLink = true;

   this.flip = 1;

   this.computeStatistics = function() {
      var c = this.sketchTrace[1-this.selection];
      var y0 = c[0][1];
      var y1 = c[c.length - 1][1];
      this.flip = y0 > y1 ? 1 : -1;
   }

   this.lo = 0;
   this.hi = 1;
   this.t = 0.5;

   this.mouseDrag = function(x, y) {
      var sc = this.size / 180;
      var p = m.transform([x,y]);
      this.t = max(0, min(1, p[this.selection]/sc + .5));
   }

   this.mouseUp = function(x, y) {
      var sc = this.size / 180;
      var p = m.transform([x,y]);
      this.t = max(0, min(1, p[this.selection]/sc + .5));
   }

   this.render = function(elapsed) {

      var sc = this.size / 180;

      this.afterSketch(function() {
         if (this.portLocation.length == 0) {
            //this.addPort("t", 0, 0);
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
            this.setDefaultValue("lo", 0);
            this.setDefaultValue("hi", 1);
         }
      });

      var t = this.t;
      if (this.isInValue("t"))
         t = max(0, min(1, this.getInFloat("t")));

      this.lo = this.isInValue("lo") ? this.getInFloat("lo") : this.getDefaultValue("lo");
      this.hi = this.isInValue("hi") ? this.getInFloat("hi") : this.getDefaultValue("hi");
      var value = lerp(t, this.lo, this.hi);

      this.setOutValue("lo", this.lo);
      this.setOutValue("hi", this.hi);
      this.setOutPortValue(value);

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
            this.drawValue(this.lo, m.transform([-.6, 0]), 1, .5);
            this.drawValue(this.hi, m.transform([ .6, 0]), 0, .5);
            break;
         case 1:
            this.drawValue(this.lo, m.transform([0, -.6]), .5, 0);
            this.drawValue(this.hi, m.transform([0,  .6]), .5, 1);
            break;
         }

         // WHEN BOUNDS ARE INTEGER VALUES, DRAW INTERMEDIATE TICK MARKS.

         if (this.lo == floor(this.lo) && this.hi == floor(this.hi)) {
            var n = 1;
            while (n < (this.hi - this.lo) / 50)
               n *= 10;
            for (var i = this.lo + n ; i < this.hi ; i += n) {
               var tw = i % (10 * n) == 0 ? 0.04 : 0.02;
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
   }
}
