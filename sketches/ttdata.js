function() {
   this.label = 'ttdata';
   var frameCounter = 0;
   var isAnimating = true;
   var colToX = function(col) { return 2 * col / ttdata.cols - 1 ; };
   var rowToY = function(row) { return .6 * (1 - 2 * row / ttdata.rows); };

   function computeFrameCounter(point) {
      frameCounter = floor(ttdata.data.length * max(0, min(.999, .5 + .5 * point.x)));
      isAnimating = false;
   }

   this.onPress   = function(point) { computeFrameCounter(point); }
   this.onDrag    = function(point) { computeFrameCounter(point); }
   this.onRelease = function(point) { isAnimating = true; }

   var pressureColor = [];
   for (var i = 0 ; i < 256 ; i++) {
      var rgb = fractionToRGB(i / 255);
      pressureColor.push('rgb(' + floor(255 * rgb[0]) + ',' +
                                  floor(255 * rgb[1]) + ',' +
				  floor(255 * rgb[2]) + ')');
   }
      
   this.render = function() {
      mClosedCurve([[-1.25,.6],[1,.6],[1,-.6],[-1.25,-.6]]);
      mLine([-1,.6],[-1,-.6]);
      this.afterSketch(function() {

         var data = ttdata.data[frameCounter];

	 for (var n = 0 ; n < data.length ; n++)
	    if (data[n] > 0) {
	       var col = n % ttdata.cols;
	       var row = (n - col) / ttdata.cols;
	       var x0 = colToX(col+.3);
	       var x1 = colToX(col+.7);
               var y0 = rowToY(row+.3);
               var y1 = rowToY(row+.7);
	       _g.fillStyle = pressureColor[data[n] >> 4];
	       mFillCurve([[x0,y0], [x1,y0], [x1,y1], [x0,y1]]);
	    }

         if (isAnimating)
	    frameCounter = (frameCounter + 1) % ttdata.data.length;
      });
   };
}
