import {
  GetAllVariantFieldReq,
  UpdateVFReq,
  DeleteProductRequest,
} from 'build/proto/product';
import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { VariantFieldService } from './variantField.service';
import { Metadata } from '@grpc/grpc-js';
import { getLang } from '../../shared/utils';

@Controller()
export class VariantFieldController {
  constructor(private readonly service: VariantFieldService) {}

  @GrpcMethod('VariantFieldService', 'GetAll')
  GetAll(query: GetAllVariantFieldReq, meta: Metadata) {
    try {
      return this.service.getAll(query, getLang(meta));
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  @GrpcMethod('VariantFieldService', 'GetOne')
  GetOne(query: GetAllVariantFieldReq, meta: Metadata) {
    try {
      return this.service.get(query, getLang(meta));
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  @GrpcMethod('VariantFieldService', 'AddNew')
  addNew(data: any) {
    try {
      return this.service.addNew(data);
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  @GrpcMethod('VariantFieldService', 'Update')
  update(data: UpdateVFReq) {
    try {
      return this.service.update(data);
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  // @GrpcMethod('VariantValueService', 'UpdateStatus')
  // updateStatus({ id, status }: UpdateStatusCategoryRequest) {
  //   return this.service.updateStatus(id, status);
  // }

  @GrpcMethod('VariantFieldService', 'Delete')
  delete(data: DeleteProductRequest) {
    try {
      return this.service.delete(data);
    } catch (error) {
      throw new RpcException(error.message);
    }
  }
}
