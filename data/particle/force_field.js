/**
 * Created by filles-dator on 2016-03-23.
 */
///<reference path="../../threejs/three.d.ts"/>
var ForceField = (function () {
    function ForceField(startForce) {
        this._currentForce = startForce;
    }
    Object.defineProperty(ForceField.prototype, "currentForce", {
        get: function () {
            return this._currentForce;
        },
        enumerable: true,
        configurable: true
    });
    return ForceField;
})();
//# sourceMappingURL=force_field.js.map