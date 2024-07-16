import {
  DeleteProductRequest,
  UpdateCharReq,
  GetAllCharReq,
} from 'build/proto/product';
import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { CharacteristicService } from './characteristic.service';
import { Metadata } from '@grpc/grpc-js';
import { getLang } from '../../shared/utils';

@Controller()
export class CharacteristicController {
  constructor(private readonly service: CharacteristicService) {}

  @GrpcMethod('CharacteristicService', 'GetAll')
  getAll(query: GetAllCharReq, meta: Metadata) {
    try {
      return this.service.getAll(query, getLang(meta));
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  @GrpcMethod('CharacteristicService', 'GetOne')
  GetOne(query: CharacteristicService, meta: Metadata) {
    try {
      return this.service.get(query, getLang(meta));
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  @GrpcMethod('CharacteristicService', 'AddNew')
  addNew({ data }: any) {
    try {
      return this.service.addNew(data);
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  @GrpcMethod('CharacteristicService', 'Update')
  update(data: UpdateCharReq) {
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

  @GrpcMethod('CharacteristicService', 'Delete')
  delete(data: DeleteProductRequest) {
    try {
      return this.service.delete(data);
    } catch (error) {
      throw new RpcException(error.message);
    }
  }
}
