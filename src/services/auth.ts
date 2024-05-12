import { Inject, Service } from "typedi";
import { IUser } from "../interfaces/IUser";
import { errorStrings } from "../utils/errorStrings";
import mongoose, { Models } from "mongoose";
import jwt from "jsonwebtoken";
import { sendMail } from "../utils/sendMail";
import fs from "fs";

@Service()
export default class AuthService {
  constructor(@Inject("userModel") private userModel: Models.UserModel) {}

  public async SignInUser(
    email: string,
    password: string
  ): Promise<{ token: string; user: IUser } | { message: string }> {
    try {
      const user = await this.userModel.findOne({
        email: email,
      });

      if (!user) {
        return Promise.reject({
          status: 400,
          message: errorStrings.userNotFound,
        });
      }

      if (!user.confirmed) {
        return Promise.reject({
          status: 403,
          message: errorStrings.userNotConfirmed,
        });
      }

      if (user.password != password) {
        return Promise.reject({
          status: 400,
          message: errorStrings.wrongPassword,
        });
      }

      if (user.role === "admin" || user.role === "superadmin") {
        const token = this.generateToken(user);

        return { token: token, user };
      }

      const randomNum =
        Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
      user.confirmCode = randomNum.toString();

      await user.save();
      await sendMail(user.confirmCode, user.email);
      return { message: "Sucessfully logged in" };
    } catch (error) {
      throw error;
    }
  }

  public async SignUpUser({
    userId,
    email,
    password,
    role,
  }: {
    userId?: string;
    email: string;
    password: string;
    role: "user" | "admin" | "superadmin";
  }): Promise<{ message: string }> {
    try {
      let existingUser: IUser;
      const user = await this.userModel.findById(
        new mongoose.Types.ObjectId(userId)
      );

      if (userId && !user) {
        return Promise.reject({
          status: 404,
          message: errorStrings.userNotFound,
        });
      }

      if (userId && user.role !== "superadmin") {
        return Promise.reject({
          status: 403,
          message: errorStrings.unAuthorized,
        });
      }

      if (role === "user") {
        existingUser = await this.userModel.findOne({ email });
      } else if (role === "admin") {
        if (user.role !== "superadmin") {
          return Promise.reject({
            status: 403,
            message: errorStrings.unAuthorized,
          });
        }

        existingUser = await this.userModel.findOne({ email, role });

        if (existingUser) {
          return Promise.reject({
            status: 400,
            message: errorStrings.userIsExists,
          });
        }

        await this.userModel.create({
          email,
          password,
          confirmed: true,
          role,
        });

        return { message: "Admin user created" };
      } else {
        existingUser = await this.userModel.findOne({ email, role });
      }
    } catch (e) {
      throw e;
    }
  }

  public async confirmOtp(
    userId: string,
    otp: string
  ): Promise<{ token: string }> {
    try {
      const user = await this.userModel.findById(userId);

      if (!user) {
        return Promise.reject({
          status: 404,
          message: errorStrings.userNotFound,
        });
      }

      if (user.confirmCode === "null") {
        return Promise.reject({
          status: 400,
          message: errorStrings.userAlreadyConfirmed,
        });
      }

      if (user.confirmCode != otp) {
        return Promise.reject({ status: 400, message: errorStrings.wrongOtp });
      }
      user.confirmed = true;
      user.confirmCode = "null";
      await user.save();

      const token = this.generateToken(user);
      return { token: token };
    } catch (error) {
      throw error;
    }
  }

  private generateToken(user: IUser) {
    const today = new Date();
    const exp = new Date(today);
    exp.setDate(today.getDate() + 300);
    const privateKey = fs.readFileSync("keys/private_key.pem", "utf8");

    return jwt.sign(
      {
        _id: user._id,
        name: user.name,
        exp: exp.getTime() / 1000,
      },
      privateKey,
      {
        algorithm: "RS256",
      }
    );
  }
}
