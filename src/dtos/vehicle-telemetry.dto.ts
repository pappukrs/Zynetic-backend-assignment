import { IsString, IsNumber, IsDateString, Min, Max } from 'class-validator';

export class VehicleTelemetryDto {
  @IsString()
  vehicleId: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  soc: number;

  @IsNumber()
  @Min(0)
  kwhDeliveredDc: number;

  @IsNumber()
  @Min(-40)
  @Max(80)
  batteryTemp: number;

  @IsDateString()
  timestamp: string;
}
