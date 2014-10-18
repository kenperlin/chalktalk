
   function Mat4() {
      this.labels = "mat4".split(' ');
      this.mode = 0;
      this.onClick = function(x, y) {
         this.mode++;
      }
      this.render = function(elapsed) {
         m.save();
         mCurve([[-1,1],[1,1],[1,-1],[-1,-1],[-1,1]]);
         mLine([-.5,1],[-.5,-1]);
         mLine([  0,1],[  0,-1]);
         mLine([ .5,1],[ .5,-1]);
         mLine([-1, .5],[1, .5]);
         mLine([-1,  0],[1,  0]);
         mLine([-1,-.5],[1,-.5]);
         this.afterSketch(function() {
            if (this.mode > 0) {
               var vals = (this.mode % 2) == 1 ? [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]
                                               : [0,1,0,0, 1,0,0,0, 0,0,1,0, 0,0,0,1] ;
               textHeight((this.xhi - this.xlo) / 10);
               for (var i = 0 ; i < 4 ; i++)
               for (var j = 0 ; j < 4 ; j++) {
                  var x = (i - 1.5) / 2;
                  var y = (1.5 - j) / 2;
                  mText(vals[i + 4 * j], [x, y], .5, .5);
               }
            }
         });
         m.restore();
      }
   }
   Mat4.prototype = new Sketch;
   addSketchType("Mat4");

