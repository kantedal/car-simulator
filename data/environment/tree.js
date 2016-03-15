/**
 * Created by filles-dator on 2016-03-12.
 */
///<reference path="../../threejs/three.d.ts"/>
///<reference path="../../renderer.ts"/>
///<reference path="./../ground_plane.ts"/>
var Tree = (function () {
    function Tree(renderer, groundPlanes) {
        this._treeCount = 20;
        this._renderer = renderer;
        this._trees = [];
        this._groundPlanes = groundPlanes;
    }
    Tree.prototype.update = function (current_pos) {
        if (this._treeMesh) {
            for (var c = 0; c < this._treeCount; c++) {
                if (current_pos.distanceTo(this._trees[c].position) > 200) {
                    var angle = Math.random() * 2 * Math.PI;
                    var radius = Math.sqrt(Math.random()) * 200;
                    var x_val = current_pos.x + Math.cos(angle) * radius;
                    var z_val = current_pos.z + Math.sin(angle) * radius;
                    var y_val = this._groundPlanes.simplexNoise(new THREE.Vector3(x_val, 0, z_val));
                    this._trees[c].position.set(x_val, y_val, z_val);
                }
            }
        }
    };
    Tree.prototype.attachTreeMesh = function (tree) {
        this._treeMesh = tree;
        for (var c = 0; c < this._treeCount; c++) {
            var angle = Math.random() * 2 * Math.PI;
            var length = 150 + Math.sqrt(Math.random()) * 50;
            var x_val = Math.cos(angle) * length;
            var z_val = Math.sin(angle) * length;
            var y_val = this._groundPlanes.simplexNoise(new THREE.Vector3(x_val, 0, z_val));
            var newTree = this._treeMesh.clone();
            newTree.position.set(x_val, y_val, z_val);
            this._renderer.scene.add(newTree);
            this._trees.push(newTree);
        }
    };
    return Tree;
})();
//# sourceMappingURL=tree.js.map