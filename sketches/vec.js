function() {
   this.nRows = function() {
      return 2 + floor(this.selection / 2);
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
      this._updateLength();
   }

   this.mouseDown = function(x, y) {
      this.isDraggedValue = false;
      var mt = m.transform([x,y])[this.axis()];
      var t = this.axis() == 0 ? (1 + mt ) / 2 : (1 - mt) / 2;
      this.row = max(0, min(this.nRows()-1, floor(this.nRows() * t)));
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
      this._updateLength();
   }];
   this.onSwipe[4] = ['fewer\ndigits'  , function() { this.precision = max(0, this.precision - 1); }];
   this.onSwipe[5] = ['transpose'      , function() { this.selection = (this.selection & 14) + 1 - (this.selection % 2); }];
   this.onSwipe[7] = ['longer\nvector' , function() {
      if (! this.isDraggedValue) {
         this.selection += 2;
      }
      this._updateLength();
   }];

   this._updateLength = function() {
      if (this.value.length != this.nRows()) {
         while (this.nRows() > this.value.length) {
            this.value.push(0);
         }
         this.value.length = this.nRows();
      }
   }

   this.render = function(elapsed) {
      var a = 1 / this.nRows();
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
      for (var i = 1 ; i < this.nRows() ; i++) {
         var b = mix(1, -1, i / this.nRows());
         switch (this.axis()) {
         case 0: mLine([-b, a],[-b,-a]); break;
         case 1: mLine([-a, b],[ a, b]); break;
         }
      }
      this.afterSketch(function() {
         textHeight(m.transform([1,0,0,0])[0] / max(1.5, this.nRows() - 1) / (1 + this.precision));
         for (var i = 0 ; i < this.nRows() ; i++) {
            let t = (i+.5) / this.nRows(),
               a = this.axis() == 0 ? mix(-1, 1, t) : mix(1, -1, t),
               p = this.axis() == 0 ? [a,0] : [0,a];
            mText(roundedString(this.value[i], this.precision), p, .5, .5);
         }
      });
   }

   this.defineInput(AT.Matrix);

   this.defineOutput(AT.Matrix, function() {
      let myMatrix;
      switch(this.axis()) {
      case 0: myMatrix = new AT.Matrix([this.value]);
      case 1: myMatrix = new AT.Matrix(this.value.map(function(n) { return [n]; }));
      }
      if (this.inputs.hasValue(0) && this.inputs.value(0).canMultiply(myMatrix)) {
         return this.inputs.value(0).times(myMatrix);
      }
      else {
         return myMatrix;
      }
   });
}
