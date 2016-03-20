/**
 * Created by filles-dator on 2016-03-08.
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
///<reference path="../renderer.ts"/>
///<reference path="environment/ground_plane.ts"/>
///<reference path="../data/parts/wheel.ts"/>
///<reference path="../data/parts/spring.ts"/>
///<reference path="../data/physics_object3d.ts"/>
///<reference path="../data/vehicle.ts"/>
///<reference path="../data/dynamic_rigid_body.ts"/>
///<reference path="../data/car_test.ts"/>
///<reference path="../math/mathjs.d.ts"/>
var RelativeDynamicBody = (function (_super) {
    __extends(RelativeDynamicBody, _super);
    function RelativeDynamicBody(geometry, material, renderer, parent, parentVel) {
        _super.call(this, geometry, material, renderer);
        this._parentVehicle = parent;
        this._spring = new Spring(renderer);
        this._relativeVelocity = math.matrix([0, 0, 0, 0, 0, 0]);
        this.state = math.matrix([0, 1, 0, 0, 0, 0]);
    }
    RelativeDynamicBody.prototype.update = function (time, delta) {
        var linearState = new THREE.Vector3(this.state.valueOf()[0], this.state.valueOf()[1], this.state.valueOf()[2]);
        var angularState = new THREE.Vector3(this.state.valueOf()[3], this.state.valueOf()[4], this.state.valueOf()[5]);
        this._spring.update(time, delta, linearState, angularState);
        this.velocity.valueOf()[1] = this._spring.linearSpringVelocity.y;
        this.velocity.valueOf()[3] = this._spring.angularSpringVelocity.x;
        this.velocity.valueOf()[4] = this._spring.angularSpringVelocity.y;
        this.velocity.valueOf()[5] = this._spring.angularSpringVelocity.z;
        //this.velocity.valueOf()[5] = this._spring.v*0.03;
        //for(var i=0; i<this._parentVehicle.vehicleSetup.wheels.length; i++){
        //this._parentVehicle.vehicleSetup.wheels[i].velocity.valueOf()[1] = -this._spring.v;
        //}
        var forceComp = math.dot(math.matrix([0, 1, 0]), math.matrix([this._parentVehicle.vehicleModel.localYDirection.x, this._parentVehicle.vehicleModel.localYDirection.y, this._parentVehicle.vehicleModel.localYDirection.z]));
        this._forceTotal = math.add(math.multiply(this.forceExternal, forceComp), this.forceConstraints); //Combine external and constraint forces
        this.velocity = math.add(this.velocity, math.multiply(math.multiply(math.inv(this.M), this.forceTotal), delta));
        //this._relativeVelocity = math.subtract(this.velocity, this._parentVehicle.vehicleModel.velocity);
        this._relativeVelocity.valueOf()[1] = this.velocity.valueOf()[1] - this._parentVehicle.vehicleModel.velocity.valueOf()[1];
        this._relativeVelocity.valueOf()[3] = this.velocity.valueOf()[3] - this._parentVehicle.vehicleModel.velocity.valueOf()[3];
        this._relativeVelocity.valueOf()[4] = this.velocity.valueOf()[4] - this._parentVehicle.vehicleModel.velocity.valueOf()[4];
        this._relativeVelocity.valueOf()[5] = this.velocity.valueOf()[5] - this._parentVehicle.vehicleModel.velocity.valueOf()[5];
        this.state = math.add(this.state, math.multiply(this._relativeVelocity, delta));
        //this._forceConstraints = math.matrix([0,0,0,0,0,0]);
        this._forceConstraints = math.multiply(this._forceConstraints, 0.9);
        this.object.position.set(0, this.state.valueOf()[1], 0);
        this.object.rotation.set(this.state.valueOf()[3], this.state.valueOf()[4], this.state.valueOf()[5]);
    };
    RelativeDynamicBody.prototype.applyForce = function (normal, force_radius) {
        var rotComponent = math.cross(force_radius, normal);
        var J = math.matrix([
            -normal.valueOf()[0],
            -normal.valueOf()[1],
            -normal.valueOf()[2],
            rotComponent.valueOf()[0],
            rotComponent.valueOf()[1],
            rotComponent.valueOf()[2]
        ]);
        var mc = 1 / math.multiply(math.multiply(J, math.inv(this._parentVehicle.vehicleModel.M)), math.transpose(J));
        var lagrange = -mc * (math.multiply(J, this.velocity));
        var Pc = math.multiply(math.transpose(J), lagrange);
        //var newVelocity : mathjs.Matrix = math.add(this.velocity, math.multiply(math.inv(this._parentVehicle.vehicleModel.M),Pc));
        this.forceConstraints.valueOf()[3] += Pc.valueOf()[3];
        this.forceConstraints.valueOf()[4] += Pc.valueOf()[4];
        this.forceConstraints.valueOf()[5] += Pc.valueOf()[5];
    };
    RelativeDynamicBody.prototype.attatchMesh = function (mesh) {
        this._attatchedMesh = mesh;
        this.object.add(this._attatchedMesh);
    };
    return RelativeDynamicBody;
})(DynamicRigidBody);
//# sourceMappingURL=relative_dynamic_body.js.map