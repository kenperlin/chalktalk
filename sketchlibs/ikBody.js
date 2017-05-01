"use strict";

// VISUALIZE AN IK BODY

(function() {
   var p = 'ANKLE_L ANKLE_R WRIST_R WRIST_L NECK KNEE_L KNEE_R ELBOW_R ELBOW_L CHEST HIP_L HIP_R SHOULDER_R SHOULDER_L BELLY WAIST PELVIS'.split(' ');
   window.IK = {};
   for (var i = 0 ; i < p.length ; i++)
      IK[p[i]] = i;
})();

var _ikBody_count_ = 0;

function IKBody(ik_data) {
   this.id = _ikBody_count_++;

   this.lineMaterial   = phongMaterial().setAmbient(.7,.7,.7).setDiffuse(.3,.3,.3);
   this.shoesMaterial  = phongMaterial().setAmbient(.5,.5,.5).setDiffuse(.5,.5,.5);
   this.jointMaterial  = phongMaterial().setAmbient(.4,.3,.2).setDiffuse(.4,.3,.2).setSpecular(.2,.2,.2,5);
   this.tendonMaterial = phongMaterial().setAmbient(0,.4,.5).setDiffuse(0,.4,.5);
   this.limbMaterial   = phongMaterial().setAmbient(.4,.0,.0).setDiffuse(.4,.0,.0).setSpecular(.3,.3,.3,7);

   this.loadData(ik_data);
   this.modelBody();
   this.blinkTime = time;
   this.frame = 0;
   this.mode = 3;
   this.nodeData = this.computeNodeData();
   this.startTime = 0;
}

var _IKBodyGraph_count_ = 0;

IKBody.prototype = {

   loadData : function(ik_data) {

      // CHANGE DATA INTO A MORE CONVENIENT FORM.

      this.data = [];
      for (var frame = 0 ; frame < ik_data.length ; frame++) {
         this.data.push([]);
         for (var j = 0 ; j < 5 ; j++) {
            var src = ik_data[frame];
	    this.data[frame].push({
	       q: new THREE.Quaternion(src[7*j+2], src[7*j+3], src[7*j+4], src[7*j+5]),
	       p: new THREE.Vector3   (src[7*j+6], src[7*j+7], src[7*j+8]),
            });
         }

         for (var j = 5 ; j < 9 ; j++) {
            var src = ik_data[frame];
	    this.data[frame].push({
	       q: new THREE.Quaternion(),
	       p: new THREE.Vector3   (),
            });
         }
      }

      // THIS SECTION IS HERE IN CASE JOINT ORDER EVER CHANGES IN THE IK_DATA FILE FORMAT.
      // IT LETS US CREATE A FILE OF IK_DATA COMPATIBLE WITH THE NEW JOINT ORDER.

      if (false) {
	 this._d2s = function(j, frame) {
	    var p = this.data[frame][j].p;
	    var q = this.data[frame][j].q;
	    return q.x + ',' + q.y + ',' + q.z + ',' + q.w + ',' + p.x + ',' + p.y + ',' + p.z + ',';
	 }
         for (var frame = 0 ; frame < ik_data.length ; frame++)
	    console.log( '[' + ik_data[frame][0] + ',' +
	                       ik_data[frame][1] + ',' +
		               this._d2s(IK.ANKLE_L, frame) +
		               this._d2s(IK.ANKLE_R, frame) +
		               this._d2s(IK.WRIST_R, frame) +
		               this._d2s(IK.WRIST_L, frame) +
		               this._d2s(IK.NECK   , frame) +
		         '],');
      }

      // REPLACE ANY MISSING VALUES BY VALUE FROM THE NEXT VALID FRAME.

      for (var frame = ik_data.length - 1 ; frame > 0 ; frame--) {
         for (var j = 0 ; j < 5 ; j++) {
	    if (this.getP(j, frame).lengthSq() == 0)
	       for (var f = frame + 1 ; f < ik_data.length ; f++)
	          if (this.getP(j, f).lengthSq() != 0) {
	             this.getP(j, frame).copy(this.getP(j, f));
	             break;
                  }

	    if (this.getQ(j, frame).w == 1)
	       for (var f = frame + 1 ; f < ik_data.length ; f++)
	          if (this.getQ(j, f).w != 1) {
	             this.getQ(j, frame).copy(this.getQ(j, f));
	             break;
                  }
         }
      }

      // ADJUST ORIENTATIONS TO STANDARD BODY POSE.

      var tmp = new THREE.Quaternion();

      var qAR = (new THREE.Quaternion()).copy(this.getQ(IK.ANKLE_R, 120)).inverse();
      var qAL = (new THREE.Quaternion()).copy(this.getQ(IK.ANKLE_L, 120)).inverse();

      var qWL = (new THREE.Quaternion()).copy(this.getQ(IK.WRIST_L, 120)).inverse().multiply(tmp.set(0,-.15,0,1).normalize());
      var qWR = (new THREE.Quaternion()).copy(this.getQ(IK.WRIST_R, 120)).inverse().multiply(tmp.set(0, .05,0,1).normalize());

      for (var frame = 0 ; frame < ik_data.length ; frame++) {
         this.getQ(IK.ANKLE_R, frame).multiply(qAR);
         this.getQ(IK.ANKLE_L, frame).multiply(qAL);
         this.getQ(IK.WRIST_L, frame).multiply(qWL);
         this.getQ(IK.WRIST_R, frame).multiply(qWR);
      }

      for (var frame = 0 ; frame < ik_data.length ; frame++)
         this.getP(IK.NECK, frame).offset(0, -.1, -.1, this.getQ(IK.NECK, frame));
   },

   computeNodeData : function() {

      function relVec(id, x, y, z) { return newVec3().copy(nodeP[id]).offset(x, y, z); }

      var nodeP = [];
      nodeP[IK.NECK      ] = newVec3().copy(this.getP(IK.NECK, 120));

      nodeP[IK.CHEST     ] = relVec(IK.NECK      , 0   ,  0   , 0);
      nodeP[IK.BELLY     ] = relVec(IK.CHEST     , 0   , -0.13, 0);
      nodeP[IK.WAIST     ] = relVec(IK.BELLY     , 0   , -0.13, 0);
      nodeP[IK.PELVIS    ] = relVec(IK.WAIST     , 0   , -0.13, 0);

      nodeP[IK.HIP_R     ] = relVec(IK.PELVIS    ,-0.1 ,  0   , 0);
      nodeP[IK.KNEE_R    ] = relVec(IK.HIP_R     , 0   , -0.36, 0);
      nodeP[IK.ANKLE_R   ] = relVec(IK.KNEE_R    , 0   , -0.34, 0);

      nodeP[IK.HIP_L     ] = relVec(IK.PELVIS    , 0.1 ,  0   , 0);
      nodeP[IK.KNEE_L    ] = relVec(IK.HIP_L     , 0   , -0.36, 0);
      nodeP[IK.ANKLE_L   ] = relVec(IK.KNEE_L    , 0   , -0.34, 0);

      nodeP[IK.SHOULDER_R] = relVec(IK.CHEST     ,-0.16,  0   , 0);
      nodeP[IK.ELBOW_R   ] = relVec(IK.SHOULDER_R,-0.22,  0   , 0);
      nodeP[IK.WRIST_R   ] = relVec(IK.ELBOW_R   ,-0.20,  0   , 0);

      nodeP[IK.SHOULDER_L] = relVec(IK.CHEST     , 0.16,  0   , 0);
      nodeP[IK.ELBOW_L   ] = relVec(IK.SHOULDER_L, 0.22,  0   , 0);
      nodeP[IK.WRIST_L   ] = relVec(IK.ELBOW_L   , 0.20,  0   , 0);

      return nodeP;
   },

   getLinkData : function() {
      return [
	 [IK.BELLY     , IK.SHOULDER_L, 0.3],
	 [IK.BELLY     , IK.SHOULDER_R, 0.3],
         [IK.SHOULDER_L, IK.SHOULDER_R     ],
	 [IK.NECK      , IK.SHOULDER_R, 0.2],
	 [IK.NECK      , IK.SHOULDER_L, 0.2],
	 [IK.CHEST  , IK.NECK   , .9],

	 [IK.HIP_L  , IK.PELVIS ],
	 [IK.HIP_R  , IK.PELVIS ],
	 [IK.HIP_L  , IK.HIP_R  ],
	 [IK.PELVIS , IK.WAIST  ],
	 [IK.WAIST  , IK.BELLY  ],
	 [IK.BELLY  , IK.CHEST  ],
	 [IK.CHEST  , IK.SHOULDER_L],
	 [IK.CHEST  , IK.SHOULDER_R],

         [IK.ANKLE_L, IK.KNEE_L ], [IK.KNEE_L , IK.HIP_L     ],
         [IK.ANKLE_R, IK.KNEE_R ], [IK.KNEE_R , IK.HIP_R     ],
         [IK.WRIST_L, IK.ELBOW_L], [IK.ELBOW_L, IK.SHOULDER_L],
         [IK.WRIST_R, IK.ELBOW_R], [IK.ELBOW_R, IK.SHOULDER_R],

	 [IK.HIP_L     , IK.SHOULDER_L, .2 ],
	 [IK.HIP_R     , IK.SHOULDER_R, .2 ],
	 [IK.HIP_L     , IK.SHOULDER_R, 0.2],
	 [IK.HIP_R     , IK.SHOULDER_L, 0.2],
      ];
   },

   modelBody : function() {

      this.body = new THREE.Mesh();

      this.skinMaterial = new phongMaterial().setAmbient(.4,.3,.2).setDiffuse(.4,.3,.2);
      this.eyeMaterial = new phongMaterial().setAmbient(0,0,.5);

      for (var j = 0 ; j < 5 ; j++) {

	 switch (j) {

	 case IK.NECK:

            var head = new THREE.Mesh(globeGeometry(16,16), this.skinMaterial);
	    head.position.set(0,.2,0);
	    head.scale.set(.1,.12,.1);

            var nose = new THREE.Mesh(globeGeometry(), this.skinMaterial);
	    nose.position.set(0,0,1);
	    nose.scale.set(.3,.25,.4);
	    head.add(nose);

	    var eyes = new THREE.Mesh();
	    eyes.rotation.x = -0.5;
	    head.add(eyes);

            for (var i = 0 ; i < 2 ; i++) {
	       var eye = new THREE.Mesh(globeGeometry(), this.eyeMaterial);
	       eyes.add(eye);
	       eye.position.set(i==0 ? -.4 : .4, 0, .9);
	       eye.rotation.y = i==0 ? -.5 : .5;
	       eye.rotation.z = i==0 ? -.2 : .2;
	       eye.scale.set(.3,.2,.1);
            }
	    this.neckShape = new THREE.Mesh(cylinderGeometry(), this.linkMaterial());
	    this.neckShape.position.set(0, -.12/.12, 0);
	    this.neckShape.scale.set(0.2, .8, 0.2);
	    head.add(this.neckShape);

            var neck = new THREE.Mesh();
	    neck.add(head);

            this.body.add(neck);
	    break;

	 case IK.ANKLE_R:
	 case IK.ANKLE_L:

            var foot = new THREE.Mesh(globeGeometry(16,5,0,TAU,-PI/2,PI), this.shoesMaterial);
	    foot.position.set(0,-.1,.1);
	    foot.scale.set(.06,.06,.14);

            var sole = new THREE.Mesh(globeGeometry(16,5,0,TAU,0,PI), this.shoesMaterial);
	    sole.position.set(0,-.1,.1);
	    sole.scale.set(.06,.01,.14);

	    var joint = new THREE.Mesh(new THREE.CylinderGeometry(.4, 1, 2, 8, 4), this.shoesMaterial);
	    joint.radialSegments = 8;
	    joint.position.set(0,-.05,0);
	    joint.scale.set(.042,.05,.05);

            var ankle = new THREE.Mesh();
	    ankle.add(joint);
	    ankle.add(foot);
	    ankle.add(sole);

            this.body.add(ankle);
	    break;

	 case IK.WRIST_R:
	 case IK.WRIST_L:

	    var sign = j == IK.WRIST_R ? -1 : 1;

            var hand = new THREE.Mesh(globeGeometry(16,8), this.skinMaterial);
	    hand.position.set(sign * .11, 0, 0);
	    hand.scale.set(.11,.025,.05);

            var thumb = new THREE.Mesh(globeGeometry(16,8), this.skinMaterial);
	    thumb.position.set(sign * .08, -.02, .05);
	    thumb.rotation.y = j==3 ? -.5 : .5;
	    thumb.rotation.z = j==3 ? -.4 : .4;
	    thumb.scale.set(.053,.018,.018);

            var wrist = new THREE.Mesh();
	    wrist.add(hand);
	    wrist.add(thumb);

            this.body.add(wrist);
	    break;
         }
      }
      this.mesh = new THREE.Mesh();
   },

   blink   : function(isBlinking) {
      var neck = this.body.children[IK.NECK].children[0].children[1];
      for (var e = 0 ; e < 2 ; e++)
         neck.children[e].scale.y = isBlinking ? 0 : .2;
      return isBlinking;
   },

   getP    : function(j, frame) { return this.data[def(frame,this.frame)][j].p; },
   getQ    : function(j, frame) { return this.data[def(frame,this.frame)][j].q; },
   getFrame: function(time)     { return floor(120 * time + this.data.length) % this.data.length; },

   render  : function(time) {
      if (this.graph === undefined) {

         function IKBodyResponder() {
	    
            this.isAdjustable = function(j) { return j >= 9; }
            this.simulate = function() {
               for (var j = 0 ; j < 9 ; j++)
                  this.graph.nodes[j].p.copy(this.ikBody.getP(j));

               // FORCE KNEES TO BEND FORWARD, RATHER THAN BACKWARD.

               this.graph.nodes[IK.HIP_L ].p.offset( .1, 0, 0, this.ikBody.getQ(IK.NECK));
               this.graph.nodes[IK.HIP_R ].p.offset(-.1, 0, 0, this.ikBody.getQ(IK.NECK));

               this.graph.nodes[IK.KNEE_L].p.offset( 0, 0, .02, this.ikBody.getQ(IK.ANKLE_L));
               this.graph.nodes[IK.KNEE_R].p.offset( 0, 0, .02, this.ikBody.getQ(IK.ANKLE_R));

               // FORCE SPINE TO CURVE BACKWARD, RATHER THAN FORWARD.

               this.graph.nodes[IK.PELVIS].p.offset( 0, .1, -.1, this.ikBody.getQ(IK.NECK));
               this.graph.nodes[IK.WAIST ].p.offset( 0, 0, -.07, this.ikBody.getQ(IK.NECK));
               this.graph.nodes[IK.BELLY ].p.offset( 0, 0, -.05, this.ikBody.getQ(IK.NECK));
            }
         }
         IKBodyResponder.prototype = new GraphResponder;

         this.graph = new VisibleGraph();

         this.responder = new IKBodyResponder();
	 this.responder.ikBody = this;
         this.graph.setResponder(this.responder);

         for (var i = 0 ; i < this.nodeData.length ; i++) {
            var p = this.nodeData[i];
            this.graph.addNode(p.x, p.y, p.z);
         }

         var linkData = this.getLinkData();
         for (var i = 0 ; i < linkData.length ; i++) {
            var ij = linkData[i];
            this.graph.addLink(ij[0], ij[1], ij[2]);
         }

	 this.startTime = time;
      }

      this.graph.update();

      this.frame = this.getFrame(time - this.startTime);

      for (var j = 0 ; j < 5 ; j++) {
         var joint = this.body.children[j];
         joint.quaternion.copy(this.getQ(j));
         joint.position  .copy(this.getP(j));
      }

      this._computeJoint = function(a, b) {
         this.getP(a).copy(this.nodeData[a]).sub(this.nodeData[b])
                                            .applyQuaternion(this.getQ(b))
	                                    .add(this.getP(b));
      }
      this._computeJoint(IK.KNEE_R , IK.ANKLE_R);
      this._computeJoint(IK.KNEE_L , IK.ANKLE_L);
      this._computeJoint(IK.ELBOW_L, IK.WRIST_L);
      this._computeJoint(IK.ELBOW_R, IK.WRIST_R);

      if (time > this.blinkTime)
         if (! this.blink(time < this.blinkTime + 0.1))
            this.blinkTime = time + 1 + 5 * random();

      var isAddingBodyToMesh = this.mesh.children.length == 0;

      if (isAddingBodyToMesh)
         this.mesh.add(this.body);

      for (var j = 0 ; j < this.graph.nodes.length ; j++)
         this.renderNode(this.graph.nodes[j], j);

      for (var j = 0 ; j < this.graph.links.length ; j++)
         this.renderLink(this.graph.links[j], j);

      for (var j = 0 ; j < 5 ; j++)
         this.body.children[j].position.copy(this.graph.nodes[j].p);

      this.body.children[IK.NECK].position.copy(this.graph.nodes[IK.CHEST].p);

      if (false) {
         if (isAddingBodyToMesh)
            console.log(this.mesh.toXML());

         var s = '<Update frame="' + this.frame + '">\n';
         s += this.mesh.matricesToXML();
         s += '</Update>\n';
	 console.log(s);
      }
   },

   rebuild : function() {
      var nodes = this.graph.nodes;
      for (var i = 0 ; i < nodes.length ; i++) {
         this.mesh.remove(nodes[i].g);
         nodes[i].g = undefined;
      }
      var links = this.graph.links;
      for (var i = 0 ; i < links.length ; i++) {
         this.mesh.remove(links[i].g);
         links[i].g = undefined;
      }
      this.neckShape.setMaterial(this.linkMaterial());
   },

   nodeRadius : function() { return 0.04; },
   linkRadius : function() { return 0.02; },

   nodeMaterial : function() { return this.jointMaterial; },
   linkMaterial : function() { return this.limbMaterial; },

   renderNode : function(node, j) {
      if (j === IK.NECK)
         return;

      var r = this.nodeRadius();
      var r2 = r * 0.75;
      var isSmallJoint = r > 0.025 && (j == IK.BELLY || j == IK.WAIST);
      if (isSmallJoint)
         r *= 0.75;
      if (node.g === undefined) {
         node.g = this.graph.newNodeMesh(this.jointMaterial, r);
         this.mesh.add(node.g);
      }
      var s = this.mode >= 3 ? r : this.mode == 2 ? r2 : this.mode == 1 ? j<=9 ? r2 : 0 : j <= 4 ? r2 : 0;
      node.g.scale.set(s,s,s);
      node.g.setMaterial(this.mode < 3 ? this.linkMaterial() : this.nodeMaterial());
      node.g.position.copy(node.p);
   },

   renderLink : function(link, j) {
      if (j < 6 || j == 8)
         return;

      var r = this.linkRadius();
      if (link.g === undefined) {
         var r = link.w * r * (link.w == 1 ? 1 : .5);
         link.g = this.graph.newLinkMesh(link.w < 1 ? this.tendonMaterial : this.linkMaterial(), r);
         this.mesh.add(link.g);
      }
      var s = this.mode == 4 ? 1 : this.mode == 3 ? link.w == 1 || link.w > .2 && link.w < .9 ? 1 : 0 : 0;
      link.g.scale.set(s,s,s);
      link.g.placeStick(this.graph.nodes[link.i].p, this.graph.nodes[link.j].p);
   },
};

