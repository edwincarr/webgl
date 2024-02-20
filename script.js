
// WebGL got hands fr

const main = () => {
  /** @type {HTMLCanvasElement} */
  const canvas = document.querySelector('#glcanvas');
  /** @type {WebGLRenderingContext} */
  const gl = canvas.getContext('webgl2');

  if (gl === null) {
    alert("Unable to initialize WebGL. Your browser or machine may not support it.");
    return;
  };

  const triangle = [
    // top
    0.0, 0.5,
    // bottom-left
    -0.5, -0.5,
    // bottom-right
    0.5, -0.5
  ];

  // GPU's like to get one chunk of memory data not scattered pointers like what arrays in js do? if that makes sense?
  const triangleVerticesCPUBuffer = new Float32Array(triangle);

  // prepares space for gpu. not all the gpu is great for what we need to do or might not have space so preparing for space and functionality is key
  const triangleGeoBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleGeoBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, triangleVerticesCPUBuffer, gl.STATIC_DRAW);

  // gpu doesnt understand JS (obvi) so i need to write in glsl to be sent and compiled
  // line 38 dictates precision
  // lnie 40 creates a variable "in = attribute" "vec2 = specifies how many vertices" followed by a var name
  // gl_Position is a shader ? is a vec4, 0.0=z/depth, 1.0=w/

  const vertexShaderSourceCode = /*glsl*/ `#version 300 es
  precision mediump float;

  in vec2 vertexPosition;

  void main() {
    gl_Position = vec4(vertexPosition, 0.0, 1.0);
  }
  `

  // similar to above code of binding and prepping buffer we need to create shader var and compile
  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vertexShaderSourceCode);
  gl.compileShader(vertexShader);

  if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    const compileError = gl.getShaderInfoLog(vertexShader);
    console.log(`Failed to COMPILE vertex shader - ${compileError}`);
    return;
  }

  const fragmentShaderSourceCode = /*glsl*/ `#version 300 es
  precision mediump float;

  out vec4 outputColor;

  void main() {
    outputColor = vec4(1.0,0.0,1.0,1.0);
  }
  `

  // create anad compile fragment shader similar to above vertex shader
  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, fragmentShaderSourceCode);
  gl.compileShader(fragmentShader)

  if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    const compileError = gl.getShaderInfoLog(fragmentShader);
    console.log(`Failed to COMPILE fragment shader - ${compileError}`);
    return;
  }

  // apparently we cant send over individual shaders so we need to combine and
  const triangleShader = gl.createProgram();
  gl.attachShader(triangleShader, vertexShader);
  gl.attachShader(triangleShader, fragmentShader);
  gl.linkProgram(triangleShader);

  // could still get an error if shaders are incompatabile
  if(!gl.getProgramParameter(triangleShader, gl.LINK_STATUS)) {
    const linkError = gl.getProgramInfoLog(triangleShader);
    console.log(`Failed to LINK shaders - ${linkError}`)
    return;
  }

  // we need to reference variables: in this case "vertexPosition" set in the vertexShader. variables for glsl are "always?" indexed from when they are used so this var is safe to say 0 but we need to check just in case
  const vertexPositionAttribLocation = gl.getAttribLocation(triangleShader, 'vertexPosition')
  if(vertexPositionAttribLocation < 0) {
    console.log(`Failed to get attrib location`)
    return;
  }

  // I kinda give up on comments but this section is sending the information along with instructions on how to render to canvas
  canvas.width = canvas.clientWidth
  canvas.height = canvas.clientHeight
  
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.viewport(0,0, canvas.width, canvas.height)

  gl.useProgram(triangleShader)
  gl.enableVertexAttribArray(vertexPositionAttribLocation)

  gl.bindBuffer(gl.ARRAY_BUFFER, triangleGeoBuffer)
  gl.vertexAttribPointer(
    vertexPositionAttribLocation,
    2,
    gl.FLOAT,
    false,
    2* Float32Array.BYTES_PER_ELEMENT,
    0
  )

  gl.drawArrays(gl.TRIANGLES, 0, 3)
}


main()