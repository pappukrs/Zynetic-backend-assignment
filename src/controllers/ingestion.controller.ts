import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { IngestionService } from '../services/ingestion.service';
import { MeterTelemetryDto } from '../dtos/meter-telemetry.dto';
import { VehicleTelemetryDto } from '../dtos/vehicle-telemetry.dto';
import {
  BatchMeterTelemetryDto,
  BatchVehicleTelemetryDto,
} from '../dtos/batch-telemetry.dto';

@Controller('v1/ingest')
export class IngestionController {
  constructor(private readonly ingestionService: IngestionService) { }

  @Post('meter')
  @HttpCode(HttpStatus.CREATED)
  async ingestMeter(@Body() dto: MeterTelemetryDto): Promise<{ success: boolean }> {
    await this.ingestionService.ingestMeterTelemetry(dto);
    return { success: true };
  }

  @Post('vehicle')
  @HttpCode(HttpStatus.CREATED)
  async ingestVehicle(@Body() dto: VehicleTelemetryDto): Promise<{ success: boolean }> {
    await this.ingestionService.ingestVehicleTelemetry(dto);
    return { success: true };
  }

  @Post('meter/batch')
  @HttpCode(HttpStatus.CREATED)
  async ingestMeterBatch(@Body() dto: BatchMeterTelemetryDto): Promise<{ success: boolean; count: number }> {
    await this.ingestionService.ingestMeterBatch(dto.readings);
    return { success: true, count: dto.readings.length };
  }

  @Post('vehicle/batch')
  @HttpCode(HttpStatus.CREATED)
  async ingestVehicleBatch(@Body() dto: BatchVehicleTelemetryDto): Promise<{ success: boolean; count: number }> {
    await this.ingestionService.ingestVehicleBatch(dto.readings);
    return { success: true, count: dto.readings.length };
  }
}
