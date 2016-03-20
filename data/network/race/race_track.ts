/**
 * Created by filles-dator on 2016-03-19.
 */

///<reference path="../../../threejs/three.d.ts"/>
///<reference path="../../../renderer.ts"/>
///<reference path="./checkpoint.ts"/>

class RaceTrack {
    private _renderer: Renderer;
    private _trackPoints: THREE.Vector3[];
    private _trackPointsCount: number = 100;
    private _points: THREE.Mesh[];

    private _checkpoints: Checkpoint[];
    private _checkpointsCount: number = 10;


    constructor(renderer: Renderer){
        this._renderer = renderer;
        this._trackPoints = [];
        this._points = [];
        this._checkpoints = [];
        this.generateTrackPoints();
    }

    private generateTrackPoints(){
        for(var i=0; i<this._trackPointsCount; i++){
            var newPoint = new THREE.Vector3(0,0,0);
            newPoint.x = Math.cos(i/this._trackPointsCount*Math.PI*2)*100;
            newPoint.z = Math.sin(i/this._trackPointsCount*Math.PI*2)*100;
            newPoint.y = 10;
            this._trackPoints.push(newPoint);
        }

        for(var i=1; i<this._checkpointsCount; i++){
            this._checkpoints.push(new Checkpoint(
                this._renderer,
                this._trackPoints[i*this._checkpointsCount-1],
                this._trackPoints[i*this._checkpointsCount],
                this._trackPoints[i*this._checkpointsCount+1]
            ));
        }
    }
}
