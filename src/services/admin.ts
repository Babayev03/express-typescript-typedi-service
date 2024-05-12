import mongoose from "mongoose";
import { errorStrings } from "../utils/errorStrings";
import { Inject, Service } from "typedi";
import { IUser } from "src/interfaces/IUser";

@Service()
export default class AdminService {
  constructor(@Inject("userModel") private userModel: Models.UserModel) {}

  public async getAllAdmins(
    userId: string
  ): Promise<{ status: number; response: IUser[] }> {
    try {
      const user = await this.userModel.findById(
        new mongoose.Types.ObjectId(userId)
      );

      if (!user) {
        return Promise.reject({
          status: 404,
          message: errorStrings.userNotFound,
        });
      }

      if (user.role !== "admin") {
        return Promise.reject({
          status: 403,
          message: errorStrings.unAuthorized,
        });
      }

      const admins = await this.userModel.find({ role: "admin" });
      return { status: 200, response: admins };
    } catch (error) {
      throw error;
    }
  }

  public async getAdminById(
    userId: string,
    adminId: string
  ): Promise<{
    status: number;
    response: IUser;
  }> {
    try {
      const user = await this.userModel.findById(
        new mongoose.Types.ObjectId(userId)
      );
      if (!user) {
        return Promise.reject({
          status: 404,
          message: errorStrings.userNotFound,
        });
      }

      if (user.role !== "admin") {
        return Promise.reject({
          status: 403,
          message: errorStrings.unAuthorized,
        });
      }

      const admin = await this.userModel.findById(
        new mongoose.Types.ObjectId(adminId)
      );
      if (!admin || admin.role !== "admin") {
        return Promise.reject({
          status: 404,
          message: errorStrings.userNotFound,
        });
      }

      return { status: 200, response: admin };
    } catch (error) {
      throw error;
    }
  }

  public async deleteAdmin(
    userId: string,
    adminId: string
  ): Promise<{ status: number; message: string }> {
    try {
      const user = await this.userModel.findById(
        new mongoose.Types.ObjectId(userId)
      );
      if (!user) {
        return Promise.reject({
          status: 404,
          message: errorStrings.userNotFound,
        });
      }

      const admin = await this.userModel.findById(
        new mongoose.Types.ObjectId(adminId)
      );
      if (!admin || admin.role !== "admin") {
        return Promise.reject({
          status: 404,
          message: errorStrings.userNotFound,
        });
      }

      if (user.role !== "superadmin") {
        return Promise.reject({
          status: 403,
          message: errorStrings.unAuthorized,
        });
      }

      await this.userModel.findByIdAndDelete(
        new mongoose.Types.ObjectId(adminId)
      );

      return { status: 200, message: "Admin deleted successfully" };
    } catch (error) {
      throw error;
    }
  }

  public async editAdmin(
    userId: string,
    adminId: string,
    email: string,
    password: string,
    name: string
  ): Promise<{ status: number; message: string }> {
    try {
      const user = await this.userModel.findById(
        new mongoose.Types.ObjectId(userId)
      );
      if (!user) {
        return Promise.reject({
          status: 404,
          message: errorStrings.userNotFound,
        });
      }

      const admin = await this.userModel.findById(
        new mongoose.Types.ObjectId(adminId)
      );
      if (!admin || admin.role !== "admin") {
        return Promise.reject({
          status: 404,
          message: errorStrings.userNotFound,
        });
      }

      if (user.role !== "superadmin") {
        return Promise.reject({
          status: 403,
          message: errorStrings.unAuthorized,
        });
      }

      const updateObj: { email?: string; password?: string; name?: string } =
        {};

      if (email) {
        updateObj.email = email;
      }

      if (password) {
        updateObj.password = password;
      }

      if (name) {
        updateObj.name = name;
      }

      await this.userModel.findByIdAndUpdate(
        new mongoose.Types.ObjectId(adminId),
        updateObj
      );

      return { status: 200, message: "Admin edited successfully" };
    } catch (error) {
      throw error;
    }
  }
}
