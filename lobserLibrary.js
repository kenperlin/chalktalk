// TREE.js - requires THREE.js
/*

TODO:

** - setup search function so that "all" applies to limbs and branches
double check 'magic' edges on surface maker
setup reportlayers that splits up branches better
tree.appendTree - doesn't know what 'this' is - wtf fucking fuck seriously
*/

var Joint = function(params){

	//Each joint looks like this:
	//Joint(Object3D).children[0]=rotator(Object3D)
	//Joint(Object3D).children[0].children[0]=ballGeo(Mesh)
	//Joint(Object3D).children[0].children[0].children[0]=ballGeo(Mesh)
	//Joint(Object3D).children[0].children[1]=scalar(Object3D)
	//Joint(Object3D).children[0].children[1].children[0]=jointGeo(Mesh)
	//Joint(Object3D).children[0].children[2]=Joint(Object3D) (the next joint, if there is one)

	THREE.Object3D.call(this);
	this.params = params;
	this.limbs = [];
	this.parts = [];
	this.nameArray = [];
}

Joint.prototype = Object.create(THREE.Object3D.prototype);

Joint.prototype.construct = function(off){

	// the argument off refers to the offset in y 

	var p = this.params;

	this.ballMesh = new THREE.Mesh( p.ballGeo, p.mat );
	this.ballMesh2 = new THREE.Mesh( p.ballGeo, p.mat );
	this.jointMesh = new THREE.Mesh( p.jointGeo, p.mat );
	this.ballMesh.scale = new THREE.Vector3(p.jointScale.x,p.jointScale.x,p.jointScale.x);
	this.jointMesh.position.y = .5;	

	this.scalar = new THREE.Object3D();
	this.rotator = new THREE.Object3D();

	this.scalar.add(this.jointMesh);
	this.scalar.scale = p.jointScale;

	this.rotator.add(this.ballMesh);
	this.ballMesh2.position.y = p.jointScale.y/p.jointScale.x;
	this.ballMesh.add(this.ballMesh2);

	this.rotator.add(this.scalar);

	this.add(this.rotator);
	var offset = p.jointScale.y;

	if(off!=undefined)
		var offset = off;

	this.position.y = offset;
}

Joint.prototype.mergeGeo = function(){

    var meshes = [];

    this.updateMatrixWorld();
    
    meshes[0] = this.ballMesh.geometry.clone();
    meshes[1] = this.jointMesh.geometry.clone();
    meshes[2] = this.ballMesh2.geometry.clone();

    meshes[0].applyMatrix(this.matrixWorld);
    meshes[1].applyMatrix(this.children[0].children[1].children[0].matrixWorld);
    meshes[2].applyMatrix(this.children[0].children[0].children[0].matrixWorld);

    THREE.GeometryUtils.merge(meshes[0],meshes[1]);
    THREE.GeometryUtils.merge(meshes[0],meshes[2]);

    return meshes[0];
}

TREE = function(params){


	//TREE is an object3D so it can be transformed

	if(!params) params = {};

	THREE.Object3D.call(this);
	this.limbs = [];
	this.name = 0;
	this.nameArray = [];
	this.parts = [];

	var zero = new THREE.Vector3(0,0,0);
	var one = new THREE.Vector3(1,1,1);
	var colour = params.color || 0xFFFFFF;

	this.params = {
		name : 0,
		jointScale : new THREE.Vector3(1,1,1),
		ballGeo :  new THREE.SphereGeometry(1,8,6),
		jointGeo : new THREE.CylinderGeometry( 1,1,1,8,1),
		color : colour,
		mat : new THREE.MeshLambertMaterial({ color:colour, shading: THREE.SmoothShading }),
		offset : 0,
		scalar : new THREE.Object3D(),
		rotator : new THREE.Object3D(),
		poser : new THREE.Object3D(),
		num : 100,
		tubeGeo : []
	}

	this.self = this;

	// this.treeParent = this;
	this.metaBalls.treeParent = this;
}

TREE.prototype = Object.create(THREE.Object3D.prototype);

//create

TREE.prototype.branch = function(amt,obj,params){

	//Create one branch, a collection of linked limbs

	var p = this.params;
	var parent = obj || this;
	var amount = amt || p.num;
	var countUp = 0;

	var joint = new Joint(parent.params);

	if(!parent.offset)
		parent.offset=0;
	if(!parent.joint)
		parent.joint=0;

	var offsetOffset = parent!=undefined ? parent.offset+parent.limbs.length : 0;
	joint.offset = parent.joint+offsetOffset || 0;
	joint.offset2 = offsetOffset;

	joint.joint = countUp;
	joint.joints = amount-1;
	joint.parentJoint = parent; 
	joint.name = Math.floor(Math.random()*1e9);
	parent.limbs.push(joint);
	countUp++;

	//start weird

	var keys = (Object.keys(joint.params));

	var tempParams = {};

	for(var i = 0 ; i < keys.length ; i++){
		tempParams[keys[i]] = joint.params[keys[i]];
	}

	joint.params = tempParams;

	if(params){
		var keys = (Object.keys(params));
		for(var i = 0 ; i < keys.length ; i++){
			joint.params[keys[i]] = params[keys[i]];
		}
	}
	////// end weird

	if(parent!=this){
		joint.construct(parent.params.jointScale.y);
		parent.rotator.add(this.recursiveAdd(amount, countUp++, joint));
	}
	else{
		joint.construct(0);
		parent.add(this.recursiveAdd(amount, countUp++, joint));
	}

	return joint;
}

TREE.prototype.recursiveAdd = function(amt,counter,obj){

	//helper function for branch
	
	var joint = new Joint(obj.params);
	joint.offset = obj.offset;
	joint.offset2 = obj.offset2;
	joint.parentJoint = obj.parentJoint;
	joint.name = obj.name;
	joint.construct();
	joint.joint = counter;
	obj.childJoint = joint;
	
	if(amt>1)
		obj.rotator.add(joint);

	amt--;
	counter++;

	if(amt>0){
		this.recursiveAdd(amt,counter++,joint);
	}

	return obj;
}

TREE.prototype.generate = function(genome, parent){


	//e.g. genome = {joints:[15,3,2],divs:[2,3,1],angles:[.78,.05,.03],rads:[2,1,1]}

	var parent = parent || this;

	var g = this.generateFixedParams(genome);

	if(g.joints.length!=g.divs.length || g.joints.length!=g.angles.length || g.divs.length!=g.angles.length){
		alert("arrays must be the same length");
		return;
	}

	var tempRoot = new Joint(this.params);
	tempRoot.construct();
	tempRoot.name = "0";

	for (var i = 0; i < g.rads[0]; i++) {

		//for offsetting
		var altLength = tempRoot.params.jointScale.clone();
		altLength.y = g.length[0];
		altLength.x = altLength.z = g.width[0];
		var root = this.branch(g.joints[0],tempRoot,{jointScale:altLength});

		root.rotator.rotation.z = g.angles[0];
		root.rotator.rotation.y = i * ((2*Math.PI)/g.rads[0]);
		this.recursiveBranch(g,1,root);
		parent.add(root);
		parent.limbs.push(root);
	}

	this.makeDictionary();
}

TREE.prototype.recursiveBranch = function(genome,counter,joint){

	//helper for generate
	
	var g = genome;
	var end = g.end[counter];
	if(end==-1)
		end = joint.joints+1;
	var newBranch,kidJoint;	

	//loop through all the joints in the current branch
	for (var i = g.start[counter]; i < end; i+=g.divs[counter]) {
	
		//loop through the 'rads' - the number of branches from each joint
		for (var j = 0; j < g.rads[counter]; j++) {

			kidJoint = this.findJoint(joint,i);
			var altLength = kidJoint.params.jointScale.clone();
			altLength.y = g.length[counter];

			altLength.x = altLength.z = g.width[counter];

			newBranch = this.branch(g.joints[counter],kidJoint,{jointScale:altLength});

			newBranch.rotator.rotation.z = g.angles[counter];
			newBranch.rotator.rotation.y = j * ((2*Math.PI)/g.rads[counter]);
		}
		if(counter<g.joints.length){
			for (var k = 0; k < kidJoint.limbs.length; k++) {
				this.recursiveBranch(genome,counter+1,kidJoint.limbs[k]);
			}
		}
	}
}

TREE.prototype.appendBranch = function(obj,args){

	if(!args) args = {};

	var amt = args.amount || 10;

	var x = args.rx || 0;
	var y = args.ry || 0;
	var z = args.rz || 1;

	if(args.rz===0)
		z=0;

	var sc = args.sc || 1;

	//making a tempTree to get access to the 'branch' function
	var tempTree = new TREE();

	var tempRoot = new Joint(tempTree.params);
	var altLength = tempRoot.params.jointScale.clone();
	altLength.y = sc;
	tempRoot.construct();

	var root = tempTree.branch(amt,obj,{jointScale:altLength});

	var posY = args.ty || root.parent.parent.params.jointScale.y;	
	
	root.position.y=posY;

	root.rotator.rotation.x = x;
	root.rotator.rotation.y = y;
	root.rotator.rotation.z = z;

	return root;
}

TREE.prototype.makeSkinnedGeo = function(){


    var geo = new THREE.Geometry();
       
    geo.skinIndices = [];
    geo.skinWeights = [];

    geo.bones = [];
    geo.parts = [];
   
    var reportArray = this.report();

    this.mirrorJointArray = [];

    for (var k = 0; k < reportArray.length; k++) {

        var parentJoint = reportArray[k];

        for (var i = 0; i < parentJoint.joints+1; i++) {

            var thisJoint = this.findJoint(parentJoint,i);
            
            this.mirrorJointArray.push(thisJoint);

            var mergedGeo = thisJoint.mergeGeo();

            THREE.GeometryUtils.merge(geo,mergedGeo);

             var len = geo.bones.length;

            for(var j = 0 ; j < mergedGeo.vertices.length ; j++){
                geo.skinIndices.push( new THREE.Vector4(len,len,0,0 ));
                geo.skinWeights.push( new THREE.Vector4(1,1,0,0 ));
            }

            var bone = {};

            bone.name="bone"+len;

            bone.pos = [thisJoint.position.x,thisJoint.position.y,thisJoint.position.z];
            bone.rot = [thisJoint.quaternion.x,thisJoint.quaternion.z,thisJoint.quaternion.y];
            bone.scl = [thisJoint.scale.x,thisJoint.scale.y,thisJoint.scale.z];
            bone.rotq = [thisJoint.rotator.quaternion.x,thisJoint.rotator.quaternion.y,thisJoint.rotator.quaternion.z,thisJoint.rotator.quaternion.w];
            bone.joints = thisJoint.joints;
            bone.joint = thisJoint.joint;
            bone.offset = thisJoint.offset;
            bone.offset2 = thisJoint.offset2;
            bone.rotator = bone;
            bone.scalar = bone;

            if(thisJoint.dictionaryName!=undefined){
            	geo.parts[thisJoint.dictionaryName] = bone;
            	bone.dictionaryName = thisJoint.dictionaryName;
            }

            if(k>0 && i==0){
                bone.parent = this.findParentInMirrorArray(thisJoint,this.mirrorJointArray);
            }
            else
                bone.parent = geo.bones.length-1;


            geo.bones.push(bone);
        }
    }


    this.params.skinMaterial = new THREE.MeshLambertMaterial({color:0xffffff,skinning:true});
    var skinned = new THREE.SkinnedMesh(geo,this.params.skinMaterial,true);

    this.boneDictionary = [];

    for (var i = 0; i < skinned.bones.length; i++) {
        skinned.bones[i].joint = geo.bones[i].joint;
        skinned.bones[i].joints = geo.bones[i].joints;
        skinned.bones[i].offset = geo.bones[i].offset;
        skinned.bones[i].offset2 = geo.bones[i].offset2;
        skinned.bones[i].rotator = geo.bones[i].rotator;
        skinned.bones[i].scalar = geo.bones[i].scalar;
        skinned.bones[i].dictionaryName = geo.bones[i].dictionaryName;
        this.boneDictionary[geo.bones[i].dictionaryName] = skinned.bones[i];
    };
    // console.log(skinned.bones);
    this.bones = skinned.bones;
    // this.boneDictionary = geo.parts;

    return skinned;
}

//utility

TREE.prototype.makeInfo = function(args){

	//helper function for xform
	//applies argument object to each array

	var info = [];
	
	for (var i = 0; i < args.length; i+=2) {
	
		info.push(this.makeList(args[i]));
		info.push(args[i+1]);
	}

	return info;
}

TREE.prototype.findParentInMirrorArray = function(obj,arr){
    var count = 0;
    for (var i = 0; i < arr.length; i++) {
        if(obj.parentJoint == arr[i]){
            count = i;
        }
    }
    return count;
}

TREE.prototype.findInMirrorArray = function(obj,arr){
    var count = 0;
    for (var i = 0; i < arr.length; i++) {
        if(obj == arr[i]){
            count = i;
        }
    }
    return count;
}

TREE.prototype.makeList = function(range,stacker,stackArray,index) {



	var stack = stacker || [];
	var stackArray = stackArray || [];
	var index = index || 0;

	// if(stack.length>5)
	// console.log(stack + " " + range.length);

	if(index < range.length){

		var i = index;

		if (range[i] instanceof Array && i!=range.length-1) {
			for (var j = range[i][0] ; j <= range[i][1]; j++) {

				stack.push(j);

				var tempStack = [];

				for(var k = 0 ; k < stack.length ; k++){
					tempStack[k] = stack[k];
				}

				this.makeList(range,tempStack,stackArray,i+1);
				stack.pop();

			};
		}

		else if(range[i] == "all" && index%2==0 && index!=range.length-1 ||
			range[i] == -1 && index%2==0 && index!=range.length-1){

			var tempStack = [];

			for(var k = 0 ; k < stack.length ; k++){
				tempStack[k] = stack[k];
			}

			tempStack.push(0);

			var jarr = [];
			this.findLimbs(this.FIND(tempStack),jarr);

			// console.log(jarr.length);

			for (var j = 0 ; j < jarr.length ; j++){


				stack.push(j);

				var tempStack = [];

				for(var k = 0 ; k < stack.length ; k++){
					tempStack[k] = stack[k];
				}
				// console.log(tempStack);


				this.makeList(range,tempStack,stackArray,i+1);

				stack.pop();


			}

		}
		else if(range[i] == "all" && index%2!=0 && index!=range.length-1 ||
			range[i] == -1 && index%2!=0 && index!=range.length-1){


			var tempStack = [];

			for(var k = 0 ; k < stack.length ; k++){
				tempStack[k] = stack[k];
			}
			// tempStack.push(0);

			// console.log(tempStack);

			var jarr = [];
			this.findLimbs(this.FIND(tempStack),jarr);

			// console.log(jarr[0].limbs);
		
			var limbs = jarr[0].limbs;//this.FIND(tempStack).limbs;

		// console.log(jarr[tempStack[tempStack.length-1]].limbs);


			// console.log(tempStack);
			// console.log(limbs.length);

			for (var j = 0 ; j < limbs.length ; j++){

				// console.log(j);

				stack.push(j);

				var tempStack2 = [];

				for(var k = 0 ; k < stack.length ; k++){
					tempStack2[k] = stack[k];
				}

				// console.log(tempStack);

				this.makeList(range,tempStack2,stackArray,i+1);

				stack.pop();
			}

		}

		else if(range[i] == -2 && index==range.length-1 || 
				range[i] == "all" && index==range.length-1 || 
				range[i] == -1 && index==range.length-1 ||
				range[i] == -3 && index==range.length-1){

			var tempStack = [];

			for(var k = 0 ; k < stack.length ; k++){
				tempStack[k] = stack[k];
			}

			tempStack.push(0);

			var joints = this.FIND(tempStack).joints;

			var min=0;
			var max = joints+1;

			if(range[i]==-2)
				min=1;

			if(range[i]==-3)
				min=max-1;

			for (var j = min ; j < max ; j++){

				stack.push(j);

				var tempStack = [];

				for(var k = 0 ; k < stack.length ; k++){
					tempStack[k] = stack[k];
				}

				this.makeList(range,tempStack,stackArray,i+1);
				stack.pop();
			}

		}
		else if(range[i] instanceof Array && index==range.length-1){
			var tempStack = [];

			for(var k = 0 ; k < stack.length ; k++){
				tempStack[k] = stack[k];
			}

			tempStack.push(0);

			var min = range[i][0];
			var max = range[i][1];

			var joints = this.FIND(tempStack).joints;

			if(min>joints+1)
				min=joints+1;
			if(max>joints+1)
				max=joints+1;

			for (var j = min ; j <= max ; j++){

				if(range[i]==-2)
					j++;

				stack.push(j);

				var tempStack = [];

				for(var k = 0 ; k < stack.length ; k++){
					tempStack[k] = stack[k];
				}

				this.makeList(range,tempStack,stackArray,i+1);
				stack.pop();
			}
		}
		else{

			stack.push(range[i]);

			var tempStack = [];

			for(var k = 0 ; k < stack.length ; k++){
				tempStack[k] = stack[k];
			}

			this.makeList(range,tempStack,stackArray,i+1);
			stack.pop();
		}

	}
	else{
		stackArray.push(stack);
	}


	return stackArray;
}

TREE.prototype.arrayStringName = function (arr){
	for (var i = 0; i < arr.length; i++) {
		arr[i].name = arr[i].toString();
	}
}

TREE.prototype.makeListAll = function(range) {

	//by Andrew Magill

	var allRange = this.makeList(range);
	
	// var result = [];

	// var allRange = [];

	// var processed = this.makeList(range);

	// for (var i = 0; i < processed.length; i++) {
	// 		if(processed[i][processed[i].length-1]=="all"){
	// 			var newarr = processed[i];
	// 			newarr[newarr.length-1]=0;
	// 			var joint = this.FIND(newarr);
	// 			if(joint.joints!=undefined){
	// 				newarr[newarr.length-1]=[0,joint.joints];
	// 				allRange.push(newarr);
	// 			}
	// 		}
	// }

	return allRange;
}

TREE.prototype.generateFixedParams = function(params){

	//helper function for generate

	var counter = 0;

	var keys = (Object.keys(params));
	for(var i = 0 ; i < keys.length ; i++){
		if(counter < params[keys[i]].length){
			counter = params[keys[i]].length;
		}
	}

	var amt = counter;

	var tempParams = this.generateDefaultParams(amt);
	
	var keys = (Object.keys(params));
	for(var i = 0 ; i < keys.length ; i++){
		tempParams[keys[i]] = params[keys[i]];
		if(tempParams[keys[i]].length<amt){
			for (var j = tempParams[keys[i]].length - 1 ; j < amt-1; j++) {
				console.log(keys[i]);
				if(keys[i]=='end')
					tempParams[keys[i]].push(-1);
				else
					tempParams[keys[i]].push(tempParams[keys[i]][tempParams[keys[i]].length-1]);
			}
		}
	}
	
	return tempParams;
}

TREE.prototype.generateDefaultParams = function(amt){

	//helper function for generate

	var params = {
		joints:[],
		divs:[],
		start:[],
		angles:[],
		length:[],
		rads:[],
		width:[],
		end:[],
	};

	for (var i = 0; i < amt; i++) {

		params.joints.push(5);
		params.divs.push(1);
		params.start.push(0);
		params.angles.push(1);
		params.length.push(5);
		params.rads.push(2);
		params.width.push(1);
		params.end.push(-1);

		if(i==0){
			params.rads[0] = 1;
			params.angles[0] = 0;
			params.joints[0] = 10;
		}
	};

	return params;
}

TREE.prototype.cloneVec4Array = function(arr){
    function cloneVec4(val){
        var tempVec = new THREE.Vector4();
       tempVec.x = val.x;
       tempVec.y = val.y;
       tempVec.z = val.z;
       tempVec.w = val.w;
       return tempVec;
    }
    var tempArray = [];
    for (var i = 0; i < arr.length; i++) {
        tempArray[i] = cloneVec4(arr[i]);
    }
    return tempArray;
}



//find and report

TREE.prototype.findJoint = function(obj,num){

	//Return a particular joint on a branch
	//where obj is the root 

	var returner;

	if(obj){

		if(num>obj.joints+1)
			num=obj.joints+1;

		if(num>0){
			num--
			returner = this.findJoint(obj.childJoint,num);
		}
		else{
			returner = obj;
		}
	}
	else
		console.warn("missing object");

	return returner;
}

TREE.prototype.Move = function(selector,func,args,counter,branch){

	//apply a function to a selected joint
	//e.g. Move([0,1,0,1,1],function,{rx:3})
	//no need to supply counter or branch on fist call

	var root = branch || this;
	var count = counter || 0;

	var returner;
	// console.log(root);
	// console.log(selector[count]);
	//selector:[limb with branches, branch, limb, branch, etc, etc, which joint]

	//count up through items in selector; an array
	if( count < selector.length-1 ){

		//create an empty array that we'll fill up with the locations
		//of all the joints that have limbs
		var j = [];
		this.findLimbs(root,j);
		//make sure we're not going past the end of the array
		var c;
		if(selector[count] > j.length-1){
			c=j.length-1;
			console.warn("array is too big: " + selector[count] + " " + selector);
		}
		else
			c=selector[count];

		//use the selected joint for the next recursion
		var joint = j[c];
		returner = this.Move(selector,func,args,count+2,joint.limbs[selector[count+1]]);
	}
	else{
		if( selector[count] == "all" ){
			for (var i = 0; i < root.joints+1; i++) {
				returner = func(this.findJoint(root,i),args);
			}
		}
		else{
			returner = func(this.findJoint(root,selector[count]),args);
		}

	}
	return returner;
}

TREE.prototype.FIND = function(selector,counter,branch){

	//idential to MOVE but instead of applying a function it just returns an object
	var root = branch || this;
	var count = counter || 0;


	var returner;
	
	//count up through items in selector; an array
	if( count < selector.length-1 ){

		//create an empty array that we'll fill up with the locations
		//of all the joints that have limbs
		var j = [];
		this.findLimbs(root,j);
		
		//make sure we're not going past the end of the array
		var c;
		if(selector[count] > j.length-1){
			c=j.length-1;
		}
		else
			c=selector[count];

		//use the selected joint for the next recursion
		var joint = j[c];
		returner = this.FIND(selector,count+2,joint.limbs[selector[count+1]]);
	}
	else{
		if( selector[count] == "all" ){
			for (var i = 1; i < root.joints+1; i++) {
				returner = this.findJoint(root,i);
			}
		}
		else{
			returner = this.findJoint(root,selector[count]);

		}

	}
	return returner;
}

TREE.prototype.findLimbs = function(branch,array){

	//utility function
	//fills an array with a list of the joints that branch from a limb

	var returner;

	if(branch){
		if(branch.limbs){
			if(branch.limbs.length>0){
				array.push(branch);
			}}
			if(branch.childJoint!=undefined && branch.childJoint.name==branch.name){
				returner = this.findLimbs(branch.childJoint,array);
			}
		
		
	}

	return returner;
}

TREE.prototype.report = function(array,obj){

	//returns a one dimensional array with all root joints

	var arr = array || [];
	var joint = obj || this;

	for(var j = 0 ; j < joint.limbs.length ; j++){

		arr.push(joint.limbs[j]);

		var jarr = [];
		this.findLimbs(joint.limbs[j],jarr);


		for(var i = 0 ; i < jarr.length ; i++){

			// joint.nameArray.push(i);
			// console.log(joint.nameArray);

			this.report(arr,jarr[i]);

		}
	}
	return arr;
}

TREE.prototype.reportLayers = function(array,obj,count){

	//makes a multi dimensional array where the first dimension
	//refers to the depth of the indexed branches

	var arr = array || [];	//the first time through it creates an array
	var joint = obj || this; // and references the 0th joint
	var c = count+1 || 0; // and starts the counter at 0

	var larr =  [];

	for(var j = 0 ; j < joint.limbs.length ; j++){

		larr.push(joint.limbs[j]);

		var jarr = [];
		this.findLimbs(joint.limbs[j],jarr);

		for(var i = 0 ; i < jarr.length ; i++){
			this.reportLayers(arr,jarr[i],c);
		}
	}

	if(!arr[c]){
		arr[c] = [];
		for (var i = 0; i < larr.length; i++) {
			arr[c].push(larr[i]);
		};
	}
	else{
		for (var i = 0; i < larr.length; i++) {
			arr[c].push(larr[i]);
		};
	}

	return arr;
}

TREE.prototype.makeDictionary = function(obj,stacker,stackArray,pusher){

	var joint = obj || this;
	var stack = stacker || [];
	var stackArray = stackArray || [];
	var pusher = pusher || 0;

	stack.push(pusher);

	for(var i = 0 ; i < joint.limbs.length ; i++){

		stack.push(i);

		var jarr = [];
		this.findLimbs(joint.limbs[i],jarr);

		var tempStack = [];
		var t2 = [];

		for(var k = 0 ; k < stack.length ; k++){
			tempStack[k] = stack[k];
			t2[k] = stack[k];
		}

		stackArray.push(tempStack);

		t2.push("all");
		var t3 = this.makeList(t2);
		var t4 = t3;//this.makeList(t3[0]);

		for(var k = 0 ; k < t4.length ; k++){
			var tempString = t4[k].toString();
			var tempJoint = this.FIND(t4[k]);
			this.parts[tempString] = tempJoint;
			tempJoint.dictionaryName = tempString;
			// console.log(tempString);
			// console.log(joint.id);
		}

		for(var j = 0 ; j < jarr.length ; j++){
			this.makeDictionary(jarr[j],tempStack,stackArray,j	);
		}

		stack.pop();

	}

	stack.pop();

	return stackArray;
}

TREE.prototype.worldPositions = function(obj){

	//returns the world positions of all the joints on a branch

	var arr = [];

	this.updateMatrixWorld();

	for(var i = 0 ; i <= obj.joints ; i++){

		var tempObj1 = this.findJoint(obj,i);
		tempObj = tempObj1;
		tempObj.updateMatrixWorld();
		if(tempObj1.ballMesh!=undefined)
			tempObj = tempObj1.ballMesh;

		var vector = new THREE.Vector3();
		vector.setFromMatrixPosition( tempObj.matrixWorld );

		var vecScale = new THREE.Vector3();
		vecScale.setFromMatrixScale( tempObj.matrixWorld );

		var vec4 = new THREE.Vector4(vector.x,vector.y,vector.z,(vecScale.z));

		arr.push(vec4);

		if(i==obj.joints){

			vector.setFromMatrixPosition( tempObj1.ballMesh2.matrixWorld );

			var vec4 = new THREE.Vector4(vector.x,vector.y,vector.z,(vecScale.z));
			
			arr.push(vec4);
		}

	}
	return arr;
}

TREE.prototype.worldPositionsArray = function(arr){

	//good for working working with the output of tree.report()
	//which returns a one dimensional array of all joints

	var masterArray = [];

	for(var i = 0 ; i < arr.length ; i++){
		masterArray.push(this.worldPositions(arr[i]));
	}

	return masterArray;
}

TREE.prototype.worldPositionsMultiArray = function(arr){

	//best for working with the output of reportLayers()
	//which returns a 2 dimensional array

	var masterArray = [];

	for(var i = 0 ; i < arr.length ; i++){
		var smallArray = [];
		for(var j = 0 ; j < arr[i].length ; j++){
			smallArray.push(this.worldPositions(arr[i][j]));
		}
		masterArray.push(smallArray);
	}

	return masterArray;
}

//model

TREE.prototype.tubes = function(arr,args){

	//takes a 2 dimensional array where the first dimension
	//use this.worldPositionsArray(tree.report()) - 
	//a one dimensional array of joints

	if(!args) args = {};

	var width = args.width || 1;
	var minWidth = args.minWidth || 0;
	var seg = args.lengthSegs || 1;
	var wseg = args.widthSegs || 6;
	var func = args.func || function(t){return 0};

	var geoObj = new THREE.Object3D();

	
	for(var i = 0 ; i < arr.length ; i++){

		//Building a duplicate curve to offset curve parameterization issue

		var dataCurveArray = [];
		var addX = 0;



		for (var j = 0; j < arr[i].length; j++) {
			var vecW = arr[i][j].w || 1;
			var worldWide = vecW + func(j);
			addX+=vecW;
			if(worldWide<minWidth)
				worldWide=minWidth;
			dataCurveArray.push(new THREE.Vector3(worldWide,addX,0));
		}

		var dataCurve = new THREE.SplineCurve3(dataCurveArray);
		var curve = new THREE.SplineCurve3(arr[i]);
		curve.data = arr[i];
		curve.dataCurve = dataCurve;
		var geo = new THREE.TubeGeometry2(curve, arr[i].length * seg , width, wseg);
		var tube = new THREE.Mesh(geo,this.params.mat);
		geoObj.add(tube);
		this.params.tubeGeo.push(tube);

	}

	return geoObj;
}

TREE.prototype.averagePoints = function(arr,amt){

	//A single array of vectors to be averaged

	amount = amt || .5;

	for (var i = 1; i < arr.length-1; i++) {

		now = arr[i];
		prev = arr[i-1];
		next = arr[i+1];

		var lerped = prev.clone();
		lerped.lerp(next,.5);

		now.lerp(lerped,amount);

	}
}

TREE.prototype.removeZeroLength = function(arr,min){

	var min = min || 0.0001;
	// console.log(min);

	var newArr = [];

	for (var i = 0; i < arr.length; i++) {

		var temp = [];

		for(var j = 1 ; j < arr[i].length ; j++){
			now = arr[i][j];
			prev = arr[i][j-1];

			if(j==1)
				temp.push(arr[i][j-1]);

			var checker = new THREE.Vector3(prev.x-now.x,prev.y-now.y,prev.z-now.z);

			if(!(checker.length() < min)){
				temp.push(now);
			}
		}

		if(temp.length>1){
			newArr.push(temp);
		}
	}

	return newArr;
}

TREE.prototype.insertLerpVerts = function(arr,args){

	if(!args) args = {};

	var points = args.points || 1;
	var tx = args.tx || 0;
	var ty = args.ty || 0;
	var tz = args.tz || 0;
	var freq = args.freq || .4;
	var mult = args.mult || 4;
	var bulge = args.bulge || 0;
	var tipOff = args.tipOff || 0;
	var tipLength = args.tipLength || 0;
	var tipNoiseFreq = args.tipNoiseFreq || .1;
	var tipNoiseMult = args.tipNoiseMult || 0;
	var tipPoint = args.tipPoint || 1;

	var skip = args.skip || false;


	var func = args.func || function(t,p){};
	var parentI = args.parentI || 0;

	var tempArr = [];

	// console.log(arr);

	if(arr.length>1){

		for (var i = 0; i < arr.length; i++) {

			var temp = [];

			var start = arr[i][0];
			var end = arr[i][arr[i].length-1];

			arr[i].unMoved = [];

			for(var j = 1 ; j < points+1 ; j++){

				var b = points+1;

				// console.log(1/2);

				var lerpVec = start.clone();
				lerpVec.lerp(end,j/b);

				arr[i].unMoved.push(lerpVec);

				var aim;

				// if(i>0)
				// console.log(arr[i-1].un);

				if(i>0){
					aim = arr[i-1].unMoved[j-1];
				}
				else{
					// aim = lerpVec.clone();
					if(arr[1]){
						var start2 = arr[1][0];
						var end2 = arr[1][arr[1].length-1];
						var lerpVec2 = start2.clone();
						lerpVec2.lerp(end2,j/b);
						// var toward2 = lerpVec.clone();
						// toward2.lerp(lerpVec2,.5);
						// var diff = lerpVec.clone();
						// diff = diff.subVectors(lerpVec2,toward);
						// diff.normalize();
						// subr.multiplyScalar(-1);
						aim = lerpVec2.clone();
					}
					// aim.multiplyScalar(-1);
				}

				var toward = lerpVec.clone();
				toward.lerp(aim,.5);

				var towardStart = lerpVec.clone();
				towardStart.lerp(start,.5);


				var diff = lerpVec.clone();
				diff = diff.subVectors(lerpVec,toward);
				diff.normalize();
				var nLerp = diff.clone();

				diff.multiplyScalar(Math.sin(i*freq)*mult);
				// diff.multiplyScalar(tx);

				var cLerp = lerpVec.clone();
				cLerp = cLerp.subVectors(lerpVec,towardStart);
				cLerp.normalize();

				nLerp.cross(cLerp);

				if(i==0){
					nLerp.multiplyScalar(-tipOff); //nlerp travels out
				}
				else
					nLerp.multiplyScalar(tipOff); //nlerp travels out
				
				// tipLength=args.parentI;
				// if(args.parentI < 8){
				// 	tipLength=15;
				// }
				var modLength = func(parentI);

				if(modLength==undefined)
					modLength=0;

				cLerp.multiplyScalar(tipLength+modLength); // clerp travels down

				var tLerp = lerpVec.clone();

				var tip = arr[i][arr[i].length-1];

				tip.x+=nLerp.x+(noise(tip.x*tipNoiseFreq,tip.y*tipNoiseFreq,tip.z*tipNoiseFreq)*tipNoiseMult);
				tip.y+=nLerp.y+(noise(tip.x*tipNoiseFreq,tip.y*tipNoiseFreq,tip.z*tipNoiseFreq)*tipNoiseMult);
				tip.z+=nLerp.z+(noise(tip.x*tipNoiseFreq,tip.y*tipNoiseFreq,tip.z*tipNoiseFreq)*tipNoiseMult);

				tip.x+=cLerp.x;
				tip.y+=cLerp.y;
				tip.z+=cLerp.z;


				// var cLerp = diff.clone();

				// // cLerp.normalize();
				

				// if(i>0)
				// 	cLerp.cross(arr[i][0]);
				// else
				// 	cLerp.y=0;

				// // cLerp.addScalar(-1);
				// // cLerp.multiplyScalar(bulge);
				// cLerp.normalize();

				// diff.multiply(cLerp.multiplyScalar(5))

				tLerp.x+=diff.x;
				tLerp.y+=diff.y;
				tLerp.z+=diff.z;


				// tLerp.x+=nLerp.x;
				// tLerp.y+=nLerp.y;
				// tLerp.z+=nLerp.z;

				// lerpVec.x+=Math.sin(i*.4)*4;
				// lerpVec.y+=Math.cos(i*.4);
				// lerpVec.z+=tz;
				
				if(args.tipPoint)
					arr[i][arr[i].length-1].w=tipPoint;

				arr[i].splice(arr[i].length-1,0,tLerp);

				if(arr[i+1]){
					if(skip)
						arr[i][arr[i].length-1]=arr[i+1][arr[i+1].length-1];
					if(args.tipPoint)
						arr[i][arr[i].length-1].w=tipPoint;
				}

			}

			// if(!(Math.sin(i*.3)>-.5 && Math.sin(i*.3)<.5)){
				tempArr.push(arr[i]);
			// }

		}
	}

	return tempArr;
}

TREE.prototype.nurbsishSurface = function(arr,divsx,divsy){

	divsX = divsx || arr.length;
	divsY = divsy || divsX;

	//create Y curves (to the original X)
	//create a new set of interpolated X curves based on those

	var curvesX = [];
	var curvesY = [];
	var curvesX2 = [];
	var curvesY2 = [];
	var pointsY = [];
	var pointsX = [];

	for (var i = 0; i < arr.length; i++) {
		curvesX.push(new THREE.SplineCurve3(arr[i]));
	}
	for (var i = 0; i <= divsX; i++) {
		var tempPoints = [];
		for(var j = 0 ; j < curvesX.length ; j++){
			tempPoints.push(curvesX[j].getPointAt(i/divsX));
		}
		pointsY.push(tempPoints);
	};

	for (var i = 0; i < pointsY.length; i++) {
		curvesY.push(new THREE.SplineCurve3(pointsY[i]));
	}

	for (var i = 0; i <= divsY; i++) {
		var tempPoints = [];
		for(var j = 0 ; j < curvesY.length ; j++){
			tempPoints.push(curvesY[j].getPointAt(i/divsY));
		}
		pointsX.push(tempPoints);
	};

	for (var i = 0; i < pointsY.length; i++) {
		var temp = [];
		for (var j = 0; j < pointsY[i].length; j++) {
			temp.push(pointsY[i][j]);
		};
		this.averagePoints(temp);
		curvesY2.push(temp);
	}

	for (var i = 0; i < pointsX.length; i++) {
		var temp = [];
		for (var j = 0; j < pointsX[i].length; j++) {
			temp.push(pointsX[i][j]);
		};
		this.averagePoints(temp);
		curvesX2.push(temp);
	}

	var XY = [];

	XY.push(curvesY2);
	XY.push(curvesX2);

	return XY;
}

TREE.prototype.mergeMeshes = function(obj){
	//take an array of geo and merge it
	// console.log(obj);

	var arr = [];

	obj.traverse(function(t){
		if(t.geometry){
			arr.push(t);
		}
	})

	// console.log(arr);

	var geo = new THREE.Geometry();

	for (var i = 0; i < arr.length; i++) {
		arr[i].parent.updateMatrixWorld();
		var temp = arr[i].clone();
		temp.applyMatrix(arr[i].parent.matrixWorld);
		THREE.GeometryUtils.merge(geo,temp);
	};

	return geo;
}

TREE.prototype.animateTubes = function(w,sc){

	// Rebuilds tube geometry and deletes the old geo
	// Kinda crappy but whaddya gonna do - throws errors too - meh

	var obj;

	for (var i = 0; i < this.params.tubeGeo.length; i++) {

		obj = this.params.tubeGeo[i];

		obj.geometry.dispose();

		sc.remove(obj);
	};

	this.params.tubeGeo=[];
	sc.add(this.makeTubes(w));
}

TREE.prototype.makeTubes = function(args){

	//simplifies the process of making tubes
	//args = {
	// width - argument passed to tube geometry
	// minWidth - in world space, tube won't get smaller than this
	// widthSegs - radial subdivisions
	// lengthSegs - length subdivisions - multiplier of control points (not total)
	// func - a function which takes an input from a loop based on joint #s
	//}

	var arrayToSort = this.report();
	// arrayToSort.sort(function(a,b){return a.id-b.id});
	return this.tubes(this.worldPositionsArray(arrayToSort),args);
}

TREE.prototype.openSurface = function(points){

	//points is a 2 dimensional array of vectors
	//generate a parametric surface where each vertex is the position of each joint

	function makeSheet(u,v){
		var c = points;

		var tempU = Math.round(u*(c.length));
		var tempV = Math.round(v*(c[0].length));
		
		if(u*(c.length)>c.length-1){
			tempU = c.length-1;
		}
		if(v*(c[0].length)>c[0].length-1){
			tempV = c[0].length-1;
		}

		return(c[tempU][tempV]);
	}


	var geo = new THREE.ParametricGeometry( makeSheet, points.length, points[0].length );

	geo.computeVertexNormals();

	return geo;
}

TREE.prototype.solidify = function(geo,offset,w,h){

	//works with parametric geometry
	//extrudes along the normals and stitches the edges

	var width = w || 10;
	var height = h || 10;

	var vertsize = geo.vertices.length;
	var facesize = geo.faces.length;

	var tempVerts = [];
	var tempFaces = [];

	for (var i = 0; i < vertsize; i++) {
		geo.vertices.push(geo.vertices[i].clone());
	}
	for (var i = 0; i < facesize; i++) {
		geo.faces.push(geo.faces[i].clone());
	}
	for (var i = facesize; i < geo.faces.length; i++) {

		geo.faces[i].a = geo.faces[i].a + vertsize;
		geo.faces[i].b = geo.faces[i].b + vertsize;
		geo.faces[i].c = geo.faces[i].c + vertsize;

		if(geo.vertices[geo.faces[i].a].off!=true){
			geo.vertices[geo.faces[i].a].sub(geo.faces[i].normal.multiplyScalar(offset));
			geo.vertices[geo.faces[i].a].off=true;
		}
		if(geo.vertices[geo.faces[i].b].off!=true){
			if(i==facesize)//don't know why I have to do this - looks messy
				geo.vertices[geo.faces[i].b].sub(geo.faces[i].normal.multiplyScalar(offset/offset));
			else
			geo.vertices[geo.faces[i].b].sub(geo.faces[i].normal.multiplyScalar(offset));
			geo.vertices[geo.faces[i].b].off=true;
		}	
		if(geo.vertices[geo.faces[i].c].off!=true){
			if(i==facesize)
				geo.vertices[geo.faces[i].c].sub(geo.faces[i].normal.multiplyScalar(offset/offset));
			else
			geo.vertices[geo.faces[i].c].sub(geo.faces[i].normal.multiplyScalar(offset));
			geo.vertices[geo.faces[i].c].off=true;
		
		}
			
		
	}

	for (var i = 0; i < (geo.vertices.length); i++) {

		if(i<width-1){

			var a = i;
			var b = i+1;
			var c = i+vertsize;
			var d = i+1+vertsize;
			geo.faces.push(new THREE.Face3(a,b,c));
			geo.faces.push(new THREE.Face3(d,c,b));

			// var a = i+((width*height)-width);
			// var b = i+1+((width*height)-width);
			// var c = i+vertsize+((width*height)-width);
			// var d = i+1+vertsize+((width*height)-width);
			// geo.faces.push(new THREE.Face3(a,b,c));
			// geo.faces.push(new THREE.Face3(d,c,b));

		}
		if(i<height-1){

			var a = i*(width+1);
			var b = (i+1)*(width+1);
			var c = (i*(width+1))+vertsize;
			var d = (i*(width+1))+(width+1)+vertsize;
			geo.faces.push(new THREE.Face3(c,b,a));
			geo.faces.push(new THREE.Face3(b,c,d));

			// var a = width-1+(i*width);
			// var b = width-1+((i+1)*width);
			// var c = width-1+((i*width)+vertsize);
			// var d = width-1+((i*width)+width+vertsize);
			// geo.faces.push(new THREE.Face3(a,b,c));
			// geo.faces.push(new THREE.Face3(d,c,b));
		
		}
	};
}

TREE.prototype.solidSurface = function(points,offset){

	var w = points.length;
	var h = points[0].length;
	var off = offset || 1;

	var geometry;
	geometry = this.openSurface(points);
	this.solidify(geometry,off,w,h);

	geometry.mergeVertices();
	geometry.computeFaceNormals();
	geometry.computeVertexNormals();

	var mesh = new THREE.Mesh(geometry,new THREE.MeshLambertMaterial({side:THREE.DoubleSide}))

	return mesh;
}

TREE.prototype.metaBalls = {

	holder:new THREE.Object3D(),
	resolution:100,
	size:500,
	effect:0,
	box:0,
	ballSize:1,

	init:function(){

		if(this.holder.children.length>0){
			for (var i = 0; i < this.holder.children.length; i++) {
				this.holder.remove(this.holder.children[0]);
			}
		}
		this.effect = new THREE.MarchingCubes( this.resolution, new THREE.MeshLambertMaterial({color:0xffffff}),true,true );
		this.effect.scale.set(this.size,this.size,this.size);
		this.box = new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshLambertMaterial({color:0xffffff,transparent:true,opacity:.2})),

		this.box.scale.set(this.size*2,this.size*2,this.size*2);

		this.holder.add(this.effect);

		return this.holder;
	},

	showBox:function(){
		this.holder.add(this.box);
	},

	hideBox:function(){
		this.holder.remove(this.box);
	},

	setSize:function(val){
		this.size = val;
		var size = this.size;
		this.effect.scale.set( size,size,size );
		this.box.scale.set(size*2,size*2,size*2);
	},

	setResolution:function(val){
		this.resolution = val;
		this.init();
	},

	updateBalls:function(arr) {

		var balls,ballArr,flatArray;


		if(arr==undefined){

			var report = this.treeParent.report();
			ballArr = this.treeParent.worldPositionsArray(report);

			flatArray = [];

			for (var i = 0; i < ballArr.length; i++) {
				for (var j = 0; j < ballArr[i].length; j++) {
					flatArray.push(ballArr[i][j]);
				}
			}
		}

		var balls = arr || flatArray;

		this.effect.reset();

		// fill the field with some metaballs

		var i, ballx, bally, ballz, subtract, strength;

		subtract = 10;
		strength = this.ballSize*.005;//1.2 / ( ( Math.sqrt( numblobs ) - 1 ) / 4 + 1 );

		for ( var i = 0; i < balls.length; i ++ ) {
			// console.log(balls[0][i]);
			ballx = (((balls[i].x+this.size)*  (1/this.size/2))); 
			bally = (((balls[i].y+this.size)*  (1/this.size/2)));//+(size*.000625); 
			ballz = (((balls[i].z+this.size)*  (1/this.size/2)));//+(size*.000625); 

			this.effect.addBall(ballx, bally, ballz, strength, subtract);
		}

		// if ( floor ) object.addPlaneY( 2, 12 );
		// if ( wallz ) object.addPlaneZ( 2, 12 );
		// if ( wallx ) object.addPlaneX( 2, 12 );

	},

	generateGeo:function(){

		var geo = this.effect.generateGeometry();
		geo.verticesNeedUpdate = true;

		for ( var i = 0; i < geo.vertices.length; i ++ ) {

			(geo.vertices[i].x*=this.size) + (this.size/2); 
			(geo.vertices[i].y*=this.size) + (this.size/2);
			(geo.vertices[i].z*=this.size) + (this.size/2);
		}

		// console.log(geo.vertices);

		geo.mergeVertices();

		var obj = new THREE.Mesh(geo,new THREE.MeshLambertMaterial({color:0xffffff}));

		// this.holder.add(obj);
		return obj;
	}
}

//modify

TREE.prototype.passFunc = function (array,func,GPU){

	// this.applyFunc(array,func,GPU);

	var accelerated = GPU || false;
	
	for (var i = 0; i < array.length; i+=2) {
		for (var j = 0; j < array[i].length; j++) {
		 	var process = this.makeList(array[i][j]);
		 	for (var k = 0; k < process.length; k++) {
		 		if(accelerated){
		 			array[i+1].GPU = true;
		 			
		 			if(process[k].name == undefined)
 						this.arrayStringName(process);

		 			func(this.boneDictionary[process[k].name],array[i+1]);
		 		}
		 		else{
					this.Move(process[k],func,array[i+1]);
					
				}
			};
		 }; 
	};
}

TREE.prototype.applyFunc = function (array,func,GPU){

	//same as passFunc but modified for new organization

	var accelerated = GPU || false;

	for (var i = 0; i < array.length; i+=2) {
		for (var j = 0; j < array[i].length; j++) {

	 		if(accelerated)
	 			array[i+1].GPU = true;
		 		
 			if(array[i][j].name == undefined){
 			 	this.arrayStringName(array[i]);
 			}

			
			if(GPU){
				func(this.boneDictionary[array[i][j].name],array[i+1]);
			}
			else{
				func(this.parts[array[i][j].name],array[i+1]);
			}
		 }
	}
}

TREE.prototype.setGeo = function(obj,args){

	//swap out the geometry for the specified joint

	var jointGeo = args.jointGeo || obj.params.jointGeo;
	var ballGeo = args.ballGeo || obj.params.ballGeo;
	var ballGeo2 = args.ballGeo2 || ballGeo;

	obj.ballMesh.geometry = ballGeo;
	obj.ballMesh2.geometry = ballGeo2;
	obj.jointMesh.geometry = jointGeo;
}

TREE.prototype.aimAt = function(obj,args){

	//aims selected joints at a target in world space
	//ugly solution, runs slowly

	var target = args.target || new THREE.Vector3(0,0,0);
	
	var tempParent = obj.parent;

	THREE.SceneUtils.detach(obj,tempParent,scene); //*ergh

	obj.lookAt(target);
	obj.rotation.y+=Math.PI/2;

	obj.parent.updateMatrixWorld();

	THREE.SceneUtils.attach(obj,scene,tempParent); //*ick
}

TREE.prototype.axisRotate = function(obj,args) { 

	//rotate a joint in world space
	//runs well but strange jiggling with long joint chains and large transformations

	if(!args) args = {};

	var axis = args.axis || new THREE.Vector3(0,0,1);
	var radians = args.radians || 0;

	var parent;

	if(!obj.parent){
		console.warn("axisRotate missing parent");
		parent = this;
	}
	else
		parent = obj.parent;

	var tempMatrix = new THREE.Matrix4();
	var inverse = new THREE.Matrix4();
	var multed = new THREE.Matrix4();

	var quat = new THREE.Quaternion();

	inverse.getInverse(parent.matrixWorld);

    tempMatrix.makeRotationAxis(axis, radians);
  
    multed.multiplyMatrices(inverse,tempMatrix); // r56

    quat.setFromRotationMatrix(multed);

    var rot = new THREE.Vector3(axis.x,axis.y,axis.z);
    
    rot.applyQuaternion(quat);

	obj.quaternion.setFromAxisAngle(rot,radians);

	obj.updateMatrixWorld();
}

TREE.prototype.setJointLength = function (obj,args){

	var len = args.length || obj.scalar.scale.y;

	obj.scalar.children[0].scale.y = len/obj.scalar.scale.y;
	obj.scalar.children[0].position.y = len/obj.scalar.scale.y/2;

	for(var i = 2 ; i < obj.rotator.children.length ; i++){
		obj.rotator.children[i].position.y=len;
	}

	obj.ballMesh2.position.y = len;
	obj.childJoint.position.y = len;
}

TREE.prototype.setJointWidth = function (obj,args){

	var wid = args.width || obj.scalar.scale.y;

	obj.scalar.scale.x = wid;
	obj.scalar.scale.z = wid;

	obj.ballMesh.scale.x = wid;
	obj.ballMesh.scale.z = wid;

	// obj.childJoint.position.y = wid;
}

TREE.prototype.xform = function (array,func){

	//deprecated, use passFunc

	this.passFunc(array,func);//deprecated
}

TREE.prototype.appendObj = function (obj,args){

	//append geometry to selected joint

	if(!args) args = {};

	var appendage = new THREE.Object3D();

	if(args.obj)
		appendage= args.obj.clone();

	var rx,ry,rz,sc,scx,scy,scz,tx,ty,tz;

	sc = args.sc || 1;

	if(args.sc){
		scx = scy = scz = args.sc;
	}
	else{
		scx = args.scx || 1 ;
		scy = args.scy || 1 ;
		scz = args.scz || 1 ;
		
	}
	rx = args.rx || 0 ;
	ry = args.ry || 0 ;
	rz = args.rz || 0 ;
	tx = args.tx || 0 ;
	ty = args.ty || 0 ;
	tz = args.tz || 0 ;

	appendage.position = new THREE.Vector3(tx,ty,tz);
	appendage.rotation = new THREE.Euler(rx,ry,rz);
	appendage.scale = new THREE.Vector3(scx,scy,scz);

	obj.rotator.add(appendage);
	obj.parts.push(appendage);	
}

TREE.prototype.appendTree = function (obj,args){

	// just a little helper function for if you want
	// to grow a tree from a tree

	//e.g
	// tree.generate({
	// 		joints: [90,20],
	// 		divs:   [1,5],
	// 		start:  [0],
	// 		angles: [0,Math.PI/2],
	// 		length: [1],
	// 		rads:   [1],
	// });
	// var t = findTopParent(obj);


	var newTree;
	
	if(!args.newTree)
		newTree = new TREE();
	else
		newTree = args.newTree;

	newTree.generate(args.tree,obj);

	obj.limbs.push(newTree);
}

TREE.prototype.transform = function (obj,args){


	// console.log(obj);
	var rx,ry,rz,sc,scx,scy,scz,tx,ty,tz,
	off,offMult,freq,
	jOff,jMult,jFreq,
	jFract, jOffset,
	offsetter,offsetter2,offsetter3,offsetter4,
	jointOff,scoff,sjoff,
	nMult,nOff,nFreq,nFract,
	sinScaleMult,sinScale,sinOff,
	offScale,offScaleMult,offScaleOff,
	rotator, nObjOff,
	GPU;


	if(args){
		sc = args.sc || 1;

		if(args.sc){
			scx = scy = scz = args.sc;
		}
		else{
			scx = args.scx || 1 ;
			scy = args.scy || 1 ;
			scz = args.scz || 1 ;
			
		}
		rx = args.rx || 0 ;
		ry = args.ry || 0 ;
		rz = args.rz || 0 ;
		tx = args.tx || 0 ;
		ty = args.ty || 0 ;
		tz = args.tz || 0 ;

		off = args.off || 0;
		offMult = args.offMult || 0;
		freq = args.freq || 0;
		jOff = args.jOff || 0;
		jMult = args.jMult || 0;
		jFreq = args.jFreq || 0;
		jFract = args.jFract * obj.joint || 1;
		nMult = args.nMult || 0;
		nFreq = args.nFreq || 0;
		nObjOff = args.nObjOff || 0;
		nOff = args.nOff  || 1;
		nFract = args.nFract  * obj.joint || 1;
		jOffset = args.jOffset || 0;
		offsetter = args.offsetter || 0;
		offsetter2 = args.offsetter2 || 0;
		offsetter3 = args.offsetter3 || 0;
		offsetter4 = args.offsetter4 || 0;
		sinScale = args.sinScale || 1;
		sinScaleMult = args.sinScaleMult || 1;
		sinOff = args.sinOff || 0;
		offScale = args.offScale || 0;
		offScaleMult = args.offScaleMult || 1;
		offScaleOff = args.offScaleOff || 0;
		rotator = args.rotator || false;


		GPU = args.GPU || false;

	}
	else{

		rx = ry = rz = tx = ty = tz = sinOff = 0;
		sc = scx = scy = scz = freq = jFreq = jFract = offScaleMult = 1;
		off = offMult = jOff = jMult = jOffset = offsetter = offsetter2 = sinScale = sinScaleMult = 
		nMult = nFreq = nOff = nFract = offScale = offScaleOff = offsetter4 = nObjOff = 0;
		GPU = rotator = false;
	}
	
	var objOffset = obj.offset;
	var objOffsetter = offsetter;
	
	if(offsetter2){
		objOffset = obj.offset2;
		objOffsetter = offsetter2;
	}
	if(offsetter3){
		objOffset = obj.parentJoint.joint;
		objOffsetter = offsetter3;
	}
	if(offsetter4){
		objOffset = obj.parentJoint.parentJoint.joint;
		objOffsetter = offsetter4;
	}

	if(jMult||jOff||jMult||offMult||offsetter||offsetter2||nMult){

		var off1 = jFract * Math.sin( (jOffset * objOffset) + jOff + ( ( jFreq * obj.joint + 1 ) ) ) * jMult;
		var off2 = Math.sin( off + ( freq * objOffset ) ) * offMult;
		var off3 = objOffset * objOffsetter;
		var off4 = nFract * (noise( nOff + ( nFreq * obj.joint + ((objOffset+1)*nObjOff)) ) * nMult);

		jointOff = off3 + off2 + off1 + off4;

	}
	else
		jointOff = 0;

	if(args.sinScale||args.sinScaleMult){
		scoff = ( Math.sin ( (obj.joint * sinScale) + sinOff ) ) * sinScaleMult;
	}
	else
		scoff = 0;

	if(args.offScale || args.offScaleOff || args.offScaleMult)
		sjoff = ( Math.sin ( (obj.parentJoint.joint * offScale) + offScaleOff ) ) * offScaleMult;
	else
		sjoff = 0;

	scalar = sjoff+scoff;

	if(GPU){
		obj.rotator = obj;
		obj.rotator.rotation = obj._rotation;
	}


	var rotOb = obj.rotator;
	if(rotator)rotOb = obj;


	if(args.rx != undefined) rotOb.rotation.x=rx+jointOff;
	if(args.ry != undefined) rotOb.rotation.y=ry+jointOff;
	if(args.rz != undefined) rotOb.rotation.z=rz+jointOff;
	
	if(args.tx != undefined)
		obj.rotator.position.x=tx+jointOff;
	if(args.ty != undefined) 
		obj.rotator.position.y=ty+jointOff;
	if(args.tz != undefined)
		obj.rotator.position.z=tz+jointOff;

	if(args.sc || args.scx || args.scy || args.scz);
		obj.rotator.scale = new THREE.Vector3(scx,scy,scz).addScalar(scalar);

	return obj;
}

TREE.prototype.setScale = function (sc){
	this.scale.x = sc;
	this.scale.y = sc;
	this.scale.z = sc;
}

function findTopParent(obj){

	var re;

	if(obj.parent.parent)
		re = findTopParent(obj.parent);
	else{
		re=obj;
	}
	return re;
}

var pi = Math.PI/2;
var pi2 = Math.PI;
var sin = Math.sin;
var cos = Math.cos;
