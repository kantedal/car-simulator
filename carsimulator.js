/**
 * Created by filles-dator on 2016-01-26.
*/
///<reference path="./renderer.ts"/>
///<reference path="./data/ground_plane.ts"/>
///<reference path="./data/parts/wheel.ts"/>
///<reference path="./data/physics_object3d.ts"/>
///<reference path="./data/vehicle.ts"/>
///<reference path="./data/dynamic_rigid_body.ts"/>
///<reference path="./data/car_test.ts"/>
///<reference path="./data/environment/object_loader.ts"/>
///<reference path="./math/stats.d.ts"/>
///<reference path="./data/network/socket.ts"/>
/// <reference path="./math/jquery.d.ts" />
var CarSimulator = (function () {
    function CarSimulator() {
        this._surfaceIndex = 0;
        this._renderer = new Renderer();
        this._clock = new THREE.Clock();
        this._stats = new Stats();
        this._time = 0;
        this._groundPlanes = new GroundPlane();
        ;
        this._car = new Vehicle(this._renderer);
        this._objectLoader = new ObjectLoader();
        if (!CarSimulator.developer_mode)
            this._groundObjects = new GroundObjects(this._renderer, this._groundPlanes);
        this._socket = new Socket(this._renderer);
        this.handleJqueryEvents();
        //this._dynamicBody = new DynamicRigidBody(new THREE.BoxGeometry( 6, 3, 8 ), new THREE.MeshBasicMaterial({color: 0xff0000, wireframe: true}), this._renderer, 500, this);
    }
    CarSimulator.prototype.start = function () {
        var self = this;
        self._renderer.start();
        //self._carTest = new CarTest(this._renderer);
        //this._dynamicBody = new DynamicRigidBody(new THREE.BoxGeometry(8,2,4), new THREE.MeshBasicMaterial({color: 0x999999, wireframe: true}), this._renderer);
        this._collisionScene = new THREE.Scene();
        this._groundPlanes = new GroundPlane(this._renderer, 11);
        var width = CarSimulator.ground_width;
        var dim = this._groundPlanes.dimension;
        for (var x = 0; x < dim; x++) {
            for (var z = 0; z < dim; z++) {
                this._groundPlanes.newPlane(new THREE.Vector3(width * x - width * (dim - 1) / 2, 0, width * z - width * (dim - 1) / 2));
            }
        }
        this._car.vehicleModel.connectCollisionSurfaces(this._groundPlanes.collisionMesh);
        var objectsLoaderListener = {
            objectsLoaded: function () {
                self._renderer.scene.add(self._objectLoader.wheelMesh);
                self._objectLoader.wheelMesh.rotateY(Math.PI / 2);
                self._objectLoader.wheelMesh.scale.set(1.6, 1.6, 1.6);
                for (var w = 0; w < self._car.vehicleSetup.wheels.length; w++) {
                    self._car.vehicleSetup.wheels[w].attatchMesh(self._objectLoader.wheelMesh.clone());
                }
            }
        };
        this._objectLoader.load(objectsLoaderListener);
        this._stats = new Stats();
        this._stats.setMode(0); // 0: fps, 1: ms, 2: mb
        this._stats.domElement.style.position = 'absolute';
        this._stats.domElement.style.left = '20px';
        this._stats.domElement.style.top = '20px';
        document.body.appendChild(this._stats.domElement);
        this.update();
    };
    CarSimulator.prototype.update = function (delta) {
        this._stats.begin();
        this._socket.update(this._car);
        var delta = (this._clock.getElapsedTime() - this._time);
        if (delta > 0.06)
            delta = 0.06;
        this._groundPlanes.update(this._car.vehicleModel.object.position);
        this._car.update(this._time, delta);
        if (!CarSimulator.developer_mode)
            this._groundObjects.update(this._car.vehicleModel.object.position);
        var self = this;
        requestAnimationFrame(function () { return self.update(); });
        this._renderer.render();
        this._stats.end();
    };
    CarSimulator.prototype.handleJqueryEvents = function () {
        var self = this;
        $("#connectButton").click(function () {
            self._socket.connectToPeer($("#idText").val());
        });
    };
    Object.defineProperty(CarSimulator.prototype, "renderer", {
        get: function () {
            return this._renderer;
        },
        set: function (value) {
            this._renderer = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CarSimulator.prototype, "collisionScene", {
        get: function () {
            return this._collisionScene;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CarSimulator.prototype, "clock", {
        get: function () {
            return this._clock;
        },
        set: function (value) {
            this._clock = value;
        },
        enumerable: true,
        configurable: true
    });
    CarSimulator.ground_width = 40;
    CarSimulator.developer_mode = true;
    return CarSimulator;
})();
window.onload = function () {
    var app = new CarSimulator();
    app.start();
};
//# sourceMappingURL=carsimulator.js.map