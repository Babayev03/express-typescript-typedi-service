import { IBlog } from "../../interfaces/IBlog";
import { IUser } from "../../interfaces/IUser";
import { IWork } from "../../interfaces/IWork";
import { Document, Model } from "mongoose";

declare global {
  namespace Express {
    export interface Request {
      currentUser: IUser & Document;
      deviceLanguage: string;
    }
  }
  namespace Models {
    export type UserModel = Model<IUser & Document>;
    export type BlogModel = Model<IBlog & Document>;
    export type WorkModel = Model<IWork & Document>;
  }
}
