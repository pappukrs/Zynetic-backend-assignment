import { Entity, Column, PrimaryColumn, Index } from 'typeorm';


@Entity('vehicle_status')
@Index(['lastUpdated']) 
@Index(['soc']) 
export class VehicleStatus {
  @PrimaryColumn({ type: 'varchar', length: 100 })
  vehicleId: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  soc: number; 

  @Column({ type: 'decimal', precision: 10, scale: 4 })
  kwhDeliveredDc: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  batteryTemp: number;

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

  
  @Column({ type: 'boolean', default: false })
  isCharging: boolean; 
}
