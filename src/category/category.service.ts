import { VariantValue } from 'src/schemas/variantValues.schema';
import { VariantField } from '../schemas/variantFields.schema';
import { GetCategoryRequest } from 'build/proto/product';
import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Category, CategoryModel } from '../schemas/category.schema';
import { StatusCategory } from '../schemas/category.schema';
import { BaseService } from 'src/base.service';
import { ClientGrpc, RpcException } from '@nestjs/microservices';
import { getField, jsonToStructProto } from '../../shared/utils';
import * as _ from 'lodash';
import { paginate, RegexSlug, Transliterate } from '../../shared/helper';
import grpc from "grpc";
import { GRPC_IMPORT_PACKAGE } from '../../shared/utils/constants';
import { lastValueFrom } from 'rxjs';
import { VariantService } from '../variant/variant.service';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ObjectId = require('mongoose').Types.ObjectId;

@Injectable()
export class CategoryService extends BaseService<
  Category | VariantField | VariantValue
  > {
  private importService: any;

  tree(data: any, parentId = null) {
    return _.reduce(
      data,
      (r, e) => {
        if (parentId == e?.parentId) {
          const o = _.clone(e);
          const children = this.tree(data, e?.id);
          if (children.length) o.children = children;
          r.push(o);
        }
        return r;
      },
      [],
    );
  }

  private categoryStatus = {
    0: StatusCategory.ACTIVE,
    1: StatusCategory.INACTIVE,
    '-1': StatusCategory.ACTIVE,
  };

  constructor(
    @InjectModel(Category.name) private categoryModel: CategoryModel,
    @Inject(GRPC_IMPORT_PACKAGE) private client: ClientGrpc,
    private readonly variantService: VariantService,
  ) {
    super();
  }


  onModuleInit() {
    this.importService =
      this.client.getService<any>('BillzService');
  }

  async getTree(lang: LanguageTypes = 'ru') {
    let data: any[] = await this.categoryModel.find(
      {
        status: StatusCategory.ACTIVE,
      },
      {},
      {
        lang,
        populate: [],
      },
    ).sort({rating:'asc'});
    data = data.map((r) => {
      let t: any = {};
      try {
        t = r.translation[lang];
        t.name = r.translation[lang].name
      } catch (e) {}
      delete r?._doc?.__v;
      // delete r?._doc?.translation;
      const result = {
        ...getField(r, '_doc'),
        ...t,
        id: r.id + '',
        updatedAt: r.updatedAt + '',
        createdAt: r.createdAt + '',
        parentId:
          r?.parentId === null || r?.parentId === undefined || r?.parentId == ''
            ? null
            : r?.parentId,
        _id: undefined,
      };
      delete result?._id;
      delete result?.translation;
      return result;
    });
    return {
      data: jsonToStructProto(this.tree(data)),
    };
  }
  async getAll(query: any, lang = 'ru') {
    const where = {
      ...query.where,
      status: this.categoryStatus[query?.where?.status],
    };
    if (!where.status) {
      delete where.status;
    }

    const data = await paginate(
      this.categoryModel.find(where).sort({rating:'asc'}),
      this.categoryModel.find(where).sort({rating:'asc'}),
      query.page,
      query.pagesize,
    );
    return {
      ...data,
      data: data.data.map((r) => {
        const a = getField(r, '_doc');
        let t = {};
        try {
          t = a.translation[lang];
        } catch (e) {
          t = {};
        }
        return {
          ...a,
          id: a._id,
          ...t,
          // slug: a.slug,
          translation: undefined,
        };
      }),
    };
  }

  async get({ id, ...query }: GetCategoryRequest, lang = 'ru') {
    const relations = [];
    const projection = relations
      .filter((key) => !query[key])
      .reduce((a, b) => ({ ...a, [b]: false }), {});
    // mongoose.t;
    // console.log(ObjectId.isValid(id));
    const condition = ObjectId.isValid(id)
      ? { _id: ObjectId(id) }
      : { slug: id };

    const data = await this.categoryModel.findOne(condition, projection, {
      lang,
      populate: relations,
    });

    if (!data) {
      return null;
    }
    let t = {};
    try {
      t = getField(data, '_doc').translation[lang];
    } catch (e) {
      t = {};
    }
    return {
      id: getField(data, '_id'),
      ...getField(data, '_doc'),
      ...t,
      translation: jsonToStructProto(data.translation),
    };
  }

  async addNew(data?: any) {
    if (data.parentId) {
      const parent = await this.categoryModel.findById(data.parentId);
      if (!parent) {
        return { errors: ['Invalid parentId'] };
      }
    }
    const status = this.categoryStatus[data.status];
    const result = await Promise.all([
      this.categoryModel.create({
        ...data,
        status,
        translation: this.formatTranslation(data.translation),
      }),
    ]).catch((e) => {
      throw new RpcException(e.message);
    });
    await this.serelize(result);
    return { data: result[0] };
  }

  async update(category: any, lang: LanguageTypes = 'ru') {
    if (category.parentId) {
      const parent = await this.categoryModel.findById(category.parentId);
      if (!parent) {
        return { errors: ['Invalid parentId'] };
      }
    }
    const a = this.translationMapper(category);
    let translate: any = {};
    try {
      translate = this.formatTranslation(a.translation)[lang];
    } catch (e) {}
    let slug = await this.generateSlug(translate.name);
    const response = await this.categoryModel
      .findByIdAndUpdate(
        category.id,
        {
          ...a,
          translation: this.formatTranslation(a.translation),
          status: this.categoryStatus[a.status],
          ...translate,
          slug
        },
        {
          new: true,
        },
      )
      .catch((e) => {
        throw new RpcException(e.message);
      });
    await this.variantService.updateVariantGroupByCategories(category.id);
    return {
      data: response,
    };
  }

  async updateStatus(id: string, status: string) {
    const data = await this.categoryModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .catch((e) => {
        throw new RpcException(e.message);
      });
    return { data };
  }

  async delete(id: string) {
    try {
      // await lastValueFrom(this.importService.GetProducts({}))
      // this.variantService.syncAllVariantGroup()
      const category1 = await this.categoryModel.findById(id).catch((e) => {
        throw new RpcException(e.message);
      });
      let ids = [category1.id];
      async function getIds(id, categoryModel) {
        const category = await categoryModel.find({ parentId: id }, { id: 1 });
        const arrays = category
          ?.filter((r) => {
            let id = null;
            try {
              id = r._id.toString();
            } catch (e) {}
            return id;
          })
          .map((e) => e._id.toString());
        ids = [...ids, ...arrays];
        await Promise.all(category?.map((r) => getIds(r._id, categoryModel)));
      }
      await getIds(id, this.categoryModel);
      const result = await this.categoryModel.deleteMany({
        _id: {
          $in: ids,
        },
      });
      await this.variantService.updateVariantGroupByCategories(category1.id);

      return { result: result?.deletedCount };
    } catch (e) {
      throw new RpcException(e.message);
    }
  }

  async getOneByName(name: string, lang?: string) {
    let defaultLanguage = lang || 'ru';
    const data = await this.categoryModel.findOne({"translation.ru.name": name}).catch((error) => {
      throw new RpcException({
        code: grpc.status.NOT_FOUND,
        message: error.message,
      });
    });

    return { data };
  }

  async getChildCategories(name: string, lang?: string) {
    let defaultLanguage = lang || 'ru';
    const data = await this.categoryModel.findOne({"translation.ru.name": name}).catch((error) => {
      throw new RpcException({
        code: grpc.status.NOT_FOUND,
        message: error.message,
      });
    });

    const childCategories = await this.categoryModel.find({
      parentId: data?._id
    })

    const childIds = childCategories.map((item) => item._id) || [];

    return { data: childIds };
  }

  async generateSlug(slug) {
    let newSlug = slug.replace(/\s+/g, "-").toLowerCase();
    newSlug = RegexSlug(Transliterate(newSlug));
    let counter = 0;

    const checkSlug = async (searchSlug, searchCounter) => {
      const element = await this.categoryModel.findOne({ slug: counter > 0 ? `${searchSlug}-${searchCounter}` : searchSlug });
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
