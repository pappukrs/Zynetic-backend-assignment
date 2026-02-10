import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { IngestionService } from '../services/ingestion.service';
import { MeterStatusResponseDto } from '../dtos/meter-status-response.dto';
import { VehicleStatusResponseDto } from '../dtos/vehicle-status-response.dto';

@Controller('v1/status')
export class StatusController {
  constructor(private readonly ingestionService: IngestionService) { }

  @Get('meter/:meterId')
  @Get('meter/:meterId')
  async getMeterStatus(@Param('meterId') meterId: string): Promise<MeterStatusResponseDto> {
    const status = await this.ingestionService.getMeterStatus(meterId);
    if (!status) {
      throw new NotFoundException(`Meter ${meterId} not found`);
    }

    return {
      meterId: status.meterId,
      kwhConsumedAc: Number(status.kwhConsumedAc),
      voltage: Number(status.voltage),
      lastUpdated: status.lastUpdated,
    };
  }

  @Get('vehicle/:vehicleId')
  @Get('vehicle/:vehicleId')
  async getVehicleStatus(@Param('vehicleId') vehicleId: string): Promise<VehicleStatusResponseDto> {
    const status = await this.ingestionService.getVehicleStatus(vehicleId);
    if (!status) {
      throw new NotFoundException(`Vehicle ${vehicleId} not found`);
    }

    return {
      vehicleId: status.vehicleId,
      soc: Number(status.soc),
      kwhDeliveredDc: Number(status.kwhDeliveredDc),
      batteryTemp: Number(status.batteryTemp),
      isCharging: status.isCharging,
      lastUpdated: status.lastUpdated,
    };
  }
}
