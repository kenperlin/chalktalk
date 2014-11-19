function TTInput()
{
	this.labels = "ttinput".split(' ');
	this.myText = "Tactonic";

	this.recordBtn = new Button([-0.9, -0.9], [-0.7, -0.7], function() {
		this.myText = "record clicked";
	});

	this.playBtn = new Button([-0.6, -0.9], [-0.4, -0.7], function () {
		this.myText = "play clicked";
	});

	this.onClick = function(x, y) {};

    this.mouseDown = function(x, y)
    {
    	var p = m.transform([x, y]);

    	this.playBtn.test(p[0], p[1]);
    	this.recordBtn.test(p[0], p[1]);
    };

    this.mouseDrag = function()
    {

    };

    this.mouseUp = function()
    {
    	this.playBtn.release();
    	this.recordBtn.release();
    };


	this.render = function()
	{
		this.duringSketch(function() {
			mLine([-1, 1], [1, 1]);
			mLine([1, 1], [-1, -1]);
			mLine([-1, -1], [1, -1]);
		});

		this.afterSketch(function() {
			// main rectangle
			mDrawRect([-1, -1], [1, 1]);

			// buttons
			this.playBtn.draw();
			this.recordBtn.draw();

			mText(this.myText, [-0.9, 0.9], 0, 0);

			this.table.applyHeights(ttForce);

			this.sendValues();
		});
	};

	// the visualization surface
    this.createMesh = function() {
    	this.table = new InformTable(32, 32);
    	this.table.init();
    	this.table.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI/20);

    	this.mesh = new THREE.Mesh();
		this.mesh.setMaterial(this.shaderMaterial());
    	this.mesh.add(this.table);

    	return this.mesh;
   	};

   	this.sendValues = function()
   	{
   		var frame = {};
   		frame.width = 32;	// x elements
   		frame.height = 32;	// y elements
   		frame.physical_width = 100;
   		frame.physical_height = 100;
   		frame.timestamp = Date.now();
   		frame.data = ttForce;

   		// var max = 0;
   		// for (var i=0; i<ttForce.length; i++) {
   			// if (ttForce[i] > max) {
   				// max = ttForce[i];
   			// }
   		// }

		this.outValue[0] = frame;
   	}
}
TTInput.prototype = new Sketch;
addSketchType("TTInput");


function Button(c1, c2, onclick)
{
	this.rect = [c1, c2];
	this.onclick = onclick;
	this.pressed = false;

	this.draw = function() {
		if (this.pressed) {
			mFillRect(this.rect[0], this.rect[1]);
		}
		else {
			mDrawRect(this.rect[0], this.rect[1]);
		}
	}

	this.test = function(x, y) {
		if (x < this.rect[0][0] ||
			x > this.rect[1][0] ||
			y < this.rect[0][1] ||
			y > this.rect[1][1]) {

			return false;
		}

		this.pressed = true;
		this.onclick();
		return true;
	}

	this.release = function() {
		this.pressed = false;
	}

};





var MAX_HEIGHT = 0.5;

InformTable = function(rows, cols)
{
	THREE.Object3D.call(this);

	this.squareSize = 1.0 / Math.max(rows, cols);
	this.spacing = this.squareSize / 4;
	this.rows = rows;
	this.cols = cols;

	console.log("square size = " + this.squareSize);

	this.cubes = [];
	this.table = {};
	this.dampSpeed = 0.3;

	this.showClipping = false;

	this.whiteMaterial = new THREE.MeshLambertMaterial( { color: 0xffffff, ambient: 0xffffff } );
	this.greyMaterial = new THREE.MeshLambertMaterial( { color: 0x444444, ambient: 0x222222 } );
	this.blackMaterial = new THREE.MeshLambertMaterial( { color: 0x111111, ambient: 0x111111 } );
};

InformTable.prototype = Object.create(THREE.Object3D.prototype);

InformTable.prototype.init = function()
{
	// create the big table
	var geo = new THREE.CubeGeometry(this.cols*(this.squareSize + this.spacing) + this.spacing*2,
			this.rows*(this.squareSize + this.spacing) + this.spacing*2, 0.1);//MAX_HEIGHT-0.01);
	this.table = new THREE.Mesh(geo, this.greyMaterial);
	// this.table.position.set(0, 0, -2);
	this.add(this.table);

	// create the pixels
	var topLeft = {};
	topLeft.x = -(this.cols*(this.squareSize + this.spacing))/2 + this.spacing*2;
	topLeft.y = -(this.rows*(this.squareSize + this.spacing))/2 + this.spacing*2;

	geo = new THREE.CubeGeometry(this.squareSize, this.squareSize, MAX_HEIGHT);
	var index=0;
	for (var y=0; y<this.rows; y++)
	{
		for (var x=0; x<this.cols; x++)
		{
			var cube = new THREE.Mesh(geo, this.whiteMaterial);
			cube.position.set(topLeft.x + x*(this.squareSize + this.spacing), topLeft.y + y*(this.squareSize + this.spacing), 0.1);
			this.cubes[index++] = cube;
			this.table.add(cube);
			cube.castShadow = true;
			cube.receiveShadow = true;
		}
	}
};

// heights should be an array of values ranging 0 - 1
InformTable.prototype.applyHeights = function(heights)
{
	for (var i=0; i<heights.length; i++)
	{
		var cube = this.cubes[i];
		if (!cube) {
			continue;
		}

		cube.scale.z += 0.1 + (heights[i] - cube.scale.z) * (1-this.dampSpeed);
		cube.position.z = (cube.scale.z * MAX_HEIGHT) / 2;

		if (this.showClipping) {
			if (heights[i] == 0 || heights[i] == MAX_HEIGHT) {
				cube.material = this.blackMaterial;
			}
			else {
				cube.material = this.whiteMaterial;
			}
		}
	}
};

InformTable.prototype.refreshClipping = function()
{
	if (this.showClipping) {
		return;
	}

	for (var i=0; i<this.cubes.length; i++)
	{
		var cube = this.cubes[i];
		cube.material = this.whiteMaterial;
	}
};

InformTable.prototype.transform = function(func)
{
	for (var y=0; y<this.rows; y++)
	{
		for (var x=0; x<this.cols; x++)
		{
			var cube = this.cubes[y*this.cols + x];
			cube.position.z = func(x, y);
			if (cube.position.z < 0) {
				cube.position.z = 0;
			}
			else if (cube.position.z > 4) {
				cube.position.z = 4;
			}
		}
	}
};



