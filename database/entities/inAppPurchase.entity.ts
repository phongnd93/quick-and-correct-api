import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity()
export class InAppPurchase extends BaseEntity {
  @Column({ type: 'varchar' })
  id: string;

  @Column({ type: 'varchar' })
  userId: string;

  @Column({ type: 'varchar' })
  package: string;

  @Column({ type: 'varchar' })
  orderId: string;

  @Column({ type: 'bool', nullable: true, default: true })
  consumable: boolean;
}
