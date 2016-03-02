/**
 * Created by filles-dator on 2016-01-26.
 */

///<reference path="../physics_object3d.ts"/>
///<reference path="../dynamic_rigid_body.ts"/>
///<reference path="./motor.ts"/>
///<reference path="./spring.ts"/>
///<reference path="../particle_collider.ts"/>

class Wheel extends ParticleCollider {
    private _wheelRotation : number = 0;
    private _connectedMotor : Motor;
    private _connectedSpring : Spring;
    private _steering : Steering;
    private _frictionalMomentum : number;
    private _forwardForce : number;

    constructor(renderer: Renderer){
        super(new THREE.CylinderGeometry(2,2,1), new THREE.MeshBasicMaterial({color: 0xff0000, wireframe: true}), renderer);
        this._forwardForce = 0;
    }

    public update(time: number, delta: number, axis: THREE.Vector3){
        super.update(time,delta);

        if(this._steering){
            this.object.rotateOnAxis(axis, this._steering.steeringVelocity*delta);
        }

        if(this._connectedMotor){
            this._forwardForce = this._connectedMotor.torque;
        }
    }

    public connectMotor(motor:Motor):void {
        this._connectedMotor = motor;
    }

    public connectSteering(steering:Steering):void {
        this._steering = steering;
    }

    get rotation():number {
        return this._rotation;
    }

    get forwardForce():number {
        return this._forwardForce;
    }

    set forwardForce(value:number) {
        this._forwardForce = value;
    }
}