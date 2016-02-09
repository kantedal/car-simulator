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
var Car = (function (_super) {
    __extends(Car, _super);
    function Car(renderer, vehicle) {
        _super.call(this, renderer, vehicle);
        this.wheels = [
            new Wheel(renderer, this.vehicle, new THREE.Vector3(5, 0, 0)),
            new Wheel(renderer, this.vehicle, new THREE.Vector3(-5, 0, 0))
        ];
        this.springs = [
            new Spring(renderer, this.vehicle, Math.PI / 9),
            new Spring(renderer, this.vehicle, -Math.PI / 9)
        ];
        this.motor = new Motor(20000, 100);
        this.steering = new Steering(Math.PI / 2);
        this.setupWheels();
    }
    Car.prototype.setupWheels = function () {
        this.wheels[0].object.position.set(-5, 0, 0);
        this.wheels[0].connectSpring(this.springs[0]);
        this.wheels[0].connectMotor(this.motor);
        this.wheels[0].connectSteering(this.steering);
        this.wheels[1].object.position.set(5, 0, 0);
        this.wheels[1].connectSpring(this.springs[1]);
        this.wheels[1].connectMotor(this.motor);
        this.wheels[1].connectSteering(this.steering);
    };
    return Car;
})(VehicleSetup);
//# sourceMappingURL=car.js.map