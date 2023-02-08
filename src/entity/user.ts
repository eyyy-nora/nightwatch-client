import { Exclude } from "class-transformer";
import { Rating } from "src/entity/rating";
import type { OAuthTokenData } from "src/service/services/oauth-service";
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Location } from "src/entity/location";

@Entity("user")
export class User {
  @PrimaryGeneratedColumn("uuid")
  uuid!: string;

  @Column("varchar")
  name!: string;

  @Column("varchar")
  email!: string;

  @Column("boolean", { default: false })
  admin!: boolean;

  @Exclude()
  @Column("varchar", { nullable: true })
  hash!: string;

  @Exclude()
  @Column("jsonb", { nullable: true })
  oauthData?: OAuthTokenData;

  @Exclude()
  @Column("jsonb", { nullable: true })
  oauthUser?: unknown;

  @Exclude()
  @Column("varchar", { nullable: true })
  oauthSource?: string;

  @Column("varchar", { nullable: true })
  picture?: string;

  @OneToMany(() => Rating, ({ user }) => user)
  ratings!: Rating[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => Location, ({ checkedIn }) => checkedIn, { nullable: true })
  location?: Location;
}
