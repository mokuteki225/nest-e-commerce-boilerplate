import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Order } from '../order/order.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  vendorCode: string;

  @Column()
  weight: string;

  @Column()
  price: string;

  @Column()
  photo: string;

  @Column()
  description: string;

  @Column()
  size: string;

  @ManyToMany(() => Order, (order: Order) => order.products)
  orders: Order[];
}