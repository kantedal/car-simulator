/**
 * Created by filles-dator on 2016-02-03.
 */

///<reference path="../../renderer.ts"/>
///<reference path="../vehicle.ts"/>

class Spring {
    private _vehicle : Vehicle;
    private _renderer : Renderer;
    private _springGroup : THREE.Group;
    private _spring : THREE.Object3D;
    private _springMesh : THREE.Mesh;
    private _wheelConnectorMesh : THREE.Mesh;
    private _carBodyConnectorMesh : THREE.Mesh;

    private _springDirection : THREE.Vector3;
    private _springArrow : THREE.ArrowHelper;

    constructor(renderer: Renderer, vehicle: Vehicle, startRot: number){
        this._vehicle = vehicle;
        this._renderer = renderer;
        this._springGroup = new THREE.Group();
        this._springGroup.rotateZ(startRot);
        this._springGroup.position.set(0,0,0);

        this._spring = new THREE.Object3D();
        this._spring.position.set(0,0,0);
        this._springGroup.add(this._spring);

        this._wheelConnectorMesh = new THREE.Mesh(new THREE.CylinderGeometry( 0.5, 0.5, 0.5, 10 ), new THREE.MeshBasicMaterial({color: 0xff0000, wireframe: true}));
        this._wheelConnectorMesh.position.set(0,0,0);
        this._springGroup.add(this._wheelConnectorMesh);

        this._carBodyConnectorMesh = new THREE.Mesh(new THREE.CylinderGeometry( 0.5, 0.5, 0.5, 10 ), new THREE.MeshBasicMaterial({color: 0xff0000, wireframe: true}));
        this._carBodyConnectorMesh.position.set(0,8,0);
        this._springGroup.add(this._carBodyConnectorMesh);

        this._springDirection = new THREE.Vector3(0,1,0);
        this._springArrow = new THREE.ArrowHelper( this._springDirection, new THREE.Vector3(0,0,0), 10, 0x00ffff );

        this._vehicle.add(this._springGroup);

        this.loadSpringModel();
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

    private a:number = 0;
    private v:number = 0;
    private k:number = 10000;
    private c:number = 1500;
    public update(time:number, delta:number) {
        if (this._springMesh) {
            var dampConst = 5000;

            this.a = -(this._vehicle.acceleration.y/0.003+9.82) - (this.k*(this._carBodyConnectorMesh.position.y-4.5) + this.c*this.v)/500;
            this._carBodyConnectorMesh.position.y += this.v*0.03;
            this._spring.scale.y = this._carBodyConnectorMesh.position.y*0.35+0.2;
            this.v += this.a*0.03;
            //this._carBodyConnectorMesh.position.y = 8-(500*(this._car.force.y+9.82))/dampConst;

        }
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