/**
 * Created by filles-dator on 2016-02-03.
 */

///<reference path="../../renderer.ts"/>
///<reference path="../vehicle.ts"/>

class Spring {
    private _vehicle : Vehicle;
    private _renderer : Renderer;
    private _object : THREE.Mesh;
    private _springGroup : THREE.Group;
    private _spring : THREE.Object3D;
    private _springMesh : THREE.Mesh;
    private _wheelConnectorMesh : THREE.Mesh;
    private _carBodyConnectorMesh : THREE.Mesh;

    private _springDirection : THREE.Vector3;
    private _springArrow : THREE.ArrowHelper;

    constructor(renderer: Renderer){
        //this._vehicle = vehicle;
        this._renderer = renderer;
        this._springGroup = new THREE.Group();
        //this._springGroup.rotateZ(startRot);
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

    private loadSpringModel():void {
        var self = this;
        var loader = new THREE.OBJLoader();
        loader.load(
            './models/spring2.obj',
            function(object : THREE.Mesh){
                var material1 = new THREE.MeshBasicMaterial({color: 0x999999, wireframe: true});

                self._springMesh = object.clone();
                self._springMesh.scale.set(0.4,0.4,0.4);
                self._springMesh.position.set(0,1.2,0);
                //self._springMesh.position.set(self._wheelConnectorMesh.position.x, self._wheelConnectorMesh.position.y, self._wheelConnectorMesh.position.z);
                self._spring.add(self._springMesh);
            },
            function ( xhr ) {
                console.log( 'An error happened' );
            }
        )
    }

    private _linearSpringAcceleration:number = 0;
    private _linearSpringVelocity:number = 0;

    private _linearSpringConst:number = 12000;
    private _linearDampingConst:number = 900;

    private _angularSpringAccelerationX:number = 0;
    private _angularSpringVelocityX:number = 0;
    private _angularSpringAccelerationY:number = 0;
    private _angularSpringVelocityY:number = 0;
    private _angularSpringAccelerationZ:number = 0;
    private _angularSpringVelocityZ:number = 0;

    private _angularSpringConst:number = 16000;
    private _angularDampingConst:number = 1600;

    public update(time:number, delta:number, state:mathjs.Matrix) {
        this._linearSpringAcceleration = - (this._linearSpringConst*(state.valueOf()[1]-1) + this._linearDampingConst*this._linearSpringVelocity)/500;
        this._linearSpringVelocity += this._linearSpringAcceleration*delta;

        this._angularSpringAccelerationX = - (this._angularSpringConst*(state.valueOf()[3]) + this._angularDampingConst*this._angularSpringVelocityX)/1500;
        this._angularSpringVelocityX += this._angularSpringAccelerationX*delta;

        this._angularSpringAccelerationY = - (this._angularSpringConst*(state.valueOf()[4]) + this._angularDampingConst*this._angularSpringVelocityY)/1500;
        this._angularSpringVelocityY += this._angularSpringAccelerationY*delta;

        this._angularSpringAccelerationZ = - (this._angularSpringConst*(state.valueOf()[5]) + this._angularDampingConst*this._angularSpringVelocityZ)/1500;
        this._angularSpringVelocityZ += this._angularSpringAccelerationZ*delta;
    }

    get linearSpringAcceleration():number {
        return this._linearSpringAcceleration;
    }

    get linearSpringVelocity():number {
        return this._linearSpringVelocity;
    }

    get angularSpringVelocityZ():number {
        return this._angularSpringVelocityZ;
    }
    get angularSpringVelocityY():number {
        return this._angularSpringVelocityY;
    }
    get angularSpringVelocityX():number {
        return this._angularSpringVelocityX;
    }

    get position():THREE.Vector3 {
        return this._springGroup.position;
    }

    set position(value:THREE.Vector3) {
        this._springGroup.position = value;
    }

    get springObject():THREE.Group {
        return this._springGroup;
    }
}