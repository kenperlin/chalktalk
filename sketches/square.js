function() {
   this.label = 'square';
   this.guide = 'you can use a square to be hip';
   this.mode = 0;

   this.onClick = function() { this.mode++; }

   this.render = function() {
      mLine([-1,-1],[ 1,-1]);
      mLine([ 1,-1],[ 1, 1]);
      mLine([ 1, 1],[-1, 1]);
      mLine([-1, 1],[-1,-1]);

      mText(this.guide, [0, 0], 1, .5);

      this.afterSketch(function() {
         textHeight(this.mScale(0.2));
	 if (this.mode > 0) {
	    mText("-1,-1", [-1.2,-1.2], .5, .5);
	    mText("1,-1", [ 1.2,-1.2], .5, .5);
	    mText("-1,1", [-1.2, 1.2], .5, .5);
	    mText("1,1", [ 1.2, 1.2], .5, .5);
         }

	 if (this.mode > 1) {
	    mText("0:\n1\u2006:\n2:\n3:", [-.2,0], 1, .5);
	    mText("-1\n1\n1\n-1", [.1,0], 1, .5);
	    mText(",\n,\n,\n,", [.2,0], .5, .5);
	    mText("-1\n-1\n1\n1", [.4,0], 1, .5);
         }

	 if (this.mode > 2) {
	    mText("[0,1]", [0,-1.2], .5, .5);
	    mText("[1,2]", [1.3, 0], .5, .5);
	    mText("[2,3]", [0, 1.2], .5, .5);
	    mText("[3,0]", [-1.3, 0], .5, .5);
         }
      });
   }
}
