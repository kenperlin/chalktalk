function() {
   this.label = 'credits';
   this.render = function() {
   		this.duringSketch(function() {
      		mCurve([[1, 1], [-1, 1], [-1, -1], [1, -1]]);
		});

    	this.afterSketch(function() {
       		textHeight(this.mScale(1));
   	        //mText("Thanks to:\nProfessor Ken Perlin\nZhenyi He\n\nSpecial Thanks to Pat Sukhum\n",[0,0,0],.5,.5);
   	        mText("Special Thanks to Pat Sukhum\nMy collaborator, Zhenyi He\nMy advisor and the creator of Chalktalk, Professor Ken Perlin\nThanks to:\n",[0,0,0],.5,.5);
      	});
   }
}
