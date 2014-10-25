
   function Vec4() {
      this.labels = "vec4".split(' ');
      this.value = [1,0,0,0];
      this.row = 0;
      this.delta = 1;
      this.mxy = [0,0];
      this.mm = new M4();
      this.mouseDown = function(x, y) {
         var my = m.transform([x,y])[1];
         this.row = my > .5 ? 0 : my > 0 ? 1 : my > -.5 ? 2 : 3;
         this.yDrag = y;
      }
      this.mouseDrag = function(x, y) {
         var val = this.value[this.row];
	 if (this.yDrag - y > 20) { val += this.delta; this.yDrag = y; }
	 if (y - this.yDrag > 20) { val -= this.delta; this.yDrag = y; }
	 this.value[this.row] = val;
      }
      this.mouseUp = function(x, y) { }
      this.onSwipe = function(dx, dy) {
         switch (pieMenuIndex(dx, dy)) {
	 case 0: this.delta /= 10; break;
	 case 2: this.delta *= 10; break;
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

