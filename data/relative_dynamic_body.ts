/**
 * Created by filles-dator on 2016-03-08.
 */

///<reference path="../renderer.ts"/>
///<reference path="../data/ground_plane.ts"/>
///<reference path="../data/parts/wheel.ts"/>
///<reference path="../data/parts/spring.ts"/>
///<reference path="../data/physics_object3d.ts"/>
///<reference path="../data/vehicle.ts"/>
///<reference path="../data/dynamic_rigid_body.ts"/>
///<reference path="../data/car_test.ts"/>

class RelativeDynamicBody extends DynamicRigidBody {
    private _parentVehicle : Vehicle;
    private _relativeVelocity : mathjs.Matrix;
    private _spring : Spring;

    constructor(geometry: THREE.Geometry, material: THREE.Material, renderer: Renderer, parent:Vehicle) {
        super(geometry, material, renderer);
        this._parentVehicle = parent;
        this._spring = new Spring(renderer);

        this._relativeVelocity = math.matrix([0,0,0,0,0,0]);
        this.state = math.matrix([0,1,0,0,0,0]);
    }

    public update(time:number, delta:number){
        this._spring.update(time,delta,this.state);
        this.velocity.valueOf()[1] = this._spring.linearSpringVelocity;
        this.velocity.valueOf()[3] = this._spring.angularSpringVelocityX;
        this.velocity.valueOf()[4] = this._spring.angularSpringVelocityY;
        this.velocity.valueOf()[5] = this._spring.angularSpringVelocityZ;
        //this.velocity.valueOf()[5] = this._spring.v*0.03;

        for(var i=0; i<this._parentVehicle.vehicleSetup.wheels.length; i++){
            //this._parentVehicle.vehicleSetup.wheels[i].velocity.valueOf()[1] = -this._spring.v;
        }

        this._forceTotal = math.add(this.forceExternal, this.forceConstraints); //Combine external and constraint forces
        this.velocity = math.add(this.velocity, math.multiply(math.multiply(math.inv(this.M), this.forceTotal), delta));

        //this._relativeVelocity = math.subtract(this.velocity, this._parentVehicle.vehicleModel.velocity);
        this._relativeVelocity.valueOf()[1] = this.velocity.valueOf()[1] - this._parentVehicle.vehicleModel.velocity.valueOf()[1];
        this._relativeVelocity.valueOf()[3] = this.velocity.valueOf()[3] - this._parentVehicle.vehicleModel.velocity.valueOf()[3];
        this._relativeVelocity.valueOf()[4] = this.velocity.valueOf()[4] - this._parentVehicle.vehicleModel.velocity.valueOf()[4];
        this._relativeVelocity.valueOf()[5] = this.velocity.valueOf()[5] - this._parentVehicle.vehicleModel.velocity.valueOf()[5];

        this.state = math.add(this.state, math.multiply(this._relativeVelocity, delta));
        this._forceConstraints = math.matrix([0,0,0,0,0,0]);

        this.object.position.set(0, this.state.valueOf()[1], 0);
        this.object.rotation.set(this.state.valueOf()[3],this.state.valueOf()[4],this.state.valueOf()[5]);
    }

    public collision(collision: number[]){
        var force_radius = math.matrix([collision[0], collision[1], collision[2]]);
        var normal = math.matrix([collision[3], collision[4], collision[5]]);

        var rotComponent = math.cross(force_radius,normal);
        var J = math.matrix([
            -normal.valueOf()[0],
            -normal.valueOf()[1],
            -normal.valueOf()[2],
            rotComponent.valueOf()[0],
            rotComponent.valueOf()[1],
            rotComponent.valueOf()[2]
        ]);

        var mc = 1/math.multiply( math.multiply(J, math.inv(this._parentVehicle.vehicleModel.M)), math.transpose(J));
        var lagrange = -mc*(math.multiply(J,this.velocity));

        var Pc = math.multiply(math.transpose(J),lagrange);
        //var newVelocity : mathjs.Matrix = math.add(this.velocity, math.multiply(math.inv(this._parentVehicle.vehicleModel.M),Pc));

        this.forceConstraints.valueOf()[3] += Pc.valueOf()[3];
        this.forceConstraints.valueOf()[4] += Pc.valueOf()[4];
        this.forceConstraints.valueOf()[5] += Pc.valueOf()[5];
    }
}