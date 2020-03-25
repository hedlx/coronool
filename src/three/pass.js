import {
	OrthographicCamera,
	PlaneBufferGeometry,
	Mesh
} from 'three';

class Pass {
    constructor() {
        this.enabled = true;
        this.needsSwap = true;
        this.clear = false;
        this.renderToScreen = false;
    }

    setSize() {}
}

Pass.FullScreenQuad = class {
    constructor(material) {
        material.generateMipmaps = false;
        material.anisotropy = 16;
        this._mesh = new Mesh(new PlaneBufferGeometry(2, 2), material);
        this._camera = new OrthographicCamera(-1, 1, 1, -1, 0, 2000);
    }

    get material() {
        return this._mesh.material;
    }

    set material(material) {
        this._mesh.material = material;
    }

    dispose() {
        this._mesh.geometry.dispose();
    }

    render(renderer) {
        renderer.render(this._mesh, this._camera);
    }
};

export default Pass;
