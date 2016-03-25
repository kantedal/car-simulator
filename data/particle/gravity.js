/**
 * Created by filles-dator on 2016-03-23.
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
///<reference path="../../threejs/three.d.ts"/>
///<reference path="./force_field.ts"/>
var Gravity = (function (_super) {
    __extends(Gravity, _super);
    function Gravity() {
        _super.call(this, new THREE.Vector3(0, -9.82, 0));
    }
    Gravity.prototype.update = function (time, delta) {
    };
    return Gravity;
})(ForceField);
//# sourceMappingURL=gravity.js.map