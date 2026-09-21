import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { CURRENT_TIMESTAMP } from '../utils/constants.js';
import type { Review } from '../reviews/review.entity.js';
import { Product } from '../products/product.entity.js';
import { UserType } from '../utils/enums.js';

import { Exclude } from 'class-transformer';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'varchar', length: 150, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  @Exclude()
  password: string;

  @Column({ type: 'enum', enum: UserType, default: UserType.NORMAL_USER })
  userType: UserType;


  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ type: 'varchar', nullable: true, default: null })
  verificationToken: string | null;

  @Column({ type: 'varchar', nullable: true, default: null })
  profileImg: string | null;

  @CreateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => CURRENT_TIMESTAMP,
    onUpdate: CURRENT_TIMESTAMP,
  })
  updatedAt: Date;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @OneToMany('Review', 'user', {
    cascade: true,
  })
  reviews: Relation<any[]>;

  @OneToMany(() => Product, (product) => product.user, {
    cascade: true,
  })
  products: Relation<Product[]>;
}
