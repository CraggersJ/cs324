import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

//scene
const scene = new THREE.Scene();

//camera
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

//controls
let controls = new PointerLockControls(camera, document.body);
scene.add(controls.getObject());
controls.maxPolarAngle = Math.PI/2 + Math.PI/180 * 20;
controls.minPolarAngle = Math.PI/2  + Math.PI/180 * 10;

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
const loader = new GLTFLoader();

//sounds
var music = new THREE.Audio( listener );
var spiderSound = new THREE.Audio( listener );
var chime = new THREE.Audio( listener );

//lights
const targetObject = new THREE.Object3D();
targetObject.position.set(0,75,-100);
scene.add(targetObject);
const light = new THREE.SpotLight( 0x2a2a2a, 100, 250, Math.PI/2, 1, 2);
light.position.set( 0, 50, 0 );
light.target = targetObject;
scene.add( light );

const lightTwo = new THREE.PointLight( 0xaaaaff, 10, 250);
lightTwo.position.set( 0, 50, 150);
scene.add( lightTwo );

//constants
var text = ["Let's play a little game...", "I ask you three riddles...", "If you answer them correctly, you go free...", "First riddle...", "What runs but never walks, has a mouth but never talks?", "Still two more to go", "What goes up but never goes down?", "Lucky guess, now one more...", "What has one eye, but can't see?", "Why do I keep doing this?"]
var riddleAnswers = [["A RIVER", "RIVER"], ["YOUR AGE", "AGE", "MY AGE"], ["A NEEDLE", "NEEDLE"]];

//variables
var lockedIn = false;
var spidereyes = new THREE.Group();
var alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ ";
var answer = ""
var answerMesh = null
var currentRiddle = 0;
var currentSpeech = 0;
var nextSpeech = false;
var rightLeg;
var leftLeg;
var myFont;
var textMesh;
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

function loadLevel()
{
    document.addEventListener('click', onClick);
    document.addEventListener( 'keyup', onKeyUp );
    camera.position.y = 500;
    camera.position.z = 150;
    camera.rotation.y = 0;

    audioLoader.load( '../assets/sound/music/The Elder Scrolls IV - Oblivion - Tension.mp3', function( buffer ) {
        music.setBuffer( buffer );
        music.setLoop( true );
        music.setVolume( 0.05 );
        music.play();

        fontLoader.load('../assets/fonts/Eagle Lake_Regular.json', function (font) 
        {
            myFont = font

            loader.load( './assets/environments/cave/cave.glb', function ( gltf ) {

                gltf.scene.scale.set(10,10,10);
                scene.add(gltf.scene);
        
                loader.load( './assets/models/web/spiderWeb.glb', function ( gltf ) {
            
                    gltf.scene.scale.set(10,5,10);
                    gltf.scene.rotation.x = -Math.PI/4;
                    gltf.scene.position.set(0, 95, 150)
                    const webLight = new THREE.SpotLight( 0xffffff, 10, 100, Math.PI/2, 1, 2);
                    webLight.position.set(0,150,140);
                    webLight.target = gltf.scene;
                    scene.add(gltf.scene);
                    scene.add(webLight)
        
                    loader.load( './assets/models/bed/Bed.glb', function ( gltf ) {
            
                        gltf.scene.scale.set(9,10,10);
                        gltf.scene.rotation.x = 3 * Math.PI/4
                        gltf.scene.position.set(15,92,135);
                        
                        scene.add(gltf.scene);
        
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
                            scene.add(rightLeg);

                            audioLoader.load( '../assets/sound/effects/spider-chattering-87558.mp3', function( buffer ) {
                                spiderSound.setBuffer( buffer );
                                spiderSound.setLoop( true );
                                spiderSound.setVolume( 0.5 );

                                audioLoader.load( '../assets/sound/effects/magic-wand-6214.mp3', function( buffer ) {
                                    chime.setBuffer( buffer );
                                    chime.setPlaybackRate(3);
                                    chime.setVolume( 0.5 );
                                });
                            });

                            update();
                        
                        }, undefined, function ( error ) {
                        
                            console.error( error );
                        
                        } );
                    
                    }, undefined, function ( error ) {
                    
                        console.error( error );
                    
                    } );
                
                }, undefined, function ( error ) {
                
                    console.error( error );
                
                } );
            
            }, undefined, function ( error ) {
            
                console.error( error );
            
            } );
        })
    });

    var x = -5
    var y = 5
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
}

function update() {
    requestAnimationFrame( update );

    const time = performance.now();

    const delta = ( time - prevTime ) / 1000;

    if (camera.position.y > 100)
    {
        camera.position.y -= 5;
    }

    if (fall)
    {
        camera.position.y -= 2;
    }

    if (camera.position.y < -100 && !loadingNext)
    {
        window.location.replace("../level3.html")
        loadingNext = true;
    }

    if (webFade)
    {
        fall = true;
    }

    if (spiderEnter)
    {
        if (spiderTimer > 7 && spiderTimer < 7.2)
        {
            leftLeg.position.set(-30 + (20 * (7.2 - spiderTimer)/0.2), 80 + (40 * (7.2 - spiderTimer)/0.2), -150 - (100 * (7.2 - spiderTimer)/0.2))
        }

        if (spiderTimer > 7.1 && spiderTimer < 7.3)
        {
            rightLeg.position.set(10 - (50 * (7.3 - spiderTimer)/0.2), 80, -150 - (100 * (7.3 - spiderTimer)/0.2))
            spidereyes.position.y = 50 - (50 * (7.3 - spiderTimer)/0.2);
        }

        if (spiderTimer > 7.4)
        {

            if (spiderTimer < 7.7)
            {
                spidereyes.position.y = 72.5 - (22.5 * (7.7 - spiderTimer)/0.3);
            }
            

            if (spiderTimer < 7.5)
            {
                rightLeg.position.x = 10 * (7.5 - spiderTimer)/0.1
                leftLeg.position.y = 120 - 40 * (7.5 - spiderTimer)/0.1
            }
            else if (spiderTimer < 7.6)
            {
                rightLeg.position.z = leftLeg.position.z = -80 - 70 * (7.6 - spiderTimer)/0.1
            }
            else if (spiderTimer < 7.8)
            {
                leftLeg.position.set(-50 + (20 * (7.8 - spiderTimer)/0.2), 70 + (50 * (7.8 - spiderTimer)/0.2) , -80)
                rightLeg.position.set(45 - (45 * (7.8 - spiderTimer)/0.2), 80 - (10 * (7.8 - spiderTimer)/0.2) , -80)
                
            }
            else
            {
                nextSpeech = true;
                spiderEnter = false;
                stopTimer = false;
                spiderTimer = 0;
                spiderSound.play();
            }
        }


        spiderTimer += delta;
    }
    else if (spiderExit)
    {
        if (spiderTimer > 3 && spiderTimer < 3.4)
        {
            if (spiderTimer < 3.2)
            {
                leftLeg.position.lerpVectors(new THREE.Vector3(-50, 70, -80), new THREE.Vector3(-30, 120, -80), (spiderTimer-3)/0.2)
                rightLeg.position.lerpVectors(new THREE.Vector3(45, 80, -80), new THREE.Vector3(0, 70, -80), (spiderTimer-3)/0.2)
            }
            else if (spiderTimer < 3.3)
            {
                rightLeg.position.z = leftLeg.position.z = -150 + 70 * (3.3 - spiderTimer)/0.1
            }
            else if (spiderTimer < 3.4)
            {
                rightLeg.position.x = 10 * (spiderTimer)/0.1
                leftLeg.position.y = 80 + 40 * (3.4 - spiderTimer)/0.1
            }

            if (spiderTimer < 3.3)
            {
                spidereyes.position.y = 50 + (22.5 * (3.3 - spiderTimer)/0.3);
            }
        }
        else if (spiderTimer > 3.4)
        {
            if (spiderTimer < 3.7)
            {
                rightLeg.position.lerpVectors(new THREE.Vector3(10, 80, -150), new THREE.Vector3(-40, 80, -250), (spiderTimer-3.5)/0.2)
                
            }

            if (spiderTimer > 3.6 && spiderTimer < 3.8)
            {
                spidereyes.position.y = 0 + (50 * (3.8 - spiderTimer)/0.2);
                leftLeg.position.lerpVectors(new THREE.Vector3(-30, 80, -150), new THREE.Vector3(-10, 120, -250), (spiderTimer-3.6)/0.2)
            }
            
            if (spiderTimer > 3.8)
            {
                spiderExit = false
                webFade = true;
            }
        }
        


        spiderTimer += delta;
    }

    if (nextSpeech && currentSpeech != text.length)
    {
        if (currentSpeech == 4 || currentSpeech == 6 || currentSpeech == 8)
        {
            lockTyping = false;
            answerMesh = new THREE.Mesh(new TextGeometry("Type your Answer", {font: myFont, size: 10, height: 1}), new THREE.MeshBasicMaterial({color: 0x0000ff}))
            const answerBox = new THREE.Box3().setFromObject(answerMesh);
            answerMesh.position.set(answerBox.min.x - answerBox.max.x/2,-50,-100);
            scene.add(answerMesh);
            stopTimer = true;
        }
        changeSpeech(text[currentSpeech++])
        speechTimer = 0;
        nextSpeech = false;
    }
    else if (!stopTimer && speechTimer > 3)
    {
        if (currentRiddle == 3)
        {
            scene.remove(textMesh)
        }
        nextSpeech = true;
        speechTimer = 0;
    }

    speechTimer += delta;


    if (dead)
    {
        if (deadTime <= 1)
        {
            camera.position.lerp(new THREE.Vector3(0,50,-200), (deadTime)/1)
            deadTime += delta
        }
        else
        {
            window.location.replace("../level2.html")
            dead = false;
        }   
    }

    prevTime = time;

    renderer.render( scene, camera );
};

//utility functions
function changeSpeech(speech)
{
    scene.remove(textMesh)
    textMesh = new THREE.Mesh(new TextGeometry(speech, {font: myFont, size: 7.5, height: 0.1}), new THREE.MeshBasicMaterial({color: 0xff0000}))
    const textBox = new THREE.Box3().setFromObject(textMesh);

    textMesh.position.set(textBox.min.x - textBox.max.x/2,175,-100);
    scene.add(textMesh);
}


//listener functions
const onClick = function (event)
{
    if (!lockedIn)
    {
        controls.lock();
    }
}

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
                    chime.play();
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

loadLevel();