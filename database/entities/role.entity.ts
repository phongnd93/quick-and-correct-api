import { UserRole } from 'database/enums';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { RolePermision } from './role-permision.entity';

@Entity()
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ enum: UserRole, type: 'enum' })
  name: UserRole;

  @Column()
  description: string;

  @OneToMany(() => RolePermision, (permision) => permision.role)
  permisions: RolePermision[];

  @Column()
  test: string;
}
