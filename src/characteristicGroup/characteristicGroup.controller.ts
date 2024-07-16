import {
  DeleteProductRequest,
  UpdateCharReq,
  GetAllCharReq,
} from 'build/proto/product';
import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { CharacteristicGroupService } from './characteristicGroup.service';
import { Metadata } from '@grpc/grpc-js';
import { getLang } from "../../shared/utils";

@Controller()
export class CharacteristicGroupController {
  constructor(private readonly service: CharacteristicGroupService) {}

  @GrpcMethod('CharacteristicGroupService', 'GetAll')
  async getAll(query: GetAllCharReq, meta: Metadata) {
    try {
      const changedData = await this.service.getAll(
        query,
        getLang(meta),
      );
      return {
        data: changedData,
      };
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  @GrpcMethod('CharacteristicGroupService', 'GetOne')
  async GetOne(query: CharacteristicGroupService, meta: Metadata) {
    try {
      return this.service.get(query, getLang(meta));
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  @GrpcMethod('CharacteristicGroupService', 'AddNew')
  async addNew(data: any, meta: Metadata) {
    try {
      return this.service.addNew(data, getLang(meta));
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  @GrpcMethod('CharacteristicGroupService', 'Update')
  async update(data: UpdateCharReq) {
    try {
      return this.service.update(data);
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  @GrpcMethod('CharacteristicGroupService', 'Delete')
  async delete(data: DeleteProductRequest) {
    try {
      return this.service.delete(data);
    } catch (error) {
      throw new RpcException(error.message);
    }
  }
}
