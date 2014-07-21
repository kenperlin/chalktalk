
palmTree = {

	bob:0,

    setup:function(){

        tree = new TREE();

        tree.generate({joints:[10,33,7],angles:[0,1],rads:[1,3,2],length:[5,3,2],start:[1,9,1],width:[3,2,2]})

        // codeName="palmTree";
        // // scene.add(tree);

        // tree.position.y = -30;

        // // setSliders({"var1":0,"var2":0,"var3":.6,"var4":.4,"var5":.2,"var6":.4,"var7":.3})
        var sph= sphere(5);

        tree.passFunc(tree.makeInfo([
            [0,-1,-3],  {obj:sph},
            [0,-1,-3],  {obj:sph},

            // [0,-1,-1,1,-1],  {ob:.03},

        ]),tree.appendObj)

         tree.passFunc(tree.makeInfo([
            [0,-1,-3],  {obj:sph},
            // [0,-1,-1,1,-1],  {ob:.03},

        ]),function(obj,args){obj.parts[0].position.x=3,obj.parts[1].position.z=3,obj.parts[1].position.y=-1})

        // tree.geometry = {};

        tree.material = tree.params.mat;

        // tree = sphere(10);

        return tree;

    },

    draw:function(time){

        tree.passFunc(tree.makeInfo([
            [0,-1,-2],   {rz:0,sc:.98,nFreq:.1,nOff:time,nMult:.2,nObjOff:1},
            [0,-1,-1,-1,-2],  {sc:1+(-0.284*.2),rx:0.105,jOffset:0.083,jOff:count*0.3*-.1,jFreq:-0.067,jMult:-0.002,nFreq:.05,nOff:time,nMult:.6,nObjOff:0.2,nFract:.1},
            [0,-1,-1,-1,1], {ry:-1},
            [0,-1,-1,-1,-1,1,-2],  {sc:.8,rz:.15,rx:-.1},
            [0,-1,-1,-1,-1,0,-2],  {sc:.8,rz:.15,rx:.1},
            [0,-1,-1,-1,-1,-1,0],  {rz:0,off:.2,offMult:2,freq:.11},
            [0,-1,-2],{sc:.92}

        ]),tree.transform)


    }
}

/*
I'm commenting this out until we figure out how to get it to work again. -KP

registerGlyph("tree()",["FrFoGlHjHgIeIbJ`J]KYKWLTLRMOMMNJNGOEOBP@P=P:Q8Q5R3Q2N2K2I1F1D1A1>1<09070401///,/).'.$.!-!/%0'1*1,1/122427393<4?4A5D5F5I5L5N6Q6T6V6Y6[6_6b5d5g5i5l4o4q4t4w4y4|4}4{4x4v3s3p3n3k4i4f4c4a4^4Z4X4U5S5P5M5K5H5",]
);
*/

THREE.Object3D.prototype.addTree = function() {
  var palm = palmTree.setup();
  this.add(palm);
  this.palm = palm;
  return palm;
}

function tree() {
	var a = root.addTree();
	geometrySketch(a);
	a.update = function() {

		this.getMatrix().translate(0,-2,0).scale(0.08);
		this.shaderMaterial.uniforms['time'].value = time*.1;

	}
}
