
export class VehicleStatusResponseDto {
    vehicleId: string;

    soc: number;

    kwhDeliveredDc: number;

    batteryTemp: number;

    isCharging: boolean;

    lastUpdated: Date;
}
