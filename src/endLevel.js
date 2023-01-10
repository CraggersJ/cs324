import * as THREE from 'three';
import { Group, SphereGeometry, Vector3 } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const ambientLight = new THREE.PointLight( 0xffffff, 5, 100 );
ambientLight.position.set(0,20,50);
scene.add( ambientLight );

const light = new THREE.PointLight( 0xff0000, 1, 250 );
light.position.set(0,250,0);
scene.add( light );

const loader = new GLTFLoader();

var cave = [];

const listener = new THREE.AudioListener();
camera.add( listener );

// create a global audio source
const breakSound = new THREE.Audio( listener );
const song = new THREE.Audio( listener );


const audioLoader = new THREE.AudioLoader();


audioLoader.load( '../assets/sound/effects/wood-crate-destory-2-97263.mp3', function( buffer ) {
	breakSound.setBuffer( buffer );
	breakSound.setLoop( false );
	breakSound.setVolume( 0.3 );
});

audioLoader.load( '../assets/sound/music/TheElderScrollsIV-Oblivion-WingsofKynareth.mp3', function( buffer ) {
	song.setBuffer( buffer );
	song.setLoop( false );
	song.setVolume( 0.2 );
});

loader.load( './assets/environments/exit/EndStage.glb', function ( gltf ) {

    gltf.scene.traverse(o => {if (o.isMesh){o.material.opacity = 1; o.material.transparent = true; cave.push(o)}})
    gltf.scene.scale.set(10,10,10);
    scene.add(gltf.scene);

}, undefined, function ( error ) {

	console.error( error );

} );

loader.load( './assets/models/bed/BrokenBed.glb', function ( gltf ) {

    gltf.scene.traverse(o => {if (o.isMesh){o.material.opacity = 1; o.material.transparent = true; cave.push(o)}})
    gltf.scene.scale.set(10, 10,10);
    gltf.scene.position.set(0,0, 0);
    
    scene.add(gltf.scene);

}, undefined, function ( error ) {

	console.error( error );

} );

var myFont;
var textMesh;

var fontLoader = new FontLoader();



var astralGroup = new THREE.Group();
var sphereMesh = new THREE.Mesh(new THREE.SphereGeometry(2,32,32), new THREE.MeshBasicMaterial())
sphereMesh.position.set(2,20,100)
astralGroup.add(sphereMesh);
for (let i = 0; i < 100; i++)
{
    var starMesh = new THREE.Mesh(new THREE.SphereGeometry(0.2,2,2), new THREE.MeshBasicMaterial())
    starMesh.position.set(Math.random()*500 - 250, Math.random()*200-100, 100)
    astralGroup.add(starMesh);
}
scene.add(astralGroup)


var cutscene = true;
var fallTime = 0;
var LieTime = 0;
var GetUpTime = 0;
var LookToBedTime = 0;
var LookAtBedTime = 0;
var LookOutsideTime = 0;
var hangTime = 0;
var fadeTime = 0;
var starHangTime = 0;
var starRotateTime = 0;
var textFade = 0;
var textHang = 0;

var breakSoundHasPlayed = false;

var loadingNext = false;


camera.position.y = 100;
camera.position.z = 0;
camera.rotation.y = Math.PI;
camera.rotation.x = -Math.PI/2

var prevTime = performance.now(); 

function cutsceneFunction()
{
    const time = performance.now(); 

    requestAnimationFrame( cutsceneFunction );
    
    if (fallTime < 2)
    {
        camera.position.lerpVectors(new THREE.Vector3(0,200,0), new THREE.Vector3(0, 5, 0), fallTime/2);
        if (fallTime > 1.8 && !breakSoundHasPlayed)
        {
            breakSound.play()
            breakSoundHasPlayed = true;
        }
        fallTime += (time - prevTime)/1000
    }
    else if (LieTime < 2)
    {
        
        LieTime += (time - prevTime)/1000
    }
    else if (GetUpTime < 2)
    {
        if (!song.isPlaying)
        {
            song.play()
        }
        camera.position.lerpVectors(new THREE.Vector3(0,5,0), new THREE.Vector3(20,20, 0), GetUpTime/2);
        camera.rotation.x = -Math.PI/2 * (2 - GetUpTime)/2
        camera.rotation.y = Math.PI - Math.PI/2 * GetUpTime/2 
        GetUpTime += (time - prevTime)/1000
    }
    else if (LookToBedTime < 1)
    {
        camera.rotateOnWorldAxis(new Vector3(0,0,1), Math.PI/4/100);
        LookToBedTime += (time - prevTime)/1000
    }
    else if (LookAtBedTime < 1)
    {
        LookAtBedTime += (time - prevTime)/1000
    }
    else if (LookOutsideTime < 0.5)
    {
        camera.rotateOnWorldAxis(new Vector3(0,0,-1), Math.PI/4/50);
        LookOutsideTime += (time - prevTime)/1000
    }
    else if (hangTime < 1)
    {   
        hangTime += (time - prevTime)/1000
    }
    else if (fadeTime < 2)
    {
        for (let i = 0; i< cave.length; i++)
        {
            cave[i].material.opacity = 1 * (2-fadeTime)/2
        }
        camera.rotation.y = Math.PI/2 - Math.PI/2 * (fadeTime)/2 
        camera.position.lerpVectors(new THREE.Vector3(20,20, 0), new THREE.Vector3(0,15, 0), fadeTime/2);
        fadeTime += (time - prevTime)/1000
    }
    else if (starHangTime < 3)
    {
        if (cave.length > 0)
        {
            for (let i = 0; i < cave.length; i++)
            {
                scene.remove(cave[i])
            }
            fontLoader.load('https://unpkg.com/three@0.138.0/examples/fonts/helvetiker_regular.typeface.json', function (font) 
            {
                myFont = font
                const geometry = new TextGeometry("The End", {font: myFont, size: 1, height: 0.1});
                const material = new THREE.MeshBasicMaterial({color: 0xffffff, transparent: true, opacity: 0})
                textMesh = new THREE.Mesh(geometry, material);
                textMesh.rotation.y = Math.PI;
                textMesh.rotation.x = -Math.PI/2;
                const textBox = new THREE.Box3().setFromObject(textMesh);
                textMesh.position.set(textBox.max.x - textBox.min.x/2,30,0);
                scene.add(textMesh);
            })
            cave = []
        }
        starHangTime += (time - prevTime)/1000
    }
    else if (starRotateTime < 5)
    {
        camera.rotation.x = Math.PI - Math.PI/2 * starRotateTime/5
        starRotateTime += (time - prevTime)/1000
    }
    else if (textFade < 2)
    {
        textMesh.material.opacity = 1 * textFade/2
        textFade += (time - prevTime)/1000
    }
    else if (textHang < 3)
    {
        textHang += (time - prevTime)/1000
    }
    else
    {
        if (!loadingNext)
        {
            window.location.replace("../index.html")
            loadingNext = true;
        }
        
    }

    prevTime = time;

    renderer.render( scene, camera );

 
}

cutsceneFunction();

