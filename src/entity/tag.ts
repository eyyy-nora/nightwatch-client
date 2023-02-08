import { Location } from "src/entity/location";
import { Column, CreateDateColumn, Entity, ManyToMany, PrimaryColumn, UpdateDateColumn } from "typeorm";

@Entity("tag")
export class Tag {
  @PrimaryColumn()
  id!: string;

  @Column("varchar")
  name!: string;

  @Column("boolean", { default: false })
  adminOnly!: boolean;

  @Column("varchar")
  icon!: string;

  @ManyToMany(() => Location, ({ tags }) => tags)
  locations!: Location[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
