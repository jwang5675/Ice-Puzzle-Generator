import {vec2, vec3} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Square from './geometry/Square';
import ScreenQuad from './geometry/ScreenQuad';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';

import MapGenerator from './game/MapGenerator';
import Player from './game/Player'


const controls = {
};

let square: Square;
let playerSprite: Square;
let screenQuad: ScreenQuad;
let time: number = 0.0;
let camera: Camera;

let mapGenerator: MapGenerator;
let player: Player;

function loadScene() {
  square = new Square();
  square.create();
  playerSprite = new Square;
  playerSprite.create();
  screenQuad = new ScreenQuad();
  screenQuad.create();

  // Set up Map Generator
  mapGenerator = new MapGenerator;
  let numSteps: number = mapGenerator.generateMap(20, 25);
  let map: string[][] = mapGenerator.getMap();

  let offsetsArray = [];
  let colorsArray = [];
  for (let x: number = 0; x < map.length; x++) {
    for (let y: number = 0; y < map[0].length; y++) {
      offsetsArray.push(x);
      offsetsArray.push(y);
      offsetsArray.push(0);

      if (map[x][y] == "O") {
        colorsArray.push(0.3);
        colorsArray.push(0.25);
        colorsArray.push(0.3);
      } else if (map[x][y] == "S") {
        colorsArray.push(1);
        colorsArray.push(0);
        colorsArray.push(0);
      } else if (map[x][y] == "E") {
        colorsArray.push(0);
        colorsArray.push(1);
        colorsArray.push(0);
      } else {
        colorsArray.push(0.5);
        colorsArray.push(0.8);
        colorsArray.push(1.0);
      }
      colorsArray.push(1.0);
    }
  }
  let offsets: Float32Array = new Float32Array(offsetsArray);
  let colors: Float32Array = new Float32Array(colorsArray);
  square.setInstanceVBOs(offsets, colors);
  square.setNumInstances(map.length * map[0].length);

  // Setup Player Class
  player = new Player(vec2.fromValues(mapGenerator.start.x, mapGenerator.start.y), map);
}

function updateScene(resizeFunc: any) {
  // Render Player and Update Camera
  let offsets: Float32Array = new Float32Array([player.position[0], player.position[1], 0.1]);
  let colors: Float32Array = new Float32Array([1, 1, 1, 1]);
  playerSprite.setInstanceVBOs(offsets, colors);
  playerSprite.setNumInstances(1);

  camera = new Camera(vec3.fromValues(player.position[0], player.position[1], 20), 
                      vec3.fromValues(player.position[0], player.position[1], 0));
  resizeFunc();
}

function main() {
  // Initial display for framerate
  const stats = Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);

  // Add controls to the gui and get canvas and webgl context
  const gui = new DAT.GUI();
  const canvas = <HTMLCanvasElement> document.getElementById('canvas');
  const gl = <WebGL2RenderingContext> canvas.getContext('webgl2');
  if (!gl) {
    alert('WebGL 2 not supported!');
  }
  setGL(gl);

  // Initial call to load scene
  loadScene();

  // Setup Camera and shader programs
  camera = new Camera(vec3.fromValues(0, 0, 20), vec3.fromValues(0, 0, 0));

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(0.2, 0.2, 0.2, 1);
  gl.enable(gl.DEPTH_TEST);
  gl.blendFunc(gl.ONE, gl.ONE);

  const instancedShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/instanced-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/instanced-frag.glsl')),
  ]);

  const flat = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/flat-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/flat-frag.glsl')),
  ]);

  // Setup window resize
  let resize = function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
    flat.setDimensions(window.innerWidth, window.innerHeight);
  }
  window.addEventListener('resize', resize, false);
  resize();

  // This function will be called every frame
  function tick() {
    updateScene(resize);

    camera.update();

    stats.begin();
    instancedShader.setTime(time);
    flat.setTime(time++);
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.clear();
    renderer.render(camera, flat, [
      screenQuad,
    ]);
    renderer.render(camera, instancedShader, [
      square,
      playerSprite
    ]);
    stats.end();

    requestAnimationFrame(tick);
  }

  // Start render loop
  tick();

  // Start Game Engine that updates every 0.3 seconds
  window.setInterval(function() {
    player.tick();
  }, 50);
}

main();
