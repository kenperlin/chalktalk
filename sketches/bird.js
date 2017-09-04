function() {
   this.label = "bird";
   this.is3D = true;
   this.bird = new Bird();

   this.onSwipe[0] = ['walk'        , function() { this.bird.turnOnWalk(); }];
   this.onSwipe[1] = ['toggle\ngaze', function() { this.bird.toggleGaze(); }];
   this.onSwipe[2] = ['toggle\ngaze', function() { this.bird.toggleGaze(); }];
   this.onSwipe[4] = ['come\nalive' , function() { this.bird.turnOnIdle(); }];

   this.render = function(elapsed) {
      this.bird.legLength  = this.stretch('leg length' , S(2).height / 0.2 );
      this.bird.bodyLength = this.stretch('body length', S(1).height / 0.15);
      this.bird.headWidth  = this.stretch('head width' , S(0).width  / 0.15);
      this.bird.headHeight = this.stretch('head height', S(0).height / 0.1 );
      if (this.cx())
         this.bird.lookUp  = -atan2(sketchPage.y - this.cy(), max(0,sketchPage.x - this.cx()));

      this.bird.update(elapsed);

      if (! this.isOnScreen())
         this.fade();
   }
}
