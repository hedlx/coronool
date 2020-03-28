import {
	ShaderMaterial,
	UniformsUtils
} from 'three';

import Pass from './pass';


export default class extends Pass {
    constructor(shader, textureID) {
        super();

        this.textureID = textureID || 'tDiffuse';

        if (shader instanceof ShaderMaterial) {
            this.uniforms = shader.uniforms;
            this.material = shader;
        } else {
            this.uniforms = UniformsUtils.clone(shader.uniforms);

            this.material = new ShaderMaterial({
                defines: {...shader.defines},
                uniforms: this.uniforms,
                vertexShader: shader.vertexShader,
                fragmentShader: shader.fragmentShader
            });
        }

        this.fsQuad = new Pass.FullScreenQuad( this.material );        
    }

    render(renderer, writeBuffer, readBuffer) {
		if (this.uniforms[this.textureID]) {
			this.uniforms[this.textureID].value = readBuffer.texture;
		}

		this.fsQuad.material = this.material;

		if (this.renderToScreen) {
			renderer.setRenderTarget(null);
			this.fsQuad.render(renderer);
		} else {
			renderer.setRenderTarget( writeBuffer );
            
            if (this.clear) {
                renderer.clear(renderer.autoClearColor, renderer.autoClearDepth, renderer.autoClearStencil)
            };

			this.fsQuad.render( renderer );
		}
	}
}
