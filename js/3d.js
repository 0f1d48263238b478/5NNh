/*
 *  Author: Anonymous
 *  
 *  Date:   2024-09-02
 */

var d = 0;
if (window.outerWidth > window.innerWidth) {
    // approx scroll bar width
    d = (window.outerWidth - window.innerWidth);
}
const width  = document.getElementById("3D").offsetWidth-d;
const height = document.getElementById("3D").offsetWidth-d;

document.getElementById("3D").innerHTML = "<img src=\"img/texture-1000.jpg\" width=\""+width+"\" height=\""+height+"\"/>";

import * as THREE    from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';

// init

const camera = new THREE.PerspectiveCamera( 70, width / height, 0.01, 10 );
camera.position.z = 1;

const scene = new THREE.Scene();

// load the background image
const background = new THREE.TextureLoader().load( "img/texture-1000.jpg" );
background.colorSpace = THREE.SRGBColorSpace;
scene.background = background;

const light = new THREE.AmbientLight( 0x404040, 100 ); // soft white light
scene.add( light );

const directionalLight = new THREE.DirectionalLight( 0xffffff, 10 );
scene.add( directionalLight );


// instantiate a loader
const objLoader = new OBJLoader();
const mtlLoader = new MTLLoader();

// load crazyflie model
const materials = await mtlLoader.loadAsync('3d/crazyflie.mtl');
objLoader.setMaterials(materials)
const geometry = await objLoader.loadAsync('3d/crazyflie.obj');

// add it to the scene
var SCALE=0.005;
geometry.scale.set(SCALE,SCALE,SCALE);
scene.add( geometry );

// center it
var bb = new THREE.Box3();
bb.setFromObject(geometry);
geometry.translateX(-(bb.max.x+bb.min.x)/2)
geometry.translateY(-(bb.max.y+bb.min.y)/2)
geometry.translateZ(-(bb.max.z+bb.min.z)/2)
geometry.rotateY(Math.PI/4);

// precompute the bounding boxes of the props

var prop1 = new THREE.Box3();
var prop2 = new THREE.Box3();
var prop3 = new THREE.Box3();
var prop4 = new THREE.Box3();

prop1.setFromObject(geometry.getObjectByName("propeller_1"));
prop2.setFromObject(geometry.getObjectByName("propeller_2"));
prop3.setFromObject(geometry.getObjectByName("propeller_3"));
prop4.setFromObject(geometry.getObjectByName("propeller_4"));


var pos1 = new THREE.Vector3();
pos1.x = (prop1.max.x+prop1.min.x)/2;
pos1.y = (prop1.max.y+prop1.min.y)/2;
pos1.z = (prop1.max.z+prop1.min.z)/2;

var pos2 = new THREE.Vector3();
pos2.x = (prop2.max.x+prop2.min.x)/2;
pos2.y = (prop2.max.y+prop2.min.y)/2;
pos2.z = (prop2.max.z+prop2.min.z)/2;

var pos3 = new THREE.Vector3();
pos3.x = (prop3.max.x+prop3.min.x)/2;
pos3.y = (prop3.max.y+prop3.min.y)/2;
pos3.z = (prop3.max.z+prop3.min.z)/2;

var pos4 = new THREE.Vector3();
pos4.x = (prop4.max.x+prop4.min.x)/2;
pos4.y = (prop4.max.y+prop4.min.y)/2;
pos4.z = (prop4.max.z+prop4.min.z)/2;

// add new renderer
const renderer = new THREE.WebGLRenderer( { antialias: true, powerReference: "high-performance"} );
renderer.setSize( width, height );
renderer.setPixelRatio(1);



document.getElementById("3D").innerHTML = "";
document.getElementById("3D").appendChild( renderer.domElement );

// animation
var last_pitch = null;
var last_yaw = null;
var last_roll = null;

const propx1 = geometry.getObjectByName("propeller_1");
const propx2 = geometry.getObjectByName("propeller_2");
const propx3 = geometry.getObjectByName("propeller_3");
const propx4 = geometry.getObjectByName("propeller_4");

renderer.setAnimationLoop( animate_3d );

var last_spin = 0;

const ROTATION_FACTOR = Math.PI/6.5;

function animate_3d( time ) {

    if (((time-last_spin) > 20) && (G_cont || G_interval)) {
        /* spin the props */
        
        propx1.geometry.translate(-pos1.x/SCALE,-pos1.y/SCALE,-pos1.z/SCALE);
        propx1.geometry.rotateY(ROTATION_FACTOR);
        propx1.geometry.translate(pos1.x/SCALE,pos1.y/SCALE,pos1.z/SCALE);

        propx2.geometry.translate(-pos2.x/SCALE,-pos2.y/SCALE,-pos2.z/SCALE);
        propx2.geometry.rotateY(-ROTATION_FACTOR);
        propx2.geometry.translate(pos2.x/SCALE,pos2.y/SCALE,pos2.z/SCALE);
        
        propx3.geometry.translate(-pos3.x/SCALE,-pos3.y/SCALE,-pos3.z/SCALE);
        propx3.geometry.rotateY(ROTATION_FACTOR);
        propx3.geometry.translate(pos3.x/SCALE,pos3.y/SCALE,pos3.z/SCALE);
        
        propx4.geometry.translate(-pos4.x/SCALE,-pos4.y/SCALE,-pos4.z/SCALE);
        propx4.geometry.rotateY(-ROTATION_FACTOR);
        propx4.geometry.translate(pos4.x/SCALE,pos4.y/SCALE,pos4.z/SCALE);
        
        last_spin = time;
    }

    if (G_pitch != last_pitch || G_yaw != last_yaw || G_roll != last_roll) {
        /* rotate the drone model */

        const rotation  = new THREE.Euler(-G_pitch/180*Math.PI,(G_yaw)/180*Math.PI,-G_roll/180*Math.PI,'YXZ');
        geometry.setRotationFromEuler(rotation);
        
        last_pitch = G_pitch;
        last_yaw   = G_yaw;
        last_roll  = G_roll;
    }
    
    renderer.render( scene, camera );

}
