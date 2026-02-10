import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';


@Entity('meter_telemetry_history')
@Index(['meterId', 'timestamp']) 
@Index(['timestamp']) 
export class MeterTelemetryHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  meterId: string;

  @Column({ type: 'decimal', precision: 10, scale: 4 })
  kwhConsumedAc: number;

  @Column({ type: 'decimal', precision: 6, scale: 2 })
  voltage: number;

  @Column({ type: 'timestamptz' })
  timestamp: Date;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
