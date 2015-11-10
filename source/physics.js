var physics = {
  oldTime: performance.now(),
  animTime: undefined,
  animMaxTime: undefined,
  pausedTime: undefined,
  animHasStarted: false,
  animIsRunning: false,
  animSpeed: 1.0,

  tick: function() {
    this.newTime = performance.now();
    var dt = this.newTime - this.oldTime;

    ball.mat_model[0] = mult(ball.mat_model[0], rotateY(0.01 * dt));

    controls.handleKeys(dt);
    camera.tickShmooze(dt);

    if (this.animIsRunning) {
      var animLoopTime = this.newTime - this.animTime;
      if (animLoopTime > this.animMaxTime) {
        do {
          animLoopTime -= this.animMaxTime;
        } while (animLoopTime > this.animMaxTime)        
        this.animTime = this.newTime - animLoopTime;
      }
      if (this.animSpeed >= 1.0) {

      } else {

      }      
    }

    this.oldTime = this.newTime;
  },

  beginAnim: function() {
    this.animTime = performance.now();
    this.animIsRunning = true;
    this.animHasStarted = true;
  },

  pauseAnim: function() {
    this.pausedTime = performance.now();
    this.animIsRunning = false;
  },

  resumeAnim: function() {
    this.animTime += performance.now() - this.pausedTime;
    this.animIsRunning = true;
  },

  toggleAnim: function() {
    if (this.animHasStarted) {
      if (this.animIsRunning) {
        this.pauseAnim();
      } else {
        this.resumeAnim();
      }
    } else {
      this.beginAnim();
    }
  },

  init: function() {

    // resize spheres
    var i;
    for (i = 0; i < ball.vertices.length; ++i) {
      ball.vertices[i] *= 3.2;
    }
  }
};
