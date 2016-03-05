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
    function Wheel(renderer) {
        _super.call(this, new THREE.CylinderGeometry(1.5, 1.5, 0.5), new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true }), renderer);
        this._wheelRotation = 0;
        this._isColliding = false;
        this._wheelDirection = new THREE.Vector3(0, 0, -1);
    }
    Wheel.prototype.update = function (time, delta) {
        //super.update(time,delta);
        if (this._connectedVehicle) {
            this._wheelDirection = this._connectedVehicle.vehicleBody.localZDirection.clone().multiplyScalar(-1);
            if (this._connectedSteering) {
                this._wheelDirection.applyAxisAngle(this._connectedVehicle.vehicleBody.localYDirection, this._connectedSteering.steeringAngle);
            }
            var wheelRotation = -this._connectedVehicle.vehicleBody.velocityDirection.clone().dot(this._wheelDirection);
            this.object.geometry.rotateX(wheelRotation * 0.015);
            if (this.isColliding) {
                this.friction();
            }
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
        var position = this.object.position.clone().applyQuaternion(this._connectedVehicle.vehicleBody.object.quaternion);
        var force_radius = math.add(math.matrix([position.x, position.y, position.z]), math.multiply(math.matrix([
            this._connectedVehicle.vehicleBody.localYDirection.x,
            this._connectedVehicle.vehicleBody.localYDirection.y,
            this._connectedVehicle.vehicleBody.localYDirection.z
        ]), 1));
        ;
        var force = math.multiply(math.matrix([this._wheelDirection.x, this._wheelDirection.y, this._wheelDirection.z]), this._connectedMotor.torque);
        var J = math.matrix([
            force.valueOf()[0],
            force.valueOf()[1],
            force.valueOf()[2],
            math.cross(force_radius, force).valueOf()[0],
            math.cross(force_radius, force).valueOf()[1],
            math.cross(force_radius, force).valueOf()[2]
        ]);
        var mc = 1 / math.multiply(math.multiply(J, math.inv(this._connectedVehicle.vehicleBody.M)), math.transpose(J));
        var lagrange = mc * (math.multiply(J, math.matrix([
            this._wheelDirection.x,
            this._wheelDirection.y,
            this._wheelDirection.z,
            0, 0, 0]))) * 30;
        var Fc = math.multiply(math.transpose(J), lagrange);
        this._connectedVehicle.vehicleBody.forceConstraints = math.add(this._connectedVehicle.vehicleBody.forceConstraints, Fc);
    };
    Wheel.prototype.friction = function () {
        var position = this.object.position.clone().applyQuaternion(this._connectedVehicle.vehicleBody.object.quaternion);
        var force_radius = math.matrix([position.x, position.y, position.z]);
        var force = math.matrix([-this._connectedVehicle.vehicleBody.velocity.valueOf()[0], -this._connectedVehicle.vehicleBody.velocity.valueOf()[1], -this._connectedVehicle.vehicleBody.velocity.valueOf()[2]]);
        //var J = math.matrix([
        //    force.valueOf()[0],
        //    force.valueOf()[1],
        //    force.valueOf()[2],
        //    math.cross(force_radius,force).valueOf()[0],
        //    math.cross(force_radius,force).valueOf()[1],
        //    math.cross(force_radius,force).valueOf()[2]
        //]);
        //
        //var mc = 1/math.multiply( math.multiply(J, math.inv(this._connectedVehicle.vehicleBody.M)), math.transpose(J));
        //
        //var linearFrictionComponent = 1-Math.abs(this._connectedVehicle.vehicleBody.velocityDirection.clone().normalize().dot(this._wheelDirection.clone().normalize()));
        //var lagrange = -mc*(math.multiply(J, this._connectedVehicle.vehicleBody.velocity))*(linearFrictionComponent+0.2);
        //
        //var Fc = math.multiply(math.transpose(J),lagrange);
        //
        var rotationalFriction = 30 * Math.abs(this._connectedVehicle.vehicleBody.angularVelocityDirection
            .clone().dot(this._connectedVehicle.vehicleBody.localYDirection));
        this._connectedVehicle.vehicleBody.forceConstraints = math.add(this._connectedVehicle.vehicleBody.forceConstraints, math.multiply(math.matrix([
            -this._connectedVehicle.vehicleBody.velocity.valueOf()[0],
            -this._connectedVehicle.vehicleBody.velocity.valueOf()[1],
            -this._connectedVehicle.vehicleBody.velocity.valueOf()[2],
            -this._connectedVehicle.vehicleBody.velocity.valueOf()[3] * rotationalFriction,
            -this._connectedVehicle.vehicleBody.velocity.valueOf()[4] * rotationalFriction,
            -this._connectedVehicle.vehicleBody.velocity.valueOf()[5] * rotationalFriction
        ]), 300));
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
    return Wheel;
})(ParticleCollider);
//# sourceMappingURL=wheel.js.map