import type { Geometry } from "geojson";
import { Rating } from "src/entity/rating";
import { Tag } from "src/entity/tag";
import { User } from "src/entity/user";
import {
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryColumn,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from "typeorm";

export interface Address {
  street: string;
  streetNo: string;
  city: string;
  zip?: string;
  county: string;
  country: string;
  phone?: string;
}

export type WeekDay = "mo" | "tu" | "we" | "th" | "fr" | "sa" | "su";

@Entity("location")
export class Location {
  @PrimaryGeneratedColumn("increment")
  id!: number;

  @Column({ type: "varchar" })
  sourceId!: string;

  @Column({ type: "varchar" })
  source!: string;

  @Column({ type: "geometry" })
  geometry!: Geometry;

  @Column({ type: "varchar" })
  name!: string;

  @Column({ type: "int" })
  places!: number;

  @Column({ type: "int", default: "0" })
  available!: number;

  @Column({ type: "jsonb" })
  address!: Address;

  @Column({ type: "jsonb", default: "{}" })
  openAt!: Record<WeekDay, [number, number][]>;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => Rating, ({ location }) => location)
  ratings!: Rating[];

  @ManyToMany(() => Tag, ({ locations }) => locations, { cascade: true })
  @JoinTable({
    name: "location_tags",
    joinColumn: {
      name: "location_id",
      referencedColumnName: "id",
    },
    inverseJoinColumn: {
      name: "tag_id",
      referencedColumnName: "id",
    },
  })
  tags!: Tag[];

  @OneToMany(() => User, ({ location }) => location)
  checkedIn!: User[];
}
