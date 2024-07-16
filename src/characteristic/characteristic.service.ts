import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BaseService } from '../base.service';
import {
  CreateCharGroupRequest,
  CreateProductCategoriesRequest,
  DeleteProductRequest,
} from '../../build/proto/product';
import {
  Characteristic,
  CharacteristicModel,
} from '../schemas/characteristic.schema';
import { Product, ProductModel } from '../schemas/product.schema';
import {
  CharacteristicGroup,
  CharacteristicGroupModel,
} from '../schemas/characteristicGroup.schema';

@Injectable()
export class CharacteristicService extends BaseService<
  Product | Characteristic | CharacteristicGroup
> {
  constructor(
    @InjectModel(Characteristic.name)
    private characteristic: CharacteristicModel,
    @InjectModel(CharacteristicGroup.name)
    private characteristicGroupModel: CharacteristicGroupModel,
    @InjectModel(Product.name) private productModel: ProductModel, // @InjectModel(Category.name) // private categoryModel: CategoryModel,
  ) {
    super();
  }

  async getAll(query: any, lang: LanguageTypes = 'ru') {
    const relations = ['group', 'product'];
    const projection = relations
      .filter((key) => !query[key])
      .reduce((a, b) => ({ ...a, [b]: false }), {});

    const data = await this.characteristic.findTranslated(
      query.where,
      projection,
      {
        lang,
        populate: relations,
      },
    );
    const newData = data?.map((r) => {
      return this.cleanProductAll(r);
    });
    return { data: newData };
  }

  async get(query: any, lang: LanguageTypes = 'ru') {
    const relations = ['group', 'product'];
    const projection = relations
      .filter((key) => !query[key])
      .reduce((a, b) => ({ ...a, [b]: false }), {});
    const data = await this.characteristic.findByIdTranslated(
      query.where.id,
      projection,
      {
        lang,
        populate: relations,
      },
    );
    return { data: this.cleanProductOne(data) };
  }

  async addNew(data) {
    // if (
    //   data?.status === StatusBrand.ACTIVE ||
    //   data?.status === StatusBrand.INACTIVE
    // ) {
    //   const data1 = await Promise.all([this.variantField.create(data)]).catch(
    //     (error) => {
    //       throw new RpcException({
    //         code: grpc.status.NOT_FOUND,
    //         message: error.message,
    //       });
    //     },
    //   );
    //   return { data: data1[0] };
    // } else {
    //   throw new RpcException({
    //     code: grpc.status.NOT_FOUND,
    //     message: 'not correct enum',
    //   });
    // }

    let product = undefined;
    let group = undefined;
    const populate = [];
    if (data.product) {
      product = await this.connect.bind(
        this.productModel,
        'characteristic:=',
        this.translationMapper([data.product])[0],
      );
      populate.push('product');
    }
    if (data.categories) {
      group = await this.connect.bind(
        this.characteristicGroupModel,
        'characteristic:=',
        this.translationMapper([data.group])[0],
      );
      populate.push('group');
    }
    const result = await this.characteristic.create({
      ...data,
      group,
      product,
      // translation: this.formatTranslation(data.translation),
    });
    if (populate.length) {
      await result.populate(populate);
    }
    await this.sync(result);
    return { data: this.serelize(this.cleanProductOne(result)) };
  }

  // async updateStatus(id: string, brand: any) {
  //   if (
  //     brand?.status === StatusBrand.ACTIVE ||
  //     brand?.status === StatusBrand.INACTIVE
  //   ) {
  //     const data = await this.variantField
  //       .findOneAndUpdate({ id: id }, brand, { new: true })
  //       .catch((error) => {
  //         throw new RpcException({
  //           code: grpc.status.NOT_FOUND,
  //           message: error.message,
  //         });
  //       });
  //     return { data };
  //   } else {
  //     throw new RpcException({
  //       code: grpc.status.NOT_FOUND,
  //       message: 'not correct enum',
  //     });
  //   }
  // }

  async update(data: any) {
    // if (status === StatusBrand.ACTIVE || status === StatusBrand.INACTIVE) {
    //   const data = await this.variantField
    //     .findOneAndUpdate({ id: id }, { status }, { new: true })
    //     .catch((error) => {
    //       throw new RpcException({
    //         code: grpc.status.NOT_FOUND,
    //         message: error.message,
    //       });
    //     });
    //   return { data };
    // } else {
    //   throw new RpcException({
    //     code: grpc.status.NOT_FOUND,
    //     message: 'not correct enum',
    //   });
    // }
    const result = await this.characteristic.findByIdAndUpdate(
      data.id,
      { ...data },
      {
        projection: {
          group: false,
          product: false,
        },
      },
    );
    return { data: result };
  }

  async delete({ id }: DeleteProductRequest) {
    // const data = await this.variantField
    //   .deleteOne({ id: id })
    //   .catch((error) => {
    //     throw new RpcException({
    //       code: grpc.status.NOT_FOUND,
    //       message: error.message,
    //     });
    //   });
    // return { data };
    const result = await this.characteristic.findByIdAndDelete(id);
    return result;
  }
}
