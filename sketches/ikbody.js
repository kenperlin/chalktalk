function() {
   this.label = "ikbody";
   this.meshBounds = [ [-.75, .1] , [.75, 1.8] ];

   this.swipe[0] = ['show\nmore', function() { this.ikBody.mode = min(4, this.ikBody.mode + 1); }];
   this.swipe[2] = ['turn\nwhite', function() {
      this.ikBody.nodeRadius = function() { return 0.025; };
      this.ikBody.linkRadius = function() { return 0.025; };
      this.ikBody.nodeMaterial = function() { return this.lineMaterial; };
      this.ikBody.linkMaterial = function() { return this.lineMaterial; };
      this.ikBody.rebuild();
   }];
   this.swipe[4] = ['show\nless', function() { this.ikBody.mode = max(0, this.ikBody.mode - 1); }];
   this.swipe[6] = ['show\nleast', function() { this.ikBody.mode = 0; }];

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

