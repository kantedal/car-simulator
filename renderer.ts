///<reference path="./threejs/three.d.ts"/>

class Renderer {
    private renderer: THREE.WebGLRenderer;
    private _scene: THREE.Scene;
    private _camera: THREE.Camera;
    private _controls : THREE.OrbitControls;

    constructor(){
        this.renderer = new THREE.WebGLRenderer({ alpha: true });

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0xFFFFFF,1);

        this._scene = new THREE.Scene();
        this._scene.fog = new THREE.Fog(0xffffff, 10, 125);
        this._camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.4, 1000);
        this._camera.removeEventListener()
        this._camera.aspect = 20;

        this._camera.position.x = 0;
        this._camera.position.y = 10;
        this._camera.lookAt(new THREE.Vector3(0,0,0));

        //this._controls = new THREE.OrbitControls(this.camera);

        var directionalLight = new THREE.DirectionalLight( 0xFFFFFF, 0.5 );
        directionalLight.position.set( 0, 1, 0 );
        this._scene.add( directionalLight );

        var container = document.getElementById( 'content' );
        container.appendChild( this.renderer.domElement );

        window.addEventListener( 'resize', this.onWindowResize, false );
    }

    animate(time){
        //this.camera.position.z = -200*Math.sin(time)-200;
    }

    render(time) {
        this.animate(time);
        this.renderer.render(this._scene,this._camera);
    }

    start() {
        this.render();
    }

    onWindowResize = () => {
        this._camera.aspect = window.innerWidth / window.innerHeight;
        this._camera.updateProjectionMatrix();
        this.renderer.setSize( window.innerWidth, window.innerHeight );
    }

    get scene():THREE.Scene {
        return this._scene;
    }

    set scene(value:THREE.Scene) {
        this._scene = value;
    }

    get camera():THREE.Camera {
        return this._camera;
    }

    set camera(value:THREE.Camera) {
        this._camera = value;
    }
}