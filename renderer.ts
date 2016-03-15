///<reference path="./threejs/three.d.ts"/>

class Renderer {
    private renderer: THREE.WebGLRenderer;
    private _scene: THREE.Scene;
    private _camera: THREE.Camera;
    private _light: THREE.DirectionalLight;

    constructor(){
        this.renderer = new THREE.WebGLRenderer({ alpha: true });
        this.renderer.shadowMap.enabled = true;

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x000000,0);
        this.renderer.sortObjects = true;

        this._scene = new THREE.Scene();
        this._scene.fog = new THREE.Fog(0xffffff, 1, 165);
        this._camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.4, 1000);
        this._camera.removeEventListener()
        this._camera.aspect = 20;

        this._camera.position.x = 0;
        this._camera.position.y = 10;
        this._camera.lookAt(new THREE.Vector3(0,0,0));

        this._light = new THREE.DirectionalLight( 0xffeeee, 0.85 );
        this._light.castShadow = true;
        this._light.shadowDarkness = 1.0;
        this._light.position.set( 1, 0.3, 0 );
        this._scene.add( this._light );

        //this._controls = new THREE.OrbitControls(this.camera);

        var geometry = new THREE.SphereGeometry(3000, 60, 40);
        var uniforms = {
            texture: { type: 't', value: new THREE.TextureLoader().load( "texture/grass.png" )) }
        };

        var material = new THREE.ShaderMaterial( {
            uniforms:       uniforms,
            vertexShader:   document.getElementById('sky-vertex').textContent,
            fragmentShader: document.getElementById('sky-fragment').textContent
        });

        var skyBox = new THREE.Mesh(geometry, material);
        skyBox.scale.set(-1, 1, 1);
        skyBox.eulerOrder = 'XZY';
        skyBox.renderDepth = 1000.0;
        this._scene.add(skyBox);

        var container = document.getElementById( 'content' );
        container.appendChild( this.renderer.domElement );

        window.addEventListener( 'resize', this.onWindowResize, false );
    }

    render() {
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