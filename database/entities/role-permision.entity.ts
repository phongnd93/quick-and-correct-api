import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Permision } from './permistion.entity';
import { Role } from './role.entity';

@Entity()
export class RolePermision {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Permision, (permision) => permision.roles)
  @JoinColumn({ name: 'permision', referencedColumnName: 'id' })
  permision: Permision;

  @ManyToOne(() => Role, (role) => role.permisions)
  @JoinColumn({ name: 'role', referencedColumnName: 'id' })
  role: Role;
}
