import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';

//scene
const scene = new THREE.Scene();

//camera
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

//controls
let controls;

//reticle
var reticle = new THREE.Mesh(new THREE.CircleGeometry( 0.01, 32), new THREE.MeshBasicMaterial( {color: 0xffffff, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, transparent: true, opacity: 0.5 }));
reticle.position.z = -1;
reticle.lookAt(camera.position)

//renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

//audioListener
var listener = new THREE.AudioListener();
camera.add( listener );

//loaders
const audioLoader = new THREE.AudioLoader();
const fontLoader = new FontLoader();
const textureLoader = new THREE.TextureLoader();
const loader = new GLTFLoader();

//sounds
var drops = new THREE.Audio( listener );
var music = new THREE.Audio( listener );
var bricks = new THREE.Audio( listener );

//font
var myFont;

//lights
const light = new THREE.PointLight( 0xadd8e6, 1, 50);
light.position.set( 0, 19, -20 );
scene.add( light );

const redLight = new THREE.PointLight( 0xff6000, 2, 50);
redLight.position.set( 0, 16, 14 );
scene.add( redLight );

const ambientLight = new THREE.AmbientLight( 0xf9defd ); // soft white light
ambientLight.intensity = 0.1;
scene.add( ambientLight );

const sconceLightOne = new THREE.PointLight(0xff6000, 1, 20);

const sconceLightTwo = new THREE.PointLight(0xff6000, 1, 20);

//Post-Processing
const composer = new EffectComposer( renderer );

const renderPass = new RenderPass( scene, camera );
composer.addPass( renderPass );

var outlinePass = new OutlinePass( new THREE.Vector2( window.innerWidth, window.innerHeight ), scene, camera );
outlinePass.visibleEdgeColor.set("#1f51ff");
composer.addPass( outlinePass );

//raycaster
const raycaster = new THREE.Raycaster();

//models
var sconceThree;

//constants
const headBobMagnitude = 0.05;
const randomArray = randomNumberArray();

//variables
var lockedIn = false;
var prevTime;
var cutscene = true;
var rotateTime = 0;
var hangTime = 0;
var slideTime = 0;
var selectedBricks = [];
var currentBrick;
var moveForward = false;
var moveBackward = false;
var moveLeft = false;
var moveRight = false;
var allBrickButtons = [];
var allBrickButtonMeshes = [];
var allRomanNumeralsMeshes = [];
var fall = false;
var bricksShowing = false;
var walking  = false;
var timeSinceWalking;
var timeSinceStoppedWalking;
let velocity = new THREE.Vector3();
let direction = new THREE.Vector3();
var mouse = new THREE.Vector2();
var astralGroup;
var trapdoor;

function loadChunkOne()
{
    audioLoader.load( '../assets/sound/effects/droplets-in-a-cave-6785.mp3', function( buffer ) {
        drops.setBuffer( buffer );
        drops.setLoop( true );
        drops.setVolume( 0.2 );

        audioLoader.load( '../assets/sound/effects/stoneblockdragwoodgrind-82327.mp3', function( buffer ) {
            bricks.setBuffer( buffer );
            bricks.setVolume( 0.1 );

            textureLoader.load('./assets/images/Fib.png', function (texture) {
                var mesh = new THREE.Mesh(new THREE.BoxGeometry(10,10,10), new THREE.MeshLambertMaterial({map: texture, transparent: true}))
                mesh.position.y = 14;
                mesh.position.x = 19.9;
                scene.add(mesh);
            } );
        });
    });
}

function loadChunkTwo()
{

    loader.load( './assets/environments/prison_cell/prisonCell.glb', function ( gltf ) {

        gltf.scene.scale.set(10,10,10);
        scene.add(gltf.scene);

        trapdoor = new THREE.Mesh(new THREE.BoxGeometry(30,5,30), new THREE.MeshLambertMaterial({color: 0x121212}))
        trapdoor.position.y = -2.5;
        scene.add(trapdoor)

        loader.load( './assets/models/door/door.glb', function ( gltf ) {
    
            gltf.scene.scale.set(10, 10,10);
            gltf.scene.position.set(0,0, 16.1);
            
            scene.add(gltf.scene);
    
            loader.load( './assets/models/vine/VineLeaf.glb', function ( gltf ) {
    
                gltf.scene.scale.set(10, 10,10);
                gltf.scene.rotation.y = Math.PI;
                gltf.scene.position.set(-2,16.5, -16);
                
                scene.add(gltf.scene);
            
            }, undefined, function ( error ) {
            
                console.error( error );
            
            });
        
        }, undefined, function ( error ) {
        
            console.error( error );
        
        });
    
    }, undefined, function ( error ) {
    
        console.error( error );
    
    });
    
}

function loadChunkThree()
{

    loader.load( './assets/models/bed/Bed.glb', function ( gltf ) {
    
        gltf.scene.scale.set(9,10,10);
        gltf.scene.position.set(9,0,-3);
        
        scene.add(gltf.scene);

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
    
        });
    
    }, undefined, function ( error ) {
    
        console.error( error );
    
    });
}

function loadChunkFour()
{
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
                textMesh = new THREE.Mesh(new TextGeometry(intToRomanNumerals(randomArray[j*7 + i]), {font: myFont, size: 0.4, height: 1}), new THREE.MeshBasicMaterial({color: 0x1f51ff}))
                textMesh.rotation.set(0,Math.PI/2,0)
                const textBox = new THREE.Box3().setFromObject(textMesh);
                textMesh.position.set(-16.9, current.position.y - (textBox.max.y - textBox.max.y/2), current.position.z + (textBox.max.z - textBox.min.z/2));
                scene.add(textMesh);
                allRomanNumeralsMeshes[j*7 + i] = textMesh
            }
        } 
    
    }, undefined, function ( error ) {
    
        console.error( error );
    
    } );
}


function startGame()
{
    document.removeEventListener('click', startGame)
    music.play();
    prevTime = performance.now(); 
    cutsceneFunction();
    
    
}


function loadLevel()
{
    camera.position.y = 15;
    camera.position.z = -50;
    camera.rotation.y = 0;
    camera.rotation.x = Math.PI/2

    audioLoader.load( '../assets/sound/music/TheElderScrollsIV-Oblivion-WingsofKynareth.mp3', function( buffer ) {
        music.setBuffer( buffer );
        music.setLoop( true );
        music.setVolume( 0.2 );

        fontLoader.load('../assets/fonts/Eagle Lake_Regular.json', function (font) 
        {
            myFont = font
            const geometry = new TextGeometry("Click anywhere to Begin...", {font: myFont, size: 5, height: 0.1});
            const material = new THREE.MeshBasicMaterial({color: 0xffffff})

            const textMesh = new THREE.Mesh(geometry, material)
            const textBox = new THREE.Box3().setFromObject(textMesh);

            textMesh.position.set(textBox.min.x - textBox.max.x/2,100,-10);
            textMesh.rotation.x = Math.PI/2
            scene.add(textMesh);

            const instructions = new THREE.Mesh(new TextGeometry("Instructions:", {font: myFont, size: 3, height: 0.1}),  new THREE.MeshBasicMaterial({color: 0xffffff}))
            const instructionsTextBox = new THREE.Box3().setFromObject(instructions);
            instructions.position.set(instructionsTextBox.min.x - instructionsTextBox.max.x/2,100,-30);
            instructions.rotation.x = Math.PI/2
            scene.add(instructions);


            const level1Header = new THREE.Mesh(new TextGeometry("Level One:", {font: myFont, size: 3, height: 0.1}),  new THREE.MeshBasicMaterial({color: 0xffffff}))
            const level1HeaderTextBox = new THREE.Box3().setFromObject(level1Header);
            level1Header.position.set(level1HeaderTextBox.min.x - level1HeaderTextBox.max.x/2,100,-50);
            level1Header.rotation.x = Math.PI/2
            scene.add(level1Header);

            const level1Instructions = new THREE.Mesh(new TextGeometry("Click the screen to lock cursor in. WASD or Arrow keys to move. Move\nmouse to control camera. Press 'E' to interact with blue highlighted object.", {font: myFont, size: 2, height: 0.1}),  new THREE.MeshBasicMaterial({color: 0xffffff}))
            const level1InstructionsTextBox = new THREE.Box3().setFromObject(level1Instructions);
            level1Instructions.position.set(level1InstructionsTextBox.min.x - level1InstructionsTextBox.max.x/2,100,-60);
            level1Instructions.rotation.x = Math.PI/2
            scene.add(level1Instructions);

            const level2Header = new THREE.Mesh(new TextGeometry("Level Two:", {font: myFont, size: 3, height: 0.1}),  new THREE.MeshBasicMaterial({color: 0xffffff}))
            const level2HeaderTextBox = new THREE.Box3().setFromObject(level2Header);
            level2Header.position.set(level2HeaderTextBox.min.x - level2HeaderTextBox.max.x/2,100,-80);
            level2Header.rotation.x = Math.PI/2
            scene.add(level2Header);

            const level2Instructions = new THREE.Mesh(new TextGeometry("Click the screen to lock cursor in. Move mouse to control camera. Type using keyboard when asked. Enter to submit answer.", {font: myFont, size: 2, height: 0.1}),  new THREE.MeshBasicMaterial({color: 0xffffff}))
            const level2InstructionsTextBox = new THREE.Box3().setFromObject(level2Instructions);
            level2Instructions.position.set(level2InstructionsTextBox.min.x - level2InstructionsTextBox.max.x/2,100,-90);
            level2Instructions.rotation.x = Math.PI/2
            scene.add(level2Instructions);

            astralGroup = new THREE.Group();
            const sphereMesh = new THREE.Mesh(new THREE.SphereGeometry(2,32,32), new THREE.MeshBasicMaterial())
            sphereMesh.position.set(-20,25,-100)
            astralGroup.add(sphereMesh);
            for (let i = 0; i < 100; i++)
            {
                const starMesh = new THREE.Mesh(new THREE.SphereGeometry(0.2,2,2), new THREE.MeshBasicMaterial())
                starMesh.position.set(Math.random()*500 - 250, Math.random()*500-250, -250)
                astralGroup.add(starMesh);
            }
            scene.add(astralGroup)

            document.addEventListener('click', startGame);
            renderer.render(scene, camera)
        })
    });
}

function cutsceneFunction()
{
    if (cutscene)
    {
        const time = performance.now(); 

        requestAnimationFrame( cutsceneFunction );
        
        if (rotateTime < 5)
        {
            if (rotateTime == 0)
            {
                loadChunkOne();
            }

            camera.rotation.x = (Math.PI/2) - (Math.PI/2 * rotateTime/5);
            rotateTime += (time - prevTime)/1000
        }
        else if (hangTime < 2)
        {
            if (hangTime == 0)
            {
                loadChunkTwo();
            }

            if (camera.rotation.x != 0)
            {
                camera.rotation.x = 0;
            }

            hangTime += (time - prevTime)/1000
        }
        else if (slideTime < 5)
        {

            if (slideTime == 0)
            {
                loadChunkThree();
            }

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
            loadChunkFour();
            music.setVolume(0.1)
            cutscene = false;
        }

        prevTime = time;

        renderer.render( scene, camera );

    }
    else
    {
        requestAnimationFrame( update );
        camera.add(reticle);

        controls = new PointerLockControls(camera, document.body);
        renderer.domElement.addEventListener( 'pointermove', onPointerMove );
        controls.addEventListener( 'lock', function () { lockedIn = true; });
        controls.addEventListener( 'unlock', function () { lockedIn = false; });

        document.addEventListener('click', onClick);
        document.addEventListener( 'keydown', onKeyDown );
        document.addEventListener( 'keyup', onKeyUp );

        scene.add(controls.getObject());
        drops.play();
    }
    
}

function update()
{
    requestAnimationFrame( update );

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
                camera.position.lerp(new THREE.Vector3(camera.position.x ,15, camera.position.z), timeSinceStoppedWalking/1);
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
}

//Utility Functions

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


//Listener Functions
const onClick = function (event)
{
    if (!lockedIn)
    {
        controls.lock();
    }
}


function onPointerMove( event ) {

    if ( event.isPrimary === false ) return;

    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

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

loadLevel();