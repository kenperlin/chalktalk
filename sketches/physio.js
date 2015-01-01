function Physio() {
   this.labels = 'physio'.split(' ');
   this.render = function() {
      color('rgb(128,200,255)');
      mLine([.3,.2],[.3,-.2]);
      mCurve([[.3,.2],[-.3,.2],[-.3,-.2],[.3,-.2]]);
      var textScale = this.mScale(.3);
      this.afterSketch(function() {

         // MIST Mat

	 color('rgba(128,200,255,.17)');
	 mFillRect([-.3,-.2],[.3,.2]);
         color('rgb(128,200,255)');
         textHeight(.2 * textScale);
	 mText("MIST Mat", [0,0], .5,.5);
	 color('rgba(128,200,255,.6)');
	 mFillRect([.3,-.205],[.35,.205]);

         color('rgba(128,255,128,.3)');
         lineWidth(8);
	 mCurve([[-.25,.5],[-.525,.5],[-.525,.15]]);
	 mCurve([[.75,.15],[.75,.4]]);
         lineWidth(2);

	 // PATIENT AND THERAPIST

         color('rgb(128,255,128)');
	 mDrawOval([-.25,.4],[.25,.6]);
	 mText("patient", [0,.5], .5,.5);

	 mDrawOval([.5,.4],[1,.6]);
	 mText("therapist", [.75,.5], .5,.5);

         color('white');

	 // PHONE

	 mClosedCurve(createRoundRect(-.6,-.15, .15,.3, .03));
         textHeight(.1 * textScale);
	 mText("phone", [-.525,0], .5,.5);

	 // COMPUTER

	 mText("computer", [.75,0], .5,.5);
	 mDrawRect([.55,-.15],[.95,.15]);

	 // CLOUD STORAGE

         textHeight(.17 * textScale);
	 mText("cloud storage", [0,-.55], .5,.5);
	 mDrawRect([-.35,-.7],[.35,-.4]);

	 // ANALYSIS

         textHeight(.13 * textScale);
	 mText("analysis", [.75,-.55], .5,.5);
	 mClosedCurve([[.5,-.55],[.75,-.7],[1,-.55],[.75,-.4]]);

	 color('rgb(100,100,100)');
	 mFillCurve([[.545,-.15],[.955,-.15],[1,-.2],[.5,-.2]]);
	 color('rgb(50,50,50)');
	 mFillRect([.5,-.22],[1,-.2]);

         color('rgb(200,64,64)');
         lineWidth(2);
	 mArrow([-.3,0],[-.45,0]);
	 mLine([-.525,-.55],[-.525,-.15]);
	 mArrow([-.525,-.55],[-.35,-.55]);
	 mArrow([ .35,-.55],[.5,-.55]);
	 mArrow([.75,-.4],[.75,-.22]);

      });
   }
}
Physio.prototype = new Sketch;
addSketchType('Physio');
