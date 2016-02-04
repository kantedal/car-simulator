/**
 * Created by filles-dator on 2016-02-03.
 */

///<reference path="../../renderer.ts"/>
///<reference path="../car.ts"/>

class Spring {
    private _car : Car;
    private _renderer : Renderer;
    private _springGroup : THREE.Group;
    private _spring : THREE.Object3D;
    private _springMesh : THREE.Mesh;
    private _wheelConnectorMesh : THREE.Mesh;
    private _carBodyConnectorMesh : THREE.Mesh;

    constructor(renderer: Renderer, car: Car){
        this._car = car;
        this._renderer = renderer;
        this._springGroup = new THREE.Group();
        this._spring = new THREE.Object3D();
        this._spring.position.set(0,3,0);
        this._springGroup.add(this._spring);

        this._wheelConnectorMesh = new THREE.Mesh(new THREE.CylinderGeometry( 0.6, 0.6, 0.5, 10 ), new THREE.MeshBasicMaterial({color: 0xff0000, wireframe: true}));
        this._wheelConnectorMesh.position.set(0,3,0);
        this._springGroup.add(this._wheelConnectorMesh);

        this._carBodyConnectorMesh = new THREE.Mesh(new THREE.CylinderGeometry( 0.6, 0.6, 0.5, 10 ), new THREE.MeshBasicMaterial({color: 0xff0000, wireframe: true}));
        this._carBodyConnectorMesh.position.set(0,6,0);
        this._springGroup.add(this._carBodyConnectorMesh);

        this.loadSpringModel();
    }

    private loadSpringModel():void {
        var self = this;
        var loader = new THREE.OBJLoader();
        loader.load(
            './models/spring.obj',
            function(object : THREE.Mesh){
                var material1 = new THREE.MeshBasicMaterial({color: 0x999999, wireframe: true});

                self._springMesh = object.clone();
                self._springMesh.scale.set(0.5,0.4,0.5);
                self._springMesh.position.set(0,0,0);
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
    private c:number = 3000;
    public update(time:number, delta:number) {
        if (this._springMesh) {
            var dampConst = 5000;

            this.a = -(this._car.acceleration.y/0.003+9.82) - (this.k*(this._carBodyConnectorMesh.position.y-6) + this.c*this.v)/500;
            this._carBodyConnectorMesh.position.y += this.v*0.03;
            this._spring.scale.y = this._carBodyConnectorMesh.position.y*0.30-1.0;
            this.v += this.a*0.03;
            //this._carBodyConnectorMesh.position.y = 8-(500*(this._car.force.y+9.82))/dampConst;
        }
    }


    get position():THREE.Vector3 {
        return this._position;
    }

    set position(value:THREE.Vector3) {
        this._position = value;
    }

    get springObject():THREE.Group {
        return this._springGroup;
    }
}