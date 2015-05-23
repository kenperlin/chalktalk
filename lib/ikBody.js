
// VISUALIZE AN IK BODY

(function() {
   var p = 'ANKLE_L ANKLE_R WRIST_R WRIST_L NECK KNEE_L KNEE_R ELBOW_R ELBOW_L CHEST HIP_L HIP_R SHOULDER_R SHOULDER_L BELLY PELVIS'.split(' ');
   window.IK = {};
   for (var i = 0 ; i < p.length ; i++)
      IK[p[i]] = i;
})();

function IKBody(ik_data) {

   this.shoesMaterial  = phongMaterial().setAmbient(.5,.5,.5).setDiffuse(.5,.5,.5);
   this.jointMaterial  = phongMaterial().setAmbient(.4,.3,.2).setDiffuse(.4,.3,.2).setSpecular(.2,.2,.2,5);
   this.tendonMaterial = phongMaterial().setAmbient(0,.4,.5).setDiffuse(0,.4,.5);
   this.boneMaterial   = phongMaterial().setAmbient(.4,.0,.0).setDiffuse(.4,.0,.0).setSpecular(.3,.3,.3,7);

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

      // ORIENT THE ANKLES ACCORDING TO VALUES AFTER ONE SECOND.

      var q1 = (new THREE.Quaternion()).copy(this.getQ(IK.ANKLE_R, 60)).inverse();
      var q2 = (new THREE.Quaternion()).copy(this.getQ(IK.ANKLE_L, 60)).inverse();

      for (var frame = 0 ; frame < ik_data.length ; frame++) {
         this.getQ(IK.ANKLE_R, frame).multiply(q1);
         this.getQ(IK.ANKLE_L, frame).multiply(q2);
      }
   },

   getNodeData : function() {
      return this.nodeData;
   },

   computeNodeData : function() {

      function relVec(id, x, y, z) { return newVec3().copy(nodeP[id]).offset(x, y, z); }

      var nodeP = [];
      nodeP[IK.NECK      ] = newVec3().copy(this.getP(IK.NECK, 60));

      nodeP[IK.CHEST     ] = relVec(IK.NECK      , 0   , -0.2 ,-.12);
      nodeP[IK.BELLY     ] = relVec(IK.CHEST     , 0   , -0.15,  0);

      nodeP[IK.SHOULDER_R] = relVec(IK.CHEST     ,-0.17,  0   , 0);
      nodeP[IK.ELBOW_R   ] = relVec(IK.SHOULDER_R,-0.22,  0   , 0);
      nodeP[IK.WRIST_R   ] = relVec(IK.ELBOW_R   ,-0.20,  0   , 0);

      nodeP[IK.SHOULDER_L] = relVec(IK.CHEST     , 0.17,  0   , 0);
      nodeP[IK.ELBOW_L   ] = relVec(IK.SHOULDER_L, 0.22,  0   , 0);
      nodeP[IK.WRIST_L   ] = relVec(IK.ELBOW_L   , 0.20,  0   , 0);

      nodeP[IK.HIP_R     ] = relVec(IK.SHOULDER_R, 0.07, -0.45, -.1);
      nodeP[IK.KNEE_R    ] = relVec(IK.HIP_R     , 0   , -0.36, 0);
      nodeP[IK.ANKLE_R   ] = relVec(IK.KNEE_R    , 0   , -0.34, 0);

      nodeP[IK.HIP_L     ] = relVec(IK.SHOULDER_L,-0.07, -0.45, -.1);
      nodeP[IK.KNEE_L    ] = relVec(IK.HIP_L     , 0   , -0.36, 0);
      nodeP[IK.ANKLE_L   ] = relVec(IK.KNEE_L    , 0   , -0.34, 0);

      nodeP[IK.PELVIS    ] = relVec(IK.HIP_L     ,-0.10,  0.15, 0);

      return nodeP;
   },

   getLinkData : function() {
      return [
	 [IK.HIP_L  , IK.HIP_R  ],
	 [IK.HIP_L  , IK.PELVIS ],
	 [IK.HIP_R  , IK.PELVIS ],
	 [IK.PELVIS , IK.BELLY  ],
	 [IK.BELLY  , IK.CHEST  ],
	 [IK.CHEST  , IK.NECK   , 0.9],
	 [IK.CHEST  , IK.SHOULDER_L],
	 [IK.CHEST  , IK.SHOULDER_R],

	 [IK.BELLY     , IK.SHOULDER_L, 0.2],
	 [IK.BELLY     , IK.SHOULDER_R, 0.2],
         [IK.SHOULDER_L, IK.SHOULDER_R, 0.2],

         [IK.ANKLE_L, IK.KNEE_L ], [IK.KNEE_L , IK.HIP_L     ],
         [IK.ANKLE_R, IK.KNEE_R ], [IK.KNEE_R , IK.HIP_R     ],
         [IK.WRIST_L, IK.ELBOW_L], [IK.ELBOW_L, IK.SHOULDER_L],
         [IK.WRIST_R, IK.ELBOW_R], [IK.ELBOW_R, IK.SHOULDER_R],

	 [IK.HIP_L     , IK.SHOULDER_L, .2 ],
	 [IK.HIP_R     , IK.SHOULDER_R, .2 ],
	 [IK.HIP_L     , IK.SHOULDER_R, 0.2],
	 [IK.HIP_R     , IK.SHOULDER_L, 0.2],
	 [IK.NECK      , IK.SHOULDER_R, 0.2],
	 [IK.NECK      , IK.SHOULDER_L, 0.2],
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
	    head.position.set(0,.02,-.12);
	    head.scale.set(.1,.12,.11);
            for (var i = 0 ; i < 2 ; i++) {
	       head.add(new THREE.Mesh(globeGeometry(), this.eyeMaterial));
	       var eye = head.children[i];
	       eye.position.set(i==0 ? -.4 : .4, 0, .9);
	       eye.rotation.y = i==0 ? -.5 : .5;
	       eye.scale.set(.3,.2,.1);
            }

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

	    var joint = new THREE.Mesh(cylinderGeometry(), this.shoesMaterial);
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
	    hand.scale.set(.11,.025,.055);

            var thumb = new THREE.Mesh(globeGeometry(16,8), this.skinMaterial);
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
   getFrame: function(time)     { return floor(120 * time) % this.nFrames(); },
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

