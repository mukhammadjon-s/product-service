import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BaseService } from '../base.service';
import {
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
import { Category, CategoryModel } from '../schemas/category.schema';
import { jsonToStructProto } from '../../shared/utils';

@Injectable()
export class CharacteristicGroupService extends BaseService<
  Product | Characteristic | CharacteristicGroup
> {
  constructor(
    @InjectModel(Characteristic.name)
    private characteristic: CharacteristicModel,
    @InjectModel(CharacteristicGroup.name)
    private characteristicGroupModel: CharacteristicGroupModel,
    @InjectModel(Product.name) private productModel: ProductModel,
    @InjectModel(Category.name)
    private categoryModel: CategoryModel,
  ) {
    super();
  }

  async getAll(query: any, lang: LanguageTypes = 'ru') {
    // console.log(
    //   JSON.stringify(
    //     jsonToStructProto({
    //       uz: {
    //         name: 'ssavdasd',
    //       },
    //       ru: {
    //         name: 'ssavdasd',
    //       },
    //       en: {
    //         name: 'ssavdasd',
    //       },
    //     }),
    //   ),
    // );
    const relations = ['categories', 'products', 'characteristics'];
    const projection = relations
      .filter((key) => !query[key])
      .reduce((a, b) => ({ ...a, [b]: false }), {});

    const data = await this.characteristicGroupModel.findTranslated(
      query.where,
      projection,
      {
        lang,
        populate: relations,
      },
    );
    const newData = data?.map((r) => {
      const a = this.cleanProductAll(r);
      return {
        ...a,
        ...a.translation[lang],
        translation: jsonToStructProto(a.translation),
      };
    });
    return newData;
  }

  async get(query: any, lang: LanguageTypes = 'ru') {
    const relations = ['categories', 'products', 'characteristics'];
    const projection = relations
      .filter((key) => !query[key])
      .reduce((a, b) => ({ ...a, [b]: false }), {});
    const data = await this.characteristicGroupModel.findByIdTranslated(
      query.where.id,
      projection,
      {
        lang,
        populate: relations,
      },
    );
    const a = this.cleanProductOne(data);
    // console.log(a);
    return {
      data: {
        ...a,
        ...a.translation[lang],
        translation: jsonToStructProto(a.translation),
        id: a._id,
      },
    };
  }

  async addNew(data, lang: LanguageTypes = 'ru') {
    let categories = undefined;
    let products = undefined;
    let characteristics = undefined;
    const populate = [];
    if (Array.isArray(data.categories) && data.categories.length) {
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
    if (Array.isArray(data.products) && data.products.length) {
      products = await Promise.all(
        data.products
          .map(this.translationMapper.bind(this))
          .map(
            this.connect.bind(
              this,
              this.productModel,
            ),
          ),
      );
      populate.push('products');
    }
    if (Array.isArray(data.characteristics) && data.characteristics.length) {
      characteristics = await Promise.all(
        data.characteristics
          .map(this.translationMapper.bind(this))
          .map(
            this.connect.bind(
              this,
              this.characteristic,
            ),
          ),
      );
      populate.push('characteristics');
    }
    const result = await this.characteristicGroupModel.create({
      ...data,
      categories,
      products,
      characteristics,
      translation: this.formatTranslation(data.translation),
    });
    if (populate.length) {
      await result.populate(populate);
    }
    await this.sync(result);
    const data1 = await this.serelize(this.cleanProductOne(result));
    let t = {};
    try {
      t = { ...data1?.translation[lang] };
    } catch (e) {}
    return {
      data: {
        ...data1,
        id: data1._id,
        ...t,
        translation: jsonToStructProto(data1?.translation),
      },
    };
  }

  async update(data: any) {
    const result = await this.characteristicGroupModel.findByIdAndUpdate(
      data.id,
      { ...data },
      {
        projection: {
          products: false,
          characteristics: false,
          categories: false,
        },
      },
    );
    return { data: result };
  }

  async delete({ id }: DeleteProductRequest) {
    const result = await this.characteristicGroupModel.findByIdAndDelete(id);
    return result;
  }
}
