/**
 * Created by filles-dator on 2016-03-23.
 */

///<reference path="../../threejs/three.d.ts"/>
///<reference path="./force_field.ts"/>

class Gravity extends ForceField {
    constructor(){
        super(new THREE.Vector3(0,-9.82,0));
    }

    public update(time:number, delta:number){

    }
}