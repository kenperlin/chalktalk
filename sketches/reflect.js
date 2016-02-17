
   function Reflect() {
      this.label = "reflect";
      this.rx = .707;
      this.ry = .707;
      this.code = [["", "R = 2 * N * dot(N,L) - L"]];

      this.mouseDrag = function(x, y) {
         if (y > this.cy)
            return;
         var xx = 2 * (x - this.xlo + x - this.xhi) / this.wide;
         var rx = -xx;
         if (xx * xx < 1) {
            this.rx = rx;
            this.ry = sqrt(1 - xx * xx);
         }
      }

      this.render = function(elapsed) {
         this.duringSketch(function() {
            mLine([-1,0],[1,0]);
            mLine([0,0],[  0,  1]);
            mLine([0,0],[-this.rx,this.ry]);
            mLine([0,0],[ this.rx,this.ry]);
         });
         this.afterSketch(function() {
            if (this.wide === undefined && isNumeric(this.xlo))
               this.wide = this.xhi - this.xlo;

            mLine([-1,0],[1,0]);
            mArrow([0,0],[  0,  1]);
            mArrow([0,0],[-this.rx,this.ry]);
            mArrow([0,0],[ this.rx,this.ry]);

            textHeight(this.mScale(0.1));
            mText("N", [0, 1 * 1.1]);
            mText("L", [-this.rx * 1.1, this.ry * 1.1]);
            mText("R", [ this.rx * 1.1, this.ry * 1.1]);

            if (isCodeWidget && this == codeSketch) {
               _g.save();
               color('rgba(128,192,255,0.5)');
               mLine([-this.rx,this.ry],[0,this.ry]);
               mLine([-this.rx,this.ry],[0,2*this.ry]);
               color('rgb(128,192,255)');
               mArrow([0,0],[0,this.ry]);
               mArrow([0,this.ry],[0,2*this.ry]);
               mArrow([0,2*this.ry],[this.rx,this.ry]);
               mText("N.L", [0.025, this.ry / 2]);
               _g.restore();
            }
         });
      }
   }
   Reflect.prototype = new Sketch;
   addSketchType("Reflect");

