/**
 * Created by filles-dator on 2016-01-26.
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
///<reference path="../physics_object3d.ts"/>
///<reference path="../dynamic_rigid_body.ts"/>
///<reference path="./motor.ts"/>
///<reference path="./spring.ts"/>
///<reference path="../particle_collider.ts"/>
var Wheel = (function (_super) {
    __extends(Wheel, _super);
    function Wheel(renderer, pos) {
        this._wheelRotation = 0;
        var geometry;
        if (CarSimulator.developer_mode)
            geometry = new THREE.CylinderGeometry(1.6, 1.6, 0.9);
        else
            geometry = new THREE.CylinderGeometry(0, 0, 0);
        _super.call(this, geometry, new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true }), renderer);
        this._isColliding = false;
        this._wheelDirection = new THREE.Vector3(0, 0, -1);
        this._relativeVelocity = math.matrix([0, 0, 0, 0, 0, 0]);
        this.velocity = math.matrix([0, 0, 0, 0, 0, 0]);
        this.state = math.matrix([pos.x, pos.y, pos.z, 0, 0, 0]);
        this.object.position.set(pos.x, pos.y, pos.z);
        //this._testArrow = new THREE.ArrowHelper(new THREE.Vector3(0,1,0), new THREE.Vector3(0,0,0), 4, 0xff0000);
        this._renderer = renderer;
        this._renderer.scene.add(this._testArrow);
    }
    Wheel.prototype.update = function (time, delta) {
        //super.update(time,delta);
        //if(!this.isColliding) {
        //this._forceTotal = math.add(this.forceExternal, this.forceConstraints); //Combine external and constraint forces
        //this.velocity = math.add(this.velocity, math.multiply(math.multiply(math.inv(this.M), this.forceTotal), delta));
        //this._relativeVelocity = math.subtract(this.velocity, this._connectedVehicle.vehicleModel.velocity);
        //this.state = math.add(this.state, math.multiply(this._relativeVelocity, delta));
        //}
        //this._forceConstraints = math.matrix([0,0,0,0,0,0]);
        this._forceConstraints = math.multiply(this._forceConstraints, 0.9);
        this.object.position.set(this.object.position.x, this.state.valueOf()[1], this.object.position.z);
        if (this._connectedVehicle) {
            this._wheelDirection = this._connectedVehicle.vehicleModel.localZDirection.clone().multiplyScalar(-1);
            if (this._connectedSteering) {
                this._wheelDirection.applyAxisAngle(this._connectedVehicle.vehicleModel.localYDirection, this._connectedSteering.steeringAngle);
            }
            var wheelRotation = -this._connectedVehicle.vehicleModel.velocityDirection.clone().dot(this._wheelDirection);
            if (CarSimulator.developer_mode)
                this.object.geometry.rotateX(wheelRotation * 0.01);
            else if (this._attatchedMesh) {
                //console.log(this._attatchedMesh);
                //this._attatchedMesh.children[1].geometry.rotateZ(wheelRotation*0.01);
                var dir = this._wheelDirection;
                this._attatchedMesh.rotateOnAxis(new THREE.Vector3(0, 0, 1), wheelRotation * 0.01);
            }
            if (this.isColliding) {
                this.friction();
            }
            else
                this.object.material.color.setHex(0xff0000);
        }
        if (this._connectedSteering) {
            this.object.rotation.set(0, this._connectedSteering.steeringAngle, 0);
        }
        if (this._connectedMotor) {
            if (this.isColliding && this._connectedMotor.torque != 0) {
                this.addMotorForce();
            }
        }
    };
    Wheel.prototype.addMotorForce = function () {
        var position = this.object.position.clone().applyQuaternion(this._connectedVehicle.vehicleModel.object.quaternion);
        var force_radius = math.add(math.matrix([position.x, position.y, position.z]), math.multiply(math.matrix([
            this._connectedVehicle.vehicleModel.localYDirection.x,
            this._connectedVehicle.vehicleModel.localYDirection.y,
            this._connectedVehicle.vehicleModel.localYDirection.z
        ]), 1));
        force_radius = math.matrix([position.x, position.y, position.z]);
        force_radius = math.matrix([0, 0, -4]);
        var force = math.multiply(math.matrix([this._wheelDirection.x, this._wheelDirection.y, this._wheelDirection.z]), this._connectedMotor.torque);
        var J = math.matrix([
            force.valueOf()[0],
            force.valueOf()[1],
            force.valueOf()[2],
            math.cross(force_radius, force).valueOf()[0],
            math.cross(force_radius, force).valueOf()[1],
            math.cross(force_radius, force).valueOf()[2]
        ]);
        var mc = 1 / math.multiply(math.multiply(J, math.inv(this._connectedVehicle.vehicleModel.M)), math.transpose(J));
        var lagrange = mc * (math.multiply(J, math.matrix([
            this._wheelDirection.x,
            this._wheelDirection.y,
            this._wheelDirection.z,
            0, 0, 0]))) * 7;
        var Fc = math.multiply(math.transpose(J), lagrange);
        this._connectedVehicle.vehicleModel.forceConstraints = math.add(this._connectedVehicle.vehicleModel.forceConstraints, Fc);
        this._connectedVehicle.vehicleSetup.vehicleBody.forceConstraints.valueOf()[3] += 100000;
    };
    Wheel.prototype.friction = function () {
        //var position = this.object.position.clone().applyQuaternion(this._connectedVehicle.vehicleModel.object.quaternion);
        //var rotation = new THREE.Vector3(this._connectedVehicle.vehicleModel.velocity.valueOf()[3], this._connectedVehicle.vehicleModel.velocity.valueOf()[4], this._connectedVehicle.vehicleModel.velocity.valueOf()[5]);
        //var force_radius = math.matrix([
        //    position.x,
        //    position.y,
        //    position.z
        //]);
        //var vel = this._connectedVehicle.vehicleModel.velocityDirection.clone();
        //
        //var forceComp1 = this._connectedVehicle.vehicleModel.localZDirection.clone().applyAxisAngle(this._connectedVehicle.vehicleModel.localYDirection, -Math.PI/2);
        //
        //if(vel.clone().normalize().angleTo(forceComp1) > Math.PI/2)
        //    forceComp1.multiplyScalar(-1);
        //
        ////this._testArrow.setDirection(forceComp1);
        ////this._testArrow.position.copy(position.clone().add(this._connectedVehicle.position));
        //
        //forceComp1 = forceComp1.multiplyScalar(Math.abs(vel.dot(forceComp1))*0.01);
        //
        //var totalForce = math.matrix([
        //   forceComp1.x,
        //   forceComp1.y,
        //   forceComp1.z
        //]);
        //
        //if(math.norm(totalForce) != 0){
        //    var J = math.matrix([
        //        totalForce.valueOf()[0],
        //        totalForce.valueOf()[1],
        //        totalForce.valueOf()[2],
        //        math.cross(force_radius,totalForce).valueOf()[0],
        //        math.cross(force_radius,totalForce).valueOf()[1],
        //        math.cross(force_radius,totalForce).valueOf()[2]
        //    ]);
        //
        //    var mc = 1/math.multiply( math.multiply(J, math.inv(this._connectedVehicle.vehicleModel.M)), math.transpose(J));
        //
        //    var lagrange = -mc*(math.multiply(J, this._connectedVehicle.velocity));
        //
        //    var Fc = math.multiply(math.transpose(J),lagrange);
        //    this._connectedVehicle.vehicleModel.forceConstraints =  math.add(this._connectedVehicle.vehicleModel.forceConstraints, Fc);
        //}
        //this._connectedVehicle.vehicleModel.velocity.valueOf()[0] *= 0.99;
        //this._connectedVehicle.vehicleModel.velocity.valueOf()[1] *= 0.99;
        //this._connectedVehicle.vehicleModel.velocity.valueOf()[2] *= 0.99;
        //this._connectedVehicle.vehicleModel.velocity.valueOf()[4] *= 0.99;
        var force_radius = math.add(math.matrix([position.x, position.y, position.z]), math.multiply(math.matrix([
            this._connectedVehicle.vehicleModel.localYDirection.x,
            this._connectedVehicle.vehicleModel.localYDirection.y,
            this._connectedVehicle.vehicleModel.localYDirection.z
        ]), 1));
        force_radius = math.matrix([position.x, position.y, position.z]);
        force_radius = math.matrix([0, 0, -4]);
        var force = math.multiply(math.matrix([this._wheelDirection.x, this._wheelDirection.y, this._wheelDirection.z]), this._connectedMotor.torque);
        var J = math.matrix([
            force.valueOf()[0],
            force.valueOf()[1],
            force.valueOf()[2],
            math.cross(force_radius, force).valueOf()[0],
            math.cross(force_radius, force).valueOf()[1],
            math.cross(force_radius, force).valueOf()[2]
        ]);
        var mc = 1 / math.multiply(math.multiply(J, math.inv(this._connectedVehicle.vehicleModel.M)), math.transpose(J));
        var lagrange = mc * (math.multiply(J, math.matrix([
            this._wheelDirection.x,
            this._wheelDirection.y,
            this._wheelDirection.z,
            0, 0, 0]))) * 7;
        var Fc = math.multiply(math.transpose(J), lagrange);
        this._connectedVehicle.vehicleModel.forceConstraints = math.add(this._connectedVehicle.vehicleModel.forceConstraints, Fc);
    };
    Wheel.prototype.attatchMesh = function (mesh) {
        this._attatchedMesh = mesh;
        this.object.add(this._attatchedMesh);
    };
    Wheel.prototype.connectVehicle = function (vehicle) {
        this._connectedVehicle = vehicle;
    };
    Wheel.prototype.connectMotor = function (motor) {
        this._connectedMotor = motor;
    };
    Wheel.prototype.connectSteering = function (steering) {
        this._connectedSteering = steering;
    };
    Object.defineProperty(Wheel.prototype, "rotation", {
        get: function () {
            return this._rotation;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Wheel.prototype, "forwardForce", {
        get: function () {
            return this._forwardForce;
        },
        set: function (value) {
            this._forwardForce = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Wheel.prototype, "wheelDirection", {
        get: function () {
            return this._wheelDirection;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Wheel.prototype, "isColliding", {
        get: function () {
            return this._isColliding;
        },
        set: function (value) {
            this._isColliding = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Wheel.prototype, "collisionNormal", {
        set: function (value) {
            this._collisionNormal = value;
        },
        enumerable: true,
        configurable: true
    });
    return Wheel;
})(ParticleCollider);
//# sourceMappingURL=wheel.js.map