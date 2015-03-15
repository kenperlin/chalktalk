function() {
   this.code = [["",""]];
   this.label = 'textedit';
   this.render = function() {
      mCurve([[.7,.6],[.7,-1],[-.7,-1],[-.7,1],[.3,1]]);
      mClosedCurve([[.3,1],[.7,.6],[.3,.6]]);
      this.afterSketch(function() {
         if (this.inValue[0] !== undefined)
	    this.code[0][1] = this.inValue[0];
      });
   }
}
