function() {
   this.label = 'signal';
   this.code = [['', 'sin(TAU*t)/TAU', function() { } ]];
   this.initCopy = function() {
      this.createCodeFunction();
   }
   this.createCodeFunction = function() {
      if (typeof this.inValue[0] === 'function')
         this.codeFunction = this.inValue[0];
      else {
         var codeText = this.code[this.selection][1];
         codeText = codeText.replace(/\bx\b/g, def(this.inValue[0], 0))
                            .replace(/\by\b/g, def(this.inValue[1], 0))
                            .replace(/\bz\b/g, def(this.inValue[2], 0));

         if (codeText.indexOf('return ') < 0)
            codeText = 'return (' + codeText + ')';

         try {
            this.codeFunction = new Function('t', codeText);
         } catch(e) { }
      }
   }
   this.createCodeFunction();
   this.evalCodeFunction = function(t) {
      try {
         return this.codeFunction(t);
      } catch(e) {
         return 0;
      }
   }
   this.render = function() {
      lineWidth(1);
      mLine([-1,0],[1,0]);
      lineWidth(2);
      var C = [];
      for (var t = 0 ; t <= 1 ; t += .01)
         C.push([2*t-1, 2*this.evalCodeFunction(t)]);
      mCurve(C);
      this.afterSketch(function() {
         if (typeof this.inValue[0] !== 'function' && this == sk() && isHover()) {
            var scale = 0.15;
            textHeight(this.mScale(scale));
            color(backgroundColor);
            for (var i = 0 ; i < 32 ; i++) {
               var theta = TAU * i / 32;
               mText(this.code[this.selection][1], [ scale / 7 * cos(theta),
                                                     scale / 7 * sin(theta) ], .5,.5);
            }
            color(defaultPenColor);
            mText(this.code[this.selection][1], [0, 0], .5,.5);
         }
      });
   }
   this.output = function() {
      var s = this.selection;
      if ( this.code[s][1] != this.savedCode ||
           this.inValue[0] != this.savedInValue_0 ||
           this.inValue[1] != this.savedInValue_1 ||
           this.inValue[2] != this.savedInValue_2 ) {
         this.savedCode = this.code[s][1];
         this.savedInValue_0 = this.inValue_0;
         this.savedInValue_1 = this.inValue_1;
         this.savedInValue_2 = this.inValue_2;
         this.createCodeFunction();
      }
      return this.codeFunction;
   }
}

