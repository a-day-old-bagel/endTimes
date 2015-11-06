var controls = {
  mouseSense: -0.005,
  zoomSense: 0.004,
  keyIsPressed: [],
  discardEvent: function(e) {
    return false;
  },
  renewTime: function(e) {
    physics.oldTime = performance.now();
  },
  mouseCamPan: function(e) {
    if (e.buttons & 1) { // if left click held
      camera.rotateTheta(controls.mouseSense * e.movementX);
      camera.rotatePhi(controls.mouseSense * e.movementY);
    }
  },
  mouseWheelZoom: function(e) {
    camera.applyZoom(controls.zoomSense * e.deltaY);
    return false;
  },
  handleKeyDown: function(e) {
    switch (e.keyCode) {
      case 37: // left
      case 38: // up
      case 39: // right
      case 40: // down
        return false; // Don't scroll the page!
      case 32: // spacebar
        physics.toggleAnim();
        return false; // Don't scroll the page!;
      default:
        // To see what the code for a certain key is, uncomment this line,
        // reload the page in the browser and press the key.
        // console.log("Unrecognized key press: " + e.keyCode);
        break;
    }
  },
  handleKeyUp: function(e) {
    switch (e.keyCode) {
      case 37: // left
      case 38: // up
      case 39: // right
      case 40: // down
        controls.keyIsPressed[e.keyCode - 37] = false;
        return false; // Don't scroll the page!
      default:
        break;
    }
  },
  handleKeys: function(dt) {
    if (this.keyIsPressed[0]) { // left
      camera.rotateTheta(controls.mouseSense * dt);
    }
    if (this.keyIsPressed[1]) { // up
      camera.applyZoom(controls.zoomSense * -dt);
    }
    if (this.keyIsPressed[2]) { // right
      camera.rotateTheta(controls.mouseSense * -dt);
    }
    if (this.keyIsPressed[3]) { // down
      camera.applyZoom(controls.zoomSense * dt);
    }
  },
  setUpEvents: function(canvas) {

    window.onfocus = this.renewTime;
    document.onkeydown = this.handleKeyDown;
    document.onkeyup = this.handleKeyUp;
    canvas.oncontextmenu = this.discardEvent;
    canvas.onmousemove = this.mouseCamPan;
    canvas.onwheel = this.mouseWheelZoom;
  }
};
