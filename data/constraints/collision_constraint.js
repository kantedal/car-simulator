/**
 * Created by filles-dator on 2016-02-16.
 */
///<reference path="../../threejs/three.d.ts"/>
var CollisionConstraint = (function () {
    function CollisionConstraint(magnitude, collisionDistance) {
        this._collisionDistance = collisionDistance;
        this._magnitude = magnitude;
    }
    CollisionConstraint.prototype.update = function (velocity, normalDirection, distance, time, delta) {
        var realDistance = distance + this._collisionDistance;
        if (velocity.length() > 0.05 && realDistance < this._collisionDistance) {
            var smoothing = (this._collisionDistance - Math.max(realDistance, 0)) / this._collisionDistance;
            var newVelocity = new THREE.Vector3(velocity.x + normalDirection.x * this._magnitude * smoothing * 0.07, velocity.y + normalDirection.y * this._magnitude * smoothing * 0.07, velocity.z + normalDirection.z * this._magnitude * smoothing * 0.07);
            return newVelocity;
        }
        return velocity.clone();
    };
    return CollisionConstraint;
}());
