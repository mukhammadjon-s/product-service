import {
  CreateProductRequest,
  DeleteProductRequest,
  GetAllProductsRequest,
  GetOneProductRequest,
  UpdateProductRequest,
} from 'build/proto/product';
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ProductService } from './product.service';
import { RpcException } from '@nestjs/microservices';
import { Metadata } from '@grpc/grpc-js';
import { getLang } from '../../shared/utils';

@Controller()
export class ProductController {
  constructor(private readonly productService: ProductService) { }
  @GrpcMethod('ProductService')
  async getAll(query: GetAllProductsRequest, meta: Metadata) {
    try {
      return this.productService.getAll(query, getLang(meta));
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  @GrpcMethod('ProductService', 'GetOne')
  async getOne(query: GetOneProductRequest, meta: Metadata) {
    try {
      return this.productService.get(query, getLang(meta));
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  @GrpcMethod('ProductService', 'GetDetails')
  async getDetails(query: GetOneProductRequest, meta: Metadata) {
    try {
      return this.productService.details(query, getLang(meta));
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  @GrpcMethod('ProductService')
  async create(data: CreateProductRequest, meta: Metadata) {
    try {
      return this.productService.create(data, getLang(meta));
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  @GrpcMethod('ProductService')
  async delete(data: DeleteProductRequest) {
    try {
      return await this.productService.delete(data);
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  @GrpcMethod('ProductService')
  async update(data: UpdateProductRequest) {
    try {
      return this.productService.update(data);
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  @GrpcMethod('ProductService', 'GetProductsByIds')
  async getProductsByIds(data: any) {
    try {
      return this.productService.getProductsByIds(data);
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  @GrpcMethod('ProductService', 'GetProductById')
  async getProductsById(data: any) {
    try {
      return this.productService.getProductById(data);
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  @GrpcMethod('ProductService', 'GetProductByBillzId')
  async getProductByBillzId(data: any) {
    try {
      return this.productService.getProductByBillzId(data.billzId);
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  @GrpcMethod('ProductService', 'GetProductsByName')
  async getProductsByName(name: string, companyId?) {
    return this.productService.getProductsByName(name, companyId);
  }
}
