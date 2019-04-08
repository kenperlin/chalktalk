function() {
   this.onClick = () => tumble = true;
   let tumble = false, pos = [0,0,0], rot = 0;
   let rProfile = [[0,1],[.2,1],[.2,.95],[.1,.95],[.1,.2],[.4,-.2],[.4,-.9],[.2,-1],[0,-1]];
   let lProfile = [];
   for (let n = 0 ; n < rProfile.length ; n++) {
      let p = rProfile[n];
      lProfile.unshift([-p[0],p[1]]);
   }
   this.label = 'bottle';
   this.render = elapsed => {
      if (tumble) {
         pos[0] -= elapsed;
         pos[1] += elapsed;
	 rot += elapsed;
	 m.translate(pos);
	 m.rotateZ(rot);
      }
      mCurve(rProfile);
      mCurve(lProfile);
   }
}

