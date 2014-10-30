
   function Vec() {
      this.labels = "vec2 vec3 vec4".split(' ');
      this.value = [1,0,0,0];
      this.nRows = 2;
      this.row = 0;
      this.precision = 1;
      this.mxy = [0,0];
      this.p10 = [1,10,100,1000];
      this.mouseDown = function(x, y) {
         var my = m.transform([x,y])[1];
	 var t = (1 - my) / 2;
         this.row = max(0, min(this.nRows-1, floor(this.nRows * t)));
         this.xVal = x;
         this.yVal = y;
      }
      this.mouseDrag = function(x, y) {
         var ax = abs(x - this.xVal);
         var ay = abs(y - this.yVal);
	 if (ay > 2 * ax && ay > 20) {
            var val = this.value[this.row];
	    val += (y < this.yVal ? 1 : -1) / this.p10[this.precision];
	    this.value[this.row] = val;
	    this.xVal = x;
	    this.yVal = y;
         }
      }
      this.mouseUp = function(x, y) { }
      this.onSwipe = function(dx, dy) {
         var my = m.transform([sketchPage.mx,sketchPage.my])[1];
         switch (pieMenuIndex(dx, dy, 8)) {
	 case 0: this.precision = min(3, this.precision + 1); break;
	 case 4: this.precision = max(0, this.precision - 1); break;
	 case 7: this.selection = min(2, this.selection + 1); break;
	 case 3: this.selection = max(0, this.selection - 1); break;
	 }
      }

      this.render = function(elapsed) {
         var x = 1 / this.nRows;
         mCurve([[-x,1],[x,1],[x,-1],[-x,-1],[-x,1]]);
         lineWidth(1);
	 this.nRows = this.selection + 2;
	 for (var i = 1 ; i < this.nRows ; i++) {
	    var y = lerp(i / this.nRows, 1, -1);
            mLine([-x, y],[x, y]);
         }
         this.afterSketch(function() {
	    textHeight(m.transform([1,0,0,0])[0] / max(1.5, this.nRows - 1) / (1.5 + this.precision));
	    var outValue = [];
            for (var i = 0 ; i < this.nRows ; i++) {
	       var y = lerp((i+.5) / this.nRows, 1, -1);
               var val = this.getInValue(i, this.value[i]);
	       mText(roundedString(val, this.precision), [0, y], .5, .5);
	       outValue.push(val);
            }
            this.outValue[0] = outValue;
         });
      }
   }
   Vec.prototype = new Sketch;
   addSketchType("Vec");

