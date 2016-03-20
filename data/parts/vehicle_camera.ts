/**
 * Created by filles-dator on 2016-03-20.
 */

///<reference path="../dynamic_rigid_body.ts"/>
///<reference path="../vehiclesetup.ts"/>
///<reference path="./spring.ts"/>
///<reference path="../../renderer.ts"/>
///<reference path="../../threejs/three.d.ts"/>

class VehicleCamera {
    private _firstPersonView:boolean = false;
    private _camera: THREE.Camera;
    private _cameraSpring: Spring
    private _cameraDirection: THREE.Vector3
    private _vehicleModel: DynamicRigidBody;
    private _vehicleSetup: VehicleSetup;

    constructor(vehicleSetup: VehicleSetup, vehicleModel: DynamicRigidBody, camera: THREE.Camera){
        this._vehicleSetup = vehicleSetup;
        this._vehicleModel = vehicleModel;
        this._camera = camera;
        this._cameraSpring = new Spring();
        this._cameraSpring.allowMotion(true, false);
        this._cameraSpring.linearSpringConst = 30;
        this._cameraSpring.linearDampingConst = 200;
        this._cameraDirection = this._vehicleModel.localZDirection;

        if(this._firstPersonView){
            this._camera.position.set(-1,2.5,1.5);
            this._camera.rotateX(Math.PI/2);
            this._camera.rotateY(-Math.PI/2);
            this._vehicleSetup.vehicleBody.object.add(this._camera);
        }
    }

    public update(time:number, delta:number){
        this._cameraSpring.linearDisplacement = this._vehicleModel.localZDirection.clone().sub(this._cameraDirection);
        this._cameraSpring.update(time, delta, this._cameraDirection, new THREE.Vector3(0,0,0));
        this._cameraDirection.add(this._cameraSpring.linearSpringVelocity.clone().multiplyScalar(delta));
        //this._cameraDirection.normalize();

        if(!this._firstPersonView){
            this._camera.lookAt(this._vehicleModel.object.position);

            var realCameraDir = this._cameraDirection.clone().normalize();
            this._camera.position.set(
                this._vehicleModel.object.position.x+realCameraDir.x*12,
                this._vehicleModel.object.position.y+9,
                this._vehicleModel.object.position.z+realCameraDir.z*12
            );
        }
    }
}