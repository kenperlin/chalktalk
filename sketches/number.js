function() {
   this.USES_DEPRECATED_PORT_SYSTEM = true;
   this.labels = '0 1 2 3 4 5 6 7 8 9'.split(' ');
   this.is3D = true;

   let updateSketchText = function() {
      if (this.sketchTexts.length == 0) {
         this.setSketchText(0, '' + this.selection, [0,-.1], 1.5);
      }
   }.bind(this);

   this.setup = updateSketchText;

   this.render = function() {
      this.duringSketch(function() {
         var curves = CT.lineFont[0][48 + this.selection];
	 for (var i = 0 ; i < curves.length ; i++)
            mCurve(curves[i]);
      });
      this.afterSketch(function() {
         updateSketchText();
      });

      if (isDef(this.inValues_DEPRECATED_PORT_SYSTEM[0]))
         this.sketchTexts[0].setValue(roundedString(this.inValues_DEPRECATED_PORT_SYSTEM[0]));
   }

   this.output = function() { return +(this.sketchTexts[0].value); }
}
