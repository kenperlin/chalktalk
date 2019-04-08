cubeTris = function() {
   let rotation = 0, isDiag = false, t = 0;

   let mCubeFace = xform => {
      var u  = isDiag ? t/4 : 0;
      var A  = [-1-u,-1-u, 1+t];
      var B0 = [ 1-u,-1-u, 1+t];
      var C0 = [-1-u, 1-u, 1+t];
      var B1 = [ 1+u,-1+u, 1+t];
      var C1 = [-1+u, 1+u, 1+t];
      var D  = [ 1+u, 1+u, 1+t];

      m.save();
         if (xform)
            xform();
         lineWidth(1);
         mLine(A, B0);
         mLine(A, C0);
         mLine(D, B1);
         mLine(D, C1);
         if (isDiag) {
            mLine(B0, C0);
            if (t > 0)
               mLine(B1, C1);
         }
      m.restore();
   }

   this.is3D = true;

   this.onMove = p => {
      rotation = p.x;
      isDiag = Math.abs(p.x) < .9;
      t = isDiag ? Math.max(0, Math.min(.5, 2 * p.y + .5)) : 0;
   }

   this.render = () => {
      this.duringSketch(() => {
         mCurve([[.3,0],[.3,.3],[-.3,.3],[-.3,-.3],[.3,-.3],[.3,0]]);
         mLine([-.3,.3],[.3,-.3]);
      });
      m.rotateY(rotation);
      m.scale(.3);
      this.afterSketch(() => {
         mCubeFace(() => m.rotateX( Math.PI  ));
         mCubeFace(() => m.rotateX(-Math.PI/2));
         mCubeFace(() => m.rotateY( Math.PI/2));
         mCubeFace();
         mCubeFace(() => m.rotateX( Math.PI/2));
         mCubeFace(() => m.rotateY(-Math.PI/2));
      });
   }
}
