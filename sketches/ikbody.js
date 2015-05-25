function() {
   this.label = "ikbody";
   this.meshBounds = [ [-.75, .1] , [.75, 1.8] ];
   this.onSwipe = function(x,y) {
      switch (pieMenuIndex(x,y)) {
      case 0: this.ikBody.mode = min(4, this.ikBody.mode + 1); break;
      case 2: this.ikBody.mode = max(0, this.ikBody.mode - 1); break;
      case 3: this.ikBody.mode = 0; break;
      }
   }
   this.freeze = false;
   this.onClick = function(x,y) { this.freeze = ! this.freeze; }
   this.createMesh = function() {
      this.ikBody = new IKBody(ik_data);
      return this.ikBody.mesh;
   }
   this.render = function() {
      this.duringSketch(function() {
         mLine([-.67,1.33],[.67,1.33]);
         mCurve([[0,1.67],[0,1],[-.33,0]]);
         mLine([0,1],[.33,0]);
      });
      this.afterSketch(function() {
         this.ikBody.render(this.freeze ? this.ikBody.startTime + 1 : time);
      });
   }
}

