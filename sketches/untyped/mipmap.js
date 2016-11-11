function() {
   this.label = 'mipmap';
   this.render = function() {
      for (var i = 0 ; i < 2 ; i++) {
         mClosedCurve([[-1,1],[1,1],[1,-1],[-1,-1]]);
         this.afterSketch(function() {
            lineWidth(pow(0.5, i-2));
            mCurve([[-.8,0],[-.4,.2],[0,-.2],[.4,.2],[.8,0]]);
            lineWidth(2);
         });
         m.translate(.5,-1.5,0);
         m.scale(.5,.5,1);
      }
      this.afterSketch(function() {
         for (var i = 2 ; i < 8 ; i++) {
            lineWidth(2);
            mClosedCurve([[-1,1],[1,1],[1,-1],[-1,-1]]);
            lineWidth(pow(0.5, i-2));
            mCurve([[-.8,0],[-.4,.2],[0,-.2],[.4,.2],[.8,0]]);
            m.translate(.5,-1.5,0);
            m.scale(.5,.5,1);
         }
      });
   }
}
