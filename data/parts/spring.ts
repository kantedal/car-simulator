/**
 * Created by filles-dator on 2016-02-03.
 */

///<reference path="../../renderer.ts"/>

class Spring {

    private _renderer : Renderer;
    private _position : THREE.Vector3;
    private _object : THREE.Mesh;

    constructor(renderer : Renderer){
        this._renderer = renderer;
        this._position = new THREE.Vector3(0,0,0);
    }

    public static loadSpringModel(loadedListener : SpringLoadedListener):void {
        var self = this;
        var loader = new THREE.OBJLoader();
        loader.load(
            './models/spring.obj',
            function(object : THREE.Mesh){
                console.log("sucess");
                var material1 = new THREE.MeshBasicMaterial({color: 0x999999, wireframe: true});

                self._object = object.clone();
                self._renderer.scene.add(self._object);
            },
            function ( xhr ) {
                console.log( 'An error happened' );
            }
        )
    }

    public update(time:number, delta:number){
        if(this._object){

        }
    }

    get object():THREE.Mesh {
        return this._object;
    }

    set object(value:THREE.Mesh) {
        this._object = value;
    }
}

interface SpringLoadedListener {
    planeLoaded: (springModel: THREE.Mesh) => void;
}