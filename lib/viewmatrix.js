
function applyViewMatrix(){

	console.log("scene matrix before:" + ctScene._viewMatrix);
    ctScene.setViewMatrix(CT.matrixInverse(window.matrixHelper._matrix));

    console.log("scene matrix after:" + ctScene._viewMatrix);

    // draw the helper objects
    // should move according to VR2
    window.cubeHelper.draw();
    // should be still all the time
    window.cubeTest.draw();
}