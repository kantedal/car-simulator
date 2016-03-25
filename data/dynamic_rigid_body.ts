/**
 * Created by filles-dator on 2016-02-18.
 */
/**
 * Created by filles-dator on 2016-01-28.
 */
///<reference path="../threejs/three.d.ts"/>
///<reference path="./physics_object3d.ts"/>
///<reference path="./constraints/collision_constraint.ts"/>
///<reference path="../math/mathjs.d.ts"/>
///<reference path="./parts/wheel.ts"/>

class DynamicRigidBody extends PhysicsObject3d {
    get collisions():number[][] {
        return this._collisions;
    }
    private _gravity : number;
    private _mass : number;
    private _frictionConst : number;

    private _inertiaTensor : mathjs.Matrix;
    private _M : mathjs.Matrix;

    private _forceExternal : mathjs.Matrix;
    private _forceConstraints : mathjs.Matrix;
    private _forceTotal : mathjs.Matrix;

    public _dir : THREE.Vector3 = new THREE.Vector3(1,0,0);
    private _collisions : number[][];

    constructor(geometry: THREE.Geometry, material: THREE.Material, renderer: Renderer){
        super(geometry, material, renderer);
        this._renderer = renderer;

        this._gravity = -9.82;
        this._mass = 500;
        this._frictionConst = 0.99;
        this._collisions = [];

        this.calculateInertiaTensor();

        this._forceExternal = math.multiply(math.matrix([0,this._gravity,0,0,0,0]), this._mass);
        this._forceConstraints = math.matrix([0,0,0,0,0,0]);
        this._forceTotal = math.add(this._forceExternal, this._forceConstraints);

        this._M = math.matrix([
            [this._mass, 0, 0, 0, 0, 0],
            [0, this._mass, 0, 0, 0, 0],
            [0, 0, this._mass, 0, 0, 0],
            [0, 0, 0, 5000, 0, -400],
            [0, 0, 0, 0, 5000, 0],
            [0, 0, 0, -400, 0, 5000],
        ]);
        this._M.subset(math.index(math.range(3,6),math.range(3,6)), math.multiply(this._inertiaTensor, 1));
        //console.log(this._M.valueOf());

        this.velocity = math.transpose(math.matrix([0,0,0,0,0,0]));
        this.state = math.transpose(math.matrix([0,30,0,0,0,0]));

        renderer.scene.add(this.object);
    }

    public update(time:number, delta:number):void{
        this._forceTotal = math.add(this._forceExternal, this._forceConstraints); //Combine external and constraint forces
        this.velocity = math.add(this._velocity, math.multiply(math.multiply(math.inv(this._M), this._forceTotal), delta));
        this.state = math.add(this._state, math.multiply(this._velocity, delta));

        this._forceConstraints = math.matrix([0,0,0,0,0,0]);

        super.update(time,delta);
        //var collisions = super.checkCollisions();
        this._collisions = super.newNewCheckCollisions();

        for(var colNum=0; colNum<this._collisions.length; colNum++){
            this.velocity = this.collision(this._collisions[colNum]);
        }
    }

    public collision(collision:number[]):mathjs.Matrix {
        var penetration = collision[9];
        var force_radius = math.matrix([collision[0], collision[1], collision[2]]);
        var normal = math.matrix([collision[3], collision[4], collision[5]]);

        this.applyFriction(force_radius, normal);

        var rotComponent = math.cross(force_radius,normal);
        var J = math.matrix([
            normal.valueOf()[0],
            normal.valueOf()[1],
            normal.valueOf()[2],
            rotComponent.valueOf()[0],
            rotComponent.valueOf()[1],
            rotComponent.valueOf()[2]
        ]);

        var mc = 1/math.multiply( math.multiply(J, math.inv(this._M)), math.transpose(J));
        var lagrange = -mc*(math.multiply(J,this._velocity)-14*penetration-0.3);

        var Pc = math.multiply(math.transpose(J),lagrange);

        var newVelocity : mathjs.Matrix = math.add(this._velocity, math.multiply(math.inv(this._M),Pc));

        return newVelocity;
    }

    private applyFriction(force_radius: mathjs.Matrix, normal: mathjs.Matrix) {
        var direction = this.velocityDirection.clone().normalize();
        var force_comp = Math.abs(direction.clone().dot(this.localXDirection));
        var math_direction = math.matrix([direction.x, direction.y, direction.z]);

        //this.velocity.valueOf()[0] *= 0.998 - force_comp*0.01;
        //this.velocity.valueOf()[1] *= 0.998 - force_comp*0.01;
        //this.velocity.valueOf()[2] *= 0.998 - force_comp*0.01;

        var cross = math.cross(force_radius,math_direction).valueOf();
        var J = math.matrix([
            direction.x,
            direction.y,
            direction.z,
            cross[0],
            cross[1],
            cross[2]
        ]);

        var mc = 1/math.multiply(math.multiply(J, math.inv(this.M)), math.transpose(J));

        //var forceVec = this._connectedVehicle.vehicleModel.localZDirection.clone().applyAxisAngle(this._connectedVehicle.vehicleModel.localYDirection, -Math.PI/2);
        //var forceComp = Math.abs(vel.clone().normalize().dot(forceVec));

        //var forceUp = this._connectedVehicle.vehicleModel.forceTotal.valueOf()[1]

        //if(this.acceleration.y > 0){

        //var acc_norm = this.acceleration.clone().normalize();

        var lagrange = -mc*(math.multiply(J, this.velocity))*(0.15 + 0.1*force_comp);

        var Fc = math.multiply(math.transpose(J),lagrange);
        this.forceConstraints =  math.add(this.forceConstraints, Fc);
        //}


    }

    public applyImpulse(){
        if(this.localYDirection.clone().dot(new THREE.Vector3(0,1,0)) < -0.3){
            var force_radius = math.matrix([0, 0, 4]);
            var normal = math.matrix([0, 1, 0]);

            var rotComponent = math.cross(force_radius, normal);
            var J = math.matrix([
                normal.valueOf()[0],
                normal.valueOf()[1],
                normal.valueOf()[2],
                rotComponent.valueOf()[0],
                rotComponent.valueOf()[1],
                rotComponent.valueOf()[2]
            ]);

            var mc = 1 / math.multiply(math.multiply(J, math.inv(this._M)), math.transpose(J));
            var lagrange = -mc * (math.multiply(J, math.matrix([0, -14, 0, 0, 0, 0])) - 4) * 1;

            var Pc = math.multiply(math.transpose(J), lagrange);

            this.velocity = math.add(this.velocity, math.multiply(math.inv(this._M), Pc));
        }
    }

    private xLim :number[] = [-2,2];
    private yLim :number[] = [-1,1];
    private zLim :number[] = [-4,4];
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

        this._inertiaTensor = math.matrix([
            [Ixx, Ixy, Ixz],
            [Ixy, Iyy, Iyz],
            [Ixz, Iyz, Izz]
        ]);
    }

    get frictionConst():number {
        return this._frictionConst;
    }

    get forceExternal():mathjs.Matrix {
        return this._forceExternal;
    }

    get forceConstraints():mathjs.Matrix {
        return this._forceConstraints;
    }

    set forceConstraints(value:mathjs.Matrix) {
        this._forceConstraints = value;
    }

    get M():mathjs.Matrix {
        return this._M;
    }

    get forceTotal():mathjs.Matrix {
        return this._forceTotal;
    }
}