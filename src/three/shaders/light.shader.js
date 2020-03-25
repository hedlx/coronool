export default {
    uniforms: {
        value: {value: null},
        iTexture: {value: null}
    },
    vertexShader: `
        varying vec2 vUv;
        
        void main() {
    	    vUv = uv;
    	    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform sampler2D iTexture;
        uniform float value;
        varying vec2 vUv;

        vec4 light(vec4 color) {
            return mix(color.rgba, vec4(0x00), 1.0 - value);
         }

        void main() {
            gl_FragColor = light(texture(iTexture, vUv));
        }
    `
};
