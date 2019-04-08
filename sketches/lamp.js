function() {
   this.label = 'lamp';
   this.render = () => {
      this.duringSketch(() => {
         mCurve([[.3,1.2],[.2,1.5],[-.2,1.5],[-.3,1.2]]);
         mLine([0,1.2],[0,0]);
      });
      this.afterSketch(() => {
         if (! skinned) {
	    skinned = new Skinned();
	    skinned.init(blobs, [iota(blobs.length)]);
	 }
	 m.rotateX(PI/12);
	 skinned.setColor(scale(CT.getRGB('clay'),2));
	 let obj = skinned.render();
	 obj.setSpecular(0);
         m.save();
	    m.rotateX(PI/2);
	    mShadow({x:0, y:0, size:1});
         m.restore();
      });
   }
   let skinned;
   let blobs = [
      [0, .03,0, 0,0,0, .09 ,.02,.09 ],
      [0, .08,0, 0,0,0, .05 ,.03,.05 ],
      [0, .33,0, 0,0,0, .015,.2 ,.015],
      [0, .68,0, 0,0,0, .015,.2 ,.015],
      [0,1.03,0, 0,0,0, .015,.2 ,.015],

      [0,1.53      ,0, 0,0,0, .10,.03,.10],
      [0,1.53-.06  ,0, 0,0,0, .12,.04,.12],
      [0,1.53-.06*2,0, 0,0,0, .14,.04,.14],
      [0,1.53-.06*3,0, 0,0,0, .16,.04,.16],
      [0,1.53-.06*4,0, 0,0,0, .18,.03,.18],
   ];
}

