function() {
   this.label = 'clock';
   this.render = () => {
      let S = t => 2*sign(t)*pow(abs(t)/2,.75);
      mCurve([[-1,-1],[-1,1],[1,1],[1,-1]]);
      mCurve([[1,-1],[-1,-1]]);
      this.afterSketch(() => {
         textHeight(this.mScale(0.2));
	 for (let n = 0 ; n < data.length ; n++)
	    for (let i = 0 ; i < data[n].length ; i++)
	       if (data[n][i])
                  mText(data[n][i],[.4*S(i-2),-1.9*S(n-2)/data.length],.5,.5);
         let seconds = floor(Date.now() / 1000) / 60;
         let minutes = seconds / 60;
         let hours   = minutes / 12 + 2/12;
	 mLine([0,0],[.4*sin(TAU * hours  ),.4*cos(TAU * hours  )]);
	 mLine([0,0],[.6*sin(TAU * minutes),.6*cos(TAU * minutes)]);
	 lineWidth(1);
	 mLine([0,0],[.7*sin(TAU * seconds),.7*cos(TAU * seconds)]);
      });
   }
   let data = [
      [ 0,11,12,1,0],
      [10, 0, 0,0,2],
      [ 9, 0, 0,0,3],
      [ 8, 0, 0,0,4],
      [ 0, 7, 6,5,0],
   ];
}

