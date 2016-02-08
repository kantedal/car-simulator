/**
 * Created by filles-dator on 2016-01-26.
 */

///<reference path="../physics_object3d.ts"/>
///<reference path="../dynamic_rigid_body.ts"/>
///<reference path="./motor.ts"/>
///<reference path="./spring.ts"/>
///<reference path="./steering.ts"/>
///<reference path="../car.ts"/>

class Wheel extends PhysicsObject3d {
    private _rotation : number;
    private _car : Car;
    private _steering : Steering;
    private _connectedMotor : Motor;
    private _connectedSpring : Spring;

    private _frictionalMomentum : number;
    private _forwardFriction : number = 0.1;
    private _sideFriction : number = 0.9;

    private _frictionForce : THREE.Vector3;

    constructor(renderer: Renderer, car : Car){
        super(new THREE.CylinderGeometry(2,2,1).rotateX(Math.PI/2), new THREE.MeshBasicMaterial({color: 0xff0000, wireframe: true}), renderer);

        this._car = car;
        this.collisionRadius = 0;
        this._rotation = 0;
        //this.position.set(0,100,0);
        this._frictionForce = new THREE.Vector3(0,0,0);
    }

    public update(time: number, delta: number){
        this.velocity = this._car.velocity;

        var normalizedGradient = this.velocity.clone().normalize();
        if(this.velocity.length() == 0)
            normalizedGradient = this.realDirection.clone();


        var sideForce = this.velocity.clone().projectOnVector(this.desiredDirection.clone().applyAxisAngle(this.normalDirection, Math.PI/2);
        var forwardForce = this.velocity.clone().projectOnVector(this.desiredDirection).multiplyScalar(this._forwardFriction);

        this.frictionForce.set(
            -forwardForce.x-sideForce.x,
            -forwardForce.y-sideForce.y,
            -forwardForce.z-sideForce.z
        );

        super.update(time, delta);


        ////////////***************************************//////////////
        if(this._connectedMotor && this.isColliding && this._connectedMotor.torque != 0) {
            var frictionCoeff = 0.1;
            this._frictionalMomentum = Math.abs((1-Math.acos(this.normalDirection.dot(new THREE.Vector3(0,1,0))))*500*(9.82)*frictionCoeff);

            var totalTorque = Math.abs(this._connectedMotor.torque-this._frictionalMomentum);

            //this.forwardForce = totalTorque;
        }else{
            //this.forwardForce = 0;
        }
        //////////******************************************/////////////////


        if(this._connectedSpring){

           // this._connectedSpring.position.set(this.position.x,this.position.y,this.position.z);
        }

        if(this._steering){
            this.desiredDirection.applyAxisAngle(new THREE.Vector3(0,1,0), this._steering.steeringAngle-this._rotation);
            this._rotation = this._steering.steeringAngle;
            this.object.rotation.set(0,this._rotation,0);
        }

        this.position.set(
            this._car.position.x+this.object.position.x*Math.cos(-0.5*(this._car.rotation-Math.PI/2)) - this.object.position.z*Math.sin(-0.5*(this._car.rotation-Math.PI/2)),
            this._car.position.y+this.object.position.y,
            this._car.position.z+this.object.position.z*Math.cos(-0.5*(this._car.rotation-Math.PI/2)) + this.object.position.x*Math.sin(-0.5*(this._car.rotation-Math.PI/2))
        );

        this.desiredDirection.applyAxisAngle(new THREE.Vector3(0,1,0), (this._car.steering.steeringAngle-Math.PI/2)*0.05*this.velocity.length());

        this.geometry.rotateZ(-0.2*this.velocity.length());
    }

    public connectMotor(motor:Motor):void {
        this._connectedMotor = motor;
    }

    public connectSpring(spring:Spring):void {
        this._connectedSpring = spring;
        //this.object.add(this._connectedSpring.springGroup);
    }

    public connectSteering(steering:Steering):void {
        this._steering = steering;
    }

    get rotation():number {
        return this._rotation;
    }

    set rotation(value:number) {
        this.object.rotateOnAxis(new THREE.Vector3(0,1,0), value-this._rotation);
        this.desiredDirection.applyAxisAngle(new THREE.Vector3(0,1,0), value-this._rotation);
        this._rotation = value;
    }

    get connectedMotor():Motor {
        return this._connectedMotor;
    }

    get frictionForce():THREE.Vector3 {
        return this._frictionForce;
    }

    set frictionForce(value:THREE.Vector3) {
        this._frictionForce = value;
    }

}