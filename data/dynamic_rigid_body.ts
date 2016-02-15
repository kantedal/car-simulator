/**
 * Created by filles-dator on 2016-01-28.
 */

///<reference path="./physics_object3d.ts"/>

class DynamicRigidBody extends PhysicsObject3d {
    private _gravity : number;
    private _mass : number;
    private _frictionConst : number;

    private _inclineForce : THREE.Vector3;
    private _frictionForce : THREE.Vector3;

    private inertiaTensor : THREE.Matrix3;
    private inverseInertiaTensor : THREE.Matrix3;

    //private _inertiaTensor : number;
    //private _inverseInertiaTensor : number;
    private _orientation : THREE.Quaternion;
    private _spin : THREE.Quaternion;

    private _renderer : Renderer;
    private _dt : number = 0.07;

    public _dir : THREE.Vector3 = new THREE.Vector3(1,0,0);

    private testVertex : THREE.Mesh;
    constructor(geometry: THREE.Geometry, material: THREE.Material, renderer: Renderer){
        super(geometry, material, renderer);
        this._renderer = renderer;

        this._gravity = -9.82;
        this._mass = 500;
        this._frictionConst = 0.99;

        this._inclineForce = new Vector3(0,0,0);
        this._frictionForce = new Vector3(0,0,0);

        this._orientation = new THREE.Quaternion();
        this._spin = new THREE.Quaternion();

        this.calculateInertiaTensor();
       // renderer.scene.add(this.object);

        this.force.set(0,0,0);
        this.forceRadius.set(0,0,0);

        window.addEventListener( 'keydown', this.onKeyDown, false );
        window.addEventListener( 'keyup', this.onKeyUp, false );
    }

    public update(time:number, delta:number):void{

        //calculate forces
        var appliedForce : THREE.Vector3 = this.forceRadius.clone().cross(this.force);
        var inertia : THREE.Vector3 = this.angularAcceleration.applyMatrix3(this.inertiaTensor);
        var torque : THREE.Vector3 = appliedForce.add(inertia);
        this.angularAcceleration = torque.applyMatrix3(this.inverseInertiaTensor);

        if(this.isColliding){
            this.velocity.multiplyScalar(0.95);
            this.angularVelocity.multiplyScalar(0.95);
        }

        this.acceleration.set(
            this.force.x + this._frictionForce.x,
            this.force.y + this._frictionForce.y +this._gravity*this._mass,
            this.force.z + this._frictionForce.z
        ).multiplyScalar(1/this._mass);

        this.velocity.set(
            this.velocity.x + this.acceleration.x*this._dt,
            this.velocity.y + this.acceleration.y*this._dt,
            this.velocity.z + this.acceleration.z*this._dt
        ).multiplyScalar(1);

        this.position.set(
            this.position.x + this.velocity.x*this._dt,
            this.position.y + this.velocity.y*this._dt,
            this.position.z + this.velocity.z*this._dt
        ).multiplyScalar(1);

        this.angularVelocity.set(
            this.angularVelocity.x + this.angularAcceleration.x*this._dt,
            this.angularVelocity.y + this.angularAcceleration.y*this._dt,
            this.angularVelocity.z + this.angularAcceleration.z*this._dt
        );

        this.rotation.set(
            this.rotation.x + this.angularVelocity.x*this._dt,
            this.rotation.y + this.angularVelocity.y*this._dt,
            this.rotation.z + this.angularVelocity.z*this._dt
        );

        this.object.rotateX(this.angularVelocity.x*this._dt);
        this.object.rotateY(this.angularVelocity.y*this._dt);
        this.object.rotateZ(this.angularVelocity.z*this._dt);

        this.trackVertices(this.angularVelocity);

        //this._orientation.normalize();
        //
        //this._spin = new THREE.Quaternion(
        //    this.angularVelocity.x,
        //    this.angularVelocity.y,
        //    this.angularVelocity.z,
        //    0
        //).multiply(this._orientation);
        //
        //this._orientation.set(
        //    this._orientation.x + this._spin.x*this._dt,
        //    this._orientation.y + this._spin.y*this._dt,
        //    this._orientation.z + this._spin.z*this._dt,
        //    0
        //);
        //
        //
        //this.rotation.applyQuaternion(this._orientation);
        //console.log(this.rotation.x + "  " + this.rotation.y + "  " + this.rotation.z);

        //console.log(this._spin.x + "  " + this._spin.y + "  " + this._spin.z);
        //this.object.rotation.set(this.rotation.x, this.rotation.y, this.rotation.z);


        this.force.set(0,0,0);
        super.update(time,delta);
        //this.forceRadius.set(0,0,0);
    }

    private pressedKeys = [];
    private angle = 0
    onKeyDown = (e) => {
        if (e) {
            console.log("PReSS")
            this.pressedKeys[e.keyCode] = true;

            if(this.pressedKeys[37]) {
                this._dir.applyAxisAngle(new Vector3(0,1,0), 0.2);
            }

            if(this.pressedKeys[38]) {
                this.force = this._dir.clone().multiplyScalar(100000);
            }

            if(this.pressedKeys[39]) {
                this._dir.applyAxisAngle(new Vector3(0,1,0), -0.2);
            }

            if(this.pressedKeys[40]) {
            }
        }
    }
    onKeyUp = (e) => {
        if (e) {
            this.pressedKeys[e.keyCode] = false;
            switch (e.which) {
                case 37: //Left
                    break;
                case 38: //Up
                    break;
                case 39: //Right
                    break;
                case 40: //Down
                    break;
            }
        }
    }

    private xLim :number[] = [-4,4];
    private yLim :number[] = [-1,1];
    private zLim :number[] = [-2,2];
    private calculateInertiaTensor():void {
        var dV = 0.1*0.1;

        var Ixx = 0;
        for(var y=this.yLim[0]; y<=this.yLim[1]; y+=0.1){
            for(var z=this.zLim[0]; z<=this.zLim[1]; z+=0.1){
                Ixx += (Math.pow(y,2) + Math.pow(z,2))*dV;
            }
        }
        Ixx *= 500;

        var Iyy = 0;
        for(var x=this.xLim[0]; x<=this.xLim[1]; x+=0.1){
            for(var z=this.zLim[0]; z<=this.zLim[1]; z+=0.1){
                Iyy += (Math.pow(x,2) + Math.pow(z,2))*dV;
            }
        }
        Iyy *= 500;

        var Izz = 0;
        for(var x=this.xLim[0]; x<=this.xLim[1]; x+=0.1){
            for(var y=this.yLim[0]; y<=this.yLim[1]; y+=0.1){
                Izz += (Math.pow(x,2) + Math.pow(y,2))*dV;
            }
        }
        Izz *= 500;

        var Ixy = 0;
        for(var x=this.xLim[0]; x<=this.xLim[1]; x+=0.1){
            for(var y=this.yLim[0]; y<=this.yLim[1]; y+=0.1){
                Ixy += (x*y)*dV;
            }
        }
        Ixy *= -500;

        var Iyz = 0;
        for(var y=this.yLim[0]; y<=this.yLim[1]; y+=0.1){
            for(var z=this.zLim[0]; z<=this.zLim[1]; z+=0.1){
                Iyz += (y*z)*dV;
            }
        }
        Iyz *= -500;

        var Ixz = 0;
        for(var x=this.xLim[0]; x<=this.xLim[1]; x+=0.1){
            for(var z=this.zLim[0]; z<=this.zLim[1]; z+=0.1){
                Ixz += (x*z)*dV;
            }
        }
        Ixz *= -500;

        this.inertiaTensor = new THREE.Matrix3;
        this.inertiaTensor.set(
            Ixx, Ixy, Ixz,
            Ixy, Iyy, Iyz,
            Ixz, Iyz, Izz
        );

        var m4: THREE.Matrix4 = new THREE.Matrix4();
        m4.set(
            this.inertiaTensor.elements[0], this.inertiaTensor.elements[1], this.inertiaTensor.elements[2], 0,
            this.inertiaTensor.elements[3], this.inertiaTensor.elements[4], this.inertiaTensor.elements[5], 0,
            this.inertiaTensor.elements[6], this.inertiaTensor.elements[7], this.inertiaTensor.elements[8], 0,
            0, 0, 0, 1
        );

        this.inverseInertiaTensor = this.inertiaTensor.getInverse(m4);
    }

    get frictionConst():number {
        return this._frictionConst;
    }

    set frictionConst(value:number) {
        this._frictionConst = value;
    }
}