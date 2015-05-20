function() {
   function IkbodyResponder() {
      this.isAdjustable = function(i) { return i >= 9; }
      this.simulate = function() {
         var graph = this.graph;
         var ikBody = graph.ikBody;
         for (var j = 0 ; j < 9 ; j++)
	    graph.nodes[j].p.copy(ikBody.getP(j));
      }
   }
   IkbodyResponder.prototype = new GraphResponder;

   this.label = "ikbody";
   this.ikBody = new IKBody(ik_data);

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

         var links = this.graph.links;
         for (var j = 0 ; j < links.length ; j++)
	    if (links[j].w == 1)
               this.renderLink(links[j]);
      });
   }

   var tmp = newVec3();

   this.renderNode = function(node, j) {
      if (node.g === undefined) {
         node.g = this.graph.newNodeMesh(whiteMaterial, 0.03);
         this.mesh.add(node.g);
      }
      switch (j) {
      case IK.NECK:
         node.p.y -= 0.12;
	 break;
      case IK.SHOULDER_L:
      case IK.SHOULDER_R:
         node.p.y += 0.07;
	 break;
      case IK.KNEE_L:
         tmp.set(-.02,0,.03).applyQuaternion(this.ikBody.getQ(IK.ANKLE_L));
	 node.p.add(tmp);
         break;
      case IK.KNEE_R:
         tmp.set( .02,0,.03).applyQuaternion(this.ikBody.getQ(IK.ANKLE_R));
	 node.p.add(tmp);
	 break;
      }
      node.g.position.copy(node.p);
   }

   this.renderLink = function(link) {
      if (link.g === undefined)
         this.mesh.add(link.g = this.graph.newLinkMesh(whiteMaterial, 0.03 * link.w));
      link.g.placeStick(this.graph.nodes[link.i].p, this.graph.nodes[link.j].p);
   }
}

