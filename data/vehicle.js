/**
 * Created by filles-dator on 2016-01-26.
 */
///<reference path="./physics_object3d.ts"/>
///<reference path="../renderer.ts"/>
///<reference path="./parts/wheel.ts"/>
///<reference path="./ground_plane.ts"/>
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
        this._vehicleGroup = new THREE.Group();
        //this._vehicleBody = new DynamicRigidBody(new THREE.BoxGeometry( 6, 3, 8 ), new THREE.MeshBasicMaterial({color: 0xff0000, wireframe: true}), renderer);
        //this._vehicleBody.position.set(0,30,0);
        this._vehicleSetup = new Car(this._renderer, this);
        //renderer.scene.add(this._vehicleBody.object);
    }
    Vehicle.prototype.update = function (time, delta) {
        //this._vehicleSetup.update(time,delta);
        this._vehicleBody.update(time, delta);
        for (var i = 0; i < this._vehicleSetup.wheels.length; i++) {
            this._vehicleSetup.wheels[i].position.set(this.vehicleBody.vertexTracker.vertices[i].x, this.vehicleBody.vertexTracker.vertices[i].y, this.vehicleBody.vertexTracker.vertices[i].z);
        }
        this._acceleration = this._vehicleBody.acceleration;
        this._velocity = this._vehicleBody.velocity;
        this._isColliding = this._vehicleBody.isColliding;
        this._renderer.camera.lookAt(this._vehicleBody.position);
        this._renderer.camera.position.set(this._vehicleBody.position.x, this._vehicleBody.position.y + 10, this._vehicleBody.position.z + 15);
        this._position.set(this._vehicleBody.position.x, this._vehicleBody.position.y, this._vehicleBody.position.z);
    };
    Vehicle.prototype.connectCollisionSurface = function (groundPlanes) {
        var surfaceIndex = 0;
        for (var g = 0; g < groundPlanes.length; g++) {
            for (var i = 0; i < this._vehicleSetup.wheels.length; i++) {
                if (Math.abs(this._vehicleSetup.wheels[i].position.x - groundPlanes[g].mesh.position.x) < CarSimulator.ground_width / 2 && Math.abs(this._vehicleSetup.wheels[i].position.z - groundPlanes[g].mesh.position.z) < CarSimulator.ground_width / 2) {
                    //this._vehicleSetup.wheels[i].connectCollisionSurface(groundPlanes[g].geometry);
                    this._vehicleBody.connectCollisionSurface(groundPlanes[g].geometry);
                    surfaceIndex = g;
                    break;
                }
            }
        }
        return surfaceIndex;
    };
    Vehicle.prototype.add = function (object) {
        this._vehicleBody.object.add(object);
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
    Object.defineProperty(Vehicle.prototype, "vehicleBody", {
        get: function () {
            return this._vehicleBody;
        },
        set: function (value) {
            this._vehicleBody = value;
        },
        enumerable: true,
        configurable: true
    });
    return Vehicle;
})();
//# sourceMappingURL=vehicle.js.map