import * as THREE from 'three'
// import { GLTFLoader } from '/jsm/loaders/GLTFLoader.js'

// import * as THREE from '/build/three.module.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
// import Stats from 'three/examples/jsm/libs/stats.module'
// import { GUI } from 'three/examples/jsm/libs/dat.gui.module'

// const scene = new THREE.Scene()

// const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100)
// camera.position.z = 2

// const renderer = new THREE.WebGLRenderer()
// renderer.setSize(window.innerWidth, window.innerHeight)
// document.body.appendChild(renderer.domElement)

// const controls = new OrbitControls(camera, renderer.domElement)

// const geometry = new THREE.BoxGeometry()
// const material = new THREE.MeshBasicMaterial({
//     color: 0x00ff00,
//     wireframe: true,
// })
// const cube = new THREE.Mesh(geometry, material)
// scene.add(cube)

// const stats = Stats()
// document.body.appendChild(stats.dom)

// const gui = new GUI()
// const cubeFolder = gui.addFolder('Cube')
// cubeFolder.add(cube.scale, 'x', -5, 5)
// cubeFolder.add(cube.scale, 'y', -5, 5)
// cubeFolder.add(cube.scale, 'z', -5, 5)
// cubeFolder.open()
// const cameraFolder = gui.addFolder('Camera')
// cameraFolder.add(camera.position, 'z', 0, 10)
// cameraFolder.open()

// function animate() {
//     requestAnimationFrame(animate)
//     cube.rotation.x += 0.01
//     cube.rotation.y += 0.01
//     controls.update()
//     render()
//     stats.update()
// }

// function render() {
//     renderer.render(scene, camera)
// }

// animate()

// import * as THREE from './web/build/three.module.js';
// // import { OrbitControls } from './web/examples/jsm/controls/OrbitControls.js';
// import { GLTFLoader } from './web/examples/jsm/loaders/GLTFLoader.js';
// // import { MeshoptDecoder } from './web/examples/jsm/libs/meshopt_decoder.module.js';
// // import { FBXLoader } from './web/examples/jsm/loaders/FBXLoader.js';

function setText(text) {
    document.getElementById('status').innerText = text
}

function setSmileLevel(level) {
    document.getElementById('smile_level').innerText = 'Smile Score is' + level
}

function drawLine(ctx, x1, y1, x2, y2) {
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
}

function drawPoint(ctx, x, y, color) {
    ctx.beginPath()
    ctx.arc(x, y, 1, 0, 3 * Math.PI)
    // ctx.fillStyle = "Indigo";
    ctx.fillStyle = color
    ctx.fill()
}

async function setupWebcam() {
    return new Promise((resolve, reject) => {
        const webcamElement = document.getElementById('webcam')
        const navigatorAny = navigator
        navigator.getUserMedia =
            navigator.getUserMedia ||
            navigatorAny.webkitGetUserMedia ||
            navigatorAny.mozGetUserMedia ||
            navigatorAny.msGetUserMedia
        if (navigator.getUserMedia) {
            navigator.getUserMedia(
                { video: true },
                (stream) => {
                    webcamElement.srcObject = stream
                    webcamElement.addEventListener('loadeddata', resolve, false)
                },
                (error) => reject()
            )
        } else {
            reject()
        }
    })
}

let output = null
let model = null
let renderer = null
let scene = null
let camera = null
let glasses = null
let canvas = null
let textureLoader = null
let gltfmodel = null
let mesh = null
let head = null
let pause = false
let smile_level = 1

let map = null,
    material = null,
    geometry = null

// instantiate a texture loader
var loader = new THREE.TextureLoader()
//allow cross origin loading
loader.crossOrigin = ''

function loadModel(file) {
    return new Promise((res, rej) => {
        const loader = new GLTFLoader()
        loader.load(
            file,
            function (gltf) {
                res(gltf.scene)
            },
            undefined,
            function (error) {
                rej(error)
            }
        )
    })
}

function loadModel2(file) {
    textureLoader = new THREE.TextureLoader()
    // var texture = textureLoader.load('./texture/blue.jpg');
    return new Promise((res, rej) => {
        const loader = new THREE.GLTFLoader()
        // loader.load( file, function ( gltf ) {
        //     res( gltf.scene );
        // }
        loader.load(
            file,
            function (gltf) {
                console.log('gltf:', gltf)
                gltf.scene.scale.set(2, 2, 2)
                gltf.scene.position.x = 0 //Position (x = right+ left-)
                gltf.scene.position.y = 0 //Position (y = up+, down-)
                gltf.scene.position.z = 0 //Position (z = front +, back-)

                // scene.add( gltf.scene );
                gltfmodel = gltf.scene
                gltfmodel.traverse((o) => {
                    console.log(o)
                    if (o.isMesh && o.name == 'lefteye') {
                        // o.material = new THREE.MeshBasicMaterial({map: textureLoader.load('./texture/lefteye.png')});
                        o.material = new THREE.MeshBasicMaterial({
                            map: textureLoader.load('web/textures/mouth1.png'),
                        })
                    }
                    if (o.isMesh && o.name == 'righteye') {
                        // o.material = new THREE.MeshBasicMaterial({map: textureLoader.load('./texture/righteye.png')});
                        o.material = new THREE.MeshBasicMaterial({
                            map: textureLoader.load('web/textures/mouth1.png'),
                        })
                    }
                    if (o.isMesh && o.name == 'mouth') {
                        // o.material = new THREE.MeshBasicMaterial({map: textureLoader.load('./texture/mouth.png')});
                        o.material = new THREE.MeshBasicMaterial({
                            map: textureLoader.load('web/textures/mouth1.png'),
                        })
                    }
                    if (o.isMesh && o.name == 'Cube') {
                        // o.material = new THREE.MeshBasicMaterial({map: textureLoader.load('./texture/mouth.png')});
                        o.material = new THREE.MeshBasicMaterial({
                            map: textureLoader.load('web/textures/black.png'),
                        })
                    }
                })
                // scene.add( model );
                res(gltf.scene)
            },
            undefined,
            function (error) {
                rej(error)
            }
        )
    })
}

let morphChange = (x) => {
    gltfmodel.morphTargetInfluences[0] = x
}

function loadModel3(file) {
    return new Promise((res, rej) => {
        const loader = new GLTFLoader()
        loader.load(
            file,
            function (gltf) {
                mesh = new THREE.SkinnedMesh(gltf, new THREE.MeshNormalMaterial({ skinning: true }))
                gltfmodel = gltf.scene
                console.log('mesh:', mesh)
                // gltfmodel.morphTargetInfluences[0]=-1;
                res(gltf.scene)
            },
            undefined,
            function (error) {
                rej(error)
            }
        )
    })
}

function loadModel4(file) {
    return new Promise((res, rej) => {
        var loader = new FBXLoader()
        loader.load(
            file,
            function (object) {
                // object.position.x = 369.55682373046875;
                // object.position.y = -257.3762512207031;
                // object.position.z = 435.2278760032416;
                // object.updateMatrix();
                mesh = object.children[1]
                console.log('object:', object)
                console.log('mesh:', mesh)
                console.log('mesh.skeliton:', mesh.skeleton)
                // mesh.skeleton.bones[ 1 ].rotation.x = 100
                mesh.skeleton.bones[5].position.set(0, 10, 2)
                mesh.skeleton.bones[4].rotation.w = 1
                // mesh.skeleton.bones[ 4 ].position.set(-0.19675, -0.054306, -0.98901);
                // mesh.skeleton.bones[ 4 ].position.set(-0.19675, -0.054306, -0.98901);
                // mesh.skeleton.bones[ 5 ].rotation.set(-0.19675, -0.054306, -0.98901);
                console.log('child.isMesh:')
                object.traverse(function (child) {
                    if (child.isMesh) {
                        console.log(child)
                    }
                })
                res(object)
            },
            undefined,
            function (error) {
                rej(error)
            }
        )
    })
}
function distance(p1, p2) {
    var x1 = p1[0],
        y1 = p1[1]
    var x2 = p2[0],
        y2 = p2[1]
    var a = x1 - x2,
        b = y1 - y2
    return Math.sqrt(a * a + b * b)
}

function f(x, mean) {
    const e = Math.E
    const pi = Math.PI
    const sigma = 3

    var a = sigma * Math.sqrt(2 * pi)
    var b = Math.pow(x - mean, 2) / (2 * Math.pow(sigma, 2))

    var ans = (1 / a) * Math.pow(e, -b)

    return ans.toFixed(10)
}

// function plotOnBell(x, scale) {
//     //This is the real workhorse of this algorithm. It returns values along a bell curve from 0 - 1 - 0 with an input of 0 - 1.
//     scale = scale || false;
//     var stdD = .125
//     var mean = .5
//     if(scale) {
//       return  1 / (( 1/( stdD * Math.sqrt(2 * Math.PI) ) ) * Math.pow(Math.E , -1 * Math.pow(x - mean, 2) / (2 * Math.pow(stdD,2))));
//     } else {
//        return (( 1/( stdD * Math.sqrt(2 * Math.PI) ) ) * Math.pow(Math.E , -1 * Math.pow(x - mean, 2) / (2 * Math.pow(stdD,2)))) * plotOnBell(.5,true);
//     }
// }

async function trackFace() {
    console.log('track face called')
    if (pause == true) return
    let smile = glasses.getObjectByName('head')

    const video = document.querySelector('video')

    renderer.render(scene, camera)

    const faces = await model.estimateFaces({
        input: video,
        returnTensors: false,
        flipHorizontal: false,
    })
    // console.log(faces)

    // for(let x=-30;x<=50;x++) {
    //     // drawPoint(output, i, 100, "Green");
    //     // console.log('hello');
    //     console.log(x, ", ", f(x, 10)*100);
    // }

    let d = 0
    let lip_h = 0,
        face_h = 0,
        lip_v = 0
    faces.forEach((face) => {
        // console.log(face.mesh.length)
        output.clearRect(0, 0, canvas.width, canvas.height)
        for (let i = 0; i < face.mesh.length; i++) {
            // console.log(face.mesh[i]);
            let x = face.mesh[i][0]
            let y = face.mesh[i][1]
            // console.log(x)
            // output = output.getContext( "2d" );
            // output.translate( canvas.width, 0 );
            drawPoint(output, x, y, 'Indigo')
        }
        drawPoint(output, face.mesh[61][0], face.mesh[61][1], 'Green')
        drawPoint(output, face.mesh[291][0], face.mesh[291][1], 'Green')

        drawPoint(output, face.mesh[13][0], face.mesh[13][1], 'Red')
        drawPoint(output, face.mesh[14][0], face.mesh[14][1], 'Red')

        d = distance(face.mesh[13], face.mesh[14])

        lip_h = distance(face.mesh[61], face.mesh[291])
        console.log('lip_h:', lip_h)

        face_h = distance(face.mesh[454], face.mesh[234])
        console.log('face_h:', face_h)

        lip_v = distance(face.mesh[13], face.mesh[14])
        console.log('lip_v:', lip_v)

        // console.log('dis:', d);
        // console.log('ration:', lip_h/face_h);
        console.log('window.innerWidth:', window.innerWidth)

        drawPoint(output, face.mesh[234][0], face.mesh[234][1], 'Green')
        drawPoint(output, face.mesh[454][0], face.mesh[454][1], 'Green')

        drawPoint(output, face.mesh[10][0], face.mesh[10][1], 'Red')
        drawPoint(output, face.mesh[152][0], face.mesh[152][1], 'Red')
        // console.log(face.mesh[61][0]);
        // smile.morphTargetInfluences[0] = (face.mesh[61][0])%2;
    })
    // face.morphTargetInfluences[0] = (face.mesh[61][0] - face.mesh[291][0]);

    // // console.log('ding dong')
    // console.log()
    faces.forEach((face) => {
        // Draw the bounding box
        const x1 = face.boundingBox.topLeft[0]
        const y1 = face.boundingBox.topLeft[1]
        const x2 = face.boundingBox.bottomRight[0]
        const y2 = face.boundingBox.bottomRight[1]
        const bWidth = x2 - x1
        const bHeight = y2 - y1
        // drawLine( output, x1, y1, x2, y1 );
        // drawLine( output, x2, y1, x2, y2 );
        // drawLine( output, x1, y2, x2, y2 );
        // drawLine( output, x1, y1, x1, y2 );

        glasses.position.x = face.annotations.midwayBetweenEyes[0][0]
        glasses.position.y = -face.annotations.midwayBetweenEyes[0][1]
        glasses.position.z = -camera.position.z + face.annotations.midwayBetweenEyes[0][2]

        // console.log('model pos.x:', glasses.position.x);
        // console.log('model pos.y:', glasses.position.y);
        // console.log('model pos.z:', glasses.position.z);

        // model pos.x: 369.55682373046875
        // model pos.y: -257.3762512207031
        // model pos.z: 435.2278760032416

        // Calculate an Up-Vector using the eyes position and the bottom of the nose
        glasses.up.x = face.annotations.midwayBetweenEyes[0][0] - face.annotations.noseBottom[0][0]
        glasses.up.y = -(
            face.annotations.midwayBetweenEyes[0][1] - face.annotations.noseBottom[0][1]
        )
        glasses.up.z = face.annotations.midwayBetweenEyes[0][2] - face.annotations.noseBottom[0][2]
        const length = Math.sqrt(glasses.up.x ** 2 + glasses.up.y ** 2 + glasses.up.z ** 2)
        glasses.up.x /= length
        glasses.up.y /= length
        glasses.up.z /= length

        // Scale to the size of the head
        const eyeDist = Math.sqrt(
            (face.annotations.leftEyeUpper1[3][0] - face.annotations.rightEyeUpper1[3][0]) ** 2 +
                (face.annotations.leftEyeUpper1[3][1] - face.annotations.rightEyeUpper1[3][1]) **
                    2 +
                (face.annotations.leftEyeUpper1[3][2] - face.annotations.rightEyeUpper1[3][2]) ** 2
        )
        // glasses.scale.x = eyeDist / 6;
        // glasses.scale.y = eyeDist / 6;
        // glasses.scale.z = eyeDist / 6;

        // glasses.scale.x = eyeDist;
        // glasses.scale.y = eyeDist;
        // glasses.scale.z = eyeDist;
        glasses.scale.x = 3
        glasses.scale.y = 3
        glasses.scale.z = 3

        glasses.scale.x = 200
        glasses.scale.y = 200
        glasses.scale.z = 200

        glasses.rotation.y = Math.PI
        glasses.rotation.z = Math.PI / 2 - Math.acos(glasses.up.x)

        // glasses.rotation.y = 130.45;
        // console.log('rotation:', glasses.rotation.x);

        // mesh.skeleton.bones[ 4 ].rotation.w = 0.986 * (d/30);
        // mesh.skeleton.bones[ 4 ].rotation.x = -0.20 * (d/30);
        // mesh.skeleton.bones[ 3 ].rotation.x = 0.20 * (d/30);
    })
    var img = document.getElementById('myImage')

    let x = lip_h - 47
    // console.log('x:', x);
    if (x <= 7) {
        // sad
        head.morphTargetInfluences[1] = 0
        head.morphTargetInfluences[2] = 0
        head.morphTargetInfluences[3] = 1
        smile_level = 1
        img.src = 'images/bar1.png'
    } else if (x <= 14) {
        //smile
        head.morphTargetInfluences[1] = 1
        head.morphTargetInfluences[2] = 0
        head.morphTargetInfluences[3] = 0
        smile_level = 2
        img.src = 'images/bar2.png'
    } else if (x <= 21) {
        //smile more
        head.morphTargetInfluences[1] = 1
        head.morphTargetInfluences[2] = 1
        head.morphTargetInfluences[3] = 0
        smile_level = 3
        img.src = 'images/bar3.png'
    }

    setSmileLevel(String(smile_level))

    let xx = 0
    // xx = (lip_h/face_h)*200;
    xx = lip_h - 47
    console.log('xx:', xx)

    // let yy = 0;
    // yy = f(lip_v, 10)*200;
    // console.log('yy:', yy);
    // let res = xx + yy;
    // console.log('xy:', res);

    // if(res <= 8) {
    //     console.log('smile level: 1');
    //     // smile_level = 1;
    // } else if(res <= 16) {
    //     console.log('smile level: 2');
    //     // smile_level = 2;
    // } else if(res <= 24) {
    //     console.log('smile level: 3');
    //     // smile_level = 3;
    // } else if(res <= 32) {
    //     console.log('smile level: 4');
    //     // smile_level = 4;
    // } else {
    //     console.log('smile level: 5');
    //     // smile_level = 5;
    // }

    let yy = lip_v
    console.log('yy:', yy)

    console.log('xy:', xx + yy)

    // setSmileLevel(String(smile_level));
    requestAnimationFrame(trackFace)
}

async function main() {
    await setupWebcam()
    const video = document.getElementById('webcam')
    video.play()
    let videoWidth = video.videoWidth
    let videoHeight = video.videoHeight
    video.width = videoWidth
    video.height = videoHeight

    canvas = document.getElementById('output')
    canvas.width = video.width
    canvas.height = video.height

    let overlay = document.getElementById('overlay')
    overlay.width = video.width
    overlay.height = video.height

    output = canvas.getContext('2d')
    output.translate(canvas.width, 0)
    output.scale(-1, 1) // Mirror cam
    output.fillStyle = '#fdffb6'
    output.strokeStyle = '#fdffb6'
    output.lineWidth = 2

    // Load Face Landmarks Detection
    model = await faceLandmarksDetection.load(
        faceLandmarksDetection.SupportedPackages.mediapipeFacemesh
    )

    renderer = new THREE.WebGLRenderer({
        // canvas: document.getElementById('overlay'),
        alpha: true,
    })

    camera = new THREE.PerspectiveCamera(45, 1, 0.1, 2000)

    camera.position.x = videoWidth / 2
    camera.position.y = -videoHeight / 2
    camera.position.z = -(videoHeight / 2) / Math.tan(45 / 2) // distance to z should be tan( fov / 2 )

    console.log('cam x:', camera.position.x)
    console.log('cam y:', camera.position.y)
    console.log('cam z:', camera.position.z)

    // cam x: 320
    // cam y: -240
    // cam z: -430.22183686063295
    // camera.position.set( -30, -1, 1 );
    // camera.position.set( 320, -240, -430.22183686063295 );
    // camera.position.set( 320, -240, -2000 );

    console.log('cam x:', camera.position.x)
    console.log('cam y:', camera.position.y)
    console.log('cam z:', camera.position.z)

    scene = new THREE.Scene()
    scene.add(new THREE.AmbientLight(0xcccccc, 0.4))
    camera.add(new THREE.PointLight(0xffffff, 0.8))
    scene.add(camera)

    camera.lookAt({ x: videoWidth / 2, y: -videoHeight / 2, z: 0, isVector3: true })

    // Glasses from https://sketchfab.com/3d-models/heart-glasses-ef812c7e7dc14f6b8783ccb516b3495c
    // glasses = await loadModel( "web/3d/heart_glasses.gltf" );
    // glasses = await loadModel( "web/model/mouth_rig_add_shapekey.glb" );
    // glasses = await loadModel( "web/model/mouth_rig_add_shapekey2.glb" );
    // glasses = await loadModel( "/model/mouth_rig_add_shapekey2.glb" );
    glasses = await loadModel('/model/mouth_rig_add_shapekey3.glb')

    // glasses = await loadModel( "web/model/mouth_rig.glb" );
    // glasses = await loadModel2( "web/model/sphereFace.glb" );
    // glasses = await loadModel3( "web/model/snake.glb" );
    // glasses = await loadModel4( "web/model/snake.fbx" );
    // glasses = await loadModel4( "web/model/mouth_rig_untic-applyModifiers.fbx" );

    scene.add(glasses)

    console.log('glasses:', glasses)
    // let object=glasses.animation;
    // console.log('object:', object);

    head = glasses.getObjectByName('head_1')
    // let cube = head.getObjectByName('Cube');
    console.log('head:', head)
    // console.log('cube:', cube);

    //sad
    // head.morphTargetInfluences[1] = 0;
    // head.morphTargetInfluences[2] = 0;
    // head.morphTargetInfluences[3] = 1;

    //smile
    head.morphTargetInfluences[1] = 1
    head.morphTargetInfluences[2] = 0
    head.morphTargetInfluences[3] = 0

    //smile more
    // head.morphTargetInfluences[1] = 1;
    // head.morphTargetInfluences[2] = 1;
    // head.morphTargetInfluences[3] = 0;

    console.log('morphTarget:', head.morphTargetInfluences[1])

    setText('Loaded!')

    trackFace()
}

function updateSmile(params) {
    mesh.skeleton.bones[4].rotation.x = -0.1 * num
}

main()

window.addEventListener(
    'resize',
    () => {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        // renderer.setSize(window.innerWidth, window.innerHeight)
        // render()
        renderer.render(scene, camera)
    },
    false
)

// let num = 1;

// document.getElementById("myBtn").addEventListener("click", function() {
//     // console.log('hi there')
//     // mesh.skeleton.bones[ 4 ].rotation.x = -0.1 * num;
//     mesh.skeleton.bones[ 5 ].position.set( 0, 0.158119, 0.030696 );
//     console.log('bone5-z:', mesh.skeleton.bones[ 5 ].position.z);
//     num++;
// });

async function submitScore(score, surveyId) {
    const requestOptions = {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({   
            "surveyId": surveyId,
            "score": String(score)
        }),
    };
    const response = await fetch("http://localhost:3002/testrealput", requestOptions);
   
    const json = await response.json()
    console.log('json response:', json);
}

document.getElementById('capture').addEventListener('click', function () {
    pause = true
    console.log('capture clicked')
})

document.getElementById('retry').addEventListener('click', function () {
    pause = false
    trackFace()
    console.log('retry clicked')
})

document.getElementById("submit").addEventListener("click", function() {
    const surveyId = document.getElementById('surveyId').innerHTML;
    console.log('surveyId:', surveyId);
    submitScore(String(smile_level), surveyId);
    console.log('submit clicked');
    location.href = "/thankyou";
});

// document.getElementById("myBtn2").addEventListener("click", function() {
//     // console.log('hi there')
//     mesh.skeleton.bones[ 4 ].rotation.x = -0.1 * num;
//     num++;
// });
// document.getElementById("myBtn3").addEventListener("click", function() {
//     // console.log('hi there')
//     mesh.skeleton.bones[ 4 ].rotation.x = -0.1 * num;
//     num++;
// });
// document.getElementById("myBtn4").addEventListener("click", function() {
//     // console.log('hi there')
//     mesh.skeleton.bones[ 4 ].rotation.x = -0.1 * num;
//     num++;
// });
// document.getElementById("myBtn5").addEventListener("click", function() {
//     // console.log('hi there')
//     mesh.skeleton.bones[ 5 ].rotation.x = -0.1 * num;
//     num++;
// });
