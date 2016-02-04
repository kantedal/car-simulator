/**
 * Created by filles-dator on 2016-01-26.
 */
///<reference path="./physics_object3d.ts"/>
///<reference path="../renderer.ts"/>
///<reference path="./parts/wheel.ts"/>
///<reference path="./ground_plane.ts"/>
///<reference path="../carsimulator.ts"/>
<<<<<<< HEAD
var Car = (function () {
    function Car(renderer) {
        //super(new THREE.BoxGeometry(7, 2, 5), new THREE.MeshBasicMaterial({color: 0xff0000, wireframe: true}), renderer);
        this._renderer = renderer;
        this._wheels = [new Wheel(renderer)];
        this._wheels[0].position.set(0, 0, 50);
        renderer.scene.add(this._wheels[0].object);
        this._position = new THREE.Vector3(0, 0, 50);
    }
    Car.prototype.update = function (time, delta) {
        for (var i = 0; i < this._wheels.length; i++) {
            this._wheels[i].update(time, delta);
        }
        this._renderer.camera.lookAt(this._wheels[0].object.position);
        this._renderer.camera.position.set(this._wheels[0].position.x, this._wheels[0].position.y + 10, this._wheels[0].position.z - 15);
=======
///<reference path="./parts/motor.ts"/>
///<reference path="./parts/spring.ts"/>
var Car = (function () {
    function Car(renderer) {
        var _this = this;
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
        this._renderer = renderer;
        this._motor = new Motor(20000, 3);
        this._wheels = [new Wheel(renderer)];
        this._springs = [new Spring(renderer, this)];
        this._wheels[0].connectMotor(this._motor);
        this._wheels[0].connectSpring(this._springs[0]);
        this._velocity = this._wheels[0].velocity;
        this._acceleration = this._wheels[0].acceleration;
        this._isColliding = this._wheels[0].isColliding;
        this._position = new THREE.Vector3(0, 0, 0);
        renderer.scene.add(this._wheels[0].object);
        window.addEventListener('keydown', this.onKeyDown, false);
        window.addEventListener('keyup', this.onKeyUp, false);
    }
    Car.prototype.update = function (time, delta) {
        this._motor.update(time, delta);
        for (var i = 0; i < this._wheels.length; i++) {
            this._springs[i].update(time, delta);
            this._wheels[i].update(time, delta);
        }
        this._acceleration = this._wheels[0].acceleration;
        this._velocity = this._wheels[0].velocity;
        this._isColliding = this._wheels[0].isColliding;
        this._renderer.camera.lookAt(this._wheels[0].object.position);
        this._renderer.camera.position.set(this._wheels[0].position.x, this._wheels[0].position.y + 10, this._wheels[0].position.z + 15);
>>>>>>> 7bc88dac21abbf9f01ffc39f50de8e4d844d3590
        this._position.set(this._wheels[0].position.x, this._wheels[0].position.y, this._wheels[0].position.z);
    };
    Car.prototype.connectCollisionSurface = function (groundPlanes) {
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
<<<<<<< HEAD
=======
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
>>>>>>> 7bc88dac21abbf9f01ffc39f50de8e4d844d3590
    return Car;
})();
//# sourceMappingURL=car.js.map