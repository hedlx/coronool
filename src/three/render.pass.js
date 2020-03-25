import Pass from './pass';


export default class extends Pass {
    constructor(scene, camera) {
        super();

        this.scene = scene;
        this.camera = camera;

        this.clear = true;
        this.clearDepth = false;
        this.needsSwap = false;
    }

    render(renderer, writeBuffer, readBuffer) {
        const oldAutoClear = renderer.autoClear;
		renderer.autoClear = false;

		renderer.setRenderTarget(this.renderToScreen ? null : readBuffer);
		renderer.clear(renderer.autoClearColor, renderer.autoClearDepth, renderer.autoClearStencil);
		renderer.render(this.scene, this.camera);

		renderer.autoClear = oldAutoClear;
    }
}
