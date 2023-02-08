import { MaxLength } from "class-validator";
import { User } from "src/entity/user";
import { Location } from "src/entity/location";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity("rating")
export class Rating {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, ({ ratings }) => ratings)
  user!: User;

  @ManyToOne(() => Location, ({ ratings }) => ratings)
  location!: Location;

  @Column("jsonb")
  tags!: Record<string, number>;

  @MaxLength(2000)
  @Column("varchar")
  comment?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
