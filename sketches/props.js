props = function() {
   this.noRotate = true;
   let props = new Props(this), x = 1.05, y = 0.25;
   this.catchSketch = sk => { props.newMix(sk.text); sk.fade(); }
   this.onPress = p => props.onPress(p);
   this.onDrag = p => props.onDrag(p);
   this.onLeave = p => props.onRelease(p);
   this.onRelease = p => props.onRelease(p);
   this.onCmdPress = p => props.onCmdPress(p);
   this.onCmdClick = p => props.onCmdClick(p);
   for (let dir = 0 ; dir < 8 ; dir++)
      this.onCmdSwipe[dir] = props.onCmdSwipe[dir];
   this.draw = () => mCurves([[[-x,x],[x,x],[x,x-y]],[[x,x-y],[-x,x-y],[-x,x]]]);
   this.update = () => props.render(this.outSketch(0));
}

