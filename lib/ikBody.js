
// VISUALIZE AN IK BODY

(function() {
   var p = 'NECK ANKLE_R ANKLE_L WRIST_L WRIST_R KNEE_R KNEE_L ELBOW_L ELBOW_R BELLY_R BELLY_L HIP_R HIP_L SHOULDER_R SHOULDER_L CHEST'.split(' ');
   window.IK = {};
   for (var i = 0 ; i < p.length ; i++)
      IK[p[i]] = i;
   IK.NPARTS = p.length;
})();

function IKBody(ik_data) {
   this.loadData(ik_data);
   this.modelBody();
   this.blinkTime = time;
   this.frame = 0;
   this.nodeData = this.computeNodeData();
}

IKBody.prototype = {

   loadData : function(ik_data) {

      // CHANGE DATA INTO A MORE CONVENIENT FORM.

      this.data = [];
      for (var frame = 0 ; frame < ik_data.length ; frame++) {
         this.data.push([]);
         for (var j = 0 ; j < 5 ; j++) {
            var src = ik_data[frame];
	    this.data[frame].push({
	       q: new THREE.Quaternion(src[8*j+2], src[8*j+3], src[8*j+4], src[8*j+5]),
	       p: new THREE.Vector3   (src[8*j+6], src[8*j+7], src[8*j+8]),
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

      // ORIENT THE ANKLES ACCORDING TO VALUES AFTER ONE SECOND.

      var q1 = (new THREE.Quaternion()).copy(this.getQ(IK.ANKLE_R, 60)).inverse();
      var q2 = (new THREE.Quaternion()).copy(this.getQ(IK.ANKLE_L, 60)).inverse();

      for (var frame = 0 ; frame < ik_data.length ; frame++) {
         this.getQ(IK.ANKLE_R, frame).multiply(q1);
         this.getQ(IK.ANKLE_L, frame).multiply(q2);
      }
   },

   nNodes : function() { return IK.NPARTS; },

   getNodeData : function() {
      return this.nodeData;
   },

   computeNodeData : function() {

      function relVec(id, x, y, z) { return newVec3().copy(nodeP[id]).offset(x, y, z); }

      var nodeP = [];
      nodeP[IK.NECK      ] = newVec3().copy(this.getP(IK.NECK, 60));

      nodeP[IK.CHEST     ] = relVec(IK.NECK      , 0   , -0.18, 0);

      nodeP[IK.SHOULDER_R] = relVec(IK.CHEST     ,-0.16,  0.03, 0);
      nodeP[IK.ELBOW_R   ] = relVec(IK.SHOULDER_R,-0.20,  0   , 0);
      nodeP[IK.WRIST_R   ] = relVec(IK.ELBOW_R   ,-0.18,  0   , 0);

      nodeP[IK.SHOULDER_L] = relVec(IK.CHEST     , 0.16,  0.03, 0);
      nodeP[IK.ELBOW_L   ] = relVec(IK.SHOULDER_L, 0.20,  0   , 0);
      nodeP[IK.WRIST_L   ] = relVec(IK.ELBOW_L   , 0.18,  0   , 0);

      nodeP[IK.BELLY_R   ] = relVec(IK.SHOULDER_R, 0.08, -0.27, 0);
      nodeP[IK.BELLY_L   ] = relVec(IK.SHOULDER_L,-0.08, -0.27, 0);

      nodeP[IK.HIP_R     ] = relVec(IK.BELLY_R   ,-0.03, -0.15, 0);
      nodeP[IK.KNEE_R    ] = relVec(IK.HIP_R     , 0   , -0.36, 0);
      nodeP[IK.ANKLE_R   ] = relVec(IK.KNEE_R    , 0   , -0.34, 0);

      nodeP[IK.HIP_L     ] = relVec(IK.BELLY_L   , 0.03, -0.15, 0);
      nodeP[IK.KNEE_L    ] = relVec(IK.HIP_L     , 0   , -0.36, 0);
      nodeP[IK.ANKLE_L   ] = relVec(IK.KNEE_L    , 0   , -0.34, 0);

      return nodeP;
   },

   getLinkData : function() {
      return [
	 [IK.HIP_L  , IK.HIP_R  ], [IK.BELLY_L, IK.BELLY_R],
	 [IK.HIP_L  , IK.BELLY_R, .9], [IK.HIP_L  , IK.BELLY_L],
	 [IK.HIP_R  , IK.BELLY_R], [IK.HIP_R  , IK.BELLY_L, .9],
         [IK.ANKLE_L, IK.KNEE_L ], [IK.KNEE_L , IK.HIP_L     ],
         [IK.ANKLE_R, IK.KNEE_R ], [IK.KNEE_R , IK.HIP_R     ],
         [IK.WRIST_L, IK.ELBOW_L], [IK.ELBOW_L, IK.SHOULDER_L],
         [IK.WRIST_R, IK.ELBOW_R], [IK.ELBOW_R, IK.SHOULDER_R],
	 [IK.NECK      , IK.CHEST],
	 [IK.CHEST     , IK.SHOULDER_L],
	 [IK.CHEST     , IK.SHOULDER_R],

	 [IK.BELLY_L   , IK.SHOULDER_L, .25],
	 [IK.BELLY_R   , IK.SHOULDER_R, .25],
	 [IK.BELLY_L   , IK.SHOULDER_R, 0.2],
	 [IK.BELLY_R   , IK.SHOULDER_L, 0.2],

         [IK.SHOULDER_L, IK.SHOULDER_R, 0.2],
      ];
   },

   modelBody : function() {

      this.body = new THREE.Mesh();

      var markerMaterial = new phongMaterial().setAmbient(0,.5,0);
      var eyeMaterial = new phongMaterial().setAmbient(0,0,.5);
      var colors = [ [.4,.3,.2], [.5,.5,.5], [.5,.5,.5], [.4,.3,.2], [.4,.3,.2] ];

      for (var j = 0 ; j < 5 ; j++) {

         var C = colors[j];
         var material = new phongMaterial().setAmbient(C[0],C[1],C[2]).setDiffuse(C[0],C[1],C[2]);

	 switch (j) {

	 case IK.NECK:

            var head = new THREE.Mesh(globeGeometry(8,16), material);
	    head.position.set(0,.04,0);
	    head.scale.set(.1,.13,.11);
            for (var i = 0 ; i < 2 ; i++) {
	       head.add(new THREE.Mesh(globeGeometry(), eyeMaterial));
	       var eye = head.children[i];
	       eye.position.set(i==0 ? -.4 : .4, 0, .8);
	       eye.rotation.y = i==0 ? -.5 : .5;
	       eye.scale.set(.3,.2,.1);
            }

            var neck = new THREE.Mesh();
	    neck.add(head);

            this.body.add(neck);
	    break;

	 case IK.ANKLE_R:
	 case IK.ANKLE_L:

            var foot = new THREE.Mesh(globeGeometry(16,5,0,TAU,-PI/2,PI), material);
	    foot.position.set(0,-.1,.1);
	    foot.scale.set(.06,.06,.14);

            var sole = new THREE.Mesh(globeGeometry(16,5,0,TAU,0,PI), material);
	    sole.position.set(0,-.1,.1);
	    sole.scale.set(.06,.01,.14);

	    var joint = new THREE.Mesh(cylinderGeometry(), material);
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

            var hand = new THREE.Mesh(globeGeometry(16,8), material);
	    hand.position.set(sign * .11, 0, 0);
	    hand.scale.set(.11,.025,.055);

            var thumb = new THREE.Mesh(globeGeometry(16,8), material);
	    thumb.position.set(sign * .08, -.02, .052);
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
      var neck = this.body.children[IK.NECK].children[0];
      for (var e = 0 ; e < 2 ; e++)
         neck.children[e].scale.y = isBlinking ? 0 : .2;
      return isBlinking;
   },

   getP    : function(j, frame) { return this.data[def(frame,this.frame)][j].p; },
   getQ    : function(j, frame) { return this.data[def(frame,this.frame)][j].q; },
   getFrame: function(time)     { return floor(60 * time) % this.nFrames(); },
   nFrames : function()         { return this.data.length; },

   render  : function(time) {
      this.frame = this.getFrame(time);

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

      if (this.mesh.children.length == 0)
         this.mesh.add(this.body);
   },
};

