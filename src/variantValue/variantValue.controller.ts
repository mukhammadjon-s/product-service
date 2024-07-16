import {
  DeleteProductRequest,
  UpdateCharReq,
  GetAllCharReq,
} from 'build/proto/product';
import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { VariantValueService } from './variantValue.service';
import { Metadata } from '@grpc/grpc-js';
import { getLang } from '../../shared/utils';

@Controller()
export class VariantValueController {
  constructor(private readonly service: VariantValueService) {}

  @GrpcMethod('VariantValueService', 'GetAll')
  getAll(query: GetAllCharReq, meta: Metadata) {
    try {
      // @ts-ignore
      return this.service.getAll(query, getLang(meta));
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  @GrpcMethod('VariantValueService', 'GetOne')
  GetOne(query: VariantValueService, meta: Metadata) {
    try {
      // @ts-ignore
      return this.service.get(query, getLang(meta));
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  @GrpcMethod('VariantValueService', 'AddNew')
  addNew(data: any) {
    try {
      return this.service.addNew(data);
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  @GrpcMethod('VariantValueService', 'Update')
  update(data: UpdateCharReq) {
    try {
      return this.service.update(data);
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  @GrpcMethod('VariantValueService', 'Delete')
  delete(data: DeleteProductRequest) {
    try {
      return this.service.delete(data);
    } catch (error) {
      throw new RpcException(error.message);
    }
  }
}
