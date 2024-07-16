import {
  GetAllBrandsReq,
  GetOneBrandReq,
  DelReq,
  UpdateBrandReq,
  UpdateStatusBrandReq,
} from 'build/proto/product';
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { BrandService } from './brand.service';
import {
  getField,
  getLang,
  jsonToStructProto,
  structProtoToJson,
} from '../../shared/utils';
import { Metadata } from '@grpc/grpc-js';
import { CatchExceptions } from '../../shared/utils/error-decorator';

@Controller()
export class BrandController {
  constructor(private readonly service: BrandService) {}

  @GrpcMethod('BrandService', 'GetAll')
  async getAll({ query, page, pagesize }: GetAllBrandsReq, meta: Metadata) {
    const data = await this.service.getAll(query, page, pagesize);
    return {
      ...data,
      data: data.data.map((r) => {
        let t = {};
        try {
          t = r.translation[getLang(meta)];
        } catch (e) {}
        return {
          ...getField(r, '_doc'),
          id: r?._id,
          translation: undefined,
          ...t,
        };
      }),
    };
  }

  @GrpcMethod('BrandService', 'GetOne')
  async getOne({ id }: GetOneBrandReq, meta: Metadata) {
    const data1 = await this.service.get(id);
    let t = {};
    try {
      t = data1.translation[getLang(meta)];
    } catch (e) {}
    return {
      data: {
        ...getField(data1, '_doc'),
        id: getField(data1, '_id'),
        translation: jsonToStructProto(getField(data1, 'translation')),
        ...t,
      },
    };
  }

  @GrpcMethod('BrandService', 'AddNew')
  async addNew({ data }: any, meta: Metadata) {
    data.translation = structProtoToJson(data.translation);
    return this.service.addNew(data, getLang(meta));
  }

  @GrpcMethod('BrandService', 'Update')
  async update(data: UpdateBrandReq, meta: Metadata) {
    return this.service.update(data.id, data.data, getLang(meta));
  }

  @GrpcMethod('BrandService', 'UpdateStatus')
  async updateStatus({ id, status }: UpdateStatusBrandReq) {
    return this.service.updateStatus(id, status);
  }

  @GrpcMethod('BrandService', 'Delete')
  async delete({ id }: DelReq) {
    return this.service.delete(id);
  }

  @GrpcMethod('BrandService', 'GetOneByName')
  @CatchExceptions()
  async getOneByName({name}) {
    return this.service.getOneByName(name);
  }
}
