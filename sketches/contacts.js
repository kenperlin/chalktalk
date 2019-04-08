function() {
   this.label = 'contacts';
   this.render = function() {
      mDrawOval([-1,-.4],[1,.4],30,0,PI);
      mDrawOval([-1,-.4],[1,.4],30,PI,TAU);
      this.afterSketch(() => mDrawOval([-1,-.6],[1,.6],30,PI,TAU));
   }
}
