/**
 * Created by filles-dator on 2016-03-14.
 */
///<reference path="../../renderer.ts"/>
///<reference path="../vehicle.ts"/>
var SpringConnector = (function () {
    function SpringConnector(renderer, vehicle, wheel, vehicleBody, vehiclePos, wheelPos) {
        this._renderer = renderer;
        this._connectedVehicle = vehicle;
        this._connectedVehicleBody = vehicleBody;
        this._connectedWheel = wheel;
        this._vehiclePos = vehiclePos;
        this._wheelPos = wheelPos;
        var spring_geometry;
        if (CarSimulator.developer_mode) {
            this._springArrow = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0), 5, 0xff0000);
            this._connectedWheel.object.add(this._springArrow);
            spring_geometry = new THREE.BoxGeometry(0.5, 2, 0.5);
        }
        else
            spring_geometry = new THREE.BoxGeometry(0, 0, 0);
        //spring_geometry.rotateX(Math.PI/2);
        this._springPlaceHolderMesh = new THREE.Mesh(spring_geometry, new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true }));
        this._connectedVehicle.object.add(this._springPlaceHolderMesh);
        this._springPlaceHolderMesh.position.copy(this._wheelPos).add(new THREE.Vector3(Math.sign(this._wheelPos.x) * 0.3, 0, 0));
        this._springPlaceHolderMesh.rotation.set(-Math.sign(this._wheelPos.z) * 0.2, 0, Math.sign(this._wheelPos.x) * 0.2);
    }
    SpringConnector.prototype.update = function (time, delta) {
        var vehiclePos = this._vehiclePos.clone();
        vehiclePos.applyQuaternion(this._connectedVehicleBody.object.getWorldQuaternion()).add(this._connectedVehicleBody.object.position);
        var wheelPos = this._wheelPos.clone();
        wheelPos.applyQuaternion(this._connectedVehicle.object.getWorldQuaternion());
        var totPos = vehiclePos.clone();
        var rotation_vec = totPos.clone();
        var spring_length = vehiclePos.distanceTo(wheelPos);
        if (CarSimulator.developer_mode) {
            //this._springArrow.position.copy(wheelPos);
            this._springArrow.setDirection(rotation_vec);
            this._springArrow.setLength(spring_length * 2);
        }
        if (this._springMesh)
            this._springMesh.scale.set(0.3, spring_length / 10.5 - 0.1, 0.3);
        //this._springPlaceHolderMesh.lookAt(vehiclePos);
        if (this._springTopConnector)
            this._springTopConnector.position.copy(totPos.clone().add(this._connectedVehicle.object.position));
    };
    SpringConnector.prototype.attatchSpringMesh = function (mesh, connectorMesh) {
        this._springMesh = mesh;
        this._springMesh.scale.set(0.25, 0.5, 0.25);
        this._springPlaceHolderMesh.add(this._springMesh);
        this._springMesh.translateX(-Math.sign(this._wheelPos.x) * 0.6);
        this._springTopConnector = connectorMesh.clone();
        this._springBottomConnector = connectorMesh.clone();
        //this._connectedWheel.object.add(this._springTopConnector);
        //this._springTopConnector.position.copy(this._vehiclePos);
        //this._springTopConnector.scale.set(0.6, 0.6, 0.6);
    };
    return SpringConnector;
})();
//# sourceMappingURL=spring_connector.js.map