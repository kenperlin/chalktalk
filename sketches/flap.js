function() {
   this.label = 'flap';

   this.isWandering = false;
   this.isExiting = false;

   this.onClick = [ 'exit', function() { this.exitTime = time; this.isExiting = true; } ];

   this.onSwipe[4] = ['wander', function() { this.wanderTime = time; this.isWandering = ! this.isWandering; }];

   this.render = function() {

      this.initCopy = function() { this.exitDx = undefined; }

      var phase = 1;
      if (this.phaseOffset === undefined)
         this.phaseOffset = TAU * random();
      else
         phase = this.phaseOffset + 8 * time + 1;
      if (isNaN(phase)) phase = 1;

      var a =  .2+.5 * sin(phase);
      var b = -.3-.5 * cos(phase);

      var ca = cos(a), cb = cos(a+b);
      var sa = sin(a), sb = sin(a+b);

      var ox = 0, oy = 0;
      if (this.isWandering) {
         var t = time - this.wanderTime;
         ox =      noise2(t/2, 10);
         oy = .5 * noise2(t  , 20);
      }
      if (this.isExiting) {
         if (this.exitDx === undefined)
            this.exitDx = 2 * random() - 1;

         var t = time - this.exitTime;
         ox += .5 * t * t * this.exitDx;
         oy += .5 * t;
      }

      // WHEN BIRD DISAPPEARS FROM VIEW, GET RID OF IT.

      if (! this.isOnScreen())
         this.fade();

      var dx1 = .25, dy1 = 0;
      var dx2 = .25, dy2 = 0;

      var x0 = 0, y0 = -.05 * cos(phase);

      var x1 = x0 + (dx1 * ca + dy1 * sa);
      var y1 = y0 + (dx1 * sa - dy1 * ca);

      var x2 = x1 + (dx2 * cb + dy2 * sb);
      var y2 = y1 + (dx2 * sb - dy2 * cb);

      mCurve([ [ox-x0, oy+y0], [ox-x1, oy+y1] ]);
      mCurve([ [ox-x1, oy+y1], [ox-x2, oy+y2] ]);
      mCurve([ [ox+x0, oy+y0], [ox+x1, oy+y1] ]);
      mCurve([ [ox+x1, oy+y1], [ox+x2, oy+y2] ]);

      this.extendBounds([[ox-.5,oy-.26],[ox+.5,oy+.31]]);
   }
}

