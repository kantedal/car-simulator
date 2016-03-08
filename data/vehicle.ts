/**
 * Created by filles-dator on 2016-01-26.
 */
///<reference path="./physics_object3d.ts"/>
///<reference path="../renderer.ts"/>
///<reference path="./parts/wheel.ts"/>
///<reference path="./ground_plane.ts"/>
///<reference path="../carsimulator.ts"/>
///<reference path="./parts/motor.ts"/>
///<reference path="./parts/spring.ts"/>
///<reference path="./parts/steering.ts"/>
///<reference path="./vehiclesetup.ts"/>
///<reference path="./dynamic_car_body.ts"/>
///<reference path="./car.ts"/>

class Vehicle {
    private _renderer:Renderer;

    private _position:THREE.Vector3;
    private _rotation:THREE.Vector3;
    private _acceleration:THREE.Vector3;
    private _velocity:THREE.Vector3;
    private _isColliding:boolean;

    private _vehicleSetup : VehicleSetup;
    private _vehicleModel : DynamicRigidBody;

    constructor(renderer : Renderer){
        this._renderer = renderer;

        this._position = new THREE.Vector3(0,0,0);
        this._rotation = new THREE.Vector3(0,0,0);
        this._acceleration = new THREE.Vector3(0,0,0);
        this._velocity = new THREE.Vector3(0,0,0);
        this._isColliding = false;

        this._vehicleModel = new DynamicRigidBody(new THREE.BoxGeometry( 0, 0, 0 ), new THREE.MeshBasicMaterial({color: 0xff0000, wireframe: true}), renderer);
        //this._vehicleModel.position.set(0,30,0);

        this._vehicleSetup = new Car(this._renderer, this);

        //renderer.scene.add(this._vehicleModel.object);
    }

    public update(time:number, delta:number):void {
        this._vehicleSetup.update(time,delta);
        this._vehicleModel.update(time,delta);

        this._velocity = this._vehicleModel.velocity;
        this._isColliding = this._vehicleModel.isColliding;

        this._renderer.camera.lookAt(this._vehicleModel.object.position);
        this._renderer.camera.position.set(this._vehicleModel.object.position.x, this._vehicleModel.object.position.y+8, this._vehicleModel.object.position.z+12);
        this._position.set(this._vehicleModel.object.position.x, this._vehicleModel.object.position.y, this._vehicleModel.object.position.z);

        //this._vehicleSetup.vehicleBody.object.position.setY(Math.sin(time*3));
        for(var colNum=0; colNum<this._vehicleModel.collisions.length; colNum++){
            this._vehicleSetup.vehicleBody.collision(this._vehicleModel.collisions[colNum]);
        }

        this._vehicleSetup.vehicleBody.update(time,delta);
    }

    public connectCollisionSurface(groundPlanes: GroundPlane[]): number{
        var surfaceIndex = 0;
        for(var g=0; g<groundPlanes.length; g++){
            for(var i=0; i<this._vehicleSetup.wheels.length; i++) {
                if(Math.abs(this._vehicleSetup.wheels[i].position.x - groundPlanes[g].mesh.position.x) < CarSimulator.ground_width/2 && Math.abs(this._vehicleSetup.wheels[i].position.z - groundPlanes[g].mesh.position.z) < CarSimulator.ground_width/2) {
                    //this._vehicleSetup.wheels[i].connectCollisionSurface(groundPlanes[g].geometry);
                    this._vehicleModel.connectCollisionSurface(groundPlanes[g].geometry);
                    surfaceIndex = g;
                    break;
                }
            }
        }
        return surfaceIndex;
    }

    public add(object){
        this._vehicleModel.object.add(object);
    }

    get position():THREE.Vector3 {
        return this._position;
    }

    set position(value:THREE.Vector3) {
        this._position = value;
    }

    get acceleration():THREE.Vector3 {
        return this._acceleration;
    }

    set acceleration(value:THREE.Vector3) {
        this._acceleration = value;
    }

    get isColliding():boolean {
        return this._isColliding;
    }

    set isColliding(value:boolean) {
        this._isColliding = value;
    }

    get velocity():THREE.Vector3 {
        return this._velocity;
    }

    set velocity(value:THREE.Vector3) {
        this._velocity = value;
    }

    get rotation():THREE.Vector3 {
        return this._rotation;
    }

    set rotation(value:THREE.Vector3) {
        this._rotation = value;
    }

    get vehicleSetup():VehicleSetup {
        return this._vehicleSetup;
    }

    set vehicleSetup(value:VehicleSetup) {
        this._vehicleSetup = value;
    }

    get vehicleModel():DynamicRigidBody {
        return this._vehicleModel;
    }

    set vehicleModel(value:DynamicRigidBody) {
        this._vehicleModel = value;
    }
}