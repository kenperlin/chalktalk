function() {
   this.label = 'Timer';
   this.initTimer = function() { this.timerTime = time; this.timerT = 0; }
   this.onCmdClick = function() { this.initTimer(); }
   this.initTimer();
   this.render = function() {
      mDrawOval([-1,-1],[1,1],36,PI/2,PI/2-TAU);
      var seconds = this.timerT % 60;
      var minutes = floor(this.timerT / 60);
      var secondsAngle = TAU / 60 * seconds;
      var minutesAngle = TAU / 60 * minutes;
      mLine([0,0],[.8 * sin(secondsAngle), .8 * cos(secondsAngle)]);
      this.afterSketch(function() {
         var s, c;
         mLine([0,0],[.6 * sin(minutesAngle), .6 * cos(minutesAngle)]);
         this.timerT += def(this.inValues[0], 1) * (time - this.timerTime);
         this.timerTime = time;
         for (var i = 0 ; i < 12 ; i++) {
            s = sin(i * TAU / 12);
            c = cos(i * TAU / 12);
            mLine([.9 * s, .9 * c], [s, c]);
         }
         textHeight(this.mScale(0.3));
         color(fadedColor(0.5, this.colorId));
         var fraction = floor(10 * seconds) % 10;
         mText(minutes
               + (seconds  < 10 ? ':0' : ':') + floor(seconds)
               + '.' + fraction,
               [0,-.4], .5,.5);
      });
   }
   this.output = function() { return this.timerT; }
}

