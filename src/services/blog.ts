import { errorStrings } from "../utils/errorStrings";
import { UploadedFile } from "express-fileupload";
import mongoose, { Types } from "mongoose";
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
import { IBlog } from "src/interfaces/IBlog";

@Service()
export default class BlogService {
  constructor(
    @Inject("blogModel") private blogModel: Models.BlogModel,
    @Inject("userModel") private userModel: Models.UserModel
  ) {}

  public async createBlog(
    userId: string,
    title: string,
    text: string,
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

      if (!image || !title || !text) {
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

      await this.blogModel.create({
        title,
        text,
        user: userId,
        image: imagePaths[0],
      });

      return { status: 200, message: "Blog created successfully" };
    } catch (error) {
      throw error;
    }
  }

  public async getBlogs(
    userId: string,
    currentPage: number,
    blogsPerPage: number
  ): Promise<{
    blogs: IBlog[];
    status: number;
    currentPage: number;
    totalPages: number;
    blogsPerPage: number;
    totalBlogs: number;
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
      blogsPerPage = blogsPerPage?.toString().match(/^[0-9]+$/)
        ? blogsPerPage
        : 5;
      blogsPerPage = blogsPerPage < 1 ? 5 : blogsPerPage;

      const totalBlogs = await this.blogModel.countDocuments();
      const totalPages = Math.ceil(totalBlogs / blogsPerPage);

      const blogs = await this.blogModel
        .find()
        .skip((currentPage - 1) * blogsPerPage)
        .limit(blogsPerPage)
        .sort({ createdAt: -1 });

      return {
        status: 200,
        blogs,
        currentPage,
        totalPages,
        blogsPerPage,
        totalBlogs,
      };
    } catch (error) {
      throw error;
    }
  }

  public async getBlogById(
    userId: string,
    blogId: string
  ): Promise<{ blog: IBlog; status: number }> {
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

      const blog = await this.blogModel.findById(
        new mongoose.Types.ObjectId(blogId)
      );
      if (!blog) {
        return Promise.reject({
          status: 404,
          message: errorStrings.blogNotFound,
        });
      }

      return { status: 200, blog: blog };
    } catch (error) {
      throw error;
    }
  }

  public async updateBlog(
    userId: string,
    blogId: string,
    title: string,
    text: string,
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

      const blog = await this.blogModel.findById(
        new mongoose.Types.ObjectId(blogId)
      );
      if (!blog) {
        return Promise.reject({
          status: 404,
          message: errorStrings.blogNotFound,
        });
      }

      if (blog.user.toString() !== userId) {
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

      if (text) {
        updateObj.text = text;
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
            await deleteObject(ref(storage, blog.image));
            await uploadBytes(imageRef, compressedImageBuffer);
          } else {
            await deleteObject(ref(storage, blog.image));
            await uploadBytes(imageRef, img.data);
          }
          const url = await getDownloadURL(imageRef);
          imagePaths.push(url);
        }
        updateObj.image = imagePaths[0];
      }

      if (Object.keys(updateObj).length > 0) {
        await this.blogModel.findByIdAndUpdate(
          new mongoose.Types.ObjectId(blogId),
          updateObj
        );
      }

      return { status: 200, message: "Blog updated successfully" };
    } catch (error) {
      throw error;
    }
  }

  public async deleteBlog(
    userId: string,
    blogId: string
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

      const blog = await this.blogModel.findById(
        new mongoose.Types.ObjectId(blogId)
      );
      if (!blog) {
        return Promise.reject({
          status: 404,
          message: errorStrings.blogNotFound,
        });
      }

      if (blog.user.toString() !== userId) {
        return Promise.reject({
          status: 403,
          message: errorStrings.unAuthorized,
        });
      }

      await deleteObject(ref(storage, blog.image));
      await this.blogModel.findByIdAndDelete(
        new mongoose.Types.ObjectId(blogId)
      );
      return { status: 200, message: "Blog deleted successfully" };
    } catch (error) {
      throw error;
    }
  }
}
