/**
 * Created by filles-dator on 2016-02-03.
 */

///<reference path="../../renderer.ts"/>
///<reference path="../vehicle.ts"/>

class Spring {
    private _linearSpringConst:number = 6000;
    private _linearDampingConst:number = 900;
    private _linearSpringAcceleration: THREE.Vector3;
    private _linearSpringVelocity: THREE.Vector3;
    private _linearDisplacement: THREE.Vector3;

    private _angularSpringConst:number = 10000;
    private _angularDampingConst:number = 1600;
    private _angularSpringAcceleration: THREE.Vector3;
    private _angularSpringVelocity: THREE.Vector3;
    private _angularDisplacement: THREE.Vector3;

    private _renderer : Renderer;
    private _springGroup : THREE.Group;
    private _spring : THREE.Object3D;
    private _springMesh : THREE.Mesh;
    private _wheelConnectorMesh : THREE.Mesh;
    private _carBodyConnectorMesh : THREE.Mesh;

    private _springDirection : THREE.Vector3;
    private _springArrow : THREE.ArrowHelper;

    constructor(renderer: Renderer){
        this._linearSpringAcceleration = new THREE.Vector3(0,0,0);
        this._linearSpringVelocity = new THREE.Vector3(0,0,0);
        this._linearDisplacement = new THREE.Vector3(0,1,0);

        this._angularSpringAcceleration = new THREE.Vector3(0,0,0);
        this._angularSpringVelocity = new THREE.Vector3(0,0,0);
        this._angularDisplacement = new THREE.Vector3(0,0,0);

        this._renderer = renderer;
        this._springGroup = new THREE.Group();
        this._springGroup.position.set(0,0,0);

        this._spring = new THREE.Object3D();
        this._spring.position.set(0,0,0);
        this._springGroup.add(this._spring);

        //this._wheelConnectorMesh = new THREE.Mesh(new THREE.CylinderGeometry( 0.5, 0.5, 0.5, 10 ), new THREE.MeshBasicMaterial({color: 0xff0000, wireframe: true}));
        //this._wheelConnectorMesh.position.set(0,0,0);
        //this._springGroup.add(this._wheelConnectorMesh);
        //
        //this._carBodyConnectorMesh = new THREE.Mesh(new THREE.CylinderGeometry( 0.5, 0.5, 0.5, 10 ), new THREE.MeshBasicMaterial({color: 0xff0000, wireframe: true}));
        //this._carBodyConnectorMesh.position.set(0,8,0);
        //this._springGroup.add(this._carBodyConnectorMesh);
        //
        //this._springDirection = new THREE.Vector3(0,1,0);
        //this._springArrow = new THREE.ArrowHelper( this._springDirection, new THREE.Vector3(0,0,0), 10, 0x00ffff );

        //this._vehicle.add(this._springGroup);

        //this.loadSpringModel();
    }

    public update(time:number, delta:number, linearState: THREE.Vector3, angularState: THREE.Vector3) {
        this._linearSpringAcceleration =
                linearState.clone().sub(this._linearDisplacement)
                .multiplyScalar(this._linearSpringConst).add(this._linearSpringVelocity.clone()
                .multiplyScalar(this._linearDampingConst)).multiplyScalar(1/300);
        this._linearSpringAcceleration.multiplyScalar(-1);
        this._linearSpringVelocity.add(this._linearSpringAcceleration.clone().multiplyScalar(delta));

        this._angularSpringAcceleration =
            angularState.clone().sub(this._angularDisplacement)
                .multiplyScalar(this._angularSpringConst).add(this._angularSpringVelocity.clone()
                .multiplyScalar(this._angularDampingConst)).multiplyScalar(1/1000);
        this._angularSpringAcceleration.multiplyScalar(-1);
        this._angularSpringVelocity.add(this._angularSpringAcceleration.clone().multiplyScalar(delta));
    }

    set angularDampingConst(value:number) {
        this._angularDampingConst = value;
    }
    set angularSpringConst(value:number) {
        this._angularSpringConst = value;
    }
    set linearDampingConst(value:number) {
        this._linearDampingConst = value;
    }
    set linearSpringConst(value:number) {
        this._linearSpringConst = value;
    }
    set angularDisplacement(value:THREE.Vector3) {
        this._angularDisplacement = value;
    }
    set linearDisplacement(value:THREE.Vector3) {
        this._linearDisplacement = value;
    }
    get angularSpringVelocity():THREE.Vector3 {
        return this._angularSpringVelocity;
    }
    get angularSpringAcceleration():THREE.Vector3 {
        return this._angularSpringAcceleration;
    }
    get linearSpringVelocity():THREE.Vector3 {
        return this._linearSpringVelocity;
    }
    get linearSpringAcceleration():THREE.Vector3 {
        return this._linearSpringAcceleration;
    }

}