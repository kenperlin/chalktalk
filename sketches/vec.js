function() {
   this.nValues = function() {
      return 2 + floor(this.selection / 2);
   }
   this.nRows = function() {
      return this.isColumnVector() ? this.nValues() : 1;
   }
   this.nColumns = function() {
      return this.isColumnVector() ? 1 : this.nValues;
   }
   this.isColumnVector = function() {
      return this.axis() === 1;
   }
   this.axis = function() {
      return 1 - this.selection % 2;
   }
   this.labels = 'Hvec2 Vvec2 Hvec3 Vvec3 Hvec4 Vvec4'.split(' ');
   this.p10 = [1,10,100,1000];
   
   this.setup = function() {
      this.value = [1,0,0,0];
      this.row = 0;
      this.precision = 1;
      this.updateLength();
   }

   this.mouseDown = function(x, y) {
      this.isDraggedValue = false;
      var mt = m.transform([x,y])[this.axis()];
      var t = this.axis() == 0 ? (1 + mt ) / 2 : (1 - mt) / 2;
      this.row = max(0, min(this.nValues()-1, floor(this.nValues() * t)));
      this.xVal = x;
      this.yVal = y;
   }
   this.mouseDrag = function(x, y) {
      var ax = abs(x - this.xVal);
      var ay = abs(y - this.yVal);
      if (ay > 2 * ax && ay > 20) {
         var val = this.value[this.row];
         val += (y < this.yVal ? 1 : -1) / this.p10[this.precision]
         this.isDraggedValue = true;
         this.value[this.row] = val;
         this.xVal = x;
         this.yVal = y;
      }
   }
   this.mouseUp = function(x, y) { }

   this.onSwipe[0] = ['more\ndigits'   , function() { this.precision = min(3, this.precision + 1); }];
   this.onSwipe[3] = ['shorter\nvector', function() { 
      if (! this.isDraggedValue && this.selection > 1) this.selection -= 2;
      this.updateLength();
   }];
   this.onSwipe[4] = ['fewer\ndigits'  , function() { this.precision = max(0, this.precision - 1); }];
   this.onSwipe[5] = ['transpose'      , function() { this.selection = (this.selection & 14) + 1 - (this.selection % 2); }];
   this.onSwipe[7] = ['longer\nvector' , function() {
      if (! this.isDraggedValue) {
         this.selection += 2;
      }
      this.updateLength();
   }];

   this.updateLength = function() {
      if (this.value.length != this.nValues()) {
         while (this.nValues() > this.value.length) {
            this.value.push(0);
         }
         this.value.length = this.nValues();
      }
   }

   this.hasControlInput = function() {
      // If first input is the same dimensions as this vector, use it as a control input.
      if (this.inputs.hasValue(0)) {
         let input = this.inputs.value(0);
         if (input.numRows() === this.nRows() && input.numColumns() === this.nColumns()) {
            return true;
         }
      }
      return false;
   }

   this.valuesToUse = function() {
      if (this.hasControlInput()) {
         return this.inputs.value(0).toFlatArray();
      }
      else {
         return this.value;
      }
   }

   this.render = function(elapsed) {
      var a = 1 / this.nValues();
      switch (this.axis()) {
      case 0: mCurve([[1,a],[1,-a],[-1,-a]]); break;
      case 1: mCurve([[a,1],[a,-1],[-a,-1]]); break;
      }
      this.afterSketch(function() {
         switch (this.axis()) {
         case 0: mCurve([[-1,-a],[-1,a],[1,a]]); break;
         case 1: mCurve([[-a,-1],[-a,1],[a,1]]); break;
         }
      });
      lineWidth(1);
      for (var i = 1 ; i < this.nValues() ; i++) {
         var b = mix(1, -1, i / this.nValues());
         switch (this.axis()) {
         case 0: mLine([-b, a],[-b,-a]); break;
         case 1: mLine([-a, b],[ a, b]); break;
         }
      }
      this.afterSketch(function() {
         let values = this.valuesToUse();
         textHeight(m.transform([1,0,0,0])[0] / max(1.5, this.nValues() - 1) / (1 + this.precision));
         for (var i = 0 ; i < this.nValues() ; i++) {
            let t = (i+.5) / this.nValues(),
               a = this.axis() == 0 ? mix(-1, 1, t) : mix(1, -1, t),
               p = this.axis() == 0 ? [a,0] : [0,a];
            mText(roundedString(values[i], this.precision), p, .5, .5);
         }
      });
   }

   this.defineInput(AT.Matrix);
   this.defineInput(AT.Matrix);

   this.defineOutput(AT.Matrix, function() {
      let myMatrix;
      if (this.hasControlInput()) {
         myMatrix = this.inputs.value(0);
      }
      else {
         myMatrix = this.isColumnVector()
            ? new AT.Matrix(this.valuesToUse().map(function(n) { return [n]; }))
            : new AT.Matrix([this.valuesToUse()]);
      }

      let multInput = this.hasControlInput() ? 1 : 0;

      if (this.inputs.hasValue(multInput) && this.inputs.value(multInput).canMultiply(myMatrix)) {
         return this.inputs.value(multInput).times(myMatrix);
      }
      else {
         return myMatrix;
      }
   });
}
