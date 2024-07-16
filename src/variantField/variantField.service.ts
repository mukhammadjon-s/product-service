import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  VariantField,
  VariantFieldModel,
} from '../schemas/variantFields.schema';
import { BaseService } from '../base.service';
import {
  CreateProductCategoriesRequest,
  CreateVariantVariantValues,
  DeleteProductRequest,
} from 'build/proto/product';
import {
  VariantValue,
  VariantValueModel,
} from '../schemas/variantValues.schema';
import { Category, CategoryModel } from '../schemas/category.schema';

@Injectable()
export class VariantFieldService extends BaseService<
  VariantField | VariantValue | Category
> {
  constructor(
    @InjectModel(VariantField.name) private variantField: VariantFieldModel,
    @InjectModel(VariantValue.name) private variantValues: VariantValueModel,
    @InjectModel(Category.name)
    private categoryModel: CategoryModel,
  ) {
    super();
  }

  async getAll(query: any, lang: LanguageTypes = 'ru') {
    const relations = ['variantValues', 'categories'];
    const projection = relations
      .filter((key) => !query[key])
      .reduce((a, b) => ({ ...a, [b]: false }), {});

    const data = await this.variantField.findTranslated(
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
    const relations = ['variantValues', 'categories'];
    const projection = relations
      .filter((key) => !query[key])
      .reduce((a, b) => ({ ...a, [b]: false }), {});
    const data = await this.variantField.findByIdTranslated(
      query.where.id,
      projection,
      {
        lang,
        populate: relations,
      },
    );
    return { data: data };
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

    let variantValues = undefined;
    let categories = undefined;
    const populate = [];
    if (Array.isArray(data?.variantValues) && data?.variantValues.length) {
      try {
        variantValues = await Promise.all(
          data.variantValues
            .map(this.translationMapper.bind(this))
            .map(
              this.connect.bind(
                this,
                this.variantValues,
              ),
            ),
        );
      } catch (e) {}
      populate.push('variantValues');
    }
    if (Array.isArray(data?.categories) && data?.categories.length) {
      categories = await Promise.all(
        data.categories
          .map(this.translationMapper.bind(this))
          .map(
            this.connect.bind(
              this,
              this.categoryModel,
            ),
          ),
      );
      populate.push('categories');
    }
    const result = await this.variantField.create({
      ...data,
      categories,
      variantValues,
      translation: this.formatTranslation(data?.translation),
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
    const result = await this.variantField.findByIdAndUpdate(
      data.id,
      { ...data },
      {
        projection: {
          categories: false,
          variantValues: false,
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
    const result = await this.variantField.findByIdAndDelete(id);
    return result;
  }
}
