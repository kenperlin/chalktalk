
// VISUALIZE AN IK BODY

function IKBody(ik_data) {
   this.loadData(ik_data);
   this.modelBody();
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
	       p: new THREE.Vector3(src[8*j+6], src[8*j+7], src[8*j+8]),
            });
         }
      }

      // REPLACE ANY MISSING VALUES BY VALUE FROM A VALID FRAME.

      for (var frame = ik_data.length - 1 ; frame > 0 ; frame--) {
         for (var j = 0 ; j < 5 ; j++) {
	    if (this.getP(frame, j).lengthSq() == 0)
	       for (var f = frame + 1 ; f < ik_data.length ; f++)
	          if (this.getP(f, j).lengthSq() != 0) {
	             this.getP(frame, j).copy(this.getP(f, j));
	             break;
                  }

	    if (this.getQ(frame, j).w == 1)
	       for (var f = frame + 1 ; f < ik_data.length ; f++)
	          if (this.getQ(f, j).w != 1) {
	             this.getQ(frame, j).copy(this.getQ(f, j));
	             break;
                  }
         }
      }

      // INITIALIZE THE ANKLE ORIENTATIONS WRT FIRST FRAME.

      var q1 = (new THREE.Quaternion()).copy(this.getQ(60, 1)).inverse();
      var q2 = (new THREE.Quaternion()).copy(this.getQ(60, 2)).inverse();

      for (var frame = 0 ; frame < ik_data.length ; frame++) {
         this.getQ(frame, 1).multiply(q1);
         this.getQ(frame, 2).multiply(q2);
      }
   },

   modelBody : function() {

      this.body = new THREE.Mesh();
      this.body.position.y = -1.5;
      this.body.scale.set(1.5,1.5,1.5);

      var eyeMaterial = new phongMaterial().setAmbient(0,0,.5);
      var colors = [ [.4,.3,.2], [.4,0,0], [.4,0,0], [.4,.3,.2], [.4,.3,.2] ];

      for (var j = 0 ; j < 5 ; j++) {

         var C = colors[j];
         var material = new phongMaterial().setAmbient(C[0],C[1],C[2]).setDiffuse(C[0],C[1],C[2]);

	 switch (j) {
	 case 0:
            var head = new THREE.Mesh(globeGeometry(), material);
	    head.position.set(0,.16,0);
	    head.scale.set(.1,.13,.11);
            for (var i = 0 ; i < 2 ; i++) {
	       head.add(new THREE.Mesh(globeGeometry(), eyeMaterial));
	       var eye = head.children[i];
	       eye.position.set(i==0?-.4:.4,0,.8);
	       eye.rotation.y = i==0 ? -.5 : .5;
	       eye.scale.set(.3,.2,.1);
            }

	    var joint = new THREE.Mesh(openCylinderGeometry(), whiteMaterial);
	    joint.scale.set(.04,.025,.05);

            var neck = new THREE.Mesh();
	    neck.add(joint);
	    neck.add(head);
            this.body.add(neck);
	    break;

	 case 1:
	 case 2:
            var foot = new THREE.Mesh(globeGeometry(8,4,0,TAU,-PI/2,PI), material);
	    foot.position.set(0,-.1,.1);
	    foot.scale.set(.06,.06,.15);

	    var joint = new THREE.Mesh(openCylinderGeometry(), material);
	    joint.scale.set(.045,.1,.055);

            var ankle = new THREE.Mesh();
	    ankle.add(joint);
	    ankle.add(foot);
            this.body.add(ankle);
	    break;

	 case 3:
	 case 4:
            var hand = new THREE.Mesh(globeGeometry(), material);
	    hand.position.set(j==3?.1:-.1,0,0);
	    hand.scale.set(.1,.03,.06);

	    var joint = new THREE.Mesh(openCylinderGeometry(), whiteMaterial);
	    joint.position.x = j==3 ? -.07 : .07;
	    joint.rotation.z = PI/2;
	    joint.scale.set(.035,.1,.035);

            var wrist = new THREE.Mesh();
	    wrist.add(joint);
	    wrist.add(hand);
            this.body.add(wrist);
	    break;
         }
      }
   },

   nFrames : function()         { return this.data.length; },
   getP    : function(frame, j) { return this.data[frame][j].p; },
   getQ    : function(frame, j) { return this.data[frame][j].q; },

   render  : function(time) {
      var frame = floor(60 * time) % this.nFrames();
      for (var j = 0 ; j < 5 ; j++) {
         var joint = this.body.children[j];
         joint.quaternion.copy(this.getQ(frame, j));
         joint.position  .copy(this.getP(frame, j));
      }

      if (this.mesh === undefined) {
         this.mesh = new THREE.Mesh();
         this.mesh.add(this.body);
      }
   },
};

