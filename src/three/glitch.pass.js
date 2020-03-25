import {
	DataTexture,
	FloatType,
	MathUtils,
	RGBFormat,
	ShaderMaterial,
	UniformsUtils
} from 'three';
import _ from 'lodash';

import Pass from './pass';
import { DigitalGlitch } from 'three/examples/jsm/shaders/DigitalGlitch';


export default class extends Pass {
    constructor() {
        super();

        this.uniforms = UniformsUtils.clone(DigitalGlitch.uniforms);    
        this.uniforms.tDisp.value = this.generateHeightmap(64);

        this.material = new ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: DigitalGlitch.vertexShader,
            fragmentShader: DigitalGlitch.fragmentShader
        });
    
        this.fsQuad = new Pass.FullScreenQuad(this.material);
    
        this.curF = 0;
        this.triggered = false;
        this.triggeredTimeout = null;
    }

    render(renderer, writeBuffer, readBuffer) {
		this.uniforms.tDiffuse.value = readBuffer.texture;
		this.uniforms.seed.value = Math.random();
        this.uniforms.byp.value = this.triggered
            ? 0
            : 1;

        if (this.triggered && !this.triggeredTimeout) {
            this.triggeredTimeout = setTimeout(() => {
                this.triggered = false;
                this.triggeredTimeout = null;
            }, Math.random() * 500 + 500);
        }

        if (this.triggered) {
            if (this.curF % this.randX == 0) {
                this.uniforms[ 'amount' ].value = Math.random() / 30;
                this.uniforms[ 'angle' ].value = MathUtils.randFloat( - Math.PI, Math.PI );
                this.uniforms[ 'seed_x' ].value = MathUtils.randFloat( - 1, 1 );
                this.uniforms[ 'seed_y' ].value = MathUtils.randFloat( - 1, 1 );
                this.uniforms[ 'distortion_x' ].value = MathUtils.randFloat( 0, 1 );
                this.uniforms[ 'distortion_y' ].value = MathUtils.randFloat( 0, 1 );
                this.curF = 0;
            } else {
                this.uniforms[ 'amount' ].value = Math.random() / 90;
                this.uniforms[ 'angle' ].value = MathUtils.randFloat( - Math.PI, Math.PI );
                this.uniforms[ 'distortion_x' ].value = MathUtils.randFloat( 0, 1 );
                this.uniforms[ 'distortion_y' ].value = MathUtils.randFloat( 0, 1 );
                this.uniforms[ 'seed_x' ].value = MathUtils.randFloat( - 0.3, 0.3 );
                this.uniforms[ 'seed_y' ].value = MathUtils.randFloat( - 0.3, 0.3 );
            }

            this.curF++;
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
    
    generateTrigger() {
        if (this.triggeredTimeout) {
            clearTimeout(this.triggeredTimeout);
            this.triggeredTimeout = null;
        }

        this.triggered = true;
		this.randX = MathUtils.randInt(120, 240);
    }
    
	generateHeightmap(dt_size) {
		const data_arr = new Float32Array( dt_size * dt_size * 3 );
		const length = dt_size * dt_size;

		for (let i = 0; i < length; i++) {
			var val = MathUtils.randFloat( 0, 1 );
			data_arr[ i * 3 + 0 ] = val;
			data_arr[ i * 3 + 1 ] = val;
			data_arr[ i * 3 + 2 ] = val;
		}

		return new DataTexture(data_arr, dt_size, dt_size, RGBFormat, FloatType);
	}
}
