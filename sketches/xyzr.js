function() {
   this.label = 'xyzr';
   this.show_xyzr = false;
   this.show_sn   = false;

   this.onSwipe[1] = ['show\nx,y,z and r', function() { this.show_xyzr = true; }];
   this.onSwipe[3] = ['show\nS and N'    , function() { this.show_sn   = true; }];

   this.render = function() {
      var X = cos(PI/4), Y = sin(PI/4);

      textHeight(this.mScale(0.1));
      mCurve(arc(0, 0, 1,   PI/4, 3*PI/4, 10));
      mCurve(arc(0, 0, 1, 3*PI/4, 9*PI/4, 30));

      if (this.show_xyzr) {
         mLine([0, 0], [X, Y]);
         mText('x,y,z', [0, 0], .5, 0);
         mText('r', [X*.45, Y*.45], 1.3, 1.2);
      }

      if (this.show_sn) {
         mArrow([-X, Y], [-X*1.5, Y*1.5]);
         mText('N', [-X*1.62, Y*1.62], .5, .5);
         mText('S', [-X, Y], -.25, -.25);
      }
   }
}

