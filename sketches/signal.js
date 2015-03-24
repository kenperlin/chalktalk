function() {
   this.label = 'signal';
   this.code = [['', 'sin(TAU * t)', function() { } ]];
   this.createCodeFunction = function() {
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
   this.createCodeFunction();
   this.evalCodeFunction = function(t) {
      try {
         return this.codeFunction(t);
      } catch(e) {
         return 0;
      }
   }
   this.render = function() {
      mLine([-1,0],[1,0]);
      var C = [];
      for (var t = -1 ; t <= 1 ; t += .02)
         C.push([t, this.evalCodeFunction(t/2)/PI]);
      mCurve(C);
      this.afterSketch(function() {
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
         this.setOutPortValue(this.codeFunction);
      });
   }
}
