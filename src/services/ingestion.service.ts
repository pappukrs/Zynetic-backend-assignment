import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { MeterTelemetryHistory } from '../entities/meter-telemetry-history.entity';
import { VehicleTelemetryHistory } from '../entities/vehicle-telemetry-history.entity';
import { MeterStatus } from '../entities/meter-status.entity';
import { VehicleStatus } from '../entities/vehicle-status.entity';
import { MeterTelemetryDto } from '../dtos/meter-telemetry.dto';
import { VehicleTelemetryDto } from '../dtos/vehicle-telemetry.dto';

@Injectable()
export class IngestionService {
  private readonly logger = new Logger(IngestionService.name);

  constructor(
    @InjectRepository(MeterTelemetryHistory)
    private meterHistoryRepo: Repository<MeterTelemetryHistory>,
    @InjectRepository(VehicleTelemetryHistory)
    private vehicleHistoryRepo: Repository<VehicleTelemetryHistory>,
    @InjectRepository(MeterStatus)
    private meterStatusRepo: Repository<MeterStatus>,
    @InjectRepository(VehicleStatus)
    private vehicleStatusRepo: Repository<VehicleStatus>,
    private dataSource: DataSource,
  ) { }

  
  async ingestMeterTelemetry(dto: MeterTelemetryDto): Promise<void> {
    const startTime = Date.now();

    try {
      await this.dataSource.transaction(async (manager) => {
        
        await manager.insert(MeterTelemetryHistory, {
          meterId: dto.meterId,
          kwhConsumedAc: dto.kwhConsumedAc,
          voltage: dto.voltage,
          timestamp: new Date(dto.timestamp),
        });

        
        
        await manager
          .createQueryBuilder()
          .insert()
          .into(MeterStatus)
          .values({
            meterId: dto.meterId,
            kwhConsumedAc: dto.kwhConsumedAc,
            voltage: dto.voltage,
            lastUpdated: new Date(dto.timestamp),
          })
          .orUpdate(
            ['kwhConsumedAc', 'voltage', 'lastUpdated', 'updatedAt'],
            ['meterId'],
          )
          .execute();
      });

      const duration = Date.now() - startTime;
      this.logger.debug(
        `Ingested meter ${dto.meterId} telemetry in ${duration}ms`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to ingest meter telemetry for ${dto.meterId}: ${error.message}`,
      );
      throw error;
    }
  }

  
  async ingestVehicleTelemetry(dto: VehicleTelemetryDto): Promise<void> {
    const startTime = Date.now();

    try {
      await this.dataSource.transaction(async (manager) => {
        
        await manager.insert(VehicleTelemetryHistory, {
          vehicleId: dto.vehicleId,
          soc: dto.soc,
          kwhDeliveredDc: dto.kwhDeliveredDc,
          batteryTemp: dto.batteryTemp,
          timestamp: new Date(dto.timestamp),
        });

        
        
        const isCharging = dto.soc > 20; 

        
        await manager
          .createQueryBuilder()
          .insert()
          .into(VehicleStatus)
          .values({
            vehicleId: dto.vehicleId,
            soc: dto.soc,
            kwhDeliveredDc: dto.kwhDeliveredDc,
            batteryTemp: dto.batteryTemp,
            lastUpdated: new Date(dto.timestamp),
            isCharging,
          })
          .orUpdate(
            [
              'soc',
              'kwhDeliveredDc',
              'batteryTemp',
              'lastUpdated',
              'isCharging',
              'updatedAt',
            ],
            ['vehicleId'],
          )
          .execute();
      });

      const duration = Date.now() - startTime;
      this.logger.debug(
        `Ingested vehicle ${dto.vehicleId} telemetry in ${duration}ms`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to ingest vehicle telemetry for ${dto.vehicleId}: ${error.message}`,
      );
      throw error;
    }
  }

  
  async ingestMeterBatch(readings: MeterTelemetryDto[]): Promise<void> {
    const startTime = Date.now();

    try {
      await this.dataSource.transaction(async (manager) => {
        
        const historyEntries = readings.map((dto) => ({
          meterId: dto.meterId,
          kwhConsumedAc: dto.kwhConsumedAc,
          voltage: dto.voltage,
          timestamp: new Date(dto.timestamp),
        }));
        await manager.insert(MeterTelemetryHistory, historyEntries);

        
        for (const dto of readings) {
          await manager
            .createQueryBuilder()
            .insert()
            .into(MeterStatus)
            .values({
              meterId: dto.meterId,
              kwhConsumedAc: dto.kwhConsumedAc,
              voltage: dto.voltage,
              lastUpdated: new Date(dto.timestamp),
            })
            .orUpdate(
              ['kwhConsumedAc', 'voltage', 'lastUpdated', 'updatedAt'],
              ['meterId'],
            )
            .execute();
        }
      });

      const duration = Date.now() - startTime;
      this.logger.log(
        `Batch ingested ${readings.length} meter readings in ${duration}ms`,
      );
    } catch (error) {
      this.logger.error(`Failed to batch ingest meter readings: ${error.message}`);
      throw error;
    }
  }

  async ingestVehicleBatch(readings: VehicleTelemetryDto[]): Promise<void> {
    const startTime = Date.now();

    try {
      await this.dataSource.transaction(async (manager) => {
        
        const historyEntries = readings.map((dto) => ({
          vehicleId: dto.vehicleId,
          soc: dto.soc,
          kwhDeliveredDc: dto.kwhDeliveredDc,
          batteryTemp: dto.batteryTemp,
          timestamp: new Date(dto.timestamp),
        }));
        await manager.insert(VehicleTelemetryHistory, historyEntries);

        
        for (const dto of readings) {
          const isCharging = dto.soc > 20; 

          await manager
            .createQueryBuilder()
            .insert()
            .into(VehicleStatus)
            .values({
              vehicleId: dto.vehicleId,
              soc: dto.soc,
              kwhDeliveredDc: dto.kwhDeliveredDc,
              batteryTemp: dto.batteryTemp,
              lastUpdated: new Date(dto.timestamp),
              isCharging,
            })
            .orUpdate(
              [
                'soc',
                'kwhDeliveredDc',
                'batteryTemp',
                'lastUpdated',
                'isCharging',
                'updatedAt',
              ],
              ['vehicleId'],
            )
            .execute();
        }
      });

      const duration = Date.now() - startTime;
      this.logger.log(
        `Batch ingested ${readings.length} vehicle readings in ${duration}ms`,
      );
    } catch (error) {
      this.logger.error(`Failed to batch ingest vehicle readings: ${error.message}`);
      throw error;
    }
  }

  
  async getMeterStatus(meterId: string): Promise<MeterStatus | null> {
    return this.meterStatusRepo.findOne({ where: { meterId } });
  }

  async getVehicleStatus(vehicleId: string): Promise<VehicleStatus | null> {
    return this.vehicleStatusRepo.findOne({ where: { vehicleId } });
  }
}
