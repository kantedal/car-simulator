/**
 * Created by filles-dator on 2016-01-26.
 */
///<reference path="./physics_object3d.ts"/>
///<reference path="../renderer.ts"/>
///<reference path="./parts/wheel.ts"/>
///<reference path="./parts/vehicle_camera.ts"/>
///<reference path="./environment/ground_plane.ts"/>
///<reference path="../carsimulator.ts"/>
///<reference path="./parts/motor.ts"/>
///<reference path="./parts/spring.ts"/>
///<reference path="./parts/steering.ts"/>
///<reference path="./vehiclesetup.ts"/>
///<reference path="./dynamic_car_body.ts"/>
///<reference path="./car.ts"/>
var Vehicle = (function () {
    function Vehicle(renderer) {
        this._renderer = renderer;
        this._position = new THREE.Vector3(0, 0, 0);
        this._rotation = new THREE.Vector3(0, 0, 0);
        this._acceleration = new THREE.Vector3(0, 0, 0);
        this._velocity = new THREE.Vector3(0, 0, 0);
        this._isColliding = false;
        var geometry = new THREE.BoxGeometry(0, 0, 0);
        this._vehicleModel = new DynamicRigidBody(geometry, new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true }), renderer);
        //this._vehicleModel.position.set(0,30,0);
        this._vehicleSetup = new Car(this._renderer, this);
        this._vehicleCamera = new VehicleCamera(this._vehicleSetup, this._vehicleModel, this._renderer.camera);
    }
    Vehicle.prototype.update = function (time, delta) {
        this._vehicleCamera.update(time, delta);
        this._vehicleSetup.update(time, delta);
        this._vehicleModel.update(time, delta);
        this._velocity = this._vehicleModel.velocity;
        this._isColliding = this._vehicleModel.isColliding;
        this._position.set(this._vehicleModel.object.position.x, this._vehicleModel.object.position.y, this._vehicleModel.object.position.z);
        //this._vehicleSetup.vehicleBody.object.position.setY(Math.sin(time*3));
        for (var colNum = 0; colNum < this._vehicleModel.collisions.length; colNum++) {
            var force_radius = math.matrix([this._vehicleModel.collisions[colNum].valueOf()[0], this._vehicleModel.collisions[colNum].valueOf()[1], this._vehicleModel.collisions[colNum].valueOf()[2]]);
            var normal = math.matrix([this._vehicleModel.collisions[colNum].valueOf()[3], this._vehicleModel.collisions[colNum].valueOf()[4], this._vehicleModel.collisions[colNum].valueOf()[5]]);
            this._vehicleSetup.vehicleBody.applyForce(normal, force_radius);
        }
        this._vehicleSetup.vehicleBody.update(time, delta);
    };
    Vehicle.prototype.setFromNetworkData = function (data) {
        this._vehicleModel.object.position.set(data.car_data.x, data.car_data.y, data.car_data.z);
        this._vehicleModel.object.rotation.set(data.car_data.rx, data.car_data.ry, data.car_data.rz);
        this._vehicleSetup.vehicleBody.object.position.setY(data.car_data.rel_y);
        this._vehicleSetup.vehicleBody.object.rotation.set(data.car_data.rel_rx, data.car_data.rel_ry, data.car_data.rel_rz);
    };
    Vehicle.prototype.connectCollisionSurface = function (groundPlanes) {
        var surfaceIndex = 0;
        for (var g = 0; g < groundPlanes.length; g++) {
            for (var i = 0; i < this._vehicleSetup.wheels.length; i++) {
                if (Math.abs(this._vehicleSetup.wheels[i].position.x - groundPlanes[g].mesh.position.x) < CarSimulator.ground_width / 2 && Math.abs(this._vehicleSetup.wheels[i].position.z - groundPlanes[g].mesh.position.z) < CarSimulator.ground_width / 2) {
                    //this._vehicleSetup.wheels[i].connectCollisionSurface(groundPlanes[g].geometry);
                    this._vehicleModel.connectCollisionSurface(groundPlanes[g].geometry);
                    surfaceIndex = g;
                    break;
                }
            }
        }
        return surfaceIndex;
    };
    Vehicle.prototype.add = function (object) {
        this._vehicleModel.object.add(object);
    };
    Object.defineProperty(Vehicle.prototype, "position", {
        get: function () {
            return this._position;
        },
        set: function (value) {
            this._position = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Vehicle.prototype, "acceleration", {
        get: function () {
            return this._acceleration;
        },
        set: function (value) {
            this._acceleration = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Vehicle.prototype, "isColliding", {
        get: function () {
            return this._isColliding;
        },
        set: function (value) {
            this._isColliding = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Vehicle.prototype, "velocity", {
        get: function () {
            return this._velocity;
        },
        set: function (value) {
            this._velocity = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Vehicle.prototype, "rotation", {
        get: function () {
            return this._rotation;
        },
        set: function (value) {
            this._rotation = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Vehicle.prototype, "vehicleSetup", {
        get: function () {
            return this._vehicleSetup;
        },
        set: function (value) {
            this._vehicleSetup = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Vehicle.prototype, "vehicleModel", {
        get: function () {
            return this._vehicleModel;
        },
        set: function (value) {
            this._vehicleModel = value;
        },
        enumerable: true,
        configurable: true
    });
    return Vehicle;
})();
//# sourceMappingURL=vehicle.js.map