/**
 * Created by filles-dator on 2016-02-03.
 */
///<reference path="../../renderer.ts"/>
///<reference path="../car.ts"/>
var Spring = (function () {
    function Spring(renderer, car) {
        this.a = 0;
        this.v = 0;
        this.k = 1000;
        this.c = 800;
        this._car = car;
        this._renderer = renderer;
        this._position = new THREE.Vector3(0, 0, 0);
        this._springGroup = new THREE.Group();
        this._springGroup.position.set(0, 2.0, 1.0);
        this._renderer.scene.add(this._springGroup);
        this._spring = new THREE.Object3D();
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
            console.log("success");
            var material1 = new THREE.MeshBasicMaterial({ color: 0x999999, wireframe: true });
            self._springMesh = object.clone();
            self._springMesh.scale.set(0.38, 0.4, 0.38);
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
            console.log(this._car.acceleration.y);
            this.a = -((this._car.acceleration.y / 0.003 + 9.82) - (this.k * (this._carBodyConnectorMesh.position.y - 4.5) + this.c * this.v) / 500);
            this._carBodyConnectorMesh.position.y += this.v * 0.03;
            this._spring.scale.y = this._carBodyConnectorMesh.position.y * 0.3 + 0.2;
            this.v += this.a * 0.03;
        }
    };
    Object.defineProperty(Spring.prototype, "position", {
        get: function () {
            return this._position;
        },
        set: function (value) {
            this._position = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Spring.prototype, "springGroup", {
        get: function () {
            return this._springGroup;
        },
        enumerable: true,
        configurable: true
    });
    return Spring;
})();
//# sourceMappingURL=spring.js.map