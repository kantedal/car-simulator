///<reference path="./physics_object3d.ts"/>

class GroundPlane {
    private _mesh : THREE.Mesh;
    private _geometry : THREE.Geometry;
    private _planeLoadedListener : PlaneLoadedListener;

    private _renderer : Renderer;
    private _scale : THREE.Vector3;

    constructor(renderer : Renderer){
        this._renderer = renderer;
        this._scale = new Vector3(1,1,1);
    }

    public loadPlane(listener : PlaneLoadedListener, renderer : Renderer):void {
        this._renderer = renderer;
        var self = this;
        var loader = new THREE.OBJLoader();
        loader.load(
            './models/ground_model2.obj',
            function(object){
                console.log("success");
                self._mesh = object;
                var material = new THREE.MeshPhongMaterial( {
                    color: 0x555555,
                    specular: 0x999999,
                    shininess: 10,
                    shading: THREE.SmoothShading
                });

                var material1 = new THREE.MeshBasicMaterial({color: 0x999999, wireframe: true});

                object.traverse( function ( child ) {
                    if (child instanceof THREE.Mesh) {
                        child.material = material1;
                        self._geometry = new THREE.Geometry().fromBufferGeometry(child.geometry);
                    }
                } );

                listener.planeLoaded(self);
            },
            function ( xhr ) {
                console.log( 'An error happened' );
            }
        )
    }

    public addLoadedListener(listener : PlaneLoadedListener):void {
        this._planeLoadedListener = listener;
        //this._planeLoadedListener.planeLoaded(this._mesh);
    }

    get scale():THREE.Vector3 {
        return this._scale;
    }

    set scale(scale:THREE.Vector3) {
        this._geometry.scale(scale.x, scale.y, scale.z);
        this.mesh.scale.set(scale.x, scale.y, scale.z);
        this._scale = scale;
    }

    get mesh():THREE.Mesh {
        return this._mesh;
    }

    set mesh(value:THREE.Mesh) {
        this._mesh = value;
    }
    get geometry():THREE.Geometry {
        return this._geometry;
    }

    set geometry(value:THREE.Geometry) {
        this._geometry = value;
    }

    public clone() : GroundPlane {
        var newGround = new GroundPlane(this._planeLoadedListener, this._renderer);
        newGround.mesh = this._mesh.clone();
        newGround.geometry = this._geometry.clone();
        return newGround;
    }
}

interface PlaneLoadedListener {
    planeLoaded: (plane:GroundPlane) => void;
}