import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BaseService } from '../base.service';
import {
  CreateProductVariantsRequest,
  CreateVVVariantField,
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
import { Category, CategoryModel } from '../schemas/category.schema';
import {
  VariantValue,
  VariantValueModel,
} from '../schemas/variantValues.schema';
import { jsonToStructProto, structProtoToJson } from '../../shared/utils';

@Injectable()
export class VariantValueService extends BaseService<
  Product | Characteristic | CharacteristicGroup
> {
  constructor(
    @InjectModel(Characteristic.name)
    private characteristic: CharacteristicModel,
    @InjectModel(CharacteristicGroup.name)
    private characteristicGroupModel: CharacteristicGroupModel,
    @InjectModel(Product.name) private productModel: ProductModel,
    @InjectModel(VariantValue.name)
    private variantValueModel: VariantValueModel,
    @InjectModel(Category.name)
    private categoryModel: CategoryModel,
  ) {
    super();
  }

  async getAll(query: any, lang: LanguageTypes = 'ru') {
    const relations = ['variantField', 'variants'];
    const projection = relations
      .filter((key) => !query[key])
      .reduce((a, b) => ({ ...a, [b]: false }), {});

    const data = await this.variantValueModel.findTranslated(
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
    const relations = ['variantField', 'variants'];
    const projection = relations
      .filter((key) => !query[key])
      .reduce((a, b) => ({ ...a, [b]: false }), {});
    const data = await this.variantValueModel.findByIdTranslated(
      query.where.id,
      projection,
      {
        lang,
        populate: relations,
      },
    );
    return {
      data: {
        ...this.cleanProductOne(data),
        translation: jsonToStructProto(data.translation),
      },
    };
  }

  async addNew(data) {
    let variants = undefined;
    let variantField = undefined;
    const populate = [];
    // console.log(data);
    if (Array.isArray(data.variants) && data.variants.length) {
      variants = await Promise.all(
        data.variants
          .map(this.translationMapper.bind(this))
          .map(
            this.connect.bind(
              this,
              this.categoryModel,
            ),
          ),
      );
      populate.push('variants');
    }
    if (data.variantField) {
      try {
        variantField = await this.connect(
          this.productModel,
          'variantValues:=',
          this.translationMapper([data?.variantField || {}])[0],
        );
      } catch (e) {}
      populate.push('variantField');
    }
    const result = await this.variantValueModel.create({
      ...data,
      variants,
      variantField,
      translation: this.formatTranslation(data.translation),
    });
    if (populate.length) {
      await result.populate(populate);
    }
    await this.sync(result);
    return { data: this.serelize(this.cleanProductOne(result)) };
  }

  async update(data: any) {
    let translation = {};
    try {
      translation = structProtoToJson(data.translation);
    } catch (e) {}
    const result = await this.characteristicGroupModel
      .findByIdAndUpdate(
        data.id,
        { ...data, translation },
        {
          new: true,
          projection: {
            products: false,
            characteristics: false,
            categories: false,
          },
        },
      )
      .catch((e) => {
        console.log(e);
      });
    return { data: result };
  }

  async delete({ id }: DeleteProductRequest) {
    const result = await this.variantValueModel.findByIdAndDelete(id);
    return result;
  }
}
