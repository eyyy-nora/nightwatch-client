import { Request } from "express";
export declare module "express" {
  import type { User } from "src/entity/user";
  import type { Request } from "express";
  export interface Request {
    session: {
      user?: User;
      oauthState?: any;
      oauthReferer?: string;
    };
    files: any;
  }
}
