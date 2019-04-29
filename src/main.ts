import {vec2, vec3} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Square from './geometry/Square';
import ScreenQuad from './geometry/ScreenQuad';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';
import Texture from './rendering/gl/Texture';
import MapGenerator from './game/MapGenerator';
import Player from './game/Player';
import PerformanceTest from './game/PerformanceTest';


const controls = {
  'Start Over': reset,
  'Quit': quit,
};

let square: Square;
let playerSprite: Square;
let screenQuad: ScreenQuad;
let time: number = 0.0;
let camera: Camera;

let texUp: Texture;
let texRight: Texture;
let texDown: Texture;
let texLeft: Texture;
let texIce: Texture;
let texRock: Texture;
let texEnd: Texture;

let mapGenerator: MapGenerator;
let player: Player;
let difficulty: string;
let numMapsCompleted: number = 0;

function reset() {
  player.position = vec2.fromValues(mapGenerator.start.x, mapGenerator.start.y);
}

function quit() {
  document.getElementById('game-wrapper').style.display = 'none';
  document.getElementById('main-wrapper').style.display = '';
  document.getElementById('maps-completed').innerHTML = "Number of maps completed: " + numMapsCompleted;
}

function loadGame() {
  // Set up Map Generator
  mapGenerator = new MapGenerator;
  let map: string[][] = mapGenerator.generateMap(20, 25, difficulty);

  let offsetsArray = [];
  let colorsArray = [];
  for (let x: number = 0; x < map.length; x++) {
    for (let y: number = 0; y < map[0].length; y++) {
      offsetsArray.push(x);
      offsetsArray.push(y);
      offsetsArray.push(0);

      if (map[x][y] == 'O') {
        colorsArray.push(0.3);
        colorsArray.push(0.25);
        colorsArray.push(0.3);
        colorsArray.push(0.1);
      } else if (map[x][y] == 'S') {
        colorsArray.push(1);
        colorsArray.push(0);
        colorsArray.push(0);
        colorsArray.push(1.0);
      } else if (map[x][y] == 'E') {
        colorsArray.push(0);
        colorsArray.push(1);
        colorsArray.push(0);
        colorsArray.push(0.2);
      } else {
        colorsArray.push(0.5);
        colorsArray.push(0.8);
        colorsArray.push(1.0);
        colorsArray.push(1.0);
      }
    }
  }
  let offsets: Float32Array = new Float32Array(offsetsArray);
  let colors: Float32Array = new Float32Array(colorsArray);
  square.setInstanceVBOs(offsets, colors);
  square.setNumInstances(map.length * map[0].length);

  // Setup Player Class
  player = new Player(vec2.fromValues(mapGenerator.start.x, mapGenerator.start.y), map);
}

function loadScene() {
  square = new Square();
  square.create();

  playerSprite = new Square;
  playerSprite.create();

  screenQuad = new ScreenQuad();
  screenQuad.create();

  // Web Texture
  texUp = new Texture('https://raw.githubusercontent.com/jwang5675/Ice-Puzzle-Generator/master/img/pikachu_up.png', 0);
  texRight = new Texture('https://raw.githubusercontent.com/jwang5675/Ice-Puzzle-Generator/master/img/pikachu_right.png', 0);
  texDown = new Texture('https://raw.githubusercontent.com/jwang5675/Ice-Puzzle-Generator/master/img/pikachu_down.png', 0);
  texLeft = new Texture('https://raw.githubusercontent.com/jwang5675/Ice-Puzzle-Generator/master/img/pikachu_left.png', 0);
  texIce = new Texture('https://raw.githubusercontent.com/jwang5675/Ice-Puzzle-Generator/master/img/ice.png', 0);
  texRock = new Texture('https://raw.githubusercontent.com/jwang5675/Ice-Puzzle-Generator/master/img/rock.png', 0);
  texEnd = new Texture('https://raw.githubusercontent.com/jwang5675/Ice-Puzzle-Generator/master/img/end.png', 0);

  // Uncomment to run locally
  // texUp = new Texture('../img/pikachu_up.png', 0);
  // texRight = new Texture('../img/pikachu_right.png', 0);
  // texDown = new Texture('../img/pikachu_down.png', 0);
  // texLeft = new Texture('../img/pikachu_left.png', 0);
  // texIce = new Texture('../img/ice.png', 0);
  // texRock = new Texture('../img/rock.png', 0);
  // texEnd = new Texture('../img/end.png', 0);

  loadGame();
}

function updateScene(resizeFunc: any) {
  // Render Player and Update Camera
  let offsets: Float32Array = player.getPlayerVBO();
  let colors: Float32Array = new Float32Array([1, 1, 1, 1]);
  playerSprite.setInstanceVBOs(offsets, colors);
  playerSprite.setNumInstances(1);

  camera.set(vec3.fromValues(player.position[0], player.position[1], 20), 
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
  gui.add(controls, 'Start Over');
  gui.add(controls, 'Quit')
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
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  const instancedShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/instanced-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/instanced-frag.glsl')),
  ]);

  const flat = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/flat-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/flat-frag.glsl')),
  ]);

  // TESTING TEXTURES START HERE
  instancedShader.bindTexToUnit(instancedShader.unifSampler1, texUp, 0);
  instancedShader.bindTexToUnit(instancedShader.unifSampler2, texRight, 1);
  instancedShader.bindTexToUnit(instancedShader.unifSampler3, texDown, 2);
  instancedShader.bindTexToUnit(instancedShader.unifSampler4, texLeft, 3);
  instancedShader.bindTexToUnit(instancedShader.unifSampler5, texIce, 4);
  instancedShader.bindTexToUnit(instancedShader.unifSampler6, texRock, 5);
  instancedShader.bindTexToUnit(instancedShader.unifSampler7, texEnd, 6);


  // Setup Event Listeners
  let resize = function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
    flat.setDimensions(window.innerWidth, window.innerHeight);
  }
  window.addEventListener('resize', resize, false);
  resize();
  document.getElementById('easy').addEventListener('click', function(){
    document.getElementById('main-wrapper').style.display = 'none';
    document.getElementById('game-wrapper').style.display = '';
    difficulty = 'easy';
    loadGame();
  });
  document.getElementById('medium').addEventListener('click', function(){
    document.getElementById('main-wrapper').style.display = 'none';
    document.getElementById('game-wrapper').style.display = '';
    difficulty = 'medium';
    loadGame();
  });
  document.getElementById('hard').addEventListener('click', function(){
    document.getElementById('main-wrapper').style.display = 'none';
    document.getElementById('game-wrapper').style.display = '';
    difficulty = 'hard';
    loadGame();
  });

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
      playerSprite,
    ]);
    stats.end();

    requestAnimationFrame(tick);
  }

  // Start Game Engine and Render Loop
  window.setInterval(function() {
    if (player.completed) {
      numMapsCompleted = numMapsCompleted + 1;
      quit();
      loadGame();
    } else {
      player.tick();
    }
  }, 20);
  tick();

  // Uncomment to run performance test
  // let test: PerformanceTest = new PerformanceTest();
  // test.runPerformanceTest();
}

main();
