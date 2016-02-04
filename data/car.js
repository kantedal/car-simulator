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
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Car = (function (_super) {
    __extends(Car, _super);
    function Car(renderer) {
        var _this = this;
        _super.call(this, new THREE.BoxGeometry(1, 2, 5), new THREE.MeshBasicMaterial({ color: 0x999999, wireframe: true }), renderer);
        this._steeringAngle = 0;
        this.pressedKeys = [];
        this.onKeyDown = function (e) {
            if (e) {
                _this.pressedKeys[e.keyCode] = true;
                if (_this.pressedKeys[37]) {
                    _this._steeringAngle += 0.35;
                    _this._wheels[0].rotation = _this._steeringAngle;
                }
                if (_this.pressedKeys[38]) {
                    _this._motor.isAccelerating = true;
                }
                if (_this.pressedKeys[39]) {
                    _this._steeringAngle -= 0.35;
                    _this._wheels[0].rotation = _this._steeringAngle;
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
        this.position.set(0, 100, 0);
        this._renderer = renderer;
        this._motor = new Motor(20000, 3);
        this._wheels = [new Wheel(renderer)];
        this._springs = [new Spring(renderer, this)];
        this._wheels[0].connectMotor(this._motor);
        this._wheels[0].connectSpring(this._springs[0]);
        this.acceleration = this._wheels[0].acceleration;
        renderer.scene.add(this._wheels[0].object);
        window.addEventListener('keydown', this.onKeyDown, false);
        window.addEventListener('keyup', this.onKeyUp, false);
    }
    Car.prototype.update = function (time, delta) {
        _super.prototype.update.call(this, time, delta);
        this._motor.update(time, delta);
        this.acceleration = this._wheels[0].acceleration;
        for (var i = 0; i < this._wheels.length; i++) {
            this._wheels[i].update(time, delta);
            this._springs[i].update(time, delta);
        }
        console.log(this.object.position.y);
        this.object.position.set(0, 100, 0);
        this._renderer.camera.lookAt(this._wheels[0].object.position);
        this._renderer.camera.position.set(this._wheels[0].position.x, this._wheels[0].position.y + 10, this._wheels[0].position.z + 15);
        //this.position.set(this._wheels[0].position.x, this._wheels[0].position.y, this._wheels[0].position.z);
    };
    Car.prototype.connectWheelsToCollisionSurface = function (groundPlanes) {
        var surfaceIndex = 0;
        for (var g = 0; g < groundPlanes.length; g++) {
            for (var i = 0; i < this._wheels.length; i++) {
                if (Math.abs(this._wheels[i].position.x - groundPlanes[g].mesh.position.x) < CarSimulator.ground_width / 2 && Math.abs(this._wheels[i].position.z - groundPlanes[g].mesh.position.z) < CarSimulator.ground_width / 2) {
                    this._wheels[i].connectCollisionSurface(groundPlanes[g].geometry);
                    surfaceIndex = g;
                    break;
                }
            }
        }
        return surfaceIndex;
    };
    Object.defineProperty(Car.prototype, "position", {
        get: function () {
            return this._position;
        },
        set: function (value) {
            this._position = value;
        },
        enumerable: true,
        configurable: true
    });
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
    return Car;
})(PhysicsObject3d);
//# sourceMappingURL=car.js.map