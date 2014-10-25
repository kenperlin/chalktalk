
   function Vec4() {
      this.labels = "vec4".split(' ');
      this.value = [1,0,0,0];
      this.row = 0;
      this.mouseDown = function(x, y) {
	 var yy = 2 * (y - this.yhi) / (this.ylo - this.yhi) - 1;
         this.row = yy > .5 ? 0 : yy > 0 ? 1 : yy > -.5 ? 2 : 3;
         this.yDrag = y;
      }
      this.mouseDrag = function(x, y) {
         var val = this.value[this.row];
	 if (this.yDrag - y > 20) { val++; this.yDrag = y; }
	 if (y - this.yDrag > 20) { val--; this.yDrag = y; }
	 this.value[this.row] = val;
      }
      this.mouseUp = function(x, y) { }
      this.render = function(elapsed) {
         var x = .25;
         mCurve([[-x,1],[x,1],[x,-1],[-x,-1],[-x,1]]);
         lineWidth(1);
         mLine([-x, .5],[x, .5]);
         mLine([-x, .0],[x, .0]);
         mLine([-x,-.5],[x,-.5]);
         this.afterSketch(function() {
	    var outValue = [];
            for (var j = 0 ; j < 4 ; j++) {
               var y = (1.5 - j) / 2;
               var val = isDef(this.inValues[j]) ? this.inValues[j] : this.value[j];
               this.drawValue(val, m.transform([0,y]), .5, .5);
	       outValue.push(val);
            }
	    if (this.portLocation.length == 0)
               this.addPort("o", x, 0);
            this.setOutValue("o", outValue);
         });
      }
   }
   Vec4.prototype = new Sketch;
   addSketchType("Vec4");

