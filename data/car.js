/**
 * Created by filles-dator on 2016-02-08.
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
///<reference path="./vehiclesetup.ts"/>
///<reference path="./vehicle.ts"/>
///<reference path="./relative_dynamic_body.ts"/>
var Car = (function (_super) {
    __extends(Car, _super);
    function Car(renderer, vehicle) {
        _super.call(this, renderer, vehicle);
        this.steering = new Steering(0);
        this.motor = new Motor(20000, 100);
        this.wheels = [
            new Wheel(renderer, new THREE.Vector3(-3, -1, -4)),
            new Wheel(renderer, new THREE.Vector3(3, -1, -4)),
            new Wheel(renderer, new THREE.Vector3(-3, -1, 4)),
            new Wheel(renderer, new THREE.Vector3(3, -1, 4))
        ];
        vehicle.vehicleModel.object.add(this.wheels[0].object);
        this.wheels[0].connectVehicle(vehicle);
        this.wheels[0].connectSteering(this.steering);
        vehicle.vehicleModel.addCollisionPoint(this.wheels[0].object.position);
        vehicle.vehicleModel.object.add(this.wheels[1].object);
        this.wheels[1].connectVehicle(vehicle);
        this.wheels[1].connectSteering(this.steering);
        vehicle.vehicleModel.addCollisionPoint(this.wheels[1].object.position);
        vehicle.vehicleModel.object.add(this.wheels[2].object);
        this.wheels[2].connectVehicle(vehicle);
        this.wheels[2].connectMotor(this.motor);
        vehicle.vehicleModel.addCollisionPoint(this.wheels[2].object.position);
        vehicle.vehicleModel.object.add(this.wheels[3].object);
        this.wheels[3].connectVehicle(vehicle);
        this.wheels[3].connectMotor(this.motor);
        vehicle.vehicleModel.addCollisionPoint(this.wheels[3].object.position);
        this.vehicleBody = new RelativeDynamicBody(new THREE.BoxGeometry(5, 2, 8), new THREE.MeshBasicMaterial({ color: 0xff00ff, wireframe: true }), renderer, this.vehicle);
        vehicle.vehicleModel.object.add(this.vehicleBody.object);
        //this.springs = [
        //    new Spring(renderer, this.vehicle, 0)
        //];
    }
    return Car;
})(VehicleSetup);
//# sourceMappingURL=car.js.map