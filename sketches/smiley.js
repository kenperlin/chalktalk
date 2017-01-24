function() {
   this.label = 'smiley';
   this.onSwipe[6] = ['wink', function() { this.isWink = ! this.isWink; }];
   this.render = function() {
      mDrawOval([-1,-1],[1,1],32,PI/2,PI/2-TAU);
      mDrawOval([-.6,-.6],[.6,.6],32,TAU*6/10,TAU*9/10);
      this.afterSketch(function() {
         mDrawOval([-.2,-.2],[.8,.5],32,PI*.5,PI*.2);
         mDrawOval([ .5,.2],[ .3,.4],32,-PI,0);
         if (this.isWink)
            mDrawOval([-1,.2],[.3,.9],32,-PI*.6,-PI*.4);
         else {
            mDrawOval([-.8,-.2],[.2,.5],32,PI*.8,PI*.5);
            mDrawOval([-.5,.2],[-.3,.4],32,-PI,0);
         }
      });
   }
}

