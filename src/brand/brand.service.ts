import { StatusBrand } from '../schemas/brand.schema';
import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import grpc from 'grpc';
import { Brand, BrandModel } from '../schemas/brand.schema';
import {
  getField,
  jsonToStructProto,
  structProtoToJson,
} from '../../shared/utils';
import { paginate, RegexSlug, Transliterate } from '../../shared/helper';
import { VariantService } from '../variant/variant.service';
const ObjectId = require('mongoose').Types.ObjectId;

@Injectable()
export class BrandService {
  constructor(@InjectModel(Brand.name) private brandModel: BrandModel,
              private readonly variantService: VariantService) {}

  async getAll(query: any, page?: number, pagesize?: number) {
    const getQuery: any = {
      status: query?.status ? query.status : StatusBrand.ACTIVE,
    };
    !getQuery.status && delete getQuery.status;
    const data = await paginate(
      this.brandModel.find(getQuery),
      this.brandModel.find(getQuery),
      page,
      pagesize,
    );
    return data;
  }

  async get(id: string, lang: LanguageTypes = 'ru') {
    const condition = ObjectId.isValid(id)
      ? { _id: ObjectId(id) }
      : { slug: id };
    const data = await this.brandModel.findOne(condition);
    if (!data){
      throw new RpcException('Brand not found!');
    }
    return data;
  }

  async addNew(data, lang: LanguageTypes = 'ru') {
    if (
      data?.status === StatusBrand.ACTIVE ||
      data?.status === StatusBrand.INACTIVE
    ) {
      const data1 = await this.brandModel.create(data).catch((error) => {
        throw new RpcException(error.message);
      });
      let t = {};
      try {
        t = data.translation[lang];
      } catch (e) {}
      return {
        data: {
          ...getField(data1, '_doc'),
          translation: jsonToStructProto(data.translation),
          id: data1._id + '',
          ...t,
        },
      };
    } else {
      throw new RpcException({
        code: grpc.status.NOT_FOUND,
        message: 'not correct enum',
      });
    }
  }

  async update(id: string, data: any, lang: LanguageTypes = 'ru') {
    if (
      data?.status === StatusBrand.ACTIVE ||
      data?.status === StatusBrand.INACTIVE
    ) {
      let translation = structProtoToJson(data.translation);
      let slug = await this.generateSlug(translation[lang].name)
      const data1 = await this.brandModel
        .findByIdAndUpdate(
          id,
          { ...data, translation: structProtoToJson(data.translation), slug },
          { new: true },
        )
        .catch((error) => {
          throw new RpcException(error.message);
        });
      let t = {};
      await this.variantService.updateVariantGroupByBrand(id);
      try {
        t = data.translation[lang];
      } catch (e) {}
      return {
        data: {
          ...getField(data1, '_doc'),
          translation: jsonToStructProto(data.translation),
          id: data1._id + '',
          ...t,
        },
      };
    } else {
      throw new RpcException({
        code: grpc.status.NOT_FOUND,
        message: 'not correct enum',
      });
    }
  }

  async updateStatus(id: string, status: string, lang: LanguageTypes = 'ru') {
    if (status === StatusBrand.ACTIVE || status === StatusBrand.INACTIVE) {
      const data = await this.brandModel
        .findByIdAndUpdate({ id: id }, { status }, { new: true })
        .catch((error) => {
          throw new RpcException({
            code: grpc.status.NOT_FOUND,
            message: error.message,
          });
        });
      return { data };
    } else {
      throw new RpcException({
        code: grpc.status.NOT_FOUND,
        message: 'not correct enum',
      });
    }
  }

  async delete(id: string) {
    const data = await this.brandModel.findByIdAndDelete(id).catch((error) => {
      throw new RpcException({
        code: grpc.status.NOT_FOUND,
        message: error.message,
      });
    });
    await this.variantService.updateVariantGroupByBrand(id);
    // console.log(data);
    return { data };
  }

  async getOneByName(name: string, lang?: string) {
    let defaultLanguage = lang || 'ru';
    const data = await this.brandModel.findOne({"translation.ru.name": { $regex: new RegExp(name, "i") }}).catch((error) => {
      throw new RpcException({
        code: grpc.status.NOT_FOUND,
        message: error.message,
      });
    });

    return { data };
  }

  async generateSlug(slug) {
    let newSlug = slug.replace(/\s+/g, "-").toLowerCase();
    newSlug = RegexSlug(Transliterate(newSlug));
    let counter = 0;

    const checkSlug = async (searchSlug, searchCounter) => {
      const element = await this.brandModel.findOne({ slug: counter > 0 ? `${searchSlug}-${searchCounter}` : searchSlug });
      if (element) {
        counter += 1;
        await checkSlug(searchSlug, counter);
      } else {
        newSlug = counter > 0 ? `${searchSlug}-${counter}` : searchSlug;
      }
    };
    await checkSlug(newSlug, counter);
    return newSlug;
  }
}
