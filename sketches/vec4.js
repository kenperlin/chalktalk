
   function Vec4() {
      this.labels = "vec4".split(' ');
      this.render = function(elapsed) {
         m.save();
         var x = .25;
         mCurve([[-x,1],[x,1],[x,-1],[-x,-1],[-x,1]]);
         lineWidth(1);
         mLine([-x, .5],[x, .5]);
         mLine([-x, .0],[x, .0]);
         mLine([-x,-.5],[x,-.5]);
         this.afterSketch(function() {
            for (var j = 0 ; j < 4 ; j++) {
               var y = (1.5 - j) / 2;
               var id = "" + j;
               if (this.portLocation.length < 4) {
                  this.addPort(id, 0, y);
                  this.setDefaultValue(id, j==0 ? 1 : 0);
               }
               var textHeight = _g.textHeight;
               _g.textHeight = textHeight * (this.yhi - this.ylo) / 150;
               this.drawValue(this.getDefaultValue(id), m.transform([0,y]), .5, .5);
               _g.textHeight = textHeight;
            }
         });
         m.restore();
      }
   }
   Vec4.prototype = new Sketch;
   addSketchType("Vec4");

