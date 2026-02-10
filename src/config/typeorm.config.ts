import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { MeterTelemetryHistory } from '../entities/meter-telemetry-history.entity';
import { VehicleTelemetryHistory } from '../entities/vehicle-telemetry-history.entity';
import { MeterStatus } from '../entities/meter-status.entity';
import { VehicleStatus } from '../entities/vehicle-status.entity';

export const getTypeOrmConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get<string>('DB_HOST', 'localhost'),
  port: configService.get<number>('DB_PORT', 5432),
  username: configService.get<string>('DB_USERNAME', 'energyuser'),
  password: configService.get<string>('DB_PASSWORD', 'energypass'),
  database: configService.get<string>('DB_DATABASE', 'energy_ingestion'),
  ssl: configService.get<string>('NODE_ENV') === 'production'
    ? { rejectUnauthorized: false }
    : false,
  entities: [
    MeterTelemetryHistory,
    VehicleTelemetryHistory,
    MeterStatus,
    VehicleStatus,
  ],
  synchronize: true,
  logging: configService.get<string>('NODE_ENV') === 'development',


  extra: {
    max: configService.get<number>('DB_POOL_SIZE', 20),
    connectionTimeoutMillis: configService.get<number>('DB_CONNECTION_TIMEOUT', 30000),
    idleTimeoutMillis: 30000,
    statement_timeout: 60000,
  },


  cache: {
    duration: 30000,
    type: 'database',
  },
});
