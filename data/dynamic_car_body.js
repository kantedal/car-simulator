/**
 * Created by filles-dator on 2016-02-09.
 */
///<reference path="./physics_object3d.ts"/>
///<reference path="./vehicle.ts"/>
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var DynamicCarBody = (function (_super) {
    __extends(DynamicCarBody, _super);
    function DynamicCarBody(geometry, material, renderer, mass, vehicle) {
        _super.call(this, geometry, material, renderer);
        this.GRAVITY = -9.82;
        this._vehicle = vehicle;
        this._mass = mass;
        this._inclineForce = new Vector3(0, 0, 0);
        this._frictionForce = new Vector3(0, 0, 0);
    }
    DynamicCarBody.prototype.update = function (time, delta) {
        if (this.hasCollisionSurface) {
            var newVelocity = new THREE.Vector3(0, 0, 0);
            if (this.isColliding) {
                var gradientMagnitude = -Math.abs(Math.PI / 2 - this.gradientDirection.angleTo(new THREE.Vector3(0, -1, 0))) / (Math.PI / 2);
                this.force.set(this.gradientDirection.x, this.gradientDirection.y, this.gradientDirection.z).multiplyScalar(this._mass * this.GRAVITY * gradientMagnitude);
                //Add forces of wheels
                for (var i = 0; i < this._vehicle.vehicleSetup.wheels.length; i++) {
                    var wheel = this._vehicle.vehicleSetup.wheels[i];
                    this.force.set(this.force.x + wheel.desiredDirection.x * wheel.forwardForce, this.force.y + wheel.desiredDirection.y * wheel.forwardForce, this.force.z + wheel.desiredDirection.z * wheel.forwardForce);
                }
                newVelocity.set(this.velocity.x + (this.force.x / this._mass) * 0.003, this.velocity.y + (this.force.y / this._mass) * 0.003, this.velocity.z + (this.force.z / this._mass) * 0.003).multiplyScalar(0.99);
                var projectedDir = newVelocity.clone().projectOnPlane(this.normalDirection);
                var yDiff = (newVelocity.y - projectedDir.y) * this.velocity.length();
                if (yDiff < 0.1)
                    newVelocity = projectedDir;
            }
            else {
                this.force.set(0, this.GRAVITY * this._mass, 0);
                newVelocity.set(this.velocity.x + (this.force.x / this._mass) * 0.003, this.velocity.y + (this.force.y / this._mass) * 0.003, this.velocity.z + (this.force.z / this._mass) * 0.003);
            }
            this.acceleration = new THREE.Vector3(newVelocity.x - this.velocity.x, newVelocity.y - this.velocity.y, newVelocity.z - this.velocity.z);
            this.velocity = newVelocity;
            this.position.set(this.position.x + this.velocity.x, this.position.y + this.velocity.y, this.position.z + this.velocity.z);
            _super.prototype.update.call(this, time, delta);
        }
    };
    return DynamicCarBody;
}(PhysicsObject3d));
