function() {
   this.label = 'vtext';
   this.is3D = true;
   this.onClick = [ 'reverse'    , () => spinAngle += PI ];
   this.onSwipe[0] = [ 'spin'    , () => spinAngle = (isSpin = ! isSpin) ? spinAngle : 0 ];
   this.onSwipe[4] = [ 'rot'     , () => isRot  = ! isRot ];
   this.onSwipe[6] = [ 'vertical', () => isVertical = ! isVertical ];
   this.render = elapsed => {
      this.duringSketch(() => {
          mCurve([ [-1,.2],[-.5,-.2],[-.5,.2],[0,-.2],[0,.2],[.5,-.2],[.5,.2],[1,-.2] ]);
       });
       this.afterSketch(() => {
          if (isSpin)
	     spinAngle += PI/2 * elapsed;
          m.rotateY(spinAngle);
	  if (isRot)
             m.rotateZ(-PI/2);
          textHeight(this.mScale(.15));
	  let words = message.split(' ');
	  if (isVertical) {
	     for (let n = 0 ; n < words.length ; n++)
	        mText(words[n], [0, .2 * ((words.length-1)/2 - n)], .5,.5);
          }
	  else
	     mText(message, [0,0], .5,.5);
	  this.extendBounds([[-1,-1],[1,1]]);
       });
   }
   let message = 'You and I both look at the same text';
   let isRot = false, spinAngle = 0, isSpin = false, isVertical = false;
}

