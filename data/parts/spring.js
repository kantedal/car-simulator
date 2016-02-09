/**
 * Created by filles-dator on 2016-02-03.
 */
///<reference path="../../renderer.ts"/>
///<reference path="../vehicle.ts"/>
var Spring = (function () {
    function Spring(renderer, vehicle, startRot) {
        this.a = 0;
        this.v = 0;
        this.k = 10000;
        this.c = 1500;
        this._vehicle = vehicle;
        this._renderer = renderer;
        this._springGroup = new THREE.Group();
        this._springGroup.rotateX(startRot);
        this._spring = new THREE.Object3D();
        this._spring.position.set(0, 0, 0);
        this._springGroup.add(this._spring);
        this._wheelConnectorMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.5, 10), new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true }));
        this._wheelConnectorMesh.position.set(0, 0, 0);
        this._springGroup.add(this._wheelConnectorMesh);
        this._carBodyConnectorMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.5, 10), new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true }));
        this._carBodyConnectorMesh.position.set(0, 8, 0);
        this._springGroup.add(this._carBodyConnectorMesh);
        this._springDirection = new THREE.Vector3(0, 1, 0);
        this._springArrow = new THREE.ArrowHelper(this._springDirection, new THREE.Vector3(0, 0, 0), 10, 0x00ffff);
        this.loadSpringModel();
    }
    Spring.prototype.loadSpringModel = function () {
        var self = this;
        var loader = new THREE.OBJLoader();
        loader.load('./models/spring2.obj', function (object) {
            var material1 = new THREE.MeshBasicMaterial({ color: 0x999999, wireframe: true });
            self._springMesh = object.clone();
            self._springMesh.scale.set(0.4, 0.4, 0.4);
            self._springMesh.position.set(0, 1.2, 0);
            //self._springMesh.position.set(self._wheelConnectorMesh.position.x, self._wheelConnectorMesh.position.y, self._wheelConnectorMesh.position.z);
            self._spring.add(self._springMesh);
        }, function (xhr) {
            console.log('An error happened');
        });
    };
    Spring.prototype.update = function (time, delta) {
        if (this._springMesh) {
            var dampConst = 5000;
            this.a = -(this._vehicle.acceleration.y / 0.003 + 9.82) - (this.k * (this._carBodyConnectorMesh.position.y - 4.5) + this.c * this.v) / 500;
            this._carBodyConnectorMesh.position.y += this.v * 0.03;
            this._spring.scale.y = this._carBodyConnectorMesh.position.y * 0.35 + 0.2;
            this.v += this.a * 0.03;
        }
    };
    Object.defineProperty(Spring.prototype, "position", {
        get: function () {
            return this._springGroup.position;
        },
        set: function (value) {
            this._springGroup.position = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Spring.prototype, "springObject", {
        get: function () {
            return this._springGroup;
        },
        enumerable: true,
        configurable: true
    });
    return Spring;
})();
//# sourceMappingURL=spring.js.map