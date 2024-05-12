import { UploadedFile } from "express-fileupload";
import mongoose from "mongoose";
import { Inject, Service } from "typedi";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import path from "path";
import { allowedMimeTypes } from "../utils/allowedImageTypes";
import { storage } from "../config/firebase";
import sharp from "sharp";
import { IWork } from "src/interfaces/IWork";
import { errorStrings } from "../utils/errorStrings";

@Service()
export default class WorkService {
  constructor(
    @Inject("workModel") private workModel: Models.WorkModel,
    @Inject("userModel") private userModel: Models.UserModel
  ) {}

  public async createWork(
    userId: string,
    title: string,
    image: UploadedFile | UploadedFile[]
  ): Promise<{ message: string; status: number }> {
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

      if (!image || !title) {
        return Promise.reject({
          status: 400,
          message: errorStrings.fieldsNotFound,
        });
      }
      const imagePaths: string[] = [];
      const imageFiles = Array.isArray(image) ? image : [image];
      for (const img of imageFiles) {
        const extName = path.extname(img.name);
        if (!allowedMimeTypes.includes(extName)) {
          return Promise.reject({
            status: 400,
            message: errorStrings.invalidImageFormat,
          });
        }
        const filename = `${userId}-${Date.now()}${extName}`;
        const imageRef = ref(storage, filename);

        if (img.size > 1024 * 1024) {
          const compressedImageBuffer = await sharp(img.data)
            .rotate()
            .jpeg({ quality: Math.floor(((1024 * 1024) / img.size) * 100) })
            .toBuffer();

          await uploadBytes(imageRef, compressedImageBuffer);
        } else {
          await uploadBytes(imageRef, img.data);
        }
        const url = await getDownloadURL(imageRef);
        imagePaths.push(url);
      }

      await this.workModel.create({
        title,
        user: userId,
        image: imagePaths[0],
      });

      return { status: 200, message: "Work created successfully" };
    } catch (error) {
      throw error;
    }
  }

  public async getWorks(
    userId: string,
    currentPage: number,
    worksPerPage: number
  ): Promise<{
    works: IWork[];
    status: number;
    currentPage: number;
    totalPages: number;
    worksPerPage: number;
    totalWorks: number;
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

      currentPage = currentPage?.toString().match(/^[0-9]+$/) ? currentPage : 1;
      currentPage = currentPage < 1 ? 1 : currentPage;
      worksPerPage = worksPerPage?.toString().match(/^[0-9]+$/)
        ? worksPerPage
        : 5;
      worksPerPage = worksPerPage < 1 ? 5 : worksPerPage;

      const totalWorks = await this.workModel.countDocuments();
      const totalPages = Math.ceil(totalWorks / worksPerPage);

      const works = await this.workModel
        .find()
        .skip((currentPage - 1) * worksPerPage)
        .limit(worksPerPage)
        .sort({ createdAt: -1 });

      return {
        status: 200,
        works,
        currentPage,
        totalPages,
        worksPerPage,
        totalWorks,
      };
    } catch (error) {
      throw error;
    }
  }

  public async getWorkById(
    userId: string,
    workId: string
  ): Promise<{ response: IWork; status: number }> {
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

      const work = await this.workModel.findById(
        new mongoose.Types.ObjectId(workId)
      );
      if (!work) {
        return Promise.reject({
          status: 404,
          message: errorStrings.workNotFound,
        });
      }

      return { status: 200, response: work };
    } catch (error) {
      throw error;
    }
  }

  public async updateWork(
    userId: string,
    workId: string,
    title: string,
    image: UploadedFile | UploadedFile[]
  ): Promise<{ message: string; status: number }> {
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

      const Work = await this.workModel.findById(
        new mongoose.Types.ObjectId(workId)
      );
      if (!Work) {
        return Promise.reject({
          status: 404,
          message: errorStrings.workNotFound,
        });
      }

      if (Work.user.toString() !== userId) {
        return Promise.reject({
          status: 403,
          message: errorStrings.cantProcessYourRequest,
        });
      }

      const updateObj: Partial<{
        title: string;
        text: string;
        image: string;
      }> = {};

      if (title) {
        updateObj.title = title;
      }

      if (image) {
        const imagePaths: string[] = [];
        const imageFiles = Array.isArray(image) ? image : [image];
        for (const img of imageFiles) {
          const extName = path.extname(img.name);
          if (!allowedMimeTypes.includes(extName)) {
            return Promise.reject({
              status: 400,
              message: errorStrings.invalidImageFormat,
            });
          }
          const filename = `${userId}-${Date.now()}${extName}`;
          const imageRef = ref(storage, filename);

          if (img.size > 1024 * 1024) {
            const compressedImageBuffer = await sharp(img.data)
              .rotate()
              .jpeg({ quality: Math.floor(((1024 * 1024) / img.size) * 100) })
              .toBuffer();
            await deleteObject(ref(storage, Work.image));
            await uploadBytes(imageRef, compressedImageBuffer);
          } else {
            await deleteObject(ref(storage, Work.image));
            await uploadBytes(imageRef, img.data);
          }
          const url = await getDownloadURL(imageRef);
          imagePaths.push(url);
        }
        updateObj.image = imagePaths[0];
      }

      if (Object.keys(updateObj).length > 0) {
        await this.workModel.findByIdAndUpdate(
          new mongoose.Types.ObjectId(workId),
          updateObj
        );
      }

      return { status: 200, message: "Work updated successfully" };
    } catch (error) {
      throw error;
    }
  }

  public async deleteWork(
    userId: string,
    workId: string
  ): Promise<{ message: string; status: number }> {
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

      const Work = await this.workModel.findById(
        new mongoose.Types.ObjectId(workId)
      );
      if (!Work) {
        return Promise.reject({
          status: 404,
          message: errorStrings.workNotFound,
        });
      }

      if (Work.user.toString() !== userId) {
        return Promise.reject({
          status: 403,
          message: errorStrings.unAuthorized,
        });
      }

      await deleteObject(ref(storage, Work.image));
      await this.workModel.findByIdAndDelete(
        new mongoose.Types.ObjectId(workId)
      );
      return { status: 200, message: "Work deleted successfully" };
    } catch (error) {
      throw error;
    }
  }
}
