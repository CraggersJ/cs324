import * as THREE from 'three';
import { Group, SphereGeometry, Vector3 } from 'three';
import { PointerLockControls } from '../node_modules/three/examples/jsm/controls/PointerLockControls.js';
import { GLTFLoader } from '../node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import { TextGeometry } from '../node_modules/three/examples/jsm/geometries/TextGeometry.js';
import { OutlinePass } from '../node_modules/three/examples/jsm/postprocessing/OutlinePass.js';
import { RenderPass } from '../node_modules/three/examples/jsm/postprocessing/RenderPass.js';
import { EffectComposer } from '../node_modules/three/examples/jsm/postprocessing/EffectComposer.js';
import { FontLoader } from '../node_modules/three/examples/jsm/loaders/FontLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
let controls;

var reticle = new THREE.Mesh(
    new THREE.CircleGeometry( 0.01, 32),
    new THREE.MeshBasicMaterial( {color: 0xffffff, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, transparent: true, opacity: 0.5 })
  );
  reticle.position.z = -1;
  reticle.lookAt(camera.position)

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const light = new THREE.PointLight( 0xadd8e6, 1, 50);
light.position.set( 0, 19, -20 );
scene.add( light );

const redLight = new THREE.PointLight( 0xff6000, 2, 50);
redLight.position.set( 0, 16, 14 );
scene.add( redLight );

const mouse = new THREE.Vector2();

var listener;

// create a global audio source
var drops;
var sound;
var bricks;

const ambientLight = new THREE.AmbientLight( 0xf9defd ); // soft white light
ambientLight.intensity = 0.1;
scene.add( ambientLight );

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;

let lockedIn = false;

let headBobMagnitude = 0.05;

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
    }

};

var selectedBricks = [];
var currentBrick;

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
        case 'Escape':
            controls.unlock();
            break;
        case 'KeyE':
            if (currentBrick != null && !selectedBricks.includes(currentBrick))
            {
                selectedBricks.push(currentBrick);
                var index = allBrickButtonMeshes.indexOf(currentBrick);
                currentBrick.position.z -= 0.075;
                allRomanNumeralsMeshes[index].position.x -= 0.75;
                allRomanNumeralsMeshes[index].material.color.set("#ffffff")
                if (bricks.isPlaying)
                {
                    bricks.stop();
                }
                bricks.play();

                if (selectedBricks.length == 3)
                {
                    var correct = true;
                    for (let i = 0; i < 3; i++)
                    {
                        selectedBricks[i].position.z += 0.075;
                        allRomanNumeralsMeshes[allBrickButtonMeshes.indexOf(selectedBricks[i])].position.x += 0.75;
                        allRomanNumeralsMeshes[allBrickButtonMeshes.indexOf(selectedBricks[i])].material.color.set('#1f51ff')

                        switch (i)
                        {
                            case 0:
                                correct = correct && randomArray[allBrickButtonMeshes.indexOf(selectedBricks[i])] == 13;
                                break;
                            case 1:
                                correct = correct && randomArray[allBrickButtonMeshes.indexOf(selectedBricks[i])] == 21;
                                break;
                            case 2:
                                correct = correct && randomArray[allBrickButtonMeshes.indexOf(selectedBricks[i])] == 34;
                                break;
                        }

                        console.log(randomArray[allBrickButtonMeshes.indexOf(selectedBricks[i])])
                        
                    }
                    selectedBricks = [];
                }
                if (correct)
                {
                    fall = true;
                }
            }
            else if (outlinePass.selectedObjects != 0 && !bricksShowing)
            {
                bricksShowing = true;
                for (let i = 0; i < 42; i++)
                {
                    allBrickButtons[i].position.x = -19;
                    allRomanNumeralsMeshes[i].position.x = -14.9;
                }
                sconceThree.rotation.z = -Math.PI/8;
                bricks.play()
            }
            break;

    }

};




document.addEventListener( 'keydown', onKeyDown );
document.addEventListener( 'keyup', onKeyUp );
camera.position.y = 15;
camera.position.z = -50;
camera.rotation.y = 0;
camera.rotation.x = Math.PI/2

const loader = new GLTFLoader();

loader.load( './assets/environments/prison_cell/prisonCell.glb', function ( gltf ) {

    gltf.scene.scale.set(10,10,10);
    scene.add(gltf.scene);

}, undefined, function ( error ) {

	console.error( error );

} );

loader.load( './assets/models/door/door.glb', function ( gltf ) {

    gltf.scene.scale.set(10, 10,10);
    gltf.scene.position.set(0,0, 16.1);
    
    scene.add(gltf.scene);

}, undefined, function ( error ) {

	console.error( error );

} );

loader.load( './assets/models/vine/VineLeaf.glb', function ( gltf ) {

    gltf.scene.scale.set(10, 10,10);
    gltf.scene.rotation.y = Math.PI;
    gltf.scene.position.set(-2,16.5, -16);
    
    scene.add(gltf.scene);

}, undefined, function ( error ) {

	console.error( error );

} );

loader.load( './assets/models/bed/Bed.glb', function ( gltf ) {

    gltf.scene.scale.set(9,10,10);
    gltf.scene.position.set(9,0,-3);
    
    scene.add(gltf.scene);

}, undefined, function ( error ) {

	console.error( error );

} );


function intToRomanNumerals(int)
{
    let romanNumeralArray = 
    ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X",
        "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX",    
        "XXI", "XXII", "XXIII", "XXIV", "XXV", "XXVI", "XXVII", "XXVIII", "XXIX", "XXX",
        "XXXI", "XXXII", "XXXIII", "XXXIV", "XXXV", "XXXVI", "XXXVII", "XXXVIII", "XXXIX", "XL",  
        "XLI", "XLII"                      
    ]
    return romanNumeralArray[int];
}

var myFont;
var textMesh;

var fontLoader = new FontLoader();


fontLoader.load('../node_modules/three/examples/fonts/helvetiker_regular.typeface.json', function (font) 
{
    myFont = font
    const geometry = new TextGeometry("Click anywhere to Begin...", {font: myFont, size: 5, height: 0.1});
    const material = new THREE.MeshBasicMaterial({color: 0xffffff})

    textMesh = new THREE.Mesh(geometry, material)
    const textBox = new THREE.Box3().setFromObject(textMesh);

    textMesh.position.set(textBox.min.x - textBox.max.x/2,100,-50);
    textMesh.rotation.x = Math.PI/2
    scene.add(textMesh);
    document.addEventListener('click', startGame);
    renderer.render(scene, camera)
})




function randomNumberArray()
{
    var list = []
    for (let i = 1; i < 43; i++)
    {
        list.push(i);
    }

    for (let i = list.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = list[i];
        list[i] = list[j];
        list[j] = temp;
    }

    return list;
}

var allBrickButtons = [];
var allBrickButtonMeshes = [];
var allRomanNumeralsMeshes = [];
var randomArray = randomNumberArray();


loader.load( './assets/models/sconce/BrickButton.glb', function ( gltf ) {

    gltf.scene.scale.set(10, 10, 10);
    gltf.scene.position.set(-21,18.5,12);
    gltf.scene.rotation.set(0,Math.PI/2,0)

    var textMesh;
    for (let i = 0; i < 7; i++)
    {
        for (let j = 0; j < 6; j++)
        {
            var current = gltf.scene.clone();
            current.position.z -= 4*i;
            current.position.y -= 3*j;
            allBrickButtons.push(current);
            current.traverse((o) =>{
                if (o.isMesh)
                {
                    allBrickButtonMeshes[j*7 + i] = o;
                }
            })
            scene.add(current);
            textMesh = new THREE.Mesh(new TextGeometry(intToRomanNumerals(randomArray[j*7 + i]), {font: myFont, size: 0.5, height: 1}), new THREE.MeshBasicMaterial({color: 0x1f51ff}))
            textMesh.rotation.set(0,Math.PI/2,0)
            textMesh.position.x = -16.9;
            textMesh.position.y = current.position.y - 0.5;
            textMesh.position.z = current.position.z + 1;
            scene.add(textMesh);
            allRomanNumeralsMeshes[j*7 + i] = textMesh
        }
    } 

}, undefined, function ( error ) {

	console.error( error );

} );


var textureLoader = new THREE.TextureLoader();
var mesh = new THREE.Mesh(new THREE.BoxGeometry(10,10,10), new THREE.MeshLambertMaterial({map: textureLoader.load('./assets/images/Fib.png'), transparent: true}))
mesh.position.y = 14;
mesh.position.x = 19.9;
scene.add(mesh);

var trapdoor = new THREE.Mesh(new THREE.BoxGeometry(30,5,30), new THREE.MeshLambertMaterial({color: 0x121212}))
trapdoor.position.y = -2.5;
scene.add(trapdoor)


var astralGroup = new THREE.Group();
var sphereMesh = new THREE.Mesh(new THREE.SphereGeometry(2,32,32), new THREE.MeshBasicMaterial())
sphereMesh.position.set(-20,25,-100)
astralGroup.add(sphereMesh);
for (let i = 0; i < 100; i++)
{
    var starMesh = new THREE.Mesh(new THREE.SphereGeometry(0.2,2,2), new THREE.MeshBasicMaterial())
    starMesh.position.set(Math.random()*500 - 250, Math.random()*500-250, -250)
    astralGroup.add(starMesh);
}
scene.add(astralGroup)

const sconceLightOne = new THREE.PointLight(0xff6000, 1, 20);
const sconceLightTwo = new THREE.PointLight(0xff6000, 1, 20);
var sconceThree;

loader.load( './assets/models/sconce/wallSconce.glb', function ( gltf ) {

    gltf.scene.scale.set(15,15,15);
    var sconceOne = gltf.scene;
    var sconceTwo = sconceOne.clone();
    sconceThree = sconceOne.clone();

    sconceThree.position.set(7.5, 15, 13.9);
    scene.add(sconceThree);

    scene.add(sconceOne);
    sconceOne.position.y = 18;
    sconceOne.position.x = -15;
    sconceOne.position.z = 44;
    sconceLightOne.position.set(-15,21,44);
    scene.add(sconceLightOne)

    scene.add(sconceTwo);
    sconceTwo.position.y = 18;
    sconceTwo.position.x = 15;
    sconceTwo.position.z = 44;
    sconceLightTwo.position.set(15,21,44);
    scene.add(sconceLightTwo)

}, undefined, function ( error ) {

	console.error( error );

} );

function isOutBounds(position)
{
    if (position.x > 3 || position.x < -13)
    {
        return true;
    }
    else if (position.z > 13 || position.z < -13)
    {
        return true;
    }

    return false;
}

renderer.domElement.addEventListener( 'pointermove', onPointerMove );

function onPointerMove( event ) {

    if ( event.isPrimary === false ) return;

    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

let prevTime = performance.now();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

var flickerSpeed = 5;
var counter = 0;

const raycaster = new THREE.Raycaster();

const roomBounds = [];

var walking  = false;
var timeSinceWalking;
var timeSinceStoppedWalking;

const composer = new EffectComposer( renderer );

const renderPass = new RenderPass( scene, camera );
composer.addPass( renderPass );

var outlinePass = new OutlinePass( new THREE.Vector2( window.innerWidth, window.innerHeight ), scene, camera );
outlinePass.visibleEdgeColor.set("#1f51ff");
composer.addPass( outlinePass );

var fall = false;


var cutscene = true;
var fadeTime = 0;
var rotateTime = 0;
var hangTime = 0;
var slideTime = 0;
var trapdoorSlideTime = 0;

var bricksShowing = false;

function animate() {
    requestAnimationFrame( animate );

    const time = performance.now();

    if (lockedIn)
    {
        if (bricksShowing)
        {
            raycaster.setFromCamera(new THREE.Vector2(), camera);
            const intersects = raycaster.intersectObjects(allBrickButtons, true);

            if ( intersects.length > 0 ) {

                outlinePass.selectedObjects = [intersects[0].object];
                currentBrick = intersects[0].object;

            } else {

                outlinePass.selectedObjects = [];
                currentBrick = null;
            }
        }
        else
        {
            raycaster.setFromCamera(new THREE.Vector2(), camera);
            const intersects = raycaster.intersectObject(sconceThree, true);

            if ( intersects.length > 0 ) {

                outlinePass.selectedObjects = [sconceThree];

            } else {

                outlinePass.selectedObjects = [];
            }
        }

        

        const delta = ( time - prevTime ) / 1000;

        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;

        direction.z = Number( moveForward ) - Number( moveBackward );
        direction.x = Number( moveRight ) - Number( moveLeft );
        direction.normalize(); // this ensures consistent movements in all directions

        if ( moveForward || moveBackward ) velocity.z -= direction.z * 200.0 * delta;
        if ( moveLeft || moveRight ) velocity.x -= direction.x * 200.0 * delta;

        controls.moveRight( - velocity.x * delta );
        controls.moveForward( - velocity.z * delta );

        if (isOutBounds(camera.position))
        {
            controls.moveRight( + velocity.x * delta );
            controls.moveForward( + velocity.z * delta );
        }

        astralGroup.position.x = camera.position.x/10
        

        if (direction.length() != 0)
        {
            if (!walking)
            {
                timeSinceWalking = time;
                walking = true;
            }
            camera.position.y += Math.sin(Math.PI/180 * (time - timeSinceWalking)) * headBobMagnitude;
        }
        else 
        {
            if (walking)
            {
                timeSinceStoppedWalking = 0;
                walking = false;
            }
            else 
            {
                timeSinceStoppedWalking += delta;
            }

            if (timeSinceStoppedWalking < 1 && !fall)
            {
                camera.position.lerp(new Vector3(camera.position.x ,15, camera.position.z), timeSinceStoppedWalking/1);
            }
        }

    }

    if (fall)
    {
        
        if (trapdoor.position.x < 30)
        {
            trapdoor.position.x += 0.1
        }
        
        if (camera.position.x < trapdoor.position.x - 15)
        {
            camera.position.y -= 1;
        }

        if (camera.position.y < -100)
        {
            window.location.replace("../level2.html")
            fall = false;
        }

    }

    prevTime = time;

    sconceLightOne.intensity = sconceLightTwo.intensity = Math.sin(Math.PI/180 * time) + 50;

    composer.render( scene, camera );
};

function titleScreen()
{

}

function cutsceneFunction()
{
    if (cutscene)
    {
        const time = performance.now(); 

        requestAnimationFrame( cutsceneFunction );
        
        if (fadeTime < 1)
        {
            textMesh.opacity = 1 - (fadeTime/1);
            fadeTime += (time - prevTime)/1000
        }
        else if (rotateTime < 5)
        {
            camera.rotation.x = (Math.PI/2) - (Math.PI/2 * rotateTime/5);
            rotateTime += (time - prevTime)/1000
        }
        else if (hangTime < 2)
        {
            if (camera.rotation.x != 0)
            {
                camera.rotation.x = 0;
            }

            hangTime += (time - prevTime)/1000
        }
        else if (slideTime < 5)
        {
            if (slideTime < 3)
            {
                camera.position.lerpVectors(new THREE.Vector3(0,15,-50), new THREE.Vector3(-1, 18, -15), slideTime/3);
            }
            else
            {
                camera.position.lerpVectors(new THREE.Vector3(-1, 18, -15), new THREE.Vector3(2, 15, 10), (slideTime-3)/2);
            }
            

            slideTime += (time - prevTime)/1000
        }
        else
        {
            sound.setVolume(0.1)
            cutscene = false;
        }

        prevTime = time;

        renderer.render( scene, camera );

    }
    else
    {
        requestAnimationFrame( animate );
        camera.add(reticle);

        controls = new PointerLockControls(camera, document.body);

        controls.addEventListener( 'lock', function () {

            lockedIn = true;
        
        } );
        
        controls.addEventListener( 'unlock', function () {
        
            lockedIn = false;
        
        } );
        const onClick = function (event)
        {
            if (!lockedIn)
            {
                controls.lock();
            }
        }
        document.addEventListener('click', onClick);

        scene.add(controls.getObject());
        drops.play();
    }
    
}

const startGame = function (event)
{
    listener = new THREE.AudioListener();
    camera.add( listener );

    drops = new THREE.Audio( listener );
    sound = new THREE.Audio( listener );
    bricks = new THREE.Audio( listener );


    const audioLoader = new THREE.AudioLoader();


    audioLoader.load( '../assets/sound/effects/droplets-in-a-cave-6785.mp3', function( buffer ) {
        drops.setBuffer( buffer );
        drops.setLoop( true );
        drops.setVolume( 0.2 );
    });

    audioLoader.load( '../assets/sound/music/TheElderScrollsIV-Oblivion-WingsofKynareth.mp3', function( buffer ) {
        sound.setBuffer( buffer );
        sound.setLoop( true );
        sound.setVolume( 0.2 );
        sound.play()
    });

    audioLoader.load( '../assets/sound/effects/stoneblockdragwoodgrind-82327.mp3', function( buffer ) {
        bricks.setBuffer( buffer );
        bricks.setVolume( 0.1 );
    });

    document.removeEventListener('click', startGame)
    prevTime = performance.now(); 
    cutsceneFunction()
}