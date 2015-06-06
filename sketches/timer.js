function() {
   this.label = 'timer';
   this.elapsedTime = 0;
   this.onCmdClick = function() { this.startTime = time; }
   this.render = function() {
      mDrawOval([-1,-1],[1,1],36,PI/2,PI/2-TAU);
      var seconds = floor(this.elapsedTime % 60);
      var minutes = floor(this.elapsedTime / 60);
      var secondsAngle = TAU / 60 * seconds;
      var minutesAngle = TAU / 60 * minutes;
      mLine([0,0],[.8 * sin(secondsAngle), .8 * cos(secondsAngle)]);
      this.afterSketch(function() {
         var s, c;
         mLine([0,0],[.6 * sin(minutesAngle), .6 * cos(minutesAngle)]);
         if (this.startTime === undefined)
            this.startTime = time;
         this.elapsedTime = time - this.startTime;
         this.setOutPortValue(this.elapsedTime);
	 for (var i = 0 ; i < 12 ; i++) {
	    s = sin(i * TAU / 12);
	    c = cos(i * TAU / 12);
	    mLine([.9 * s, .9 * c], [s, c]);
         }
	 textHeight(this.mScale(0.3));
	 color(scrimColor(0.5));
	 mText(minutes + (seconds < 10 ? ':0' : ':') + floor(seconds), [0,-.4], .5,.5);
      });
   }
}

