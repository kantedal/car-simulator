/**
 * Created by filles-dator on 2016-03-09.
 */
///<reference path="../../threejs/three.d.ts"/>
var ObjectLoader = (function () {
    function ObjectLoader() {
    }
    ObjectLoader.prototype.load = function (listener) {
        this._objectLoadedListner = listener;
        this.loadWheel();
    };
    ObjectLoader.prototype.loadWheel = function () {
        var self = this;
        var mtlLoader = new THREE.MTLLoader();
        mtlLoader.setBaseUrl('models/car/');
        mtlLoader.setPath('models/car/');
        mtlLoader.load('tire.mtl', function (materials) {
            materials.preload();
            var objLoader = new THREE.OBJLoader();
            objLoader.setMaterials(materials);
            objLoader.setPath('models/car/');
            objLoader.load('tire.obj', function (object) {
                self._wheelMesh = object;
                self._wheelMesh.castShadow = true;
                self._objectLoadedListner.objectsLoaded();
            }, 0, 0);
        });
    };
    Object.defineProperty(ObjectLoader.prototype, "wheelMesh", {
        get: function () {
            return this._wheelMesh;
        },
        enumerable: true,
        configurable: true
    });
    return ObjectLoader;
})();
//# sourceMappingURL=object_loader.js.map