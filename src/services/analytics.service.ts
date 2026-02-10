import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MeterTelemetryHistory } from '../entities/meter-telemetry-history.entity';
import { VehicleTelemetryHistory } from '../entities/vehicle-telemetry-history.entity';

export interface PerformanceAnalytics {
  vehicleId: string;
  period: string;
  totalEnergyConsumedAc: number;
  totalEnergyDeliveredDc: number;
  efficiencyRatio: number;
  efficiencyPercentage: number;
  averageBatteryTemp: number;
  dataPoints: number;
  powerLoss: number;
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
}

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);
  private readonly EFFICIENCY_WARNING_THRESHOLD = 0.85; 
  private readonly EFFICIENCY_CRITICAL_THRESHOLD = 0.75; 

  constructor(
    @InjectRepository(MeterTelemetryHistory)
    private meterHistoryRepo: Repository<MeterTelemetryHistory>,
    @InjectRepository(VehicleTelemetryHistory)
    private vehicleHistoryRepo: Repository<VehicleTelemetryHistory>,
  ) {}

  
  async getVehiclePerformance(
    vehicleId: string,
    hours: number = 24,
  ): Promise<PerformanceAnalytics> {
    const startTime = Date.now();
    const timeWindow = new Date(Date.now() - hours * 60 * 60 * 1000);

    try {
      
      const vehicleData = await this.vehicleHistoryRepo
        .createQueryBuilder('vt')
        .select('SUM(vt.kwhDeliveredDc)', 'totalDc')
        .addSelect('AVG(vt.batteryTemp)', 'avgTemp')
        .addSelect('COUNT(*)', 'count')
        .where('vt.vehicleId = :vehicleId', { vehicleId })
        .andWhere('vt.timestamp >= :timeWindow', { timeWindow })
        .getRawOne();

      if (!vehicleData || vehicleData.count === '0') {
        throw new NotFoundException(
          `No telemetry data found for vehicle ${vehicleId} in the last ${hours} hours`,
        );
      }

      
      
      const meterId = vehicleId.replace('VEH', 'METER'); 

      const meterData = await this.meterHistoryRepo
        .createQueryBuilder('mt')
        .select('SUM(mt.kwhConsumedAc)', 'totalAc')
        .addSelect('COUNT(*)', 'count')
        .where('mt.meterId = :meterId', { meterId })
        .andWhere('mt.timestamp >= :timeWindow', { timeWindow })
        .getRawOne();

      
      const totalDc = parseFloat(vehicleData.totalDc) || 0;
      const totalAc = parseFloat(meterData?.totalAc) || 0;
      const avgTemp = parseFloat(vehicleData.avgTemp) || 0;
      const dataPoints = parseInt(vehicleData.count) || 0;

      
      
      const efficiencyRatio = totalAc > 0 ? totalDc / totalAc : 0;
      const efficiencyPercentage = efficiencyRatio * 100;
      const powerLoss = totalAc - totalDc;

      
      let status: 'HEALTHY' | 'WARNING' | 'CRITICAL' = 'HEALTHY';
      if (efficiencyRatio < this.EFFICIENCY_CRITICAL_THRESHOLD) {
        status = 'CRITICAL';
      } else if (efficiencyRatio < this.EFFICIENCY_WARNING_THRESHOLD) {
        status = 'WARNING';
      }

      const duration = Date.now() - startTime;
      this.logger.log(
        `Analytics for ${vehicleId} computed in ${duration}ms (${dataPoints} data points)`,
      );

      return {
        vehicleId,
        period: `${hours}h`,
        totalEnergyConsumedAc: parseFloat(totalAc.toFixed(4)),
        totalEnergyDeliveredDc: parseFloat(totalDc.toFixed(4)),
        efficiencyRatio: parseFloat(efficiencyRatio.toFixed(4)),
        efficiencyPercentage: parseFloat(efficiencyPercentage.toFixed(2)),
        averageBatteryTemp: parseFloat(avgTemp.toFixed(2)),
        dataPoints,
        powerLoss: parseFloat(powerLoss.toFixed(4)),
        status,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to compute analytics for ${vehicleId}: ${error.message}`,
      );
      throw error;
    }
  }

  
  async getFleetPerformance(
    vehicleIds: string[],
    hours: number = 24,
  ): Promise<PerformanceAnalytics[]> {
    const results = await Promise.all(
      vehicleIds.map((id) =>
        this.getVehiclePerformance(id, hours).catch((err) => {
          this.logger.warn(`Failed to get analytics for ${id}: ${err.message}`);
          return null;
        }),
      ),
    );

    return results.filter((r) => r !== null) as PerformanceAnalytics[];
  }

  
  async getVehiclesWithLowEfficiency(
    threshold: number = 0.85,
    hours: number = 24,
  ): Promise<string[]> {
    const timeWindow = new Date(Date.now() - hours * 60 * 60 * 1000);

    const vehiclesWithData = await this.vehicleHistoryRepo
      .createQueryBuilder('vt')
      .select('DISTINCT vt.vehicleId', 'vehicleId')
      .where('vt.timestamp >= :timeWindow', { timeWindow })
      .getRawMany();

    const inefficientVehicles: string[] = [];

    for (const { vehicleId } of vehiclesWithData) {
      try {
        const analytics = await this.getVehiclePerformance(vehicleId, hours);
        if (analytics.efficiencyRatio < threshold) {
          inefficientVehicles.push(vehicleId);
        }
      } catch (error) {
        
        continue;
      }
    }

    return inefficientVehicles;
  }
}
