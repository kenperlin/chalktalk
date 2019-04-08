
function() {
   this.onClick = () => tumble = true;
   let tumble = false, pos = [0,0,0], rot = 0;
   let curve1 = makeSpline([[-.1,.2],[.05,.05],[.4,-.05],[.45,-.2],[-.4,-.2],[-.46,-.1],[-.41,.1],[-.4,.2]]);
   let curve2 = makeSpline([[-.4,.2],[-.25,.25],[-.1,.2],[-.25,.15],[-.4,.2]]);
   this.label = 'shoe';
   this.render = elapsed => {
      if (tumble) {
         pos[0] += elapsed * .5;
         pos[1] += elapsed * .5;
	 rot += elapsed;
	 m.translate(pos);
	 m.rotateZ(rot);
      }
      mCurve(curve1);
      mCurve(curve2);
   }
}

