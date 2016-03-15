///<reference path="./threejs/three.d.ts"/>
var Renderer = (function () {
    function Renderer() {
        var _this = this;
        this.onWindowResize = function () {
            _this._camera.aspect = window.innerWidth / window.innerHeight;
            _this._camera.updateProjectionMatrix();
            _this.renderer.setSize(window.innerWidth, window.innerHeight);
        };
        this.renderer = new THREE.WebGLRenderer({ alpha: true });
        this.renderer.shadowMap.enabled = true;
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.sortObjects = true;
        this._scene = new THREE.Scene();
        this._scene.fog = new THREE.Fog(0xffffff, 1, 165);
        this._camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.4, 1000);
        this._camera.removeEventListener();
        this._camera.aspect = 20;
        this._camera.position.x = 0;
        this._camera.position.y = 10;
        this._camera.lookAt(new THREE.Vector3(0, 0, 0));
        this._light = new THREE.DirectionalLight(0xffeeee, 0.85);
        this._light.castShadow = true;
        this._light.shadowDarkness = 1.0;
        this._light.position.set(1, 0.3, 0);
        this._scene.add(this._light);
        //this._controls = new THREE.OrbitControls(this.camera);
        var geometry = new THREE.SphereGeometry(3000, 60, 40);
        var uniforms = {
            texture: { type: 't', value: new THREE.TextureLoader().load("texture/grass.png") }
        };
        var material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: document.getElementById('sky-vertex').textContent,
            fragmentShader: document.getElementById('sky-fragment').textContent
        });
        var skyBox = new THREE.Mesh(geometry, material);
        skyBox.scale.set(-1, 1, 1);
        skyBox.eulerOrder = 'XZY';
        skyBox.renderDepth = 1000.0;
        this._scene.add(skyBox);
        var container = document.getElementById('content');
        container.appendChild(this.renderer.domElement);
        window.addEventListener('resize', this.onWindowResize, false);
    }
    Renderer.prototype.render = function () {
        this.renderer.render(this._scene, this._camera);
    };
    Renderer.prototype.start = function () {
        this.render();
    };
    Object.defineProperty(Renderer.prototype, "scene", {
        get: function () {
            return this._scene;
        },
        set: function (value) {
            this._scene = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Renderer.prototype, "camera", {
        get: function () {
            return this._camera;
        },
        set: function (value) {
            this._camera = value;
        },
        enumerable: true,
        configurable: true
    });
    return Renderer;
})();
//# sourceMappingURL=renderer.js.map