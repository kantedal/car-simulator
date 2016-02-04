/**
 * Created by filles-dator on 2016-02-03.
 */

///<reference path="../../renderer.ts"/>

class Spring {
    private _renderer : Renderer;
    private _springGroup : THREE.Group;
    private _springMesh : THREE.Mesh;
    private _wheelConnectorMesh : THREE.Mesh;

    constructor(renderer : Renderer){
        this._renderer = renderer;
        this._springGroup = new THREE.Group();

        this._wheelConnectorMesh = new THREE.Mesh(new THREE.CylinderGeometry( 1, 1, 1, 32 ), new THREE.MeshBasicMaterial({color: 0xff0000, wireframe: true}));
        this._springGroup.add(this._wheelConnectorMesh);
        this.loadSpringModel();
    }

    private loadSpringModel():void {
        var self = this;
        var loader = new THREE.OBJLoader();
        loader.load(
            './models/spring.obj',
            function(object : THREE.Mesh){
                console.log("sucess");
                var material1 = new THREE.MeshBasicMaterial({color: 0x999999, wireframe: true});

                self._springMesh = object.clone();
                //self._springMesh.position.set(self._wheelConnectorMesh.position.x, self._wheelConnectorMesh.position.y, self._wheelConnectorMesh.position.z);
                self._springGroup.add(self._springMesh);
            },
            function ( xhr ) {
                console.log( 'An error happened' );
            }
        )
    }

    public update(time:number, delta:number){

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