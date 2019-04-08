function() {
   let x = [-.5,-.45,-.45,-.4,-.35,-.3,-.25,-.2,-.15];
   let y = [.0,.05,.1,.15,.35,.4];
   let showPoints = false;
   this.label = 'frl';
   this.onClick = () => showPoints = ! showPoints;
   this.render = function() {
      this.duringSketch(function() {
         mCurve([[-1,-1],[-1,1],[1,1]]);
         mLine([-1,0],[1,0]);
      });
      this.afterSketch(function() {
         mFillRect( [x[0],y[0]], [x[1],y[5]] );
         mFillRect( [x[0],y[4]], [x[3],y[5]] );
         mFillRect( [x[0],y[2]], [x[1],y[3]] );

         mFillRect( [x[3],y[0]], [x[4],y[3]] );
         mFillRect( [x[3],y[2]], [x[5],y[3]] );

         mFillRect( [x[6],y[0]], [x[7],y[5]] );
         mFillRect( [x[7],y[0]], [x[8],y[1]] );

	 if (! showPoints)
	    return;

	 color('rgb(255,32,32)');
	 mFillDisk([-1,-.1],.02);
	 mFillDisk([-1,.6],.02);

	 mFillDisk([-.9,-.1],.02);
	 mFillDisk([-.9,.2],.02);
	 mFillDisk([-.9,.3],.02);
	 mFillDisk([-.9,.5],.02);

	 mFillDisk([-.7,.2],.02);
	 mFillDisk([-.7,.3],.02);

	 mFillDisk([-.6,-.1],.02);
	 mFillDisk([-.6,.3],.02);

	 mFillDisk([-.5,-.1],.02);
	 mFillDisk([-.5,.2],.02);

	 mFillDisk([-.3,.2],.02);
	 mFillDisk([-.3,.3],.02);
	 mFillDisk([-.3,.5],.02);
	 mFillDisk([-.3,.6],.02);

	 mFillDisk([-.2,-.1],.02);
	 mFillDisk([-.2,.6],.02);

	 mFillDisk([-.1,-.1],.02);
	 mFillDisk([-.1,.6],.02);
      });
   }
}
