function() {
   this.label = "ikbody";
   this.meshBounds = [ [-.75, .1] , [.75, 1.8] ];

   this.onClick = ['show\nmore', function() { this.ikBody.mode = (this.ikBody.mode + 1) % 5; }];
   this.onSwipe[2] = ['turn\nwhite', function() {
      this.ikBody.nodeRadius = function() { return 0.025; };
      this.ikBody.linkRadius = function() { return 0.025; };
      this.ikBody.nodeMaterial = function() { return this.lineMaterial; };
      this.ikBody.linkMaterial = function() { return this.lineMaterial; };
      this.ikBody.rebuild();
   }];
   this.onCmdClick = ['freeze', function() { this.freezeTime = this.freezeTime ? undefined : time; }];
   this.createMesh = function() {
      this.ikBody = new IKBody(ik_data);
      this.ikBody.mode = 0;
      return this.ikBody.mesh;
   }
   this.render = function() {
      this.duringSketch(function() {
         mLine([-.67,1.33],[.67,1.33]);
         mCurve([[0,1.67],[0,1],[-.33,0]]);
         mLine([0,1],[.33,0]);
      });
      this.afterSketch(function() {
         this.ikBody.render(def(this.freezeTime, time));
      });
   }
}

