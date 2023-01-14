import * as THREE from 'three';
import { Vector2, Vector3 } from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
let controls = new PointerLockControls(camera, document.body);

controls.maxPolarAngle = Math.PI/2 + Math.PI/180 * 20;
controls.minPolarAngle = Math.PI/2  + Math.PI/180 * 10;

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const targetObject = new THREE.Object3D();
targetObject.position.set(0,75,-100);
scene.add(targetObject);
const light = new THREE.SpotLight( 0x2a2a2a, 100, 250, Math.PI/2, 1, 2);
light.position.set( 0, 50, 0 );

light.target = targetObject;
scene.add( light );


var text = ["Let's play a little game...", "I ask you three riddles...", "If you answer them correctly, you go free...", "If not, then you become my Amuse-bouche", "What runs but never walks, has a mouth but never talks?", "Still two more to go", "What goes up but never goes down?", "Lucky guess, now one more...", "What has one eye, but can't see?", "Why do I keep doing this?"]
var riddleAnswers = [["A RIVER", "RIVER"], ["YOUR AGE", "AGE", "MY AGE"], ["A NEEDLE", "NEEDLE"]];


const lightTwo = new THREE.PointLight( 0xaaaaff, 10, 250);
lightTwo.position.set( 0, 50, 150);
scene.add( lightTwo );

const listener = new THREE.AudioListener();
camera.add( listener );

// create a global audio source
const sound = new THREE.Audio( listener );


const audioLoader = new THREE.AudioLoader();


audioLoader.load( '../assets/sound/music/The Elder Scrolls IV - Oblivion - Tension.mp3', function( buffer ) {
	sound.setBuffer( buffer );
	sound.setLoop( true );
	sound.setVolume( 0.05 );
	sound.play();
});

var x = -5
var y = 5

var spidereyes = new THREE.Group();

for (let i = 0; i < 8; i++)
{
    var sphereMesh = new THREE.Mesh(new THREE.SphereGeometry(1.5,32,32), new THREE.MeshBasicMaterial({color: '#ff0000'}))
    if (i == 3)
    {
        x = -10;
        y = 0;
    }
    sphereMesh.position.set(x,y,-200);
    x += 5;
    spidereyes.add(sphereMesh);
    scene.add(spidereyes)
}




let lockedIn = false;

controls.addEventListener( 'lock', function () {

    lockedIn = true;

} );

controls.addEventListener( 'unlock', function () {

    lockedIn = false;

} );

var alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ ";
var answer = ""
var answerMesh = null

var currentRiddle = 0;
var currentSpeech = 0;
var nextSpeech = false;

const onKeyUp = function ( event ) {

    if (!lockTyping)
    {
        if (alphabet.includes(event.key))
        {
            answer += event.key;
            answer = answer.toUpperCase();
        }

        switch ( event.key ) {
            case 'Backspace':
                if (answer.length > 0)
                {
                    answer =  answer.substring(0, answer.length-1);
                }
            break;
            case 'Enter':
                if (riddleAnswers[currentRiddle].includes(answer))
                {
                    currentRiddle++
                    nextSpeech = true;
                    stopTimer = false;
                    answer = ""
                    if (currentRiddle == 3)
                    {
                        spiderTimer = 0;
                        spiderExit = true
                    }
                }
                else
                {
                    dead = true;
                }
                lockTyping = true
        }

        if (answerMesh != null) {
            scene.remove(answerMesh)
        }
        
        answerMesh = new THREE.Mesh(new TextGeometry(answer, {font: myFont, size: 10, height: 1}), new THREE.MeshBasicMaterial({color: 0x0000ff}))
        const answerBox = new THREE.Box3().setFromObject(answerMesh);

        answerMesh.position.set(answerBox.min.x - answerBox.max.x/2,-50,-100);
        scene.add(answerMesh);
    }
};

document.addEventListener( 'keyup', onKeyUp );


const onClick = function (event)
{
    if (!lockedIn)
    {
        controls.lock();
    }
}

scene.add(controls.getObject());

document.addEventListener('click', onClick);
camera.position.y = 500;
camera.position.z = 150;
camera.rotation.y = 0;

const loader = new GLTFLoader();

loader.load( './assets/environments/cave/cave.glb', function ( gltf ) {

    gltf.scene.scale.set(10,10,10);
    scene.add(gltf.scene);

}, undefined, function ( error ) {

	console.error( error );

} );

loader.load( './assets/models/web/spiderWeb.glb', function ( gltf ) {

    gltf.scene.scale.set(10,5,10);
    gltf.scene.rotation.x = -Math.PI/4;
    gltf.scene.position.set(0, 95, 150)
    const webLight = new THREE.SpotLight( 0xffffff, 10, 100, Math.PI/2, 1, 2);
    webLight.position.set(0,150,140);
    webLight.target = gltf.scene;
    scene.add(gltf.scene);
    scene.add(webLight)

}, undefined, function ( error ) {

	console.error( error );

} );

loader.load( './assets/models/bed/Bed.glb', function ( gltf ) {

    gltf.scene.scale.set(9,10,10);
    gltf.scene.rotation.x = 3 * Math.PI/4
    gltf.scene.position.set(15,92,135);
    
    scene.add(gltf.scene);

}, undefined, function ( error ) {

	console.error( error );

} );

var rightLeg;
var leftLeg;

loader.load( './assets/models/spiderLeg/SpiderLeg.glb', function ( gltf ) {

    gltf.scene.scale.set(10,10,10);
    leftLeg = gltf.scene;
    rightLeg = leftLeg.clone();
    
    leftLeg.position.set(-10,120,-250);
    leftLeg.rotation.x = -Math.PI/180 * 20

    rightLeg.position.set(10, 90, -250)
    rightLeg.rotation.x = -Math.PI/180*20
    rightLeg.rotation.z = Math.PI/2
    rightLeg.rotation.y = -Math.PI/180 * 10

    scene.add(leftLeg);
    scene.add(rightLeg)

}, undefined, function ( error ) {

	console.error( error );

} );

var myFont;
var textMesh

var fontLoader = new FontLoader();
fontLoader.load('https://unpkg.com/three@0.138.0/examples/fonts/helvetiker_regular.typeface.json', function (font) 
{
    myFont = font
})


function changeSpeech(speech)
{
    scene.remove(textMesh)
    textMesh = new THREE.Mesh(new TextGeometry(speech, {font: myFont, size: 7.5, height: 0.1}), new THREE.MeshBasicMaterial({color: 0xff0000}))
    const textBox = new THREE.Box3().setFromObject(textMesh);

    textMesh.position.set(textBox.min.x - textBox.max.x/2,175,-100);
    scene.add(textMesh);
}


var dead = false;
var deadTime = 0;

var lockTyping = true;

var spiderEnter = true;
var spiderExit = false;
var spiderTimer = 0;
var fall = false;
var webFade = false
var loadingNext = false;

var speechTimer = 0;
var stopTimer = true;

let prevTime = performance.now();



animate();