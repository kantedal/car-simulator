/**
 * Created by filles-dator on 2016-02-03.
 */
///<reference path="../../renderer.ts"/>
var Spring = (function () {
    function Spring(renderer) {
        this._renderer = renderer;
        this._position = new THREE.Vector3(0, 0, 0);
    }
    Spring.loadSpringModel = function (loadedListener) {
        var self = this;
        var loader = new THREE.OBJLoader();
        loader.load('./models/spring.obj', function (object) {
            console.log("sucess");
            var material1 = new THREE.MeshBasicMaterial({ color: 0x999999, wireframe: true });
            self._object = object.clone();
            self._renderer.scene.add(self._object);
        }, function (xhr) {
            console.log('An error happened');
        });
    };
    Spring.prototype.update = function (time, delta) {
        if (this._object) {
        }
    };
    Object.defineProperty(Spring.prototype, "object", {
        get: function () {
            return this._object;
        },
        set: function (value) {
            this._object = value;
        },
        enumerable: true,
        configurable: true
    });
    return Spring;
})();
//# sourceMappingURL=spring.js.map