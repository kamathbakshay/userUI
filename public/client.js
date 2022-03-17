import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

let output = null;
let model = null;
let renderer = null;
let scene = null;
let camera = null;
let glasses = null;
let canvas = null;
let textureLoader = null;
let gltfmodel = null;
let mesh = null;
let head = null;
let pause = false;
let smile_level = 1;
let mediapipe = null;
let material = null, geometry = null;

var map = {
    'sad': 0,
    'smile': 1,
    'eye_socket1': 2,
    'eye_socket2': 3
}

var loader = new THREE.TextureLoader();
loader.crossOrigin = '';

function init() {

  // const container = document.createElement( 'div' );
  const container = document.getElementById( "container" )
  document.body.appendChild( container );

  camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.25, 20 );
  camera.position.set( 0, 0, 9.5 );

  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0xbbbbbb );

  new RGBELoader()
    .setPath( '/model/texture/' )
    .load( 'royal_esplanade_1k.hdr', function ( texture ) {

      texture.mapping = THREE.EquirectangularReflectionMapping;
      scene.environment = texture;
      render();

      const loader = new GLTFLoader().setPath( '/model/' );
      loader.load( 'skull6.6.glb', function ( gltf ) {
        model = gltf.scene;
        let skull = model.getObjectByName('skull');
        console.log('skull:', skull);
        scene.add( gltf.scene );
        render();
      });

    });

  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.outputEncoding = THREE.sRGBEncoding;
  container.appendChild( renderer.domElement );

  const controls = new OrbitControls( camera, renderer.domElement );
  controls.addEventListener( 'change', render ); // use if there is no animation loop
  controls.minDistance = 2;
  controls.maxDistance = 10;
  controls.target.set( 0, 0, - 0.2 );
  controls.update();

  window.addEventListener( 'resize', onWindowResize );

}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
  render();
}

function render() {
  renderer.render( scene, camera );
}

function setText( text ) {
    document.getElementById( "status" ).innerText = text;
}

function setSmileLevel(level) {
    document.getElementById("smile_level").innerText = level;
}

function drawLine( ctx, x1, y1, x2, y2 ) {
    ctx.beginPath();
    ctx.moveTo( x1, y1 );
    ctx.lineTo( x2, y2 );
    ctx.stroke();
}

function drawPoint( ctx, x, y, color) {
    ctx.beginPath();
    ctx.arc(x, y, 1, 0, 3 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
}

async function setupWebcam() {
    return new Promise( ( resolve, reject ) => {
        const webcamElement = document.getElementById( "webcam" );
        const navigatorAny = navigator;
        navigator.getUserMedia = navigator.getUserMedia ||
        navigatorAny.webkitGetUserMedia || navigatorAny.mozGetUserMedia ||
        navigatorAny.msGetUserMedia;
        if( navigator.getUserMedia ) {
            navigator.getUserMedia( { video: true },
                stream => {
                    webcamElement.srcObject = stream;
                    webcamElement.addEventListener( "loadeddata", resolve, false );
                },
            error => reject());
        }
        else {
            reject();
        }
    });
}

function distance(p1, p2) {
    var x1 = p1[0], y1 = p1[1];
    var x2 = p2[0], y2 = p2[1]
    var a = x1 - x2, b = y1 - y2;
    return Math.sqrt( a*a + b*b );
}

function f(x, mean) {
    const e = Math.E;
    const pi = Math.PI;
    const sigma = 3;

    var a = sigma*Math.sqrt(2*pi);
    var b = Math.pow((x - mean), 2)/(2*Math.pow(sigma,2))

    var ans = (1/a)*Math.pow(e, -b);

    return ans.toFixed(10);
}

// function isLoading(visible=true) {
//   var x = document.getElementById("loader");
//   if(visible) {
//     x.style.display = "block";
//   } else {
//     x.style.display = "none";
//   }
// }

async function trackFace() {
    if(pause == true) return;
    if(!model) {
      console.log('model not ready');
      requestAnimationFrame( trackFace );
      return;
    } else {
      console.log('model is ready');
    }

    const video = document.querySelector( "video" );

    render()

    const faces = await mediapipe.estimateFaces( {
        input: video,
        returnTensors: false,
        flipHorizontal: false,
    });

    let d = 0;
    let lip_h = 0, face_h = 0, lip_v = 0;

    if(faces.length <= 0) {
      console.log('finding face');
      requestAnimationFrame( trackFace );
      return;
    }
    let face = faces[0];

    d = distance(face.mesh[13], face.mesh[14]);

    lip_h = distance(face.mesh[61], face.mesh[291]);
    console.log('lip_h:', lip_h);

    face_h = distance(face.mesh[454], face.mesh[234]);
    console.log('face_h:', face_h);

    lip_v = distance(face.mesh[13], face.mesh[14]);
    console.log('lip_v:', lip_v);

    let smile = model.getObjectByName( 'skull' );
    let x = lip_h - 47;
    console.log('x:', x);
    if(x <= 7) {
        // sad
        smile.morphTargetInfluences[map['sad']] = 1;
        smile.morphTargetInfluences[map['smile']] = 0;
        // smile.morphTargetInfluences[3] = 1;
        // smile_level = 1;
    } else if(x <= 14) {
        //smile
        // smile.morphTargetInfluences[1] = 0;
        // smile.morphTargetInfluences[2] = 0;
        // smile.morphTargetInfluences[3] = 1;
        // smile_level = 2;
    } else if(x <= 21) {
        //smile more
        smile.morphTargetInfluences[map['smile']] = 1;
        smile.morphTargetInfluences[map['sad']] = 0;
        // smile.morphTargetInfluences[3] = 1;
        // smile_level = 3;
    }
    // setSmileLevel(String(smile_level));
    requestAnimationFrame( trackFace );
}

async function main() {
    await setupWebcam();
    const video = document.getElementById( "webcam" );
    video.play();

    mediapipe = await faceLandmarksDetection.load(
        faceLandmarksDetection.SupportedPackages.mediapipeFacemesh
    );
    init();
    render();
    trackFace();
}

function updateSmile(params) {
    mesh.skeleton.bones[ 4 ].rotation.x = -0.1 * num;
}


main();

// window.addEventListener(
//     'resize',
//     () => {
//         camera.aspect = window.innerWidth / window.innerHeight
//         camera.updateProjectionMatrix()
//         renderer.setSize(window.innerWidth, window.innerHeight)
//         // render()
//         renderer.render( scene, camera );
//     },
//     false
// )

// let num = 1;

// document.getElementById("myBtn").addEventListener("click", function() {
//     // console.log('hi there')
//     // mesh.skeleton.bones[ 4 ].rotation.x = -0.1 * num;
//     mesh.skeleton.bones[ 5 ].position.set( 0, 0.158119, 0.030696 );
//     console.log('bone5-z:', mesh.skeleton.bones[ 5 ].position.z);
//     num++;
// });

// async function submitScore(score) {
//     const requestOptions = {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//             "surveyId": "90110",
//             "score": String(score)
//         }),
//     };
//     const response = await fetch("http://localhost:3002/testrealput", requestOptions);
//
//     const json = await response.json()
//     console.log('json response:', json);
// }
//
document.getElementById("capture").addEventListener("click", function(x) {
    pause = true;
    document.getElementById("capture").disabled = true;
    document.getElementById("submit").disabled = false;
    document.getElementById("retry").disabled = false;
    console.log('capture clicked');

});
document.getElementById("retry").addEventListener("click", function() {
    pause = false;
    document.getElementById("capture").disabled = false;
    document.getElementById("submit").disabled = true;
    document.getElementById("retry").disabled = true;
    trackFace();
    console.log('retry clicked');
});
//
document.getElementById("submit").addEventListener("click", function() {
    submitScore(String(smile_level));
    console.log('submit clicked');
});
