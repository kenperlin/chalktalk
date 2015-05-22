function() {
   var jointMaterial  = phongMaterial().setAmbient(.4,.3,.2).setDiffuse(.4,.3,.2).setSpecular(.2,.2,.2,5);
   var tendonMaterial = phongMaterial().setAmbient(0,.4,.5).setDiffuse(0,.4,.5);
   var boneMaterial   = phongMaterial().setAmbient(.4,.0,.0).setDiffuse(.4,.0,.0).setSpecular(.3,.3,.3,7);

   function adjust(p, x, y, z, q) {
      tmp.set(x,y,z).applyQuaternion(q);
      p.add(tmp);
   }

   function IkbodyResponder() {
      var tmp = newVec3();
      this.isAdjustable = function(i) { return i >= 9; }
      this.simulate = function() {

         var graph = this.graph;
         var ikBody = graph.ikBody;
         for (var j = 0 ; j < 9 ; j++) {
	    var p = graph.nodes[j].p;
	    p.copy(ikBody.getP(j));
            switch (j) {
            case IK.KNEE_L    : adjust(p,-.025,0   ,.03, ikBody.getQ(IK.ANKLE_L)); break;
            case IK.KNEE_R    : adjust(p, .025,0.02,.03, ikBody.getQ(IK.ANKLE_R)); break;
            case IK.ANKLE_L   : adjust(p,  0,-.05,0, ikBody.getQ(IK.ANKLE_L)); break;
            }
         }
      }
   }
   IkbodyResponder.prototype = new GraphResponder;

   this.label = "ikbody";
   this.meshBounds = [ [-.75, .1] , [.75, 1.8] ];
   this.ikBody = new IKBody(ik_data);
   this.mode = 2;
   this.onSwipe = function(x,y) {
      switch (pieMenuIndex(x,y)) {
      case 0: this.mode = min(3, this.mode + 1); break;
      case 2: this.mode = max(0, this.mode - 1); break;
      }
   }
   this.createMesh = function() {
      var ikb = this.ikBody.mesh;
      return ikb;
   }
   this.render = function() {
      this.code = [];
      this.duringSketch(function() {
         m.translate(0,1,0);
         m.scale(.67,.67,.67);
         mLine([-1,.5],[1,.5]);
         mCurve([[0,1],[0,0],[-.5,-1]]);
         mLine([0,0],[.5,-1]);
      });
      this.afterSketch(function() {
         if (this.graph === undefined) {
            this.graph = new VisibleGraph();
            this.graph.setResponder(new IkbodyResponder());
            this.graph.ikBody = this.ikBody;

            var nodeData = this.ikBody.getNodeData();
            for (var i = 0 ; i < nodeData.length ; i++) {
	       var p = nodeData[i];
	       this.graph.addNode(p.x, p.y, p.z);
            }

            var linkData = this.ikBody.getLinkData();
            for (var i = 0 ; i < linkData.length ; i++) {
	       var ij = linkData[i];
	       this.graph.addLink(ij[0], ij[1], ij[2]);
            }
         }
	 this.graph.update();
         this.ikBody.render(time);

         var nodes = this.graph.nodes;
         for (var j = 0 ; j < nodes.length ; j++) {
            var node = nodes[j];
            this.renderNode(node, j);
         }

	 //nodes[IK.NECK].p.copy(nodes[IK.CHEST].p);
	 //adjust(nodes[IK.NECK].p, 0,.1,0, this.ikBody.getQ(IK.NECK));

         var links = this.graph.links;
         for (var j = 0 ; j < links.length ; j++)
            this.renderLink(links[j]);

	 for (var j = 0 ; j < 5 ; j++)
	    this.ikBody.body.children[j].position.copy(this.graph.nodes[j].p);
      });
   }

   var tmp = newVec3();

   this.renderNode = function(node, j) {
      if (node.g === undefined) {
         node.g = this.graph.newNodeMesh(jointMaterial, 0.04);
         this.mesh.add(node.g);
      }
      var s = this.mode >= 1 ? 0.04 : 0;
      node.g.scale.set(s,s,s);
      node.g.setMaterial(this.mode < 2 ? boneMaterial : jointMaterial);

      switch (j) {
      case IK.CHEST     : adjust(node.p, 0,.00,0.01, this.ikBody.getQ(IK.NECK)); break;
      case IK.SHOULDER_L: adjust(node.p, 0,.04,0.01, this.ikBody.getQ(IK.NECK)); break;
      case IK.SHOULDER_R: adjust(node.p, 0,.04,0.01, this.ikBody.getQ(IK.NECK)); break;
      }

      node.g.position.copy(node.p);
   }

   this.renderLink = function(link) {
      if (link.g === undefined) {
         var r = link.w * (link.w == 1 ? .02 : .01);
         this.mesh.add(link.g = this.graph.newLinkMesh(link.w < 1 ? tendonMaterial : boneMaterial, r));
      }
      var s = this.mode == 3 ? 1 : this.mode == 2 ? link.w == 1 || link.w > .2 && link.w < .9 ? 1 : 0 : 0;
      link.g.scale.set(s,s,s);
      link.g.placeStick(this.graph.nodes[link.i].p, this.graph.nodes[link.j].p);
   }
}

