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
    private _frictionalMomentum : number;
    private _wheelDirection : THREE.Vector3;
    private _isColliding : boolean;

    private _connectedMotor : Motor;
    private _connectedSpring : Spring;
    private _connectedSteering : Steering;
    private _connectedVehicle : Vehicle;

    constructor(renderer: Renderer){
        super(new THREE.CylinderGeometry(1.5,1.5,0.5), new THREE.MeshBasicMaterial({color: 0xff0000, wireframe: true}), renderer);
        this._isColliding = false;
        this._wheelDirection = new THREE.Vector3(0,0,-1);
    }

    public update(time: number, delta: number){
        //super.update(time,delta);

        if(this._connectedVehicle){
            this._wheelDirection = this._connectedVehicle.vehicleBody.localZDirection.clone().multiplyScalar(-1);

            if(this._connectedSteering) {
                this._wheelDirection.applyAxisAngle(this._connectedVehicle.vehicleBody.localYDirection, this._connectedSteering.steeringAngle);
            }

            var wheelRotation = -this._connectedVehicle.vehicleBody.velocityDirection.clone().dot(this._wheelDirection);
            this.object.geometry.rotateX(wheelRotation*0.015);

            if(this.isColliding){
                this.friction();

                //var linearFrictionComponent = 1-Math.abs(this._connectedVehicle.vehicleBody.velocityDirection.clone().normalize().dot(this._wheelDirection.clone().normalize()));
                //var linearFriction = math.multiply(
                //    math.multiply(math.matrix([
                //        this._connectedVehicle.vehicleBody.velocity.valueOf()[0],
                //        this._connectedVehicle.vehicleBody.velocity.valueOf()[1],
                //        this._connectedVehicle.vehicleBody.velocity.valueOf()[2],
                //        0,0,0
                //    ])
                //, -1), linearFrictionComponent*400 + 70);
                //
                //var angularFrictionComponent = Math.abs(this._connectedVehicle.vehicleBody.angularVelocityDirection.clone().normalize().dot(this._connectedVehicle.vehicleBody.localYDirection.clone().normalize()));
                //var angularFriction = math.multiply(
                //    math.multiply(math.matrix([
                //            0,0,0
                //            this._connectedVehicle.vehicleBody.velocity.valueOf()[3],
                //            this._connectedVehicle.vehicleBody.velocity.valueOf()[4],
                //            this._connectedVehicle.vehicleBody.velocity.valueOf()[5]
                //        ])
                //        , -1), angularFrictionComponent*400 + 70);
                //
                //var totalFriction = math.add(linearFriction, angularFriction);
                //
                //this._connectedVehicle.vehicleBody.forceConstraints = math.add(this._connectedVehicle.vehicleBody.forceConstraints, totalFriction);
                //console.log(this._connectedVehicle.vehicleBody.forceConstraints.valueOf()[0] + " " + this._connectedVehicle.vehicleBody.forceConstraints.valueOf()[1] + "  " + this._connectedVehicle.vehicleBody.forceConstraints.valueOf()[2]);
            }
        }

        if(this._connectedSteering){
            this.object.rotation.set(0,this._connectedSteering.steeringAngle,0)
        }

        if(this._connectedMotor){
            if(this.isColliding && this._connectedMotor.torque != 0){
                this.addMotorForce();
            }
        }

    }

    private addMotorForce(){
        var position = this.object.position.clone().applyQuaternion(this._connectedVehicle.vehicleBody.object.quaternion);
        var force_radius = math.add(
            math.matrix([position.x, position.y, position.z]),
            math.multiply(math.matrix([
                this._connectedVehicle.vehicleBody.localYDirection.x,
                this._connectedVehicle.vehicleBody.localYDirection.y,
                this._connectedVehicle.vehicleBody.localYDirection.z
            ]),1));
        );
        var force = math.multiply(math.matrix([this._wheelDirection.x, this._wheelDirection.y, this._wheelDirection.z]), this._connectedMotor.torque);

        var J = math.matrix([
            force.valueOf()[0],
            force.valueOf()[1],
            force.valueOf()[2],
            math.cross(force_radius,force).valueOf()[0],
            math.cross(force_radius,force).valueOf()[1],
            math.cross(force_radius,force).valueOf()[2]
        ]);

        var mc = 1/math.multiply( math.multiply(J, math.inv(this._connectedVehicle.vehicleBody.M)), math.transpose(J));

        var lagrange = mc*(math.multiply(J, math.matrix([
                this._wheelDirection.x,
                this._wheelDirection.y,
                this._wheelDirection.z,
                0,0,0])
            ))*30;

        var Fc = math.multiply(math.transpose(J),lagrange);
        this._connectedVehicle.vehicleBody.forceConstraints =  math.add(this._connectedVehicle.vehicleBody.forceConstraints, Fc);
    }


    private friction() {
        var position = this.object.position.clone().applyQuaternion(this._connectedVehicle.vehicleBody.object.quaternion);
        var force_radius = math.matrix([position.x, position.y, position.z]);
        var force = math.matrix([-this._connectedVehicle.vehicleBody.velocity.valueOf()[0], -this._connectedVehicle.vehicleBody.velocity.valueOf()[1], -this._connectedVehicle.vehicleBody.velocity.valueOf()[2]]);

        //var J = math.matrix([
        //    force.valueOf()[0],
        //    force.valueOf()[1],
        //    force.valueOf()[2],
        //    math.cross(force_radius,force).valueOf()[0],
        //    math.cross(force_radius,force).valueOf()[1],
        //    math.cross(force_radius,force).valueOf()[2]
        //]);
        //
        //var mc = 1/math.multiply( math.multiply(J, math.inv(this._connectedVehicle.vehicleBody.M)), math.transpose(J));
        //
        //var linearFrictionComponent = 1-Math.abs(this._connectedVehicle.vehicleBody.velocityDirection.clone().normalize().dot(this._wheelDirection.clone().normalize()));
        //var lagrange = -mc*(math.multiply(J, this._connectedVehicle.vehicleBody.velocity))*(linearFrictionComponent+0.2);
        //
        //var Fc = math.multiply(math.transpose(J),lagrange);
        //

        var rotationalFriction = 30*Math.abs(this._connectedVehicle.vehicleBody.angularVelocityDirection
            .clone().dot(
                this._connectedVehicle.vehicleBody.localYDirection
            ));

        this._connectedVehicle.vehicleBody.forceConstraints =  math.add(this._connectedVehicle.vehicleBody.forceConstraints,
             math.multiply(math.matrix([
                -this._connectedVehicle.vehicleBody.velocity.valueOf()[0],
                -this._connectedVehicle.vehicleBody.velocity.valueOf()[1],
                -this._connectedVehicle.vehicleBody.velocity.valueOf()[2],
                -this._connectedVehicle.vehicleBody.velocity.valueOf()[3]*rotationalFriction,
                -this._connectedVehicle.vehicleBody.velocity.valueOf()[4]*rotationalFriction,
                -this._connectedVehicle.vehicleBody.velocity.valueOf()[5]*rotationalFriction
            ]), 300)
        );
    }

    
    public connectVehicle(vehicle:Vehicle){
        this._connectedVehicle = vehicle;
    }

    public connectMotor(motor:Motor):void {
        this._connectedMotor = motor;
    }

    public connectSteering(steering:Steering):void {
        this._connectedSteering = steering;
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

    get wheelDirection():THREE.Vector3 {
        return this._wheelDirection;
    }

    get isColliding():boolean {
        return this._isColliding;
    }

    set isColliding(value:boolean) {
        this._isColliding = value;
    }
}