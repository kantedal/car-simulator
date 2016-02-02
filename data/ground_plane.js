///<reference path="./physics_object3d.ts"/>
var GroundPlane = (function () {
    function GroundPlane(renderer) {
        this._renderer = renderer;
        this._scale = new Vector3(1, 1, 1);
    }
    GroundPlane.prototype.loadPlane = function (listener, renderer) {
        this._renderer = renderer;
        var self = this;
        var loader = new THREE.OBJLoader();
        loader.load('./models/ground_model2.obj', function (object) {
            var textureLoader = new THREE.TextureLoader();
            textureLoader.load("./texture/sand.jpg", function (texture) {
                console.log("success");
                //var material1 = new THREE.MeshBasicMaterial({map: texture});
                self._mesh = object;
                var material = new THREE.MeshPhongMaterial({
                    color: 0xFFFFFF,
                    specular: 0xFFDDCC,
                    shininess: 3,
                    shading: THREE.SmoothShading,
                    map: texture
                });
                var material1 = new THREE.MeshBasicMaterial({ color: 0x999999, wireframe: true });
                object.traverse(function (child) {
                    if (child instanceof THREE.Mesh) {
                        child.material = material1;
                        self._geometry = new THREE.Geometry().fromBufferGeometry(child.geometry);
                    }
                });
                listener.planeLoaded(self);
            });
        }, function (xhr) {
            console.log('An error happened');
        });
    };
    GroundPlane.prototype.addLoadedListener = function (listener) {
        this._planeLoadedListener = listener;
        //this._planeLoadedListener.planeLoaded(this._mesh);
    };
    Object.defineProperty(GroundPlane.prototype, "scale", {
        get: function () {
            return this._scale;
        },
        set: function (scale) {
            this._geometry.scale(scale.x, scale.y, scale.z);
            this.mesh.scale.set(scale.x, scale.y, scale.z);
            this._scale = scale;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GroundPlane.prototype, "mesh", {
        get: function () {
            return this._mesh;
        },
        set: function (value) {
            this._mesh = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GroundPlane.prototype, "geometry", {
        get: function () {
            return this._geometry;
        },
        set: function (value) {
            this._geometry = value;
        },
        enumerable: true,
        configurable: true
    });
    GroundPlane.prototype.clone = function () {
        var newGround = new GroundPlane(this._planeLoadedListener, this._renderer);
        newGround.mesh = this._mesh.clone();
        newGround.geometry = this._geometry.clone();
        return newGround;
    };
    return GroundPlane;
})();
//# sourceMappingURL=ground_plane.js.map