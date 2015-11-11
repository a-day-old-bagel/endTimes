var graphics = {

  gl: undefined,

  shdr_prog: undefined,
  shdr_unif_matVP: undefined,
  shdr_unif_matM: undefined,
  shdr_unif_samp: undefined,
  shdr_unif_cPos: undefined,
  shdr_unif_lPos: undefined,
  shdr_unif_lDir: undefined,
  shdr_unif_cCol: undefined,
  shdr_unif_time: undefined,

  shdrSky_prog: undefined,
  shdrSky_unif_invMat: undefined,
  shdrSky_unif_sampler: undefined,

  shdrAtm_prog: undefined,
  shdrAtm_unif_matVP: undefined,
  shdrAtm_unif_matM: undefined,
  shdrAtm_unif_cPos: undefined,
  shdrAtm_unif_lDir: undefined,

  width: undefined,
  height: undefined,
  sky: undefined,
  skyTex: undefined,
  whichSky: 1,
  skyChannel: 1,

  render: function() {
    gl.clear(gl.DEPTH_BUFFER_BIT);    
    camera.updateVPMat();

    gl.useProgram(this.shdrSky_prog);
    this.drawSky(this.sky);

    gl.useProgram(this.shdr_prog);
    gl.uniform1f(this.shdr_unif_time, physics.totalTime * 0.1);
    gl.uniform3f(this.shdr_unif_cPos, camera.vec_eye[0],
        camera.vec_eye[1], camera.vec_eye[2]);
    gl.uniformMatrix4fv(this.shdr_unif_matVP, gl.FALSE, flatten(camera.mat_vp));   
    this.drawObjCubeMapped(ball, this.shdr_unif_matM);

    gl.useProgram(this.shdrAtm_prog);
    gl.uniform3f(this.shdrAtm_unif_cPos, camera.vec_eye[0],
        camera.vec_eye[1], camera.vec_eye[2]);
    gl.uniformMatrix4fv(this.shdrAtm_unif_matVP, gl.FALSE, flatten(camera.mat_vp));   
    this.drawObjCubeMapped(ball, this.shdrAtm_unif_matM);
  },

  drawSky: function() {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.skyVertexBuffer);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    var mat = camera.getVP_inverse();
    gl.uniformMatrix4fv(this.shdrSky_unif_invMat, false, flatten(mat));

    gl.drawArrays(gl.TRIANGLES, 0, this.skyVertCount);
  },

  drawObjCubeMapped: function(obj, matMLoc) {
    gl.bindBuffer(gl.ARRAY_BUFFER, obj.vertexBuffer);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, obj.normalBuffer);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);

    for (i = 0; i < obj.mat_model.length; ++i) {
      if (obj.isActive[i]) {
        gl.uniformMatrix4fv(matMLoc, gl.FALSE,
          flatten(obj.mat_model[i]));
        gl.drawArrays(gl.TRIANGLES, 0, obj.triCount);
      }
    }
  },

  initSky: function(skyObj) {
    this.skyVertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.skyVertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1,   3, -1,   -1, 3]),
      gl.STATIC_DRAW);
    this.skyVertCount = 3;

    var sky_load_counter = 0;
    var skyCallback = function (texture, face, image) {
      return function () {
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        gl.texImage2D(face, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        ++sky_load_counter;
        if (sky_load_counter == 6)
        {
          gl.generateMipmap(gl.TEXTURE_CUBE_MAP);

          gl.useProgram(graphics.shdrSky_prog);
          gl.activeTexture(gl.TEXTURE1);
          gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
          gl.uniform1i(graphics.shdrSky_unif_sampler, 1);

          gl.useProgram(graphics.shdr_prog);
          var nLightDir = normalize(graphics.sky.lightDir);
          gl.uniform3f(graphics.shdr_unif_lDir, nLightDir[0],
            nLightDir[1], nLightDir[2]);

          gl.useProgram(graphics.shdrAtm_prog);
          var nLightDir = normalize(graphics.sky.lightDir);
          gl.uniform3f(graphics.shdrAtm_unif_lDir, nLightDir[0],
            nLightDir[1], nLightDir[2]);

          console.log("Sky loaded.");
        }
      }
    }
    this.sky = skyObj;
    this.loadCubeMap(this.sky.cubeMap, this.sky.extension, this.skyTex,
        gl.TEXTURE1, skyCallback);
  },

  initObj: function(obj) {
    obj.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, obj.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(obj.vertices),
      gl.STATIC_DRAW);

    obj.normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, obj.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(obj.normals),
      gl.STATIC_DRAW);

    obj.triCount = obj.vertices.length / 3;

    var load_counter = 0;
    var callback = function (texture, face, image) {
      return function () {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        gl.texImage2D(face, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        ++load_counter;
        if (load_counter == 6)
        {
          gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
          gl.useProgram(graphics.shdr_prog);
          gl.activeTexture(gl.TEXTURE0);
          gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
          gl.uniform1i(graphics.shdr_unif_samp, 0);
          console.log("Object loaded.");
        }
      }
    }
    obj.sky = skies[obj.whichSky];
    this.loadCubeMap(obj.sky.cubeMap, obj.sky.extension, obj.texture,
        gl.TEXTURE0, callback);
  },

  loadCubeMap: function(base, extension, targetTex, targetTexChannel, callback){
    gl.activeTexture(targetTexChannel);
    targetTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, targetTex);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER,
      gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    var faces = [["posx." + extension, gl.TEXTURE_CUBE_MAP_POSITIVE_X],
                 ["negx." + extension, gl.TEXTURE_CUBE_MAP_NEGATIVE_X],
                 ["posy." + extension, gl.TEXTURE_CUBE_MAP_POSITIVE_Y],
                 ["negy." + extension, gl.TEXTURE_CUBE_MAP_NEGATIVE_Y],
                 ["posz." + extension, gl.TEXTURE_CUBE_MAP_POSITIVE_Z],
                 ["negz." + extension, gl.TEXTURE_CUBE_MAP_NEGATIVE_Z]];
    for (var i = 0; i < faces.length; ++i) {
      var face = faces[i][1];
      var image = new Image();
      image.onload = callback(targetTex, face, image);
      image.src = base + '/' + faces[i][0];
    }
  },

  init: function(canvas) {
    // Initialize WebGL
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
      alert("WebGL isn't available");
    } else {
      console.log('WebGL Initialized.');
    }
    this.width = canvas.width;
    this.height = canvas.height;

    // Configure WebGL
    gl.viewport(0, 0, this.width, this.height);
    gl.clearColor(0.25, 0.18, 0.1, 1.0);
    gl.cullFace(gl.BACK);
    gl.frontFace(gl.CCW);
    gl.enable(gl.CULL_FACE);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.DEPTH_TEST);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND);

    // Earth shader
    this.shdr_prog = initShaders(gl, 'earth.vert', 'earth.frag');
    this.shdr_unif_matVP = gl.getUniformLocation(this.shdr_prog, 'vpMat');
    this.shdr_unif_matM = gl.getUniformLocation(this.shdr_prog, 'modelMat');
    this.shdr_unif_samp = gl.getUniformLocation(this.shdr_prog, 'samp');
    this.shdr_unif_cPos = gl.getUniformLocation(this.shdr_prog, 'cameraPos');
    this.shdr_unif_lDir = gl.getUniformLocation(this.shdr_prog, 'lightDir');
    this.shdr_unif_cCol = gl.getUniformLocation(this.shdr_prog, 'cloudColor');
    this.shdr_unif_time = gl.getUniformLocation(this.shdr_prog, 'time');

    // Background shader
    this.shdrSky_prog = initShaders(gl, 'sky.vert', 'sky.frag');
    this.shdrSky_unif_invMat = gl.getUniformLocation(this.shdrSky_prog, 
      'inv_mvp');
    this.shdrSky_unif_sampler = gl.getUniformLocation(this.shdrSky_prog,
      'samp');

    // Atmosphere shader
    this.shdrAtm_prog = initShaders(gl, 'atmosphere.vert', 'atmosphere.frag');
    this.shdrAtm_unif_matVP = gl.getUniformLocation(this.shdrAtm_prog, 'vpMat');
    this.shdrAtm_unif_matM = gl.getUniformLocation(this.shdrAtm_prog, 'modelMat');
    this.shdrAtm_unif_cPos = gl.getUniformLocation(this.shdrAtm_prog, 'cameraPos');
    this.shdrAtm_unif_lDir = gl.getUniformLocation(this.shdrAtm_prog, 'lightDir');

    // Configure Camera
    camera.setAspectX(canvas.width);
    camera.setAspectY(canvas.height);
    camera.zoomedFocus = [0, 0, 0];
    camera.zoomedFTarget = camera.zoomedFocus;

    // Set up vertex buffers and the sky
    this.initObj(ball);
    this.initSky(skies[this.whichSky]);

    // Set cloud color
    gl.useProgram(this.shdr_prog);
    gl.uniform3f(this.shdr_unif_cCol, 1.0, 1.0, 1.0);

    // At most 2 attributes per vertex will be used in any shader.
    gl.enableVertexAttribArray(0);
    gl.enableVertexAttribArray(1);
  }
};
