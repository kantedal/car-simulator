/**
 * Created by filles-dator on 2016-03-23.
 */

///<reference path="../../threejs/three.d.ts"/>

abstract class ForceField {
    private _currentForce : THREE.Vector3;

    public constructor(startForce: THREE.Vector3){
        this._currentForce = startForce;
    }

    public update(time:number, delta:number):void;

    get currentForce():THREE.Vector3 {
        return this._currentForce;
    }
}