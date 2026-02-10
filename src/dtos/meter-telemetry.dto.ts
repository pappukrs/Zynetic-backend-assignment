import { IsString, IsNumber, IsDateString, Min, Max } from 'class-validator';

export class MeterTelemetryDto {
  @IsString()
  meterId: string;

  @IsNumber()
  @Min(0)
  kwhConsumedAc: number;

  @IsNumber()
  @Min(0)
  @Max(500)
  voltage: number;

  @IsDateString()
  timestamp: string;
}
