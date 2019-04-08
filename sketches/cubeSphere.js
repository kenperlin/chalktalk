cubeSphere = function() {
   let red = '#ff0000', green = '#00e000', blue = '#0000ff', rotation = 0, inflation = 0;

   function inflate(p) {
      var r = Math.sqrt((p[0]*p[0] + p[1]*p[1] + p[2]*p[2]) / 3);
      return [mix(p[0], p[0] / r, inflation),
              mix(p[1], p[1] / r, inflation),
              mix(p[2], p[2] / r, inflation)];
   }

   function mMeshFace(c, func) {
      color(c);
      m.save();
      if (func)
         func();
      for (var u = -1 ; u <= 1 ; u += .5)
      for (var v = -1 ; v <= 1 ; v += .5) {
         if (u < 1) mLine(inflate([u,v,1]), inflate([u+.5,v,1]));
         if (v < 1) mLine(inflate([u,v,1]), inflate([u,v+.5,1]));
      }
      m.restore();
   }

   this.is3D = true;

   this.onMove = p => {
      rotation = -p.x;
      inflation = sCurve(Math.max(0, Math.min(1, (p.y+.5))));
   }

   this.render = function() {
      this.duringSketch(() => {
         let r = .33;
         mCurve([[r,0],[r,r],[-r,r],[-r,-r],[r,-r],[r,0]]);
	 r *= 1.414;
         mDrawOval([-r,-r],[r,r],32);
      });
      this.afterSketch(() => {
         m.rotateY(-rotation);
	 m.scale(.4);

         lineWidth(0.5);
         mMeshFace(red  , () => m.rotateX(-Math.PI  ));
         mMeshFace(green, () => m.rotateX( Math.PI/2));
         mMeshFace(blue , () => m.rotateY(-Math.PI/2));

         lineWidth(3.0);
         color(defaultPenColor);
         mArrow([0,0,0], inflate([-1,0,0]));
         mArrow([0,0,0], inflate([-1,1,0]));

         lineWidth(1.0);
         mMeshFace(red);
         mMeshFace(green, () => m.rotateX(-Math.PI/2));
         mMeshFace(blue , () => m.rotateY( Math.PI/2));
      });
   }
}
