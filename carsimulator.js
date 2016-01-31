/**
 * Created by filles-dator on 2016-01-26.
*/
///<reference path="./renderer.ts"/>
///<reference path="./data/ground_plane.ts"/>
///<reference path="./data/parts/wheel.ts"/>
///<reference path="./data/physics_object3d.ts"/>
///<reference path="./data/car.ts"/>
var CarSimulator = (function () {
    function CarSimulator() {
        this._surfaceIndex = 0;
        this._renderer = new Renderer();
        this._clock = new THREE.Clock();
        this._groundPlanes = [];
    }
    CarSimulator.prototype.start = function () {
        var self = this;
        self._renderer.start();
        //self._wheel = new Wheel(self._renderer);
        self._car = new Car(self._renderer);
        var ground_plane = new GroundPlane(this._renderer);
        var groundCallback = {
            planeLoaded: function (groundPlane) {
                self._baseGroundPlane = groundPlane;
                self._groundPlanes.push(groundPlane);
                self._renderer.scene.add(self._groundPlanes[self._groundPlanes.length - 1].mesh);
                var newground_forward = groundPlane.clone();
                newground_forward.mesh.position.set(0, 0, 120);
                newground_forward.mesh.scale.set(1, 1, -1);
                newground_forward.scale(1, 1, -1);
                newground_forward.geometry.translate(0, 0, 120);
                self._groundPlanes.push(newground_forward);
                self._renderer.scene.add(self._groundPlanes[self._groundPlanes.length - 1].mesh);
                var newground_forward_left = groundPlane.clone();
                newground_forward_left.mesh.position.set(120, 0, 120);
                newground_forward_left.mesh.scale.set(-1, 1, -1);
                newground_forward_left.scale(-1, 1, -1);
                newground_forward_left.geometry.translate(120, 0, 120);
                self._groundPlanes.push(newground_forward_left);
                self._renderer.scene.add(self._groundPlanes[self._groundPlanes.length - 1].mesh);
                var newground_forward_right = groundPlane.clone();
                newground_forward_right.mesh.position.set(-120, 0, 120);
                newground_forward_right.mesh.scale.set(-1, 1, -1);
                newground_forward_right.scale(new THREE.Vector3(-1, 1, -1));
                newground_forward_right.geometry.translate(-120, 0, 120);
                self._groundPlanes.push(newground_forward_right);
                self._renderer.scene.add(self._groundPlanes[self._groundPlanes.length - 1].mesh);
                var newground_right = groundPlane.clone();
                newground_right.mesh.position.set(-120, 0, 0);
                newground_right.mesh.scale.set(-1, 1, 1);
                newground_right.geometry.scale(-1, 1, 1);
                newground_right.geometry.translate(-120, 0, 0);
                self._groundPlanes.push(newground_right);
                self._renderer.scene.add(self._groundPlanes[self._groundPlanes.length - 1].mesh);
                var newground_left = groundPlane.clone();
                newground_left.mesh.position.set(120, 0, 0);
                newground_left.mesh.scale.set(-1, 1, 1);
                newground_left.geometry.scale(new THREE.Vector3(-1, 1, 1));
                newground_left.geometry.translate(120, 0, 0);
                self._groundPlanes.push(newground_left);
                self._renderer.scene.add(self._groundPlanes[self._groundPlanes.length - 1].mesh);
                var newground_backwards = groundPlane.clone();
                newground_backwards.mesh.position.set(0, 0, -120);
                newground_backwards.mesh.scale.set(1, 1, -1);
                newground_backwards.scale(new THREE.Vector3(1, 1, -1));
                newground_backwards.geometry.translate(0, 0, -120);
                self._groundPlanes.push(newground_backwards);
                self._renderer.scene.add(self._groundPlanes[self._groundPlanes.length - 1].mesh);
                var newground_backwards_left = groundPlane.clone();
                newground_backwards_left.mesh.position.set(120, 0, -120);
                newground_backwards_left.mesh.scale.set(-1, 1, -1);
                newground_backwards_left.scale(new THREE.Vector3(-1, 1, -1));
                newground_backwards_left.geometry.translate(120, 0, -120);
                self._groundPlanes.push(newground_backwards_left);
                self._renderer.scene.add(self._groundPlanes[self._groundPlanes.length - 1].mesh);
                var newground_backwards_right = groundPlane.clone();
                newground_backwards_right.mesh.position.set(-120, 0, -120);
                newground_backwards_right.mesh.scale.set(-1, 1, -1);
                newground_backwards_right.scale(new THREE.Vector3(-1, 1, -1));
                newground_backwards_right.geometry.translate(-120, 0, -120);
                self._groundPlanes.push(newground_backwards_right);
                self._renderer.scene.add(self._groundPlanes[self._groundPlanes.length - 1].mesh);
            }
        };
        ground_plane.loadPlane(groundCallback, this._renderer);
        this.update();
    };
    CarSimulator.prototype.update = function () {
        var _this = this;
        var time = this._clock.getElapsedTime();
        var delta = this._clock.getDelta();
        var currentSurfaceIndex = this._car.connectCollisionSurface(this._groundPlanes);
        if (currentSurfaceIndex != this._surfaceIndex) {
            var xMove = this._groundPlanes[currentSurfaceIndex].mesh.position.x - this._groundPlanes[this._surfaceIndex].mesh.position.x;
            var zMove = this._groundPlanes[currentSurfaceIndex].mesh.position.z - this._groundPlanes[this._surfaceIndex].mesh.position.z;
            var surfacePos = this._groundPlanes[currentSurfaceIndex].mesh.position.clone();
            if (xMove < 0) {
                //var newground_forward_right = this._baseGroundPlane.clone();
                //newground_forward_right.mesh.position.set(surfacePos.x-120, surfacePos.y, surfacePos.z+120);
                //newground_forward_right.mesh.scale.set(-1,1,-1);
                //newground_forward_right.geometry.scale(-1,1,-1);
                //newground_forward_right.geometry.translate(surfacePos.x-120, surfacePos.y, surfacePos.z+120);
                //this._groundPlanes.push(newground_forward_right)
                //this._renderer.scene.add(this._groundPlanes[this._groundPlanes.length-1].mesh);
                var newground_right = this._baseGroundPlane.clone();
                newground_right.mesh.position.set(surfacePos.x - 120, surfacePos.y, surfacePos.z);
                newground_right.mesh.scale.set(-1, 1, 1);
                newground_right.geometry.scale(-1, 1, 1);
                newground_right.geometry.translate(surfacePos.x - 120, surfacePos.y, surfacePos.z);
                this._groundPlanes.push(newground_right);
                this._renderer.scene.add(this._groundPlanes[this._groundPlanes.length - 1].mesh);
            }
            this._surfaceIndex = currentSurfaceIndex;
        }
        this._car.update(time, delta);
        this._renderer.render(time);
        requestAnimationFrame(function () { return _this.update(); });
    };
    Object.defineProperty(CarSimulator.prototype, "renderer", {
        get: function () {
            return this._renderer;
        },
        set: function (value) {
            this._renderer = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CarSimulator.prototype, "clock", {
        get: function () {
            return this._clock;
        },
        set: function (value) {
            this._clock = value;
        },
        enumerable: true,
        configurable: true
    });
    return CarSimulator;
})();
window.onload = function () {
    var app = new CarSimulator();
    app.start();
};
//# sourceMappingURL=carsimulator.js.map