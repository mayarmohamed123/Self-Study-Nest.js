import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CURRENT_TIMESTAMP } from '../utils/constants.js';
import type { Product } from '../products/product.entity.js';
import type { User } from '../users/user.entity.js';

@Entity({ name: 'reviews' })
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  rating: number;

  @Column({ type: 'text' })
  comment: string;

  @CreateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => CURRENT_TIMESTAMP,
    onUpdate: CURRENT_TIMESTAMP,
  })
  updatedAt: Date;

  @ManyToOne('Product', (product: Product) => product.reviews, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  product: Product;

  @Column({ nullable: false })
  productId: number;

  @ManyToOne('User', (user: User) => user.reviews, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  user?: User;

  @Column({ nullable: true })
  userId?: number;
}
