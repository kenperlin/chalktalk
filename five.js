

var ___hiddenpoint_count = 0;



   THREE.Object3D.prototype.findMoreVisibleEdges = function(ve) {
       // side effect 
       if (ve === undefined) {
	   this.updateMatrixWorld();
	   ve = [];
	   // console.log("fmve: init ve and matrix"); // MW
	   this.geometry.computeFaceNormals(); 
	   this.geometry.computeVertexNormals(true); 
         }
       // MW
       else { 
	   this.updateMatrixWorld(); 
	   // console.log("fmve: init matrix but visible edges is defined"); 
       }
       this.geometry.matrixWorld = this.matrixWorld;
       /*      
       if (this.geometry.geometryNormalFlag === undefined) {
	   this.geometry.geometryNormalFlag = true;
	   this.geometry.computeVertexNormals();
       }
       */
       // this.geometry.computeFaceNormals(); 
       // this.geometry.computeVertexNormals(true); 
       // console.log("cvn"); 
       ve.push([ this.geometry, this.geometry.findMoreVisibleEdges() ]);
       for (var k = 0 ; k < this.children.length ; k++)
	   this.children[k].findMoreVisibleEdges(ve);
       return ve;
   }


   THREE.Geometry.prototype.findMoreVisibleEdges = function() {
       var moreVisibleEdges = [];
       var moreEdges = [];
       var normalMatrix = new THREE.Matrix3().getNormalMatrix(this.matrixWorld); 
       var eyePoint = new THREE.Vector3(0.0, 0.0, -100.0); 

       // console.log("fmve: start"); 
      
       for (var n = 0 ; n < this.faces.length ; n++) {
	   var face = this.faces[n];
	   /*
	   if (face.vertexNormals === undefined) {
	       console.log("vertex normals undefined"); 
	   }
	   if (Array.isArray(face.vertexNormals)) {
	       // console.log("vn array has length " + face.vertexNormals.length);
	       // face.vertexNormals[0].print("vn0"); 
	       // face.vertexNormals[1].print("vn1"); 
	       // face.vertexNormals[2].print("vn2"); 
	   }
	   else {
	       console.log("vn is not an array");
	   }
	   */
	   var vna = face.vertexNormals[0].applyMatrix3(normalMatrix).normalize(); 
	   var vnb = face.vertexNormals[1].applyMatrix3(normalMatrix).normalize(); 
	   var vnc = face.vertexNormals[2].applyMatrix3(normalMatrix).normalize(); 

	   moreEdges.push( [face.a, face.b, vna, vnb], 
			   [face.b, face.c, vnb, vnc], 
			   [face.c, face.a, vnc, vna]); 
       }
       // now moreEdges is a list of all edges of this geometry with its face normal
       // for each vertex, construct a normal, do a dot product against the eyePoint, 
       // and check the result 
       for (var n = 0 ; n < moreEdges.length ; n++) {
	   var edge = moreEdges[n];
	   var vtx0 = this.vertices[edge[0]].clone();
	   var vtx1 = this.vertices[edge[1]].clone();
	   vtx0.applyMatrix4(this.matrixWorld);
	   vtx1.applyMatrix4(this.matrixWorld); 
	   var vn0 = edge[2];
	   var vn1 = edge[3]; 
	   var view1 = newSubVectors(eyePoint, vtx0).normalize(); 
	   var view2 = newSubVectors(eyePoint, vtx1).normalize(); 
	   var dot1 = Math.pow((1.0 - Math.max(0.0, - view1.dot(vn0))), 7.0); 
	   var dot2 = Math.pow((1.0 - Math.max(0.0, - view2.dot(vn1))), 7.0); 

	   if (dot1 >= 0.75 && dot2 >= 0.75) {
	       moreVisibleEdges.push([edge[0], edge[1]]);
	       // console.log("fmve: adding edge " + n.toFixed(2)); 
	   }
       }
       // console.log("fmve: pushed " + moreVisibleEdges.length + " edges out of " + moreEdges.length.toFixed(0)); 

       return moreVisibleEdges;
   }



THREE.Vector3.prototype.print = function(title) {

    if (title === undefined) {
	var title = "vtx";
    }

    console.log(title + " " + this.x.toFixed(4) + ", " + this.y.toFixed(4) + ", " + this.z.toFixed(4));
    return;
}


// Function newSubVectors 
// subtract two vectors, return in a new vector

var newSubVectors = function(vx, vy) {
    var z = new THREE.Vector3(); 
    
    if (vx === undefined) {
	console.log("vx undefined");
    }
    if (vy === undefined) {
	console.log("vy undefined");
    }
    z.set(vx.x - vy.x, vx.y - vy.y, vx.z - vy.z); 
    
    return z;
};


// Function printEdge

var printEdge = function(n, e) {
   
    // console.log("edge = " + n.toFixed(0));
    if (e === undefined) {
	console.log("e undefined");
    }
    else {
	console.log("edge # " + n.toFixed(0) + " uses vertices " + e[0] + " and  " + e[1]); 
	e[2].print("1 vn");
	e[3].print("2 vn"); 
    }
    return;
};


