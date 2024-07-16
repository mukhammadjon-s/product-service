import { Metadata } from '@grpc/grpc-js';
import { GetCategoriesRequest } from 'build/proto/product';
import { UpdateStatusCategoryRequest } from 'build/proto/product';
import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import {
  AddNewCategoryRequest,
  DelReq,
  GetCategoryRequest,
} from 'build/proto/product';
import { CategoryService } from './category.service';
import { getLang } from '../../shared/utils';
import { CatchExceptions } from '../../shared/utils/error-decorator';

@Controller()
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @GrpcMethod('CategoryService', 'GetTreeCategory')
  async getTreeCategories(query: GetCategoriesRequest, meta: Metadata) {
    try {
      return this.categoryService.getTree(getLang(meta));
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @GrpcMethod('CategoryService', 'GetCategories')
  async getCategories(query: GetCategoriesRequest, meta: Metadata) {
    try {
      return await this.categoryService.getAll(query, getLang(meta));
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  @GrpcMethod('CategoryService', 'GetCategory')
  async getCategory(query: GetCategoryRequest, meta: Metadata) {
    try {
      const data = await this.categoryService.get(query, getLang(meta));
      // console.log(data);
      // data = this.getFields(data, '_doc');

      return {
        data,
      };
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  @GrpcMethod('CategoryService', 'AddNew')
  addNew(data: AddNewCategoryRequest) {
    try {
      return this.categoryService.addNew(data);
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  @GrpcMethod('CategoryService', 'Update')
  update(data: any, meta: Metadata) {
    try {
      return this.categoryService.update(data, getLang(meta));
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @GrpcMethod('CategoryService', 'UpdateStatus')
  updateStatus({ id, status }: UpdateStatusCategoryRequest) {
    try {
      return this.categoryService.updateStatus(id, status);
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  @GrpcMethod('CategoryService', 'Delete')
  delete({ id }: DelReq) {
    try {
      return this.categoryService.delete(id);
    } catch (error) {
      return this.categoryService.delete(id);
    }
  }

  @GrpcMethod('CategoryService', 'GetOneByName')
  @CatchExceptions()
  async getOneByName({name}) {
    return this.categoryService.getOneByName(name);
  }

  @GrpcMethod('CategoryService', 'GetChildCategories')
  @CatchExceptions()
  async getChildCategories({name}) {
    return this.categoryService.getChildCategories(name);
  }
}
