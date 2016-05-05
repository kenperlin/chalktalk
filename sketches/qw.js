function() {
   this.label = 'qw';
   this.onEnter   = function(p) { window.isWritingToTextSketch = true; }
   this.onExit    = function(p) { window.isWritingToTextSketch = false; }
   this.onDelete  = function(p) { window.isWritingToTextSketch = false; }
   this.mouseMove = function(x, y) { this.qw.trackXY(this.xyToSketchPoint(x, y)); }
   this.qw = new QW();
   this.render = function() {
      this.duringSketch(function() {
         mCurve([[.5,1],[-.5,-1],[-.5,1],[.5,-1]]);
      });
      this.afterSketch(function() {
         var faded = backgroundColor == 'white' ? .3 : .1;
         color(palette.color[this.colorId]);
         for (var i = 0 ; i < this.qw.zones.length ; i++) {
            var z = this.qw.zones[i];
	    if (i == this.qw.zone + 1) {
                color(fadedColor(faded, this.colorId));
                mFillDisk(z, z[2]);
                color(palette.color[this.colorId]);
	    }
            lineWidth(this.mScale(i==0 && this.qw.sequence.length == 0 ? .03 : .01));
            mDrawDisk(z, z[2]);
         }
	 this.workingChar = '';
         this.qw.sequenceToColAndRow();
         for (var col = 0 ; col < 9 ; col++)
         for (var row = 0 ; row < 9 ; row++) {
            var s = this.qw.toVisibleChar(this.qw.A(row, col));
            var fh = s.length == 1 ? .18 : .1;
            textHeight(this.mScale(fh));
            if (s != ' ') {
               var xy = this.qw.rowAndColToXY(row, col);
               mText(s, xy, .5, .5);
               if (col == this.qw.col && row == this.qw.row) {
                  mDrawDisk(xy, .1);
	          this.workingChar = s;
               }
            }
         }
	 s = this.qw.selectedChar.length > 0 ? this.qw.selectedChar : this.workingChar;
         textHeight(this.mScale(s.length == 1 ? .3 : .17));
	 color(fadedColor(s == this.qw.selectedChar ? 1 : 2 * faded, this.colorId));
         mText(s.trim(), [0,0], .5,.5);
      });
   }
}
