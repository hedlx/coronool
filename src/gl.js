import * as three from 'three';

import EffectComposer from './three/effect.composer';
import RenderPass from './three/render.pass';
import GlitchPass from './three/glitch.pass';
import LightPass from './three/light.pass';


const canvas = document.createElement( 'canvas' );
const context = canvas.getContext('webgl2', {alpha: false});
export const renderer = new three.WebGLRenderer({canvas, context});
renderer.setPixelRatio(window.devicePixelRatio);

export const scene = new three.Scene();
export const camera = new three.PerspectiveCamera(110, window.innerWidth / window.innerHeight, 1, 100000);
camera.position.z = 400;

export const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const glitchPass = new GlitchPass();
composer.addPass(glitchPass);
const lightPass = new LightPass();
composer.addPass(lightPass);

export const triggerGlitch = () => {
    glitchPass.generateTrigger();
    lightPass.trigger();
};

const texture = new three.TextureLoader().load('img/cov2.jpg');
export const geometry = new three.PlaneBufferGeometry(3060, 2390);

export const uniforms = {
    iTime: {value: 1.0},
    trans: {value: new three.Matrix4()},
    iChannel0: {value: texture},
    iResolution: {value: new three.Vector3(3060, 2390, 1)}
};

export const mesh = new three.Mesh(geometry, new three.MeshBasicMaterial({map: texture}));
scene.add(mesh);

