import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { AnalyticsService, PerformanceAnalytics } from '../services/analytics.service';

@Controller('v1/analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) { }

  @Get('performance/:vehicleId')
  async getPerformance(
    @Param('vehicleId') vehicleId: string,
    @Query('hours', new DefaultValuePipe(24), ParseIntPipe) hours: number,
  ): Promise<PerformanceAnalytics> {
    return this.analyticsService.getVehiclePerformance(vehicleId, hours);
  }

  @Get('fleet/inefficient')
  async getInefficientVehicles(
    @Query('threshold', new DefaultValuePipe(0.85)) threshold: number,
    @Query('hours', new DefaultValuePipe(24), ParseIntPipe) hours: number,
  ): Promise<{ vehicles: string[]; threshold: number; period: string }> {
    const vehicles = await this.analyticsService.getVehiclesWithLowEfficiency(
      threshold,
      hours,
    );
    return {
      vehicles,
      threshold,
      period: `${hours}h`,
    };
  }
}
