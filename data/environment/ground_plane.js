///<reference path="./../physics_object3d.ts"/>
///<reference path="../../math/noisejs.d.ts"/>
///<reference path="../../math/noisejs.d.ts"/>
///<reference path="./ground_objects.ts"/>
var GroundPlane = (function () {
    function GroundPlane(renderer, dimension) {
        this.ground_x = 0;
        this.ground_z = 0;
        this._currentSurfIdx = 4;
        this._dimension = dimension;
        this._mesh = [];
        this._collisionMesh = [];
        this._maxDistance = Math.sqrt(Math.pow(2 * CarSimulator.ground_width, 2) * 2);
        this._collisionDistance = Math.sqrt(Math.pow(CarSimulator.ground_width, 2) * 2);
        this._currentSurfIdx = 0;
        this._surfaceRaycaster = new THREE.Raycaster();
        this._renderer = renderer;
        this._scale = new Vector3(1, 1, 1);
        if (CarSimulator.developer_mode) {
            this._material = new THREE.MeshBasicMaterial({ color: 0x999999, wireframe: true });
        }
        else {
            this._texture = new THREE.TextureLoader().load("texture/sand_grass.jpg");
            this._texture.wrapS = THREE.RepeatWrapping;
            this._texture.wrapT = THREE.RepeatWrapping;
            this._texture.repeat.x = 10;
            this._texture.repeat.y = 10;
            this._material = new THREE.MeshPhongMaterial({
                color: 0xdddddd,
                specular: 0x333333,
                shininess: 10,
                map: this._texture,
                bumpMap: this._texture,
                bumpScale: 0.2
            });
        }
    }
    GroundPlane.prototype.newPlane = function (pos) {
        var geometry = new THREE.PlaneGeometry(CarSimulator.ground_width, CarSimulator.ground_width, 50, 50);
        geometry.rotateX(-Math.PI / 2);
        for (var i = 0; i < geometry.vertices.length; i++) {
            geometry.vertices[i].y = GroundPlane.simplexNoise(pos.clone().add(geometry.vertices[i]));
        }
        geometry.computeVertexNormals();
        var mesh = new THREE.Mesh(geometry, this._material);
        mesh.position.copy(pos);
        this._mesh.push(mesh);
        this._renderer.scene.add(this._mesh[this._mesh.length - 1]);
    };
    GroundPlane.prototype.update = function (pos) {
        var x = Math.round(pos.x / CarSimulator.ground_width);
        var z = Math.round(pos.z / CarSimulator.ground_width);
        if (x != this.ground_x || z != this.ground_z) {
            for (var i = 0; i < this._mesh.length; i++) {
                var distance = Math.sqrt(Math.pow(this._mesh[i].position.x - x * CarSimulator.ground_width, 2) + Math.pow(this._mesh[i].position.z - z * CarSimulator.ground_width, 2));
                if (distance * 1.99 >= this._maxDistance) {
                    if (x != this.ground_x)
                        this._mesh[i].position.setX(this._mesh[i].position.x - (this.ground_x - x) * this._dimension * CarSimulator.ground_width);
                    if (z != this.ground_z)
                        this._mesh[i].position.setZ(this._mesh[i].position.z - (this.ground_z - z) * this._dimension * CarSimulator.ground_width);
                    this.generateTerrain(i);
                }
            }
            this.ground_x = x;
            this.ground_z = z;
        }
    };
    GroundPlane.prototype.generateTerrain = function (idx) {
        var pos = this._mesh[idx].position;
        this._mesh[idx].geometry.dynamic = true;
        this._mesh[idx].geometry.verticesNeedUpdate = true;
        for (var i = 0; i < this._mesh[idx].geometry.vertices.length; i++) {
            this._mesh[idx].geometry.vertices[i].y = GroundPlane.simplexNoise(pos.clone().add(this._mesh[idx].geometry.vertices[i]));
        }
        this._mesh[idx].geometry.computeVertexNormals();
    };
    GroundPlane.simplexNoise = function (pos) {
        return (GroundPlane._noise1.perlin2(pos.x / 40, (pos.z) / 40) * 10 + GroundPlane._noise2.simplex2(pos.x / 140, (pos.z) / 140) * 6);
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
        enumerable: true,
        configurable: true
    });
    GroundPlane.prototype.clone = function () {
        var newGround = new GroundPlane(this._planeLoadedListener, this._renderer);
        newGround.mesh = this._mesh.clone();
        newGround.geometry = this._geometry.clone();
        return newGround;
    };
    Object.defineProperty(GroundPlane.prototype, "dimension", {
        get: function () {
            return this._dimension;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GroundPlane.prototype, "collisionMesh", {
        get: function () {
            return this._collisionMesh;
        },
        enumerable: true,
        configurable: true
    });
    GroundPlane._noise1 = new Noise(0.23);
    GroundPlane._noise2 = new Noise(0.59);
    return GroundPlane;
})();
//# sourceMappingURL=ground_plane.js.map