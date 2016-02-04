/**
 * Created by filles-dator on 2016-02-03.
 */

///<reference path="../../renderer.ts"/>
///<reference path="../car.ts"/>

class Spring {
    private _car : Car;
    private _renderer : Renderer;
    private _springGroup : THREE.Group;
    private _springMesh : THREE.Mesh;
    private _wheelConnectorMesh : THREE.Mesh;
    private _carBodyConnectorMesh : THREE.Mesh;

    constructor(renderer: Renderer, car: Car){
        this._car = car;
        this._renderer = renderer;
        this._springGroup = new THREE.Group();

        this._wheelConnectorMesh = new THREE.Mesh(new THREE.CylinderGeometry( 0.6, 0.6, 0.5, 10 ), new THREE.MeshBasicMaterial({color: 0xff0000, wireframe: true}));
        this._wheelConnectorMesh.position.set(0,3,0);
        this._springGroup.add(this._wheelConnectorMesh);

        this._carBodyConnectorMesh = new THREE.Mesh(new THREE.CylinderGeometry( 0.6, 0.6, 0.5, 10 ), new THREE.MeshBasicMaterial({color: 0xff0000, wireframe: true}));
        this._carBodyConnectorMesh.position.set(0,8,0);
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
                self._springMesh.scale.set(0.5,0.5,0.5);
                self._springMesh.position.set(0,3,0);
                //self._springMesh.position.set(self._wheelConnectorMesh.position.x, self._wheelConnectorMesh.position.y, self._wheelConnectorMesh.position.z);
                self._springGroup.add(self._springMesh);
            },
            function ( xhr ) {
                console.log( 'An error happened' );
            }
        )
    }

    public update(time:number, delta:number) {
        if (this._springMesh) {
            //this._carBodyConnectorMesh.position.y = 8 + Math.sin(time) * 3;
            //this._springMesh.scale.y = Math.sin(time);
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