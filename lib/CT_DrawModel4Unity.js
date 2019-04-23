"use strict";

// USER FUNCTIONS
var meshDataSendCallbackQueue = [];

function scheduleMeshDeletion(mID) {
   const uIDs = new JSSet();
   const bound = userIDs.length;
   for (let i = 0; i < bound; i += 1) {
      if (userIDs[i] == UID_Flags.HOST) {
         continue;
      }

      uIDs.add(userIDs[i]);
   }

   CT.modelInfo.deletionMap.set(mID, uIDs);
}

function enqueueDeleteMeshData(child) {
   if (!child._shape) {
      return;
   }

   scheduleMeshDeletion(child._shape.ID);
}

function enqueueSendMeshData(type, child, sketch) {
   if (!child._shape) {
	   //console.log("HEHE: child._shape not exist");
      return;
   }
   //console.log("MeshModel ID: " + child._shape.ID);

   //console.log("HEHE: func enqueueSendMeshData: type\t" + type);
   const a = child._shape.argA;
   const b = child._shape.argB;
   const c = child._shape.argC;
   const d = child._shape.argD;

   meshDataSendCallbackQueue.push(function() {
	   // todo call parent's drawMatrix for now
	   var matResult;
	  /* if(child._parent && child._parent._draw_matrix){
		  var parentMatrix = CT.matrixMultiply(pixelSpaceTo3DSpaceMatrix(), child._parent._draw_matrix);
		  console.log("child._globalMatrix:", child._globalMatrix);
		matResult = CT.matrixMultiply(parentMatrix, CT.matrixMultiply(child._globalMatrix, child._matrix));//CT.matrixMultiply(pixelSpaceTo3DSpaceMatrix(), matrix);
		//matResult = child._globalMatrix;
	  }else{
		matResult = CT.matrixMultiply(child._globalMatrix, child._matrix);
	  } */
	  matResult = child._globalMatrix;
		//matResult = CT.matrixMultiply(child._globalMatrix, child._matrix);
      const trans = getTranslation(matResult);
      const rot   = getRotation(matResult);
      const scale = sketch.scale() * sketch.xyzS() / 7;
      //getScale(matResult);

      //console.log(trans, scale);
      if (isNaN(trans[0])) {
         return;
      }

      // temp
      // rot[0] = sketch.rX;
      // rot[1] = sketch.rY;
      // rot[2] = 0;

      const rx = sketch.rX; 
      const ry = sketch.rY;
      const yy = min(1, 4 * ry * ry);

      const rotX = -PI * ry;
      const rotY = PI * rx * (1 - yy);
      const rotZ = -PI * rx *      yy;

      rot[0] = rotX;
      rot[1] = rotY;
      rot[2] = rotZ;

      //{self : this, creationTime : time, sent : false}
   const shapeID = child._shape.ID
   const record = CT.modelInfo.get(shapeID);
   // if (!record.sent) {
   //    console.log(record.self, record.sent);
   // }

   // sketch.color is a ... string in the format rgb(r,g,b))
   const index1 = sketch.color.indexOf(',');
   const index2 = sketch.color.indexOf(',',index1+1);
   const colorr = parseInt(sketch.color.substring(sketch.color.indexOf('(')+1,index1));
   const colorg = parseInt(sketch.color.substring(index1+1,index2));
   const colorb = parseInt(sketch.color.substring(index2+1,sketch.color.indexOf(')')));
   const color = [colorr/255,colorg/255,colorb/255,1];

   if (!record.sent) {

      //console.log("SENDING [" + shapeID + "] for first time");

      // Sending for the first time
   	if (!sketch._scaleX){
         _sendMeshData(
            0, type /* temp */, shapeID, -1 /* temp 0, need to increment for each sub mesh */, 
   		   color,
            //trans[0], trans[1], trans[2] + 3.733605607889321 + sketch.zOffset(),
   		   trans[0], trans[1], sketch.zOffset(),
            rot[0], rot[1], rot[2], scale,
            matResult, /* the story doesn't end here--the global matrix doesn't seem to cover sub-meshes */
            [a, b, c, d]
         );
   	} 
      else {
   		_sendMeshData(
            0, type /* temp */, shapeID, -1 /* temp 0, need to increment for each sub mesh */, 
   		   color,
            //trans[0], trans[1], trans[2] + 3.733605607889321 + sketch.zOffset(),
   		   trans[0], trans[1], sketch.zOffset(),
            rot[0], rot[1], rot[2], scale * sketch._scaleX, scale * sketch._scaleY, scale,
            matResult, /* the story doesn't end here--the global matrix doesn't seem to cover sub-meshes */
            [a, b, c, d]
         );
   	}

      record.sent = true;
   }
   else {

      // Resending to specific users
      if (record.resendTo.size > 0) {
         let iter = record.resendTo.keys();

         // Send full data to users with missing data
         for (let uidToSendTo of iter) {

            //console.log("RESENDING [" + shapeID + "] to [" + uidToSendTo + "]");
            ////////
            if (!sketch._scaleX){
               _sendMeshData(
                  0, type /* temp */, shapeID, uidToSendTo /* temp 0, need to increment for each sub mesh */, 
                  color,
                  //trans[0], trans[1], trans[2] + 3.733605607889321 + sketch.zOffset(),
                  trans[0], trans[1], sketch.zOffset(),
                  rot[0], rot[1], rot[2], scale,
                  matResult, /* the story doesn't end here--the global matrix doesn't seem to cover sub-meshes */
                  [a, b, c, d]
               );
            } 
            else {
               _sendMeshData(
                  0, type /* temp */, shapeID, uidToSendTo /* temp 0, need to increment for each sub mesh */, 
                  color,
                  //trans[0], trans[1], trans[2] + 3.733605607889321 + sketch.zOffset(),
                  trans[0], trans[1], sketch.zOffset(),
                  rot[0], rot[1], rot[2], scale * sketch._scaleX, scale * sketch._scaleY, scale,
                  matResult, /* the story doesn't end here--the global matrix doesn't seem to cover sub-meshes */
                  [a, b, c, d]
               );
            }
            ////////
         }

         // Send the updated transforms to users who don't need an update
         for (let i = 0; i < userIDs.length; i += 1) {
            if (record.resendTo.has(userIDs[i]) || userIDs[i] == UID_Flags.HOST) {
               continue;
            }

            console.log("UPDATING [" + shapeID + "] for [" + userIDs[i] + "]");
            if (!sketch._scaleX){
               _updateMeshData(
                  1, type /* temp */, shapeID, userIDs[i] /* temp 0, need to increment for each sub mesh */, 
                color,
                  //trans[0], trans[1], trans[2] + 3.733605607889321 + sketch.zOffset(),
                trans[0], trans[1], sketch.zOffset(),
                  rot[0], rot[1], rot[2], scale,
                  matResult, /* the story doesn't end here--the global matrix doesn't seem to cover sub-meshes */
                  [a, b, c, d]
               );
            } 
            else {
               _updateMeshData(
                  1, type /* temp */, shapeID, userIDs[i] /* temp 0, need to increment for each sub mesh */, 
                  color,
                  //trans[0], trans[1], trans[2] + 3.733605607889321 + sketch.zOffset(),
                  trans[0], trans[1], sketch.zOffset(),
                  rot[0], rot[1], rot[2], scale * sketch._scaleX, scale * sketch._scaleY, scale,
                  matResult, /* the story doesn't end here--the global matrix doesn't seem to cover sub-meshes */
                  [a, b, c, d]
               );
            }
         }

         record.resendTo.clear();
      }
      // send transform updates
      else {
            //console.log("UPDATING [" + shapeID + "] for all");
         if (!sketch._scaleX){
            _updateMeshData(
               1, type /* temp */, shapeID, -1 /* temp 0, need to increment for each sub mesh */, 
             color,
               //trans[0], trans[1], trans[2] + 3.733605607889321 + sketch.zOffset(),
             trans[0], trans[1], sketch.zOffset(),
               rot[0], rot[1], rot[2], scale,
               matResult, /* the story doesn't end here--the global matrix doesn't seem to cover sub-meshes */
               [a, b, c, d]
            );
         } 
         else {
            _updateMeshData(
               1, type /* temp */, shapeID, -1 /* temp 0, need to increment for each sub mesh */, 
               color,
               //trans[0], trans[1], trans[2] + 3.733605607889321 + sketch.zOffset(),
               trans[0], trans[1], sketch.zOffset(),
               rot[0], rot[1], rot[2], scale * sketch._scaleX, scale * sketch._scaleY, scale,
               matResult, /* the story doesn't end here--the global matrix doesn't seem to cover sub-meshes */
               [a, b, c, d]
            );
         }
      }
   }

   });
}
