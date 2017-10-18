"use strict";
/**------------------------------------------------------------
// Initialization
//-----------------------------------------------------------*/
window.onload = function init() {

  var desiredHeight = document.body.clientHeight;
  var desiredWidth = document.body.clientWidth;
  $("#gl-canvas").width(desiredWidth);
  $("#gl-canvas").height(desiredHeight);
  $("#instrBox").width(desiredWidth);

  var canvas = document.getElementById('gl-canvas');
  // These next two lines give canvas correct resolution
  canvas.width = $("#gl-canvas").width();
  canvas.height = $("#gl-canvas").height();
  
  physics.init();
  graphics.init(canvas);
  controls.setUpEvents(canvas);
  tick();
};

//------------------------------------------------------------
// Game Loop
//------------------------------------------------------------
function tick() {
  requestAnimFrame(tick);
  graphics.render();
  physics.tick();
}
