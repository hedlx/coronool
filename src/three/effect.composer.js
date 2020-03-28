import {
	Clock,
	LinearFilter,
	Mesh,
	OrthographicCamera,
	PlaneBufferGeometry,
	RGBAFormat,
	Vector2,
	WebGLRenderTarget
} from 'three';

import CopyShader from './shaders/copy.shader';
import ShaderPass from './shader.pass';


export default class EffectComposer {
    constructor(renderer, renderTarget) {
        this.renderer = renderer;

        if (renderTarget) {
            this._pixelRatio = 1;
            this._width = renderTarget.width;
            this._height = renderTarget.height;
        } else {
            const parameters = {
                minFilter: LinearFilter,
                magFilter: LinearFilter,
                format: RGBAFormat,
                stencilBuffer: false
            };
    
            const size = renderer.getSize(new Vector2());
            this._pixelRatio = renderer.getPixelRatio();
            this._width = size.width;
            this._height = size.height;
    
            renderTarget = new WebGLRenderTarget(this._width * this._pixelRatio, this._height * this._pixelRatio, parameters);
            renderTarget.texture.name = 'EffectComposer.rt1';
        }
    
        this.renderTarget1 = renderTarget;
        this.renderTarget2 = renderTarget.clone();
        this.renderTarget2.texture.name = 'EffectComposer.rt2';
    
        this.writeBuffer = this.renderTarget1;
        this.readBuffer = this.renderTarget2;
    
        this.renderToScreen = true;
    
        this.passes = [];
        this.copyPass = new ShaderPass( CopyShader );
        this.clock = new Clock();
    }

    swapBuffers() {
        const tmp = this.readBuffer;
		this.readBuffer = this.writeBuffer;
		this.writeBuffer = tmp;
    }

    addPass(pass) {
        this.passes.push(pass);
		pass.setSize(this._width * this._pixelRatio, this._height * this._pixelRatio);
    }

    insertPass(pass, index) {
        this.passes.splice(index, 0, pass);
        pass.setSize(this._width * this._pixelRatio, this._height * this._pixelRatio);
    }

    isLastEnabledPass(passIndex) {
        for (let i = passIndex + 1; i < this.passes.length; i++) {
			if (this.passes[i].enabled) {
				return false;
			}
		}

		return true;
    }

    reset(renderTarget) {
        if (!renderTarget) {
			const size = this.renderer.getSize(new Vector2());
			this._pixelRatio = this.renderer.getPixelRatio();
			this._width = size.width;
			this._height = size.height;

			renderTarget = this.renderTarget1.clone();
			renderTarget.setSize(this._width * this._pixelRatio, this._height * this._pixelRatio);
		}

		this.renderTarget1.dispose();
		this.renderTarget2.dispose();
		this.renderTarget1 = renderTarget;
		this.renderTarget2 = renderTarget.clone();

		this.writeBuffer = this.renderTarget1;
		this.readBuffer = this.renderTarget2;
    }

    setSize(width, height) {
        this._width = width;
		this._height = height;

		const effectiveWidth = this._width * this._pixelRatio;
		const effectiveHeight = this._height * this._pixelRatio;

		this.renderTarget1.setSize( effectiveWidth, effectiveHeight );
		this.renderTarget2.setSize( effectiveWidth, effectiveHeight );

		for (let i = 0; i < this.passes.length; i++) {
			this.passes[i].setSize(effectiveWidth, effectiveHeight);
		}
    }

    setPixelRatio(pixelRatio) {
        this._pixelRatio = pixelRatio;

		this.setSize(this._width, this._height);
    }

    render(deltaTime = this.clock.getDelta()) {
		const currentRenderTarget = this.renderer.getRenderTarget();
		let pass;

		for (let i = 0; i < this.passes.length; i++) {
			pass = this.passes[i];

			if (!pass.enabled) {
                continue;
            }

			pass.renderToScreen = this.renderToScreen && this.isLastEnabledPass(i);
			pass.render(this.renderer, this.writeBuffer, this.readBuffer, deltaTime, false);

			if (pass.needsSwap) {
				this.swapBuffers();
			}
		}

		this.renderer.setRenderTarget( currentRenderTarget );
    }
}
