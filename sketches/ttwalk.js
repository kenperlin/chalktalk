function TTWalk() {

   function uncompressData(src) {
      var dst = [];
      for (i = 0 ; i < src.length ; i++)
         if (src[i] > 0)
            dst.push(src[i]);
         else
	    for (var n = 0 ; n < -src[i] ; n++)
	       dst.push(0);
      return dst;
   }

   this.onSwipe = function(dx, dy) {
      switch (pieMenuIndex(dx, dy)) {
      case 1:
         this.walkIndex = (this.walkIndex + 1) % tt_walks.length;
         this.setWalk(this.walkIndex);
         break;
      case 3:
         this.walkIndex = (this.walkIndex + tt_walks.length - 1) % tt_walks.length;
         this.setWalk(this.walkIndex);
         break;
      }
   }
   this.setWalk = function(n) {
      this.walkIndex = n;
      this.tt_walk = tt_walks[this.walkIndex];
      this.nRows = this.tt_walk[0][0];
      this.nCols = this.tt_walk[0][1];
      this.nFrames = (this.tt_walk.length - 1) / 2;

      this.frameTime = [];
      this.frameData = [];
      for (var frame = 0 ; frame < this.nFrames ; frame++) {
         this.frameTime.push(this.tt_walk[1 + 2 * frame][1]);
         this.frameData.push(uncompressData(this.tt_walk[2 + 2 * frame]));
      }
   }
   this.setWalk(0);

   this.frame = 0;

   this.getFrame = function(time) {
      //time *= 0.1;

      var t = time % this.frameTime[this.frameTime.length-1];
      var frame = 0;
      while (t >= this.frameTime[frame])
         frame++;
      return frame;
/*
      this.frame = (this.frame + 1) % this.frameTime.length;
      return this.frame;
*/
   }

   this.labels = 'ttwalk'.split(' ');

   this.rowToY = function(row) { return (row - this.nRows / 2) / (this.nCols / 2); }
   this.colToX = function(col) { return (col - this.nCols / 2) / (this.nCols / 2); }

   var Q = [0,0,0];

   this.render = function() {

      var h2w = this.nRows / this.nCols;
      mLine([-1, h2w], [-1,-h2w]);
      mLine([-1, h2w], [ 1, h2w]);

      this.afterSketch(function() {
         var pressureData = this.frameData[this.getFrame(time / 2)];

         var iMax = 0, pMax = 0;
	 for (var i = 0 ; i < pressureData.length ; i++)
	    if (pressureData[i] > pMax) {
	       iMax = i;
	       pMax = pressureData[i];
	    }
	 var colMax = iMax % this.nCols;
	 var rowMax = floor(iMax / this.nCols);

	 colMax = max(1, min(this.nCols - 2, colMax));
	 rowMax = max(1, min(this.nRows - 2, rowMax));

         var i = this.nCols * rowMax + colMax;

	 valuesToQuadratic([ pressureData[i - 1],
	                     pressureData[i    ],
	                     pressureData[i + 1] ], Q);
	 colMax -= Q[1] / Q[0] / 2;

	 valuesToQuadratic([ pressureData[i - this.nCols],
	                     pressureData[i             ],
	                     pressureData[i + this.nCols] ], Q);
	 rowMax -= Q[1] / Q[0] / 2;

         var index = 0;
         for (var row = 0 ; row < this.nRows ; row++) {
            var y0 = this.rowToY(row - .2);
            var y1 = this.rowToY(row + .2);

            for (var col = 0 ; col < this.nCols ; col++) {
               var x0 = this.colToX(col - .2);
               var x1 = this.colToX(col + .2);

               var c = min(255, pressureData[index++] >> 3);
               color('rgb(' + c + ',' + c + ',' + c + ')');
               mFillRect([x0, y0], [x1, y1]);
            }
         }

         color(scrimColor(.3));
         mLine([-1,-h2w], [ 1,-h2w]);
         mLine([ 1, h2w], [ 1,-h2w]);

         textHeight((this.yhi - this.ylo) / 8);
         color(defaultPenColor);
         mText("" + this.walkIndex, [ 0, 0 ], .5, .5);

         var duration = this.frameTime[this.frameTime.length-1];
         var f = (time % duration) / duration;
         mFillRect([lerp(f, -1, .98), -h2w], [lerp(f, -.98, 1), -h2w-.01]);

	 var x = this.colToX(colMax);
	 var y = this.rowToY(rowMax);
         color('red');
	 var radius = 1 / this.nCols;
	 mDrawOval([x - radius,y - radius], [x + radius,y + radius]);
      });
   }
}
TTWalk.prototype = new Sketch;
addSketchType('TTWalk');

