import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getTypeOrmConfig } from './config/typeorm.config';


import { MeterTelemetryHistory } from './entities/meter-telemetry-history.entity';
import { VehicleTelemetryHistory } from './entities/vehicle-telemetry-history.entity';
import { MeterStatus } from './entities/meter-status.entity';
import { VehicleStatus } from './entities/vehicle-status.entity';


import { IngestionService } from './services/ingestion.service';
import { AnalyticsService } from './services/analytics.service';


import { IngestionController } from './controllers/ingestion.controller';
import { AnalyticsController } from './controllers/analytics.controller';
import { StatusController } from './controllers/status.controller';

@Module({
  imports: [
    
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    
    
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getTypeOrmConfig,
    }),
    
    
    TypeOrmModule.forFeature([
      MeterTelemetryHistory,
      VehicleTelemetryHistory,
      MeterStatus,
      VehicleStatus,
    ]),
  ],
  controllers: [
    IngestionController,
    AnalyticsController,
    StatusController,
  ],
  providers: [
    IngestionService,
    AnalyticsService,
  ],
})
export class AppModule {}
