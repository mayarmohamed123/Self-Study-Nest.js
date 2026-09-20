import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { CURRENT_TIMESTAMP } from '../utils/constants.js';
import { User } from '../users/user.entity.js';

@Entity({ name: 'products' })
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 150 })
  title: string;

  @Column()
  description: string;

  @Column({
    type: 'float',
  })
  price: number;

  @CreateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => CURRENT_TIMESTAMP,
    onUpdate: CURRENT_TIMESTAMP,
  })
  updatedAt: Date;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @OneToMany('Review', 'product', {
    cascade: true,
  })
  reviews: Relation<any[]>;

  @ManyToOne(() => User, (user) => user.products, {
    onDelete: 'CASCADE',
  })
  user: Relation<User>;
}

