/**
 * Created by filles-dator on 2016-02-03.
 */
///<reference path="../../renderer.ts"/>
var Spring = (function () {
    function Spring(renderer) {
        this._renderer = renderer;
        this._springGroup = new THREE.Group();
        this._wheelConnectorMesh = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 32), new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true }));
        this._springGroup.add(this._wheelConnectorMesh);
        this.loadSpringModel();
    }
    Spring.prototype.loadSpringModel = function () {
        var self = this;
        var loader = new THREE.OBJLoader();
        loader.load('./models/spring.obj', function (object) {
            console.log("sucess");
            var material1 = new THREE.MeshBasicMaterial({ color: 0x999999, wireframe: true });
            self._springMesh = object.clone();
            //self._springMesh.position.set(self._wheelConnectorMesh.position.x, self._wheelConnectorMesh.position.y, self._wheelConnectorMesh.position.z);
            self._springGroup.add(self._springMesh);
        }, function (xhr) {
            console.log('An error happened');
        });
    };
    Spring.prototype.update = function (time, delta) {
    };
    Object.defineProperty(Spring.prototype, "position", {
        get: function () {
            return this._position;
        },
        set: function (value) {
            this._position = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Spring.prototype, "springObject", {
        get: function () {
            return this._springGroup;
        },
        enumerable: true,
        configurable: true
    });
    return Spring;
})();
//# sourceMappingURL=spring.js.map