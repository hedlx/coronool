import {
	ShaderMaterial,
	UniformsUtils
} from 'three';

import Pass from './pass';
import Light from './shaders/light.shader';


const MIN_LIGHT_VALUE = 0.1;
const MAX_LIGHT_VALUE = 1;
const TRIGGER_DELTA = 0.4;
const FADING_DELTA = 0.002;

export default class extends Pass {
    constructor() {
        super();

        this.light = MIN_LIGHT_VALUE;
        this.uniforms = UniformsUtils.clone(Light.uniforms);    
        this.uniforms.value.value = this.light;

        this.material = new ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: Light.vertexShader,
            fragmentShader: Light.fragmentShader
        });
    
        this.fsQuad = new Pass.FullScreenQuad(this.material);
    }

    render(renderer, writeBuffer, readBuffer) {
		this.uniforms.iTexture.value = readBuffer.texture;
        this.uniforms.value.value = this.light;

        if (this.light > MIN_LIGHT_VALUE) {
            this.light -= FADING_DELTA;
        }

		if (this.renderToScreen) {
			renderer.setRenderTarget(null);
			this.fsQuad.render(renderer);
		} else {
			renderer.setRenderTarget(writeBuffer);
			if (this.clear) renderer.clear();
			this.fsQuad.render(renderer);
		}
    }
    
    trigger() {
        this.light += TRIGGER_DELTA;

        if (this.light > MAX_LIGHT_VALUE) {
            this.light = MAX_LIGHT_VALUE;
        }
    }
}
