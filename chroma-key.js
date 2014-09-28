navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

var videoLayer;


function ChromaKeyedVideo()
{
  var videoStream;
  var video;
  var canvas;
  var gl;
  var context;

  var projectionMatrix;
  var modelViewMatrix;
  var texture;

  var vertexBuffer;
  var texCoordsBuffer;

  var image;

  var shaderProgram, shaderVertexPosAttr, shaderProjectionMatUni, shaderModelViewMatUni;

  var bRender;

  this.chromaShaderVertSRC =
    "precision highp float;\n" +
    "   attribute vec3 vertexPos;\n" +
    "   attribute vec2 aTextureCoord;\n" +
    "   uniform mat4 modelViewMatrix;\n"+
    "   uniform mat4 projectionMatrix;\n"+
    "   varying vec2 vTextureCoord;\n" +
    "   void main(void) {\n" +
    "     vTextureCoord = aTextureCoord;\n" +
    "     // return the transformed and projected vertex value\n" +
    "     gl_Position = projectionMatrix * modelViewMatrix * \n" +
    "       vec4(vertexPos, 1.0);\n" +
    "   }\n";


  this.chromaShaderFragSRC =
  "precision highp float;\n" +
   
   "varying highp vec2 vTextureCoord;\n" +
   
   "uniform float thresholdSensitivity;\n" +
   "uniform float smoothing;\n" +
   "uniform vec3 colorToReplace;\n" +
   "uniform sampler2D uSampler;\n" +
   
   "void main(void)\n" +
   "{\n" +
  "     vec4 textureColor = texture2D(uSampler, vTextureCoord);\n"+
       
       "float maskY = 0.2989 * colorToReplace.r + 0.5866 * colorToReplace.g + 0.1145 * colorToReplace.b;\n"+
       "float maskCr = 0.7132 * (colorToReplace.r - maskY);\n"+
       "float maskCb = 0.5647 * (colorToReplace.b - maskY);\n"+
       
       "float Y = 0.2989 * textureColor.r + 0.5866 * textureColor.g + 0.1145 * textureColor.b;\n"+
       "float Cr = 0.7132 * (textureColor.r - Y);\n"+
       "float Cb = 0.5647 * (textureColor.b - Y);\n"+
       
       "//float blendValue = 1.0 - smoothstep(thresholdSensitivity - smoothing, thresholdSensitivity , abs(Cr - maskCr) + abs(Cb - maskCb));\n"+
       "float blendValue = smoothstep(thresholdSensitivity, thresholdSensitivity + smoothing, distance(vec2(Cr, Cb), vec2(maskCr, maskCb)));\n"+
       "//if (blendValue < 0.8) { blendValue = 0.0; }\n" +
       "//else if (blendValue < 0.6) {\n"+
       "//  textureColor = vec4(0.0, 0.0, 0.0, 0.2);\n"+
       "//}\n"+
       "gl_FragColor = vec4(textureColor.rgb, textureColor.a * blendValue);\n"+
   "}\n";

  this.chromaKeyR = 0.1;
  this.chromaKeyG = 0.76;
  this.chromaKeyB = 0.85;

  this.modelViewZ = -2;


  this.isInCalibration;
  this.calibIndex;
  this.tabletPoints = [];
  this.videoPoints = [];
  this.isCalibrated;
  this.calibMatrix;

  this.videoCoords = {'x1':-1.0, 'y1':-1.0,  'z1':0.0,
                      'x2': 1.0, 'y2':-1.0,  'z2':0.0,
                      'x3':-1.0, 'y3': 1.0,  'z3':0.0,
                      'x4': 1.0, 'y4': 1.0,  'z4':0.0};

  this.modelViewTranslateX = 0;
  this.modelViewTranslateY = 0;
  this.modelViewTranslateZ = -3;
  this.modelViewScaleX = 1;
  this.modelViewScaleY = 1;
  this.modelViewScaleZ = 1;

  this.addGui = function()
  {
    var gui = new dat.GUI({'autoPlace':true});
    gui.add(this, 'chromaKeyR', 0, 1);
    gui.add(this, 'chromaKeyG', 0, 1);
    gui.add(this, 'chromaKeyB', 0, 1);

    gui.add(this, 'modelViewTranslateX', -1, 1);
    gui.add(this, 'modelViewTranslateY', -1, 1);
    gui.add(this, 'modelViewTranslateZ', -4, 0);
    gui.add(this, 'modelViewScaleX', 1, 4);
    gui.add(this, 'modelViewScaleY', 1, 4);
    gui.add(this, 'modelViewScaleZ', 1, 4);
  }

  this.init = function(canvas)
  {
    console.log("chroma-key: init");
    this.bRender = false;
    this.canvas = canvas;

    this.isInCalibration = true;
    this.isCalibrated = false;
    this.calibIndex = 0;

    this.addGui();
    this.gl = this.getWebGLContext(this.canvas);


    // get live video
	  navigator.getUserMedia({audio: false, video: true}, function(stream) {videoLayer.startVideo(stream);}, function() {videoLayer.noVideo();});
  }

  this.startVideo = function(stream)
  {
      // init video object
    this.videoStream = stream;
    this.video = document.createElement("video");
    this.video.autoplay = true;
    this.video.src = webkitURL.createObjectURL(stream);

    // call initGL when the video is ready to play
    this.video.addEventListener("canplaythrough", function() { videoLayer.initGL();} );
  }

  this.noVideo = function()
  {
    console.log("chroma-key: user cancelled line video");
  }


  this.initGL = function()
  {
    console.log("chroma-key: canvas size: " + this.canvas.width + "x" + this.canvas.height);
    console.log("chroma-key: video size: " + this.video.videoWidth + "x" + this.video.videoHeight);

    this.initMatrices(this.canvas);
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);

    // some blending settings
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
    
    this.shaderProgram = this.linkShader(this.gl, this.chromaShaderVertSRC, this.chromaShaderFragSRC);
    this.texture = this.createTexture(this.gl);

    this.vertexBuffer = this.createVertexBuffer(this.gl);
    this.texCoordsBuffer = this.createTexCoords(this.gl);
    // loop();
    this.bRender = true;
  }

  this.render = function()
  {
    if (!this.bRender) {
      return;
    }

    var gl = this.gl;
    var shaderProgram = this.shaderProgram;

    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // bind the texture
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.video);


    gl.useProgram(shaderProgram);

    // recalc geometry stuff
    this.vertexBuffer = this.createVertexBuffer(gl);
    this.initMatrices(this.canvas);

    // bind the object buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPosAttr, this.vertexBuffer.vertSize, gl.FLOAT, false, 0, 0);
    // bind the texture coords buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordsBuffer);
    gl.vertexAttribPointer(shaderProgram.aTextureCoord, this.texCoordsBuffer.itemSize, gl.FLOAT, false, 0, 0);

    // pass parameters to shader
    gl.uniformMatrix4fv(shaderProgram.projectionMatUni, false, this.projectionMatrix);
    gl.uniformMatrix4fv(shaderProgram.modelViewMatUni, false, this.modelViewMatrix);
    
    gl.uniform1i(shaderProgram.samplerUniform, 0);
    gl.uniform1f(shaderProgram.thresholdSensitivity, 0.1);
    gl.uniform1f(shaderProgram.smoothing, 0.3);
    gl.uniform3f(shaderProgram.colorToReplace, this.chromaKeyR, this.chromaKeyG, this.chromaKeyB);

    // draw the object
    gl.drawArrays(this.vertexBuffer.primType, 0, this.vertexBuffer.nVerts);

    gl.bindTexture(gl.TEXTURE_2D, null);
  }

  this.toggle = function()
  {
    this.bRender = !this.bRender;

    dat.GUI.toggleHide();

    if (!this.bRender) {
      // clear layer
      var gl = this.gl;
      gl.clearColor(0.0, 0.0, 0.0, 0.0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }
  }

  this.isShowing = function()
  {
    return this.bRender;
  }

  this.getWebGLContext = function(canvas)
  {
    var webGLContext;

    /* Context name can differ according to the browser used */
    /* Store the context name in an array and check its validity */
    var names = ["experimental-webgl", "webgl", "webkit-3d", "moz-webgl"];
    for (var i = 0; i < names.length; ++i)
    {
      try
        {
          webGLContext = canvas.getContext(names[i]);
        }
      catch(err) {
        console.log("error: " + err);
      }
      if (webGLContext) break;
    }

    return webGLContext;
  }



  this.createVertexBuffer = function(gl)
  {
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);


    var verts = [];
    for (var i=0; i<4; i++) {
      verts[i*3] = eval('this.videoCoords.x' + (i+1));
      verts[i*3+1] = eval('this.videoCoords.y' + (i+1));
      verts[i*3+2] = eval('this.videoCoords.z' + (i+1));
    }
    // var verts = [
    //   1.0, 1.0, 0.0,
    //   0.0, 1.0, 0.0,
    //   1.0, 0.0, 0.0,
    //   0.0, 0.0, 0.0
    // ];

    // var hRatio = 1;//320;//this.video.videoWidth / this.canvas.width;
    // var vRatio = 0.75;//240;//this.video.videoHeight / this.canvas.height;

    // var verts = [
    //     hRatio, vRatio, 0.0,
    //     -hRatio, vRatio, 0.0,
    //     hRatio, -vRatio, 0.0,
    //     -hRatio, -vRatio, 0.0
    //     ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
    buffer.vertSize = 3;
    buffer.nVerts = 4;
    buffer.primType = gl.TRIANGLE_STRIP;

    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    return buffer;
  }

  this.createTexCoords = function(gl)
  {
    var texCoordsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordsBuffer);

    // var texCoords = [0.0, 1.0,
    //                   1.0, 1.0,
    //                   0.0, 0.0,
    //                   1.0, 0.0
    //                   ];
    var texCoords = [1.0, 0.0,
                      0.0, 0.0,
                      1.0, 1.0,
                      0.0, 1.0
                      ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);
    texCoordsBuffer.itemSize = 2;
    texCoordsBuffer.numItems = 4;

    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    return texCoordsBuffer;
  }


  this.initMatrices = function(canvas)
  {
    this.properProjection = true;

    if (this.properProjection != undefined)
    {
      // create model view matrix
      this.modelViewMatrix = mat4.create();
      mat4.translate(this.modelViewMatrix, this.modelViewMatrix, [this.modelViewTranslateX, this.modelViewTranslateY, this.modelViewTranslateZ]);
      mat4.scale(this.modelViewMatrix, this.modelViewMatrix, [this.modelViewScaleX, this.modelViewScaleY, this.modelViewScaleZ]);

      // create a projection matrix with 45 degree field of view
      this.projectionMatrix = mat4.create();
      mat4.perspective(this.projectionMatrix, Math.PI / 4,
                        canvas.width / canvas.height, 0.5, 10000);
    }
    else {
      this.modelViewMatrix = mat4.create();
      this.projectionMatrix = mat4.create();
    }
  }

  this.createShader = function(gl, str, type)
  {
    var shader;

    if (type == "fragment") {
      shader = gl.createShader(gl.FRAGMENT_SHADER);
    }
    else if (type == "vertex") {
      shader = gl.createShader(gl.VERTEX_SHADER);
    }
    else {
      return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.log("error compiling shader: " + gl.getShaderInfoLog(shader));
      return null;
    }

    return shader;
  }


  this.linkShader = function(gl, vertSRC, fragSRC)
  {
    var vertexShader = this.createShader(gl, vertSRC, "vertex");
    var fragmentShader = this.createShader(gl, fragSRC, "fragment");

    // link them together into a new program
    var shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // get pointers to the shader params
    shaderProgram.vertexPosAttr = gl.getAttribLocation(shaderProgram, "vertexPos");
    shaderProgram.aTextureCoord = gl.getAttribLocation(shaderProgram, "aTextureCoord");

    gl.enableVertexAttribArray(shaderProgram.vertexPosAttr);
    gl.enableVertexAttribArray(shaderProgram.aTextureCoord);

    shaderProgram.projectionMatUni = gl.getUniformLocation(shaderProgram, "projectionMatrix");
    shaderProgram.modelViewMatUni = gl.getUniformLocation(shaderProgram, "modelViewMatrix");

    shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
    shaderProgram.thresholdSensitivity = gl.getUniformLocation(shaderProgram, "thresholdSensitivity");
    shaderProgram.smoothing = gl.getUniformLocation(shaderProgram, "smoothing");
    shaderProgram.colorToReplace = gl.getUniformLocation(shaderProgram, "colorToReplace");

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      console.log("could not get initialize shader");
      return null;
    }

    return shaderProgram;
  }


  this.createTexture = function(gl)
  {
    var texture = gl.createTexture();

    // bind texture
    gl.bindTexture(gl.TEXTURE_2D, texture);
    // gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    // unbind
    gl.bindTexture(gl.TEXTURE_2D, null);

    return texture;
  }
}

