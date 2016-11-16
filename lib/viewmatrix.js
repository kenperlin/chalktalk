
function applyViewMatrix(){

// should be still all the time
    
    

	console.log("scene matrix before:" + ctScene._viewMatrix);
    //ctScene.setViewMatrix(CT.matrixInverse(window.matrixHelper._matrix));
    
    ctScene.setViewMatrix(CT.matrixInverse(window.matrixHelper._matrix));

    console.log("scene matrix after:" + ctScene._viewMatrix);

	CT.matrixMultiply(CT.matrixInverse(window.matrixHelper._matrix),window.cubeHelper._matrix,window.cubeHelper._matrix);
	window.cubeHelper.scale(0.1);
	window.cubeHelper.draw();
    // draw the helper objects
    // should move according to VR2
    //window.sphereTest.draw();
}

function lhs2rhs(pq){
	pq[0] = -pq[0];
	pq[3] = -pq[3];
	pq[6] = -pq[6];
}

function createObjects(){
	window.cubeHelper = new CT.Cube();
	// for(i = 0; i < 6; i++){
	// 	window.cubeHelper.addChild(new CT.Cube());
	// }
	// window.cubeHelper.getChild(0).translate(0,0,-5).scale(0.2);
	// window.cubeHelper.getChild(1).translate(-5,0,0).scale(0.2);
	// window.cubeHelper.getChild(2).translate(0,-5,0).scale(0.2);
	// window.cubeHelper.getChild(3).translate(0,0,5).scale(0.2);
	// window.cubeHelper.getChild(4).translate(5,0,0).scale(0.2);
	// window.cubeHelper.getChild(5).translate(0,5,0).scale(0.2);

      window.matrixHelper = new CT.Cylinder();

      //window.sphereTest = new CT.Sphere();
      //window.sphereTest.translate(0,5,0).scale(0.2);

      ctScene.add(window.cubeHelper);
      //ctScene.add(window.objTest);
      //ctScene.add(window.sphereTest);
}