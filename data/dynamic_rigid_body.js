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
        this.xLim = [-1, 1];
        this.yLim = [-1, 1];
        this.zLim = [-1, 1];
        this._renderer = renderer;
        this._gravity = -9.82;
        this._mass = 500;
        this._frictionConst = 0.99;
        this._inclineForce = new Vector3(0, 0, 0);
        this._frictionForce = new Vector3(0, 0, 0);
        this.calculateInertiaTensor();
        renderer.scene.add(this.object);
        this.force.set(100000, 100000, 10000);
        this.forceRadius.set(1, 1, 0);
        this.testVertex = new THREE.Mesh(new THREE.SphereGeometry(0.2), new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true }));
        renderer.scene.add(this.testVertex);
    }
    DynamicRigidBody.prototype.update = function (time, delta) {
        _super.prototype.update.call(this, time, delta);
        //calculate forces
        var appliedForce = this.forceRadius.clone().cross(this.force);
        var inertia = this.angularAcceleration.applyMatrix3(this.inertiaTensor);
        var torque = appliedForce.add(inertia);
        this.angularAcceleration = torque.applyMatrix3(this.inverseInertiaTensor);
        if (this.isColliding) {
            this.velocity.y *= 0.5;
            this.velocity.x *= 0.95;
            this.velocity.z *= 0.95;
        }
        this.acceleration.set(this.force.x, this.force.y + this._gravity * this._mass, this.force.z).multiplyScalar(1 / this._mass);
        this.velocity.set(this.velocity.x + this.acceleration.x * 0.03, this.velocity.y + this.acceleration.y * 0.03, this.velocity.z + this.acceleration.z * 0.03);
        this.position.set(this.position.x + this.velocity.x * 0.03, this.position.y + this.velocity.y * 0.03, this.position.z + this.velocity.z * 0.03);
        this.angularVelocity.set(this.angularVelocity.x + this.angularAcceleration.x * 0.03, this.angularVelocity.y + this.angularAcceleration.y * 0.03, this.angularVelocity.z + this.angularAcceleration.z * 0.03);
        this.rotation.set(this.rotation.x + this.angularVelocity.x * 0.03, this.rotation.y + this.angularVelocity.y * 0.03, this.rotation.z + this.angularVelocity.z * 0.03);
        this.object.rotateX(this.angularVelocity.x * 0.03);
        this.object.rotateY(this.angularVelocity.y * 0.03);
        this.object.rotateZ(this.angularVelocity.z * 0.03);
        this.trackVertices(this.angularVelocity);
        this.force.set(0, 0, 0);
        //this.forceRadius.set(0,0,0);
    };
    DynamicRigidBody.prototype.calculateInertiaTensor = function () {
        var dV = 0.1 * 0.1;
        var raycaster = new THREE.Raycaster();
        var Ixx = 0;
        raycaster.set(this.object.position.clone().sub(new Vector3(0, -5, 0)), new Vector3(0, 1, 0));
        var intersects = raycaster.intersectObject(this.object, false);
        console.log(intersects);
        for (var y = this.yLim[0]; y <= this.yLim[1]; y += 0.1) {
            for (var z = this.zLim[0]; z <= this.zLim[1]; z += 0.1) {
                Ixx += (Math.pow(y, 2) + Math.pow(z, 2)) * dV;
            }
        }
        Ixx *= 500;
        var Iyy = 0;
        for (var x = this.xLim[0]; x <= this.xLim[1]; x += 0.1) {
            for (var z = this.zLim[0]; z <= this.zLim[1]; z += 0.1) {
                Iyy += (Math.pow(x, 2) + Math.pow(z, 2)) * dV;
            }
        }
        Iyy *= 500;
        var Izz = 0;
        for (var x = this.xLim[0]; x <= this.xLim[1]; x += 0.1) {
            for (var y = this.yLim[0]; y <= this.yLim[1]; y += 0.1) {
                Izz += (Math.pow(x, 2) + Math.pow(y, 2)) * dV;
            }
        }
        Izz *= 500;
        var Ixy = 0;
        for (var x = this.xLim[0]; x <= this.xLim[1]; x += 0.1) {
            for (var y = this.yLim[0]; y <= this.yLim[1]; y += 0.1) {
                Ixy += (x * y) * dV;
            }
        }
        Ixy *= -500;
        var Iyz = 0;
        for (var y = this.yLim[0]; y <= this.yLim[1]; y += 0.1) {
            for (var z = this.zLim[0]; z <= this.zLim[1]; z += 0.1) {
                Iyz += (y * z) * dV;
            }
        }
        Iyz *= -500;
        var Ixz = 0;
        for (var x = this.xLim[0]; x <= this.xLim[1]; x += 0.1) {
            for (var z = this.zLim[0]; z <= this.zLim[1]; z += 0.1) {
                Ixz += (x * z) * dV;
            }
        }
        Ixz *= -500;
        this.inertiaTensor = new THREE.Matrix3;
        this.inertiaTensor.set(Ixx, Ixy, Ixz, Ixy, Iyy, Iyz, Ixz, Iyz, Izz);
        var m4 = new THREE.Matrix4();
        m4.set(this.inertiaTensor.elements[0], this.inertiaTensor.elements[1], this.inertiaTensor.elements[2], 0, this.inertiaTensor.elements[3], this.inertiaTensor.elements[4], this.inertiaTensor.elements[5], 0, this.inertiaTensor.elements[6], this.inertiaTensor.elements[7], this.inertiaTensor.elements[8], 0, 0, 0, 0, 1);
        this.inverseInertiaTensor = this.inertiaTensor.getInverse(m4);
    };
    Object.defineProperty(DynamicRigidBody.prototype, "frictionConst", {
        get: function () {
            return this._frictionConst;
        },
        set: function (value) {
            this._frictionConst = value;
        },
        enumerable: true,
        configurable: true
    });
    return DynamicRigidBody;
})(PhysicsObject3d);
//# sourceMappingURL=dynamic_rigid_body.js.map