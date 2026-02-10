import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';


@Entity('vehicle_telemetry_history')
@Index(['vehicleId', 'timestamp']) 
@Index(['timestamp']) 
export class VehicleTelemetryHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  vehicleId: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  soc: number; 

  @Column({ type: 'decimal', precision: 10, scale: 4 })
  kwhDeliveredDc: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  batteryTemp: number;

  @Column({ type: 'timestamptz' })
  timestamp: Date;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
