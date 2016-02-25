/**
 * Created by filles-dator on 2016-02-16.
 */
///<reference path="../../threejs/three.d.ts"/>

class CollisionConstraint {
    private _magnitude : number;
    private _collisionDistance : number;

    constructor(magnitude: number, collisionDistance: number){
        this._collisionDistance = collisionDistance;
        this._magnitude = magnitude;
    }

    public update(velocity: THREE.Vector3, normalDirection: THREE.Vector3, distance: number, time: number, delta: number) : THREE.Vector3 {
        var realDistance : number = distance+this._collisionDistance;

        if(velocity.length() > 0.05 && realDistance < this._collisionDistance)
        {
            var smoothing = (this._collisionDistance - Math.max(realDistance,0))/this._collisionDistance;

            var newVelocity : THREE.Vector3 = new THREE.Vector3(
                velocity.x + normalDirection.x * this._magnitude * smoothing * 0.07,
                velocity.y + normalDirection.y * this._magnitude * smoothing * 0.07,
                velocity.z + normalDirection.z * this._magnitude * smoothing * 0.07
            );

            return newVelocity;
        }

        return velocity.clone();
    }
}