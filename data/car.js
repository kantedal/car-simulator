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
///<reference path="./dynamic_rigid_body.ts"/>
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Car = (function (_super) {
    __extends(Car, _super);
    function Car(renderer) {
        var _this = this;
        _super.call(this, new THREE.BoxGeometry(6, 3, 8), new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true }), renderer);
        this.pressedKeys = [];
        this.onKeyDown = function (e) {
            if (e) {
                _this.pressedKeys[e.keyCode] = true;
                if (_this.pressedKeys[37]) {
                    _this._steering.steeringAcceleration = 110;
                }
                if (_this.pressedKeys[38]) {
                    _this._motor.isAccelerating = true;
                }
                if (_this.pressedKeys[39]) {
                    _this._steering.steeringAcceleration = -110;
                }
                if (_this.pressedKeys[40]) {
                }
            }
        };
        this.onKeyUp = function (e) {
            if (e) {
                _this.pressedKeys[e.keyCode] = false;
                switch (e.which) {
                    case 37:
                        break;
                    case 38:
                        _this._motor.isAccelerating = false;
                        break;
                    case 39:
                        break;
                    case 40:
                        break;
                }
            }
        };
        this.object.position.setY(3);
        this.rotation = Math.PI / 2;
        this._renderer = renderer;
        this._carGroup = new THREE.Group();
        this._carGroup.add(this.object);
        this._renderer.scene.add(this._carGroup);
        this._motor = new Motor(5000, 3);
        this._wheels = [new Wheel(renderer, this), new Wheel(renderer, this), new Wheel(renderer, this), new Wheel(renderer, this)];
        this._springs = [new Spring(renderer, this), new Spring(renderer, this), new Spring(renderer, this), new Spring(renderer, this)];
        this._steering = new Steering(Math.PI / 2);
        this.desiredDirection.set(0, 0, 0);
        this._wheels[0].connectSpring(this._springs[0]);
        this._wheels[0].connectSteering(this._steering);
        this._wheels[0].object.position.set(-5.5, 0, -4);
        this._wheels[0].rotation = Math.PI / 2;
        this._springs[0].springGroup.position.set(-4.5, 0, -4);
        this._springs[0].springGroup.rotateZ(-Math.PI / 9);
        this._carGroup.add(this._wheels[0].object);
        this._carGroup.add(this._springs[0].springGroup);
        this._wheels[1].connectSpring(this._springs[1]);
        this._wheels[1].connectSteering(this._steering);
        this._wheels[1].object.position.set(5.5, 0, -4);
        this._wheels[1].rotation = Math.PI / 2;
        this._springs[1].springGroup.position.set(4.5, 0, -4);
        this._springs[1].springGroup.rotateZ(Math.PI / 9);
        this._carGroup.add(this._wheels[1].object);
        this._carGroup.add(this._springs[1].springGroup);
        this._wheels[2].connectMotor(this._motor);
        this._wheels[2].object.position.set(-5.5, 0, 4);
        this._wheels[2].rotation = Math.PI / 2;
        this._springs[2].springGroup.position.set(-4.5, 0, 4);
        this._springs[2].springGroup.rotateZ(-Math.PI / 9);
        this._wheels[2].connectSpring(this._springs[2]);
        this._carGroup.add(this._wheels[2].object);
        this._carGroup.add(this._springs[2].springGroup);
        this._wheels[3].connectMotor(this._motor);
        this._wheels[3].object.position.set(5.5, 0, 4);
        this._wheels[3].rotation = Math.PI / 2;
        this._springs[3].springGroup.position.set(4.5, 0, 4);
        this._springs[3].springGroup.rotateZ(Math.PI / 9);
        this._wheels[3].connectSpring(this._springs[3]);
        this._carGroup.add(this._wheels[3].object);
        this._carGroup.add(this._springs[3].springGroup);
        window.addEventListener('keydown', this.onKeyDown, false);
        window.addEventListener('keyup', this.onKeyUp, false);
    }
    Car.prototype.update = function (time, delta) {
        _super.prototype.update.call(this, time, delta);
        this._motor.update(time, delta);
        for (var i = 0; i < this._wheels.length; i++) {
            this._springs[i].update(time, delta);
            this._wheels[i].update(time, delta);
        }
        this.acceleration.set(0, 0, 0);
        for (var i = 0; i < this._wheels.length; i++) {
            if (this._wheels[i].connectedMotor) {
                this.acceleration.set(this.acceleration.x + 0.003 * (this._wheels[i].desiredDirection.x * this._motor.torque + this._wheels[i].frictionForce.x * 5000), this.acceleration.y + 0.003 * (this._wheels[i].desiredDirection.y * this._motor.torque + this._wheels[i].frictionForce.y * 5000), this.acceleration.z + 0.003 * (this._wheels[i].desiredDirection.z * this._motor.torque + this._wheels[i].frictionForce.z * 5000));
            }
            else {
                this.acceleration.set(this.acceleration.x + 0.003 * this._wheels[i].frictionForce.x * 5000, this.acceleration.y + 0.003 * this._wheels[i].frictionForce.y * 5000, this.acceleration.z + 0.003 * this._wheels[i].frictionForce.z * 5000);
            }
        }
        // if(!this.isColliding)
        //    this.acceleration.setY(this.acceleration.y - 9.82*10)
        this.velocity.set(this.velocity.x + 0.003 * this.acceleration.x, this.velocity.y + 0.003 * this.acceleration.y, this.velocity.z + 0.003 * this.acceleration.z);
        this.velocity.projectOnPlane(this.normalDirection);
        this.position.set(this.position.x + this.velocity.x, this.position.y + this.velocity.y, this.position.z + this.velocity.z);
        this._steering.update(time, delta);
        this._carGroup.position.set(this.position.x - this.velocity.x * 1.95, this.position.y - this.velocity.y * 1.95, this.position.z - this.velocity.z * 1.96);
        this._carGroup.rotateOnAxis(new THREE.Vector3(0, 1, 0), (this._steering.steeringAngle - Math.PI / 2) * 0.05 * this.velocity.length());
        this.rotation += (this._steering.steeringAngle - Math.PI / 2) * 0.1 * this.velocity.length();
        this._renderer.camera.lookAt(this._carGroup.position);
        this._renderer.camera.position.set(this._carGroup.position.x, this._carGroup.position.y + 10, this._carGroup.position.z + 15);
        //this._carGroup.rotateZ(Math.sin(time*4)*0.02);
    };
    Car.prototype.connectWheelsCollisionSurface = function (groundPlanes) {
        var surfaceIndex = 0;
        //for(var g=0; g<groundPlanes.length; g++){
        //    if(Math.abs(this.position.x - groundPlanes[g].mesh.position.x) < CarSimulator.ground_width/2 && Math.abs(this.position.z - groundPlanes[g].mesh.position.z) < CarSimulator.ground_width/2) {
        //        this.connectCollisionSurface(groundPlanes[g].geometry);
        //        surfaceIndex = g;
        //        break;
        //    }
        //}
        for (var g = 0; g < groundPlanes.length; g++) {
            for (var i = 0; i < this._wheels.length; i++) {
                if (Math.abs(this._wheels[i].position.x - groundPlanes[g].mesh.position.x) < CarSimulator.ground_width / 2 && Math.abs(this._wheels[i].position.z - groundPlanes[g].mesh.position.z) < CarSimulator.ground_width / 2) {
                    this._wheels[i].connectCollisionSurface(groundPlanes[g].geometry);
                    // this.connectCollisionSurface(groundPlanes[g].geometry);
                    surfaceIndex = g;
                }
            }
        }
        return surfaceIndex;
    };
    Object.defineProperty(Car.prototype, "acceleration", {
        get: function () {
            return this._acceleration;
        },
        set: function (value) {
            this._acceleration = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Car.prototype, "isColliding", {
        get: function () {
            return this._isColliding;
        },
        set: function (value) {
            this._isColliding = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Car.prototype, "velocity", {
        get: function () {
            return this._velocity;
        },
        set: function (value) {
            this._velocity = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Car.prototype, "rotation", {
        get: function () {
            return this._rotation;
        },
        set: function (value) {
            this._rotation = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Car.prototype, "carGroup", {
        get: function () {
            return this._carGroup;
        },
        set: function (value) {
            this._carGroup = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Car.prototype, "steering", {
        get: function () {
            return this._steering;
        },
        set: function (value) {
            this._steering = value;
        },
        enumerable: true,
        configurable: true
    });
    return Car;
})(PhysicsObject3d);
//# sourceMappingURL=car.js.map