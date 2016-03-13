/**
 * Created by filles-dator on 2016-03-09.
 */
///<reference path="../../threejs/three.d.ts"/>
var ObjectLoader = (function () {
    function ObjectLoader() {
        this._wheelLoaded = false;
        this._carLoaded = false;
        this._treeLoaded = true;
    }
    ObjectLoader.prototype.load = function (listener) {
        this._objectLoadedListner = listener;
        this.loadWheel();
        this.loadCar();
        //this.loadTree();
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
                self._wheelLoaded = true;
                if (self.allLoaded())
                    self._objectLoadedListner.objectsLoaded();
            }, 0, 0);
        });
    };
    ObjectLoader.prototype.loadCar = function () {
        var self = this;
        var mtlLoader = new THREE.MTLLoader();
        mtlLoader.setBaseUrl('models/car/');
        mtlLoader.setPath('models/car/');
        mtlLoader.load('car.mtl', function (materials) {
            materials.preload();
            var texture = new THREE.TextureLoader().load("texture/barrel_spec.png");
            materials.materials.phong6SG = new THREE.MeshPhongMaterial({
                map: new THREE.TextureLoader().load("texture/barrel_diffuse.png"),
                specularMap: texture,
                bumpMap: texture,
                bumpScale: 0.01,
                color: 0xdddddd,
                specular: 0x999999,
                shininess: 30
            });
            var metalTexture = new THREE.TextureLoader().load("texture/metalplate.jpg");
            materials.materials.phong5SG = new THREE.MeshPhongMaterial({
                map: metalTexture,
                bumpMap: metalTexture,
                bumpScale: 0.2,
                color: 0xdddddd,
                specular: 0x999999,
                shininess: 0
            });
            materials.materials.V8_Enginephong2SG = new THREE.MeshPhongMaterial({
                map: new THREE.TextureLoader().load("models/car/chrome.png"),
                color: 0xdddddd,
                specular: 0x999999,
                shininess: 0
            });
            materials.materials.V8_Enginephong1SG = new THREE.MeshPhongMaterial({
                map: new THREE.TextureLoader().load("models/car/metal.png"),
                color: 0xdddddd,
                specular: 0x999999,
                shininess: 0
            });
            materials.materials.V8_EngineV8_Engine_lambert2SG = new THREE.MeshPhongMaterial({
                map: new THREE.TextureLoader().load("models/car/engine block.png"),
                color: 0xdddddd,
                specular: 0x999999,
                shininess: 0
            });
            var objLoader = new THREE.OBJLoader();
            objLoader.setMaterials(materials);
            objLoader.setPath('models/car/');
            objLoader.load('car.obj', function (object) {
                self._carMesh = object;
                self._wheelMesh.castShadow = true;
                self._carLoaded = true;
                if (self.allLoaded())
                    self._objectLoadedListner.objectsLoaded();
            }, 0, 0);
        });
    };
    ObjectLoader.prototype.loadTree = function () {
        var self = this;
        var mtlLoader = new THREE.MTLLoader();
        mtlLoader.setBaseUrl('models/');
        mtlLoader.setPath('models/');
        mtlLoader.load('tree.mtl', function (materials) {
            materials.preload();
            console.log("MATERIALS LOADED");
            var objLoader = new THREE.OBJLoader();
            objLoader.setMaterials(materials);
            objLoader.setPath('models/');
            objLoader.load('tree.obj', function (object) {
                self._treeMesh = object;
                self._treeLoaded = true;
                if (self.allLoaded())
                    self._objectLoadedListner.objectsLoaded();
            }, 0, 0);
        });
    };
    ObjectLoader.prototype.allLoaded = function () {
        if (this._carLoaded && this._wheelLoaded && this._treeLoaded)
            return true;
        else
            return false;
    };
    Object.defineProperty(ObjectLoader.prototype, "carMesh", {
        get: function () {
            return this._carMesh;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ObjectLoader.prototype, "wheelMesh", {
        get: function () {
            return this._wheelMesh;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ObjectLoader.prototype, "treeMesh", {
        get: function () {
            return this._treeMesh;
        },
        enumerable: true,
        configurable: true
    });
    return ObjectLoader;
})();
//# sourceMappingURL=object_loader.js.map