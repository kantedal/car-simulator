/**
 * Created by filles-dator on 2016-03-09.
 */

///<reference path="../../threejs/three.d.ts"/>
class ObjectLoader {

    private _objectLoadedListner: ObjectLoaderListener;

    private _wheelMesh : THREE.Mesh;
    private _wheelLoaded = false;

    private _carMesh : THREE.Mesh;
    private _carLoaded = false;

    private _springMesh: THREE.Mesh;
    private _springLoaded = false;

    private _springConnectorMesh: THREE.Mesh;
    private _springConnectorLoaded = false;

    private _treeMesh : THREE.Mesh;
    private _treeLoaded = false;


    constructor(){
    }

    public load(listener: ObjectLoaderListener):void {
        this._objectLoadedListner = listener;
        this.loadWheel();
        this.loadCar();
        this.loadTree();
        this.loadSpring();
        this.loadSpringConnector();
    }

    public loadWheel():void {
        var self = this;

        var mtlLoader = new THREE.MTLLoader();
        mtlLoader.setBaseUrl( 'models/car/' );
        mtlLoader.setPath( 'models/car/' );
        mtlLoader.load( 'tire.mtl', function( materials ) {
            materials.preload();

            console.log(materials.materials.phong2SG);
            materials.materials.phong2SG.bumpMap = materials.materials.phong2SG.map;
            materials.materials.phong2SG.bumpScale = 0.2;

            var objLoader = new THREE.OBJLoader();
            objLoader.setMaterials( materials );
            objLoader.setPath( 'models/car/' );
            objLoader.load( 'tire.obj', function ( object ) {
                self._wheelMesh = object;
                self._wheelMesh.rotateY(Math.PI/2);
                self._wheelMesh.scale.set(1.6,1.6,1.6);
                self._wheelMesh.castShadow = true;
                self._wheelLoaded = true;
                if(self.allLoaded())
                    self._objectLoadedListner.objectsLoaded();
            }, 0, 0 );
        });
    }

    public loadCar():void {
        var self = this;

        var mtlLoader = new THREE.MTLLoader();
        mtlLoader.setBaseUrl( 'models/car/' );
        mtlLoader.setPath( 'models/car/' );
        mtlLoader.load( 'car.mtl', function( materials ) {
            materials.preload();

            console.log(materials);

            var texture = new THREE.TextureLoader().load("texture/barrel_spec.png")
            materials.materials.phong6SG = new THREE.MeshPhongMaterial({
                map: new THREE.TextureLoader().load("texture/barrel_diffuse.png"),
                specularMap: texture,
                bumpMap: texture,
                bumpScale: 0.01,
                color: 0xdddddd,
                specular: 0x999999,
                shininess: 30
            });

            var metalTexture =new THREE.TextureLoader().load("texture/metalplate.jpg");
            materials.materials.phong5SG = new THREE.MeshPhongMaterial({
                map:metalTexture,
                bumpMap: metalTexture,
                bumpScale: 0.2,
                color: 0xdddddd,
                specular: 0x999999,
                shininess: 0
            });

            materials.materials.V8_Enginephong2SG = new THREE.MeshPhongMaterial({
                map: new THREE.TextureLoader().load("models/car/chrome.png"),
                color: 0xdddddd,
                specular: 0x999999,
                shininess: 0
            });

            materials.materials.V8_Enginephong1SG = new THREE.MeshPhongMaterial({
                map: new THREE.TextureLoader().load("models/car/metal.png"),
                color: 0xdddddd,
                specular: 0x999999,
                shininess: 0
            });


            materials.materials.V8_EngineV8_Engine_lambert2SG = new THREE.MeshPhongMaterial({
                map: new THREE.TextureLoader().load("models/car/engine block.png"),
                color: 0xdddddd,
                specular: 0x999999,
                shininess: 0
            });

            materials.materials.lambert2SG.transparent = true;

            var objLoader = new THREE.OBJLoader();
            objLoader.setMaterials( materials );
            objLoader.setPath( 'models/car/' );
            objLoader.load( 'car.obj', function ( object ) {
                self._carMesh = object;
                self._carMesh.scale.set(0.38, 0.38, 0.38);
                self._wheelMesh.castShadow = true;
                self._carLoaded = true;
                if(self.allLoaded())
                    self._objectLoadedListner.objectsLoaded();
            }, 0, 0 );
        });
    }

    public loadTree():void {
        var self = this;

        var mtlLoader = new THREE.MTLLoader();
        mtlLoader.setBaseUrl( 'models/' );
        mtlLoader.setPath( 'models/' );
        mtlLoader.load( 'tree.mtl', function( materials ) {
            materials.preload();

            materials.materials.lambert2SG = new THREE.MeshLambertMaterial({
                map: new THREE.TextureLoader().load("models/FirBranches_Df.png"),
            });

            materials.materials.lambert2SG = new THREE.MeshLambertMaterial({
                map: new THREE.TextureLoader().load("models/FirBranches_Df.png"),
                transparent: true,
                alphaTest: 0.2
            });

            var objLoader = new THREE.OBJLoader();
            objLoader.setMaterials( materials );
            objLoader.setPath( 'models/' );
            objLoader.load( 'tree.obj', function ( object ) {
                self._treeMesh = object;
                self._treeLoaded = true;
                self._treeMesh.scale.set(0.5,0.4,0.5);
                if(self.allLoaded())
                    self._objectLoadedListner.objectsLoaded();
            }, 0, 0 );
        });
    }

    public loadSpring():void {
        var self = this;

        var mtlLoader = new THREE.MTLLoader();
        mtlLoader.setBaseUrl( 'models/' );
        mtlLoader.setPath( 'models/' );
        mtlLoader.load( 'spring.mtl', function( materials ) {
            materials.preload();

            var objLoader = new THREE.OBJLoader();
            objLoader.setMaterials( materials );
            objLoader.setPath( 'models/' );
            objLoader.load( 'spring.obj', function ( object ) {
                self._springMesh = object;
                self._springLoaded = true;
                if(self.allLoaded())
                    self._objectLoadedListner.objectsLoaded();
            }, 0, 0 );
        });
    }

    public loadSpringConnector():void {
        var self = this;

        var mtlLoader = new THREE.MTLLoader();
        mtlLoader.setBaseUrl( 'models/car/' );
        mtlLoader.setPath( 'models/car/' );
        mtlLoader.load( 'spring_connector.mtl', function( materials ) {
            materials.preload();

            var objLoader = new THREE.OBJLoader();
            objLoader.setMaterials( materials );
            objLoader.setPath( 'models/car/' );
            objLoader.load( 'spring_connector.obj', function ( object ) {
                self._springConnectorMesh = object;
                self._springConnectorLoaded = true;
                if(self.allLoaded())
                    self._objectLoadedListner.objectsLoaded();
            }, 0, 0 );
        });
    }


    private allLoaded():boolean{
        if(this._carLoaded && this._wheelLoaded && this._treeLoaded && this._springLoaded && this._springConnectorLoaded)
            return true;
        else
            return false;
    }

    get carMesh():THREE.Mesh {
        return this._carMesh;
    }

    get wheelMesh():THREE.Mesh {
        return this._wheelMesh;
    }

    get treeMesh():THREE.Mesh {
        return this._treeMesh;
    }

    get springMesh():THREE.Mesh {
        return this._springMesh;
    }

    get springConnectorMesh():THREE.Mesh {
        return this._springConnectorMesh;
    }


}

interface ObjectLoaderListener {
    objectsLoaded: () => void;
}