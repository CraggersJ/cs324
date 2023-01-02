import * as THREE from 'three';
import { Vector3 } from 'three';
import { FBXLoader } from '../node_modules/three/examples/jsm/loaders/FBXLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const lightOne = new THREE.PointLight( 0xffffff, 1, 100 );
lightOne.position.set( 20, 5, 20 );
scene.add( lightOne );

const lightTwo = new THREE.PointLight( 0xffffff, 1, 100 );
lightTwo.position.set( -20, 5, 20 );
scene.add( lightTwo );

const lightThree = new THREE.PointLight( 0xffffff, 1, 100 );
lightThree.position.set( -20, 5, -20 );
scene.add( lightThree );

const lightFour = new THREE.PointLight( 0xffffff, 1, 100 );
lightFour.position.set( 20, 5, 20 );
scene.add( lightFour );

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;

let lockedIn = false;

let radius = 5;

var mousePosX,mousePosY;

var moleman;


const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const onKeyDown = function ( event ) {

    switch ( event.code ) {

        case 'ArrowUp':
        case 'KeyW':
            moveForward = true;
            break;

        case 'ArrowLeft':
        case 'KeyA':
            moveLeft = true;
            break;

        case 'ArrowDown':
        case 'KeyS':
            moveBackward = true;
            break;

        case 'ArrowRight':
        case 'KeyD':
            moveRight = true;
            break;

        case 'Space':
            if ( canJump === true ) velocity.y += 350;
            canJump = false;
            break;
        case 'Escape':
            lockedIn = false;

    }

};

const onKeyUp = function ( event ) {

    switch ( event.code ) {

        case 'ArrowUp':
        case 'KeyW':
            moveForward = false;
            break;

        case 'ArrowLeft':
        case 'KeyA':
            moveLeft = false;
            break;

        case 'ArrowDown':
        case 'KeyS':
            moveBackward = false;
            break;

        case 'ArrowRight':
        case 'KeyD':
            moveRight = false;
            break;

    }

};

const getMouseLocation = function (event)
{
    if (lockedIn)
    {
        mousePosX = event.x
        mousePosY = event.y
    }
}

const onClick = function (event)
{
    if (!lockedIn)
    {
        lockedIn = true;
        mousePosX = event.x
        mousePosY = event.y
    }
}

document.addEventListener( 'keydown', onKeyDown );
document.addEventListener( 'keyup', onKeyUp );

document.addEventListener('click', onClick);
document.addEventListener('mousemove', getMouseLocation);

const loader = new FBXLoader();
var mixer;
const animationActions = [];
const gui = new GUI()
const animationsFolder = gui.addFolder('Animations')
animationsFolder.open()

loader.load( './assets/models/player/player.fbx', (object) => {
    moleman = object;
    moleman.scale.set(0.02, 0.02, 0.02);
    mixer = new THREE.AnimationMixer(moleman);

    const animationAction = mixer.clipAction(
        moleman.animations[0]
    )
    animationActions.push(animationAction)
    animationsFolder.add(animations, 'default')
    activeAction = animationActions[0]

    scene.add(moleman)

    fbxLoader.load('./assets/models/player/animations/idle.fbx', (object) => {
        const animationAction = mixer.clipAction(object.animations[0]);
        animationActions.push(animationAction)
        animationsFolder.add(animations, "idle")

        },
        (xhr) => {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded')
        },
        (error) => {
            console.log(error)
        }
        )

}, undefined, function ( error ) {

	console.error( error );

} );

const SetCameraPosition = function ()
{
    camera.rotation.y = (Math.PI / 180) * ((mousePosX / window.innerWidth) * 720 + 360)
    camera.position.x = radius * Math.sin(camera.rotation.y) + moleman.position.x;
    camera.position.y = moleman.position.y + radius/2;
    camera.position.z = radius * Math.cos(camera.rotation.y) + moleman.position.z;
}

const geometry = new THREE.BoxGeometry( 20, 1, 20 );
const material = new THREE.MeshStandardMaterial( {color: 0xffffff} );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );
cube.position.y -= 0.5; 

function animate() {
    requestAnimationFrame( animate );

    if (moveRight && moleman != null && lockedIn) 
    {
        moleman.rotation.y = camera.rotation.y + (Math.PI / 180) * 90;
        moleman.position.x += 0.25 * Math.cos(camera.rotation.y);
        moleman.position.z -= 0.25 * Math.sin(camera.rotation.y);
    }
    else if (moveLeft && moleman != null && lockedIn)
    {
        moleman.rotation.y = camera.rotation.y + (Math.PI / 180) * 270;
        moleman.position.x -= 0.25 * Math.cos(camera.rotation.y);
        moleman.position.z += 0.25 * Math.sin(camera.rotation.y);
    }
    else if (moveForward && moleman != null && lockedIn)
    {
        moleman.rotation.y = camera.rotation.y + (Math.PI / 180) * 180;
        moleman.position.x -= 0.25 * Math.sin(camera.rotation.y);
        moleman.position.z -= 0.25 * Math.cos(camera.rotation.y);
    }
    else if (moveBackward && moleman != null && lockedIn)
    {
        moleman.rotation.y = camera.rotation.y;
        moleman.position.x += 0.25 * Math.sin(camera.rotation.y);
        moleman.position.z += 0.25 * Math.cos(camera.rotation.y);

    }
    else if (moleman != null)
    {

    }

    if (lockedIn)
    {
        SetCameraPosition();
    }

    renderer.render( scene, camera );
};

animate();