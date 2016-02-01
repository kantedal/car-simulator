/**
 * Created by filles-dator on 2016-01-28.
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
///<reference path="./physics_object3d.ts"/>
var DynamicRigidBody = (function (_super) {
    __extends(DynamicRigidBody, _super);
    function DynamicRigidBody(geometry, material, renderer) {
        _super.call(this, geometry, material, renderer);
        this._gravity = -9.82;
        this._mass = 500;
        this._frictionConst = 0.97;
        this._inclineForce = new Vector3(0, 0, 0);
        this._frictionForce = new Vector3(0, 0, 0);
    }
    DynamicRigidBody.prototype.update = function (time, delta) {
        if (this.hasCollisionSurface) {
            var gradientMagnitude = -Math.abs(Math.PI / 2 - this.gradientDirection.angleTo(new THREE.Vector3(0, -1, 0))) / (Math.PI / 2);
            var normalMagnitude = -Math.abs(this.gradientDirection.angleTo(new THREE.Vector3(0, -1, 0))) / (Math.PI / 2);
            this._inclineForce.set(this.gradientDirection.x, this.gradientDirection.y, this.gradientDirection.z).multiplyScalar(this._mass * this._gravity * gradientMagnitude);
            //this._frictionForce.set(-this.gradientDirection.x,this.gradientDirection.y,-this.gradientDirection.z).reflect(this.normalDirection).multiplyScalar(this._mass*this._gravity*gradientMagnitude*normalMagnitude);
            //console.log(this._inclineForce.length() + "  " + this._frictionForce.length() + "  " + normalMagnitude + "  " + gradientMagnitude);
            var newVelocity = new THREE.Vector3(this.velocity.x + (this._inclineForce.x) * delta, this.velocity.y + (this._inclineForce.y) * delta, this.velocity.z + (this._inclineForce.z) * delta).projectOnPlane(this.normalDirection).multiplyScalar(this._frictionConst);
            this.updateVelocity(new THREE.Vector3(newVelocity.x, newVelocity.y, newVelocity.z));
            this.position.setX(this.position.x + this.velocity.x); // + this.velocity.x); //this.realDirection.x * this.velocity.length());
            this.position.setY(this.position.y + this.velocity.y); // + this.velocity.y); //this.realDirection.y * this.velocity.length());
            this.position.setZ(this.position.z + this.velocity.z); // + this.velocity.z); //this.realDirection.z * this.velocity.length());
        }
        _super.prototype.update.call(this, time, delta);
    };
    return DynamicRigidBody;
})(PhysicsObject3d);
//# sourceMappingURL=dynamic_rigid_body.js.map