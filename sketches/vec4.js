
   function Vec4() {
      this.labels = "vec4".split(' ');
      this.value = [1,0,0,0];
      this.nRows = 4;
      this.row = 0;
      this.precision = 1;
      this.mxy = [0,0];
      this.p10 = [1,10,100,1000];
      this.mouseDown = function(x, y) {
         var my = m.transform([x,y])[1];
         this.row = my > .5 ? 0 : my > 0 ? 1 : my > -.5 ? 2 : 3;
         this.yDrag = y;
      }
      this.mouseDrag = function(x, y) {
         var val = this.value[this.row];
	 var delta = 1 / this.p10[this.precision];
	 if (y - this.yDrag < -20) { val += delta; this.yDrag = y; }
	 if (y - this.yDrag >  20) { val -= delta; this.yDrag = y; }
	 this.value[this.row] = val;
      }
      this.mouseUp = function(x, y) { }
      this.onSwipe = function(dx, dy) {
         switch (pieMenuIndex(dx, dy)) {
	 case 0: this.precision = min(3, this.precision + 1); break;
	 case 2: this.precision = max(0, this.precision - 1); break;
	 }
      }
      this.render = function(elapsed) {
         var x = .25;
         mCurve([[-x,1],[x,1],[x,-1],[-x,-1],[-x,1]]);
         lineWidth(1);
         mLine([-x, .5],[x, .5]);
         mLine([-x, .0],[x, .0]);
         mLine([-x,-.5],[x,-.5]);
         this.afterSketch(function() {
	    textHeight(m.transform([1,0,0,0])[0] / this.nRows);
	    var outValue = [];
            for (var j = 0 ; j < this.nRows ; j++) {
               var y = (1.5 - j) / 2;
               var val = this.getInValue(j, this.value[j]);
	       mText(roundedString(val, this.precision), [0, y], .5, .5);
	       outValue.push(val);
            }
            this.outValue[0] = outValue;
         });
      }
   }
   Vec4.prototype = new Sketch;
   addSketchType("Vec4");

