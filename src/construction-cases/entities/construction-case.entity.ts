import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('construction_cases')
export class ConstructionCase {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ type: 'enum', enum: ['가정용', '업소용'] })
  service_type: '가정용' | '업소용';

  @Column({ length: 100 })
  location_tag: string;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column()
  original_name: string;

  @Column()
  stored_name: string;

  @Column({ type: 'text' })
  image_url: string;

  @Column({ type: 'bigint', nullable: true })
  size: string;

  @Column({ default: 'image/webp' })
  mimetype: string;

  @Column({ default: 0 })
  sort_order: number;

  @Column({ default: true })
  is_visible: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}