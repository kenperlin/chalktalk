function() {
   this.label = "ikbody";
   this.ikBody = new IKBody(ik_data);

   this.createMesh = function() {
      return this.ikBody.mesh;
   }
   this.render = function() {
      this.code = [];
      this.duringSketch(function() {
         mLine([-1,.5],[1,.5]);
         mCurve([[0,1],[0,0],[-.5,-1]]);
         mLine([0,0],[.5,-1]);
      });
      this.afterSketch(function() {
         var ikb = this.ikBody;
         ikb.render(time);

// DIAGNOSTIC OUTPUT OF VARIATIONS IN HAND ORIENTATION:

	 function val(f) {
	    f = max(0,min(ikb.nFrames() - 1, f));
	    return abs(ikb.getQ(f, 3).w);
         }

	 var frame = ikb.getFrame(time);
         var sum = 0, count = 0;
	 for (var f = frame - 10 ; f <= frame + 10 ; f++) {
	    sum += val(f);
	    count++;
	 }
	 var diff = val(frame) - sum / count;

	 this.setOutPortValue(diff);

//////////////////////////////////////////////////////
      });
   }
}
