function() {
   this.label = 'etest';
   let time0 = time;

   this.render = () => {
      let t = time - time0, u = min(t, 1);
      let S = makeSpline([[ -1 , mix( .5, noise(t + 100.0), u), u * noise(t + 10)],
                          [-.33, mix(-.5, noise(t + 100.3), u), u * noise(t + 10.3)],
                          [ .33, mix( .5, noise(t + 100.6), u), u * noise(t + 10.6)],
                          [  1 , mix(-.5, noise(t + 100.9), u), u * noise(t + 10.9)]]);
      this.duringSketch(() => mCurve(S));
      this.afterSketch(() => armature.rope(6, 10, S, .1));
   }
}
