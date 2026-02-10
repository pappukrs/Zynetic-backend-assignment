import { IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { MeterTelemetryDto } from './meter-telemetry.dto';
import { VehicleTelemetryDto } from './vehicle-telemetry.dto';

export class BatchMeterTelemetryDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => MeterTelemetryDto)
  readings: MeterTelemetryDto[];
}

export class BatchVehicleTelemetryDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => VehicleTelemetryDto)
  readings: VehicleTelemetryDto[];
}
