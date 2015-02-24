function() {
   this.label = 'physio';
   this.phoneRect = new Rectangle(-.6, -.15, .15, .3);
   this.computerRect = new Rectangle(.55, -.15, .4, .3);
   this.storageRect = new Rectangle(-.35,-.7,.7,.3);
   this.analysisRect = new Rectangle(.5,-.7,.5,.3);
   var mouse = newVec();

   this.mouseMove = function(x, y) {
      mouse.set(this.unadjustX(x), this.unadjustY(y), 0).applyMatrix4(pixelToPointMatrix);
   }

   this.render = function() {
      color('rgb(128,200,255)');
      mLine([.3,.2],[.3,-.2]);
      mCurve([[.3,.2],[-.3,.2],[-.3,-.2],[.3,-.2]]);
      var textScale = this.mScale(.3);
      this.afterSketch(function() {
         var p;

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

         p = this.phoneRect;
	 var isInPhone = p.contains(mouse.x, mouse.y);
	 mClosedCurve(createRoundRect(p.left, p.top, p.width, p.height, .03));
         textHeight((isInPhone ? .13 : .1) * textScale);
	 mText("phone", [-.525,0], .5,.5);

	 if (isInPhone) {
	    _g.save();
	    m.save();
	    m.translate(1,0,0);
	    m.scale(4);
	    mClosedCurve(createRoundRect(p.left, p.top, p.width, p.height, .03));
            textHeight(.3 * textScale);
	    mText('"Now,', [-.525,.06], .5,.5);
	    mText('balance', [-.525,.02], .5,.5);
	    mText('on your', [-.525,-.02], .5,.5);
	    mText('left foot."', [-.525,-.06], .5,.5);
	    m.restore();
	    _g.restore();
	 }

	 // COMPUTER

         p = this.computerRect;
	 var isInComputer = p.contains(mouse.x, mouse.y);
         textHeight((isInComputer ? .13 : .1) * textScale);
	 var x0 = p.left, x1 = x0 + p.width, y0 = p.top, y1 = y0 + p.height;
	 var xc = (x0 + x1) / 2, yc = (y0 + y1) / 2;
	 mText("computer", [xc, yc], .5,.5);
	 mDrawRect([x0, y0],[x1, y1]);

	 if (isInComputer) {
	    _g.save();
	    m.save();
	    m.translate(-.4,0,0);
	    m.scale(3);
	    mDrawRect([x0, y0],[x1, y1]);
	    textHeight(.2 * textScale);
	    mText("Inform therapist", [xc,yc + .05], .5,.5);
	    mText("of updated", [xc,yc + .00], .5,.5);
	    mText("patient status.", [xc,yc - .05], .5,.5);
	    color('rgb(100,100,100)');
	    mFillCurve([[.545,-.15],[.955,-.15],[1,-.2],[.5,-.2]]);
	    color('rgb(50,50,50)');
	    mFillRect([.5,-.22],[1,-.2]);
	    m.restore();
	    _g.restore();
	 }

	 // CLOUD STORAGE

         p = this.storageRect;
	 var isInStorage = p.contains(mouse.x, mouse.y);
         textHeight((isInStorage ? .2 : .17) * textScale);
	 var x0 = p.left, x1 = x0 + p.width, y0 = p.top, y1 = y0 + p.height;
	 var xc = (x0 + x1) / 2, yc = (y0 + y1) / 2;
	 mText("cloud storage", [xc,yc], .5,.5);
	 mDrawRect([x0,y0],[x1,y1]);

	 if (isInStorage) {
	    _g.save();
	    m.save();
	    m.translate(0,-.1,0);
	    m.scale(2);
	    mDrawRect([x0,y0],[x1,y1]);
	    textHeight(.2 * textScale);
	    mText("Add raw data", [xc,yc + .05], .5,.5);
	    mText("to the", [xc,yc + .00], .5,.5);
	    mText("database.", [xc,yc - .05], .5,.5);
	    m.restore();
	    _g.restore();
	 }

	 // ANALYSIS

         p = this.analysisRect;
	 var isInAnalysis = p.contains(mouse.x, mouse.y);
         textHeight((isInAnalysis ? .17 : .13) * textScale);
	 var x0 = p.left, x1 = x0 + p.width, y0 = p.top, y1 = y0 + p.height;
	 var xc = (x0 + x1) / 2, yc = (y0 + y1) / 2;
	 mText("analysis", [xc,yc], .5,.5);
	 mClosedCurve([[x0,yc],[xc,y0],[x1,yc],[xc,y1]]);

	 if (isInAnalysis) {
	    _g.save();
	    m.save();
	    m.translate(-.75,-.1,0);
	    m.scale(2);
	    mClosedCurve([[x0,yc],[xc,y0],[x1,yc],[xc,y1]]);
	    textHeight(.2 * textScale);
	    mText("Compare", [xc,yc + .05], .5,.5);
	    mText("against normative", [xc,yc + .00], .5,.5);
	    mText("data.", [xc,yc - .05], .5,.5);
	    m.restore();
	    m.restore();
	    _g.restore();
	 }

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
