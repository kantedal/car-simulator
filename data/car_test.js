/**
 * Created by filles-dator on 2016-02-25.
 */
///<reference path="../threejs/three.d.ts"/>
///<reference path="./physics_object3d.ts"/>
///<reference path="./constraints/collision_constraint.ts"/>
///<reference path="../math/mathjs.d.ts"/>
///<reference path="./particle_collider.ts"/>
///<reference path="./constraints/spring_constraint.ts"/>
///<reference path="./parts/wheel.ts"/>
var CarTest = (function () {
    function CarTest(renderer) {
        var _this = this;
        this.pressedKeys = [];
        this.onKeyDown = function (e) {
            if (e) {
                _this.pressedKeys[e.keyCode] = true;
                if (_this.pressedKeys[37]) {
                    console.log("CONSOLE");
                    if (_this._steering)
                        _this._steering.steeringAcceleration += 100;
                }
                if (_this.pressedKeys[38]) {
                    console.log("ACCELERATE");
                    if (_this._motor)
                        _this._motor.isAccelerating = true;
                }
                if (_this.pressedKeys[39]) {
                    if (_this._steering)
                        _this._steering.steeringAcceleration -= 100;
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
                        if (_this._motor)
                            _this._motor.isAccelerating = false;
                        break;
                    case 39:
                        break;
                    case 40:
                        break;
                }
            }
        };
        this._vehicleBody = new DynamicRigidBody(new THREE.BoxGeometry(6, 3, 8), new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true }), renderer);
        this._vehicleBody.state.valueOf()[1] = 35;
        //this._vehicleBody.velocity.valueOf()[3] = 1;
        this._motor = new Motor(20000, 100);
        this._steering = new Steering(Math.PI / 2);
        this._wheels = [
            new Wheel(renderer),
            new Wheel(renderer),
            new Wheel(renderer),
            new Wheel(renderer)
        ];
        renderer.scene.add(this._wheels[0].object);
        renderer.scene.add(this._wheels[1].object);
        renderer.scene.add(this._wheels[2].object);
        renderer.scene.add(this._wheels[3].object);
        this._wheels[0].state.valueOf()[0] = 3;
        this._wheels[0].state.valueOf()[1] = 30.5;
        this._wheels[0].state.valueOf()[2] = 4;
        this._wheels[0].connectSteering(this._steering);
        this._wheels[1].state.valueOf()[0] = -3;
        this._wheels[1].state.valueOf()[1] = 30.5;
        this._wheels[1].state.valueOf()[2] = 4;
        this._wheels[1].connectSteering(this._steering);
        this._wheels[2].state.valueOf()[0] = 3;
        this._wheels[2].state.valueOf()[1] = 30.5;
        this._wheels[2].state.valueOf()[2] = -4;
        this._wheels[2].connectMotor(this._motor);
        this._wheels[3].state.valueOf()[0] = -3;
        this._wheels[3].state.valueOf()[1] = 30.5;
        this._wheels[3].state.valueOf()[2] = -4;
        this._wheels[3].connectMotor(this._motor);
        this._wheelAxis = [
            this._vehicleBody.vertexTracker.vertices[0].clone().sub(this._vehicleBody.vertexTracker.vertices[4]),
            this._vehicleBody.vertexTracker.vertices[0].clone().sub(this._vehicleBody.vertexTracker.vertices[4]),
            this._vehicleBody.vertexTracker.vertices[0].clone().sub(this._vehicleBody.vertexTracker.vertices[4]),
            this._vehicleBody.vertexTracker.vertices[0].clone().sub(this._vehicleBody.vertexTracker.vertices[4])
        ];
        this._wheelAxisStart = [
            this._vehicleBody.vertexTracker.vertices[7].clone().add(new THREE.Vector3(this.vehicleBody.state.valueOf()[0], this.vehicleBody.state.valueOf()[1], this.vehicleBody.state.valueOf()[2])),
            this._vehicleBody.vertexTracker.vertices[2].clone().add(new THREE.Vector3(this.vehicleBody.state.valueOf()[0], this.vehicleBody.state.valueOf()[1], this.vehicleBody.state.valueOf()[2])),
            this._vehicleBody.vertexTracker.vertices[6].clone().add(new THREE.Vector3(this.vehicleBody.state.valueOf()[0], this.vehicleBody.state.valueOf()[1], this.vehicleBody.state.valueOf()[2])),
            this._vehicleBody.vertexTracker.vertices[3].clone().add(new THREE.Vector3(this.vehicleBody.state.valueOf()[0], this.vehicleBody.state.valueOf()[1], this.vehicleBody.state.valueOf()[2]))
        ];
        this._wheelAxisArrow = [
            new THREE.ArrowHelper(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0), 4, 0x0000ff),
            new THREE.ArrowHelper(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0), 4, 0x0000ff),
            new THREE.ArrowHelper(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0), 4, 0x0000ff),
            new THREE.ArrowHelper(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0), 4, 0x0000ff)
        ];
        renderer.scene.add(this._wheelAxisArrow[0]);
        renderer.scene.add(this._wheelAxisArrow[1]);
        renderer.scene.add(this._wheelAxisArrow[2]);
        renderer.scene.add(this._wheelAxisArrow[3]);
        this._springs = [
            new SpringConstraint(3),
            new SpringConstraint(3),
            new SpringConstraint(3),
            new SpringConstraint(3)
        ];
        this._forwardDirection = new THREE.Vector3(this._vehicleBody.vertexTracker.vertices[0].x + this._vehicleBody.vertexTracker.vertices[5].x, this._vehicleBody.vertexTracker.vertices[0].y + this._vehicleBody.vertexTracker.vertices[5].y, this._vehicleBody.vertexTracker.vertices[0].z + this._vehicleBody.vertexTracker.vertices[5].z);
        this._forwardDirectionArrow = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0), 4, 0x00ffff);
        this._forwardDirectionArrow.setDirection(this._forwardDirection);
        this._forwardDirectionArrow.position.set(this._vehicleBody.state.valueOf()[0], this._vehicleBody.state.valueOf()[1], this._vehicleBody.state.valueOf()[2]);
        renderer.scene.add(this._forwardDirectionArrow);
        window.addEventListener('keydown', this.onKeyDown, false);
        window.addEventListener('keyup', this.onKeyUp, false);
    }
    CarTest.prototype.update = function (time, delta) {
        this._steering.update(time, delta);
        this._motor.update(time, delta);
        this._forwardDirection = new THREE.Vector3(this._vehicleBody.vertexTracker.vertices[0].x + this._vehicleBody.vertexTracker.vertices[5].x, 0, this._vehicleBody.vertexTracker.vertices[0].z + this._vehicleBody.vertexTracker.vertices[5].z);
        this._forwardDirectionArrow.setDirection(this._forwardDirection);
        this._forwardDirectionArrow.position.set(this._vehicleBody.state.valueOf()[0], this._vehicleBody.state.valueOf()[1], this._vehicleBody.state.valueOf()[2]);
        this.setAxis();
        this.projectWheelsOnAxis();
        //console.log(this._wheelAxis[0].x + "  " + this._wheelAxis[0].y + "  " + this._wheelAxis[0].z);
        for (var i = 0; i < 4; i++) {
            var springVel = this._springs[i].solveConstraint(this._wheelAxis[i], this._wheels[i].state, this._wheelAxisStart[i], this._wheels[i].velocity, this._vehicleBody.velocity, delta);
        }
        //this._vehicleBody.force.set(this._vehicleBody.f)
        this._vehicleBody.update(time, delta);
        for (var i = 0; i < 4; i++) {
            this._wheels[i].object.geometry.rotateX(this.vehicleBody.velocity.valueOf()[3] * delta);
            this._wheels[i].object.geometry.rotateY(this.vehicleBody.velocity.valueOf()[4] * delta);
            this._wheels[i].object.geometry.rotateZ(this.vehicleBody.velocity.valueOf()[5] * delta);
            this._wheels[i].update(time, delta, this._wheelAxis[i]);
            var forwardForce = math.matrix([
                this._forwardDirection.clone().multiplyScalar(this._wheels[i].forwardForce).x,
                this._forwardDirection.clone().multiplyScalar(this._wheels[i].forwardForce).y,
                this._forwardDirection.clone().multiplyScalar(this._wheels[i].forwardForce).z,
                0, 0, 0
            ]);
            this._vehicleBody.forceExternal = math.add(this._vehicleBody.forceExternal, forwardForce);
        }
    };
    CarTest.prototype.setAxis = function () {
        this._wheelAxis[0] = this._vehicleBody.vertexTracker.vertices[2].clone().sub(this._vehicleBody.vertexTracker.vertices[0]);
        this._wheelAxis[0].multiplyScalar(1 / this.getLength(this._wheelAxis[0]));
        this._wheelAxisStart[0] = this._vehicleBody.vertexTracker.vertices[2].clone().add(new THREE.Vector3(this.vehicleBody.state.valueOf()[0], this.vehicleBody.state.valueOf()[1], this.vehicleBody.state.valueOf()[2]));
        this._wheelAxisArrow[0].position.set(this._wheelAxisStart[0].x, this._wheelAxisStart[0].y, this._wheelAxisStart[0].z);
        this._wheelAxisArrow[0].setDirection(this._wheelAxis[0]);
        this._wheelAxis[1] = this._vehicleBody.vertexTracker.vertices[7].clone().sub(this._vehicleBody.vertexTracker.vertices[5]);
        this._wheelAxis[1].multiplyScalar(1 / this.getLength(this._wheelAxis[1]));
        this._wheelAxisStart[1] = this._vehicleBody.vertexTracker.vertices[7].clone().add(new THREE.Vector3(this.vehicleBody.state.valueOf()[0], this.vehicleBody.state.valueOf()[1], this.vehicleBody.state.valueOf()[2]));
        this._wheelAxisArrow[1].position.set(this._wheelAxisStart[1].x, this._wheelAxisStart[1].y, this._wheelAxisStart[1].z);
        this._wheelAxisArrow[1].setDirection(this._wheelAxis[1]);
        this._wheelAxis[3] = this._vehicleBody.vertexTracker.vertices[6].clone().sub(this._vehicleBody.vertexTracker.vertices[4]);
        this._wheelAxis[3].multiplyScalar(1 / this.getLength(this._wheelAxis[3]));
        this._wheelAxisStart[3] = this._vehicleBody.vertexTracker.vertices[6].clone().add(new THREE.Vector3(this.vehicleBody.state.valueOf()[0], this.vehicleBody.state.valueOf()[1], this.vehicleBody.state.valueOf()[2]));
        this._wheelAxisArrow[3].position.set(this._wheelAxisStart[3].x, this._wheelAxisStart[3].y, this._wheelAxisStart[3].z);
        this._wheelAxisArrow[3].setDirection(this._wheelAxis[3]);
        this._wheelAxis[2] = this._vehicleBody.vertexTracker.vertices[3].clone().sub(this._vehicleBody.vertexTracker.vertices[1]);
        this._wheelAxis[2].multiplyScalar(1 / this.getLength(this._wheelAxis[2]));
        this._wheelAxisStart[2] = this._vehicleBody.vertexTracker.vertices[3].clone().add(new THREE.Vector3(this.vehicleBody.state.valueOf()[0], this.vehicleBody.state.valueOf()[1], this.vehicleBody.state.valueOf()[2]));
        this._wheelAxisArrow[2].position.set(this._wheelAxisStart[2].x, this._wheelAxisStart[2].y, this._wheelAxisStart[2].z);
        this._wheelAxisArrow[2].setDirection(this._wheelAxis[2]);
    };
    CarTest.prototype.getLength = function (vec) {
        return Math.sqrt(vec.x * vec.x + vec.y * vec.y + vec.z * vec.z);
    };
    CarTest.prototype.projectWheelsOnAxis = function () {
        for (var i = 0; i < 4; i++) {
            var startPoint = this._wheelAxisStart[i].clone();
            var distance = this._springs[i].calculateDistance(this._wheels[i].state, startPoint);
            distance = 4;
            var newPos = startPoint.add(this._wheelAxis[i].clone().multiplyScalar(distance));
            this._wheels[i].state.valueOf()[0] = newPos.x;
            this._wheels[i].state.valueOf()[1] = newPos.y;
            this._wheels[i].state.valueOf()[2] = newPos.z;
        }
    };
    CarTest.prototype.connectCollisionSurface = function (surface) {
        this._vehicleBody.connectCollisionSurface(surface);
        for (var i = 0; i < this._wheels.length; i++)
            this._wheels[i].connectCollisionSurface(surface);
    };
    Object.defineProperty(CarTest.prototype, "vehicleBody", {
        get: function () {
            return this._vehicleBody;
        },
        set: function (value) {
            this._vehicleBody = value;
        },
        enumerable: true,
        configurable: true
    });
    return CarTest;
}());
