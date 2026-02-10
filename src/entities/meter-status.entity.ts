import { Entity, Column, PrimaryColumn, Index } from 'typeorm';


@Entity('meter_status')
@Index(['lastUpdated']) 
export class MeterStatus {
  @PrimaryColumn({ type: 'varchar', length: 100 })
  meterId: string;

  @Column({ type: 'decimal', precision: 10, scale: 4 })
  kwhConsumedAc: number;

  @Column({ type: 'decimal', precision: 6, scale: 2 })
  voltage: number;

  @Column({ type: 'timestamptz' })
  lastUpdated: Date;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ 
    type: 'timestamptz', 
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP'
  })
  updatedAt: Date;
}
