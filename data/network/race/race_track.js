/**
 * Created by filles-dator on 2016-03-19.
 */
///<reference path="../../../threejs/three.d.ts"/>
///<reference path="../../../renderer.ts"/>
///<reference path="./checkpoint.ts"/>
var RaceTrack = (function () {
    function RaceTrack(renderer) {
        this._trackPointsCount = 100;
        this._checkpointsCount = 10;
        this._renderer = renderer;
        this._trackPoints = [];
        this._points = [];
        this._checkpoints = [];
        this.generateTrackPoints();
    }
    RaceTrack.prototype.generateTrackPoints = function () {
        for (var i = 0; i < this._trackPointsCount; i++) {
            var newPoint = new THREE.Vector3(0, 0, 0);
            newPoint.x = Math.cos(i / this._trackPointsCount * Math.PI * 2) * 100;
            newPoint.z = Math.sin(i / this._trackPointsCount * Math.PI * 2) * 100;
            newPoint.y = 10;
            this._trackPoints.push(newPoint);
        }
        for (var i = 1; i < this._checkpointsCount; i++) {
            this._checkpoints.push(new Checkpoint(this._renderer, this._trackPoints[i * this._checkpointsCount - 1], this._trackPoints[i * this._checkpointsCount], this._trackPoints[i * this._checkpointsCount + 1]));
        }
    };
    return RaceTrack;
}());
