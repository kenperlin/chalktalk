"use strict";

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

var videoLayer = null;

function ChromaKeyedVideo()
{
  var isBlockingChalktalkWhenFullScreen = false;
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

  this.captureReflectionMap = () => {
     let canvas = reflection_map_canvas;
     let context = canvas.getContext('2d');
     if (this.video.videoWidth / this.video.videoHeight < 1.5)
        context.drawImage(this.video, this.video.videoWidth/2 - 43, this.video.videoHeight/2 - 79, 86, 86, 0, 0, 256, 256);
     else
        context.drawImage(this.video, this.video.videoWidth/2 - 86, this.video.videoHeight/2 - 140, 172, 172, 0, 0, 256, 256);
     CT.reflectionMap = new Image();
     CT.reflectionMap.src = canvas.toDataURL();
  }

  var image;

  var shaderProgram, shaderVertexPosAttr, shaderProjectionMatUni, shaderModelViewMatUni;

  var bRender;
  var bFreeze;

  var darkVideo = 0;

  this.vertexShaderSRC =
    "precision highp float;\n" +
    "   attribute vec3 vertexPos;\n" +
    "   attribute vec2 aTextureCoord;\n" +
    "   uniform mat4 modelViewMatrix;\n"+
    "   uniform mat4 projectionMatrix;\n"+
    "   varying vec2 vTextureCoord;\n" +
    "   void main(void) {\n" +
    "     vTextureCoord = aTextureCoord;\n" +
    "     gl_Position = projectionMatrix * modelViewMatrix * vec4(vertexPos, 1.0);\n" +
    "   }\n";

/*
   u = 3.2 * u * u
   v = v - .15

   u = sqrt(u / 3.2)
   v = v + .15

   u = C * u + .5;
   v = C * v + .5;
*/

  this.fragmentShaderSRC =
   "precision highp float;\n" +

   "varying highp vec2 vTextureCoord;\n" +
   "uniform float      dimming;\n" +
   "uniform float      matting;\n" +
   "uniform float      whitescreen;\n" +
   "uniform float      threshold;\n" +
   "uniform float      vignetting;\n" +
   "uniform sampler2D  uSampler[1];\n" +

   "void main(void)\n" +
   "{\n" +
   "   float x = vTextureCoord.x * 2. - 1.;\n"+
   "   float y = vTextureCoord.y * 2. - 1.;\n"+
   "   float t = max(0., 1. - vignetting * (x*x + (y > 0. ? 0. : y*y)));\n"+
   "   vec4 textureColor = texture2D(uSampler[0], vTextureCoord);\n"+

   "   float r = textureColor.r;\n"+
   "   float g = textureColor.g;\n"+
   "   float b = textureColor.b;\n"+
   "   float matte = max(0., min(1., 4. * mix(.3 + threshold + r + b - g - g,"+
   "                                         2.0 + threshold - r - g - b, whitescreen)));\n"+
   "   matte = max(0., min(1., 3. * matte));\n"+
   "   matte = mix(1., matte, matting);\n"+
   "   float dimEdges = pow(matte, 3.);\n"+
   "   textureColor.rgb *= vec3(mix(1.,dimEdges,whitescreen), dimEdges, mix(1.,dimEdges,whitescreen));\n"+

   //"   textureColor.rgb *= 3.2*x*x + (y-.15)*(y-.15) > .035 ? 1. : .5;"+

   "   gl_FragColor = vec4(dimming * textureColor.rgb, t * mix(1., matte, dimming));\n"+
   "}\n";

  this.modelViewZ = -2;

  this.isInCalibration;
  this.calibIndex;
  this.tabletPoints = [];
  this.videoPoints = [];
  this.isCalibrated;
  this.calibMatrix;

  this.width = function() {
     return mix(0.35, 1.0, sCurve(this.enlarge));
  }

  this.Translate_X = 0;
  this.Translate_Y = 0;
  this.Translate_Z = -2;
  this.Scale_X = 1.4;
  this.Scale_Y = 1;
  this.Scale_Z = 1;

  this.addGui = function()
  {
    // var gui = new dat.GUI({'autoPlace':true});
    this.gui = new dat.GUI();
    this.gui.add(this, 'Translate_X', -1.0, 1.0);
    this.gui.add(this, 'Translate_Y', -1.0, 1.0);
    this.gui.add(this, 'Translate_Z', -4.0, 0.0);
    this.gui.add(this, 'Scale_X', 1.0, 4.0);
    this.gui.add(this, 'Scale_Y', 1.0, 4.0);

    this.gui.domElement.style.visibility = "hidden";
  }

  this.init = function(canvas)
  {
    console.log("chroma-key: init");
    this.bRender = false;
    this.bFreeze = false;
    this.canvas = canvas;

    this.isFullScreen = false;
    this.enlarge = 0;

    this.isInCalibration = true;
    this.isCalibrated = false;
    this.calibIndex = 0;

    this.addGui();
    this.gl = this.getWebGLContext(this.canvas);


    // get live video

    navigator.getUserMedia({audio: false, video: true},
                           function(stream) {videoLayer.startVideo(stream);},
                           function(err) {videoLayer.noVideo(err);});
  }

  this.startVideo = function(stream)
  {
    console.log("chroma-key: start video", stream);

      // init video object
    this.videoStream = stream;
    this.video = document.createElement("video");
    this.video.autoplay = true;
    this.video.srcObject = stream;

    // call initGL when the video is ready to play
    this.video.oncanplaythrough = function() { videoLayer.initGL(); }

    // this.video.addEventListener("canplaythrough", function() { videoLayer.initGL();} );
  }

  this.noVideo = function(err)
  {
    console.log("chroma-key: user cancelled line video " + err);
  }


  this.initGL = function()
  {
    console.log("chroma-key: canvas size: " + this.canvas.width + "x" + this.canvas.height);
    console.log("chroma-key: video size: " + this.video.videoWidth + "x" + this.video.videoHeight);

    this.Scale_Y = 1.091 * (this.video.videoHeight / this.video.videoWidth)
                         / (this.canvas.height     / this.canvas.width    );

    this.initMatrices(this.canvas);
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    // some blending settings
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

    this.shaderProgram = this.linkShader(this.gl, this.vertexShaderSRC, this.fragmentShaderSRC);
    this.texture = this.createTexture(this.gl);
    //this.bgTexture = this.createTexture(this.gl);

    this.vertexBuffer = this.createVertexBuffer(this.gl);
    this.texCoordsBuffer = this.createTexCoords(this.gl);
    // loop();
    this.bRender = true;
  }

  this.render = function()
  {
    if (!this.bRender || !this.video) {
      return;
    }

    if (isDarkVideo)
       darkVideo = min(1, darkVideo + .03);
    else
       darkVideo = max(0, darkVideo - .03);

    if (isLightTracking)
       lightTracker.update(this.video);

    this.enlarge = max(0, min(1, this.enlarge + (this.isFullScreen ? 0.02 : -0.02)));

    var gl = this.gl;
    var shaderProgram = this.shaderProgram;

    gl.clearColor(0.0, 0.0, 0.0, 0.0);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if (window.isImageSlide)
       return;

    // bind the textures

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);

    if (!this.bFreeze) {
       gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.video);
    }
/*
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.bgTexture);

    if (window.isBgCapture) {
       gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.video);
       isBgCapture = false;
    }
*/
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

//  gl.uniform1iv(shaderProgram.samplerUniform, [0,1]);
    gl.uniform1iv(shaderProgram.samplerUniform, [0]);
    gl.uniform1f(shaderProgram.dimming, mix(1, .7, darkVideo));
    gl.uniform1f(shaderProgram.matting, window.videoMatteState > 0 ? 1 : 0);
    gl.uniform1f(shaderProgram.whitescreen, window.videoMatteState == 2 ? 1 : 0);
    gl.uniform1f(shaderProgram.threshold, def(window.videoMatteThreshold));
    gl.uniform1f(shaderProgram.vignetting, 1. - this.enlarge);

    // draw the object
    gl.drawArrays(this.vertexBuffer.primType, 0, this.vertexBuffer.nVerts);

    gl.bindTexture(gl.TEXTURE_2D, null);
  }

  this.toggleSize = function()
  {
     this.isFullScreen = ! this.isFullScreen;
  }

  this.toggle = function()
  {
    // three state toggle (active / freeze / black)
    if (!this.bRender) {
      this.bRender = true;
    }
    else {
      if (this.bFreeze) {
        this.bRender = false;
        this.bFreeze = false;
      }
      else {
        this.bFreeze = true;
      }
    }

    if (!this.bRender) {
      // clear layer
      var gl = this.gl;
      gl.clearColor(0.0, 0.0, 0.0, 0.0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }
  }

  this.toggleControls = function()
  {
    if (this.gui.domElement.style.visibility == "hidden")
    {
      this.gui.domElement.style.visibility = "visible";
    }
    else {
      this.gui.domElement.style.visibility = "hidden";
    }

    console.log("Camera Transformation Parameters:");
    console.log("Translate: " + this.Translate_X + "x" + this.Translate_Y + "x" + this.Translate_Z);
    console.log("Scale: " + this.Scale_X + "x" + this.Scale_Y);
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

    var aspect = 1.25;
    var w = this.width();
    var verts = [-aspect*w, .85-2*w, 0,   aspect*w, .85-2*w, 0,
                 -aspect*w, .85    , 0,   aspect*w, .85    , 0];

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
      mat4.translate(this.modelViewMatrix, this.modelViewMatrix, [this.Translate_X, this.Translate_Y, this.Translate_Z]);
      mat4.scale(this.modelViewMatrix, this.modelViewMatrix, [this.Scale_X, this.Scale_Y, this.Scale_Z]);

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

    if (type == "fragment")
      shader = gl.createShader(gl.FRAGMENT_SHADER);
    else if (type == "vertex")
      shader = gl.createShader(gl.VERTEX_SHADER);
    else
      return null;

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
    shaderProgram.dimming = gl.getUniformLocation(shaderProgram, "dimming");
    shaderProgram.matting = gl.getUniformLocation(shaderProgram, "matting");
    shaderProgram.whitescreen = gl.getUniformLocation(shaderProgram, "whitescreen");
    shaderProgram.threshold = gl.getUniformLocation(shaderProgram, "threshold");
    shaderProgram.vignetting = gl.getUniformLocation(shaderProgram, "vignetting");

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
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    // unbind
    gl.bindTexture(gl.TEXTURE_2D, null);

    return texture;
  }
}

function removeGui(gui, parent) {
  if (! parent)
    parent = dat.GUI.autoPlaceContainer;
  parent.removeChild(gui.domElement);
}

function addGui(gui, parent) {
  if (! parent)
    parent = dat.GUI.autoPlaceContainer;
  parent.appendChild(gui);
}

