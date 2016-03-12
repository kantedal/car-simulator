/**
 * Created by filles-dator on 2016-03-09.
 */

///<reference path="../../threejs/three.d.ts"/>
class ObjectLoader {
    private _wheelMesh : THREE.Mesh;
    private _objectLoadedListner: ObjectLoaderListener;

    constructor(){
    }

    public load(listener: ObjectLoaderListener):void {
        this._objectLoadedListner = listener;
        this.loadWheel();
    }

    public loadWheel():void {
        var self = this;

        var mtlLoader = new THREE.MTLLoader();
        mtlLoader.setBaseUrl( 'models/car/' );
        mtlLoader.setPath( 'models/car/' );
        mtlLoader.load( 'tire.mtl', function( materials ) {
            materials.preload();

            var objLoader = new THREE.OBJLoader();
            objLoader.setMaterials( materials );
            objLoader.setPath( 'models/car/' );
            objLoader.load( 'tire.obj', function ( object ) {
                self._wheelMesh = object;
                self._wheelMesh.castShadow = true;
                self._objectLoadedListner.objectsLoaded();
            }, 0, 0 );
        });
    }


    get wheelMesh():THREE.Mesh {
        return this._wheelMesh;
    }
}

interface ObjectLoaderListener {
    objectsLoaded: () => void;
}