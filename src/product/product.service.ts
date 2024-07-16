import { Inject, Injectable } from '@nestjs/common';
import { ClientGrpc, RpcException } from '@nestjs/microservices';
import { InjectModel }                                    from '@nestjs/mongoose';
import * as _                                             from 'lodash';

import {
  CreateProductRequest,
  CreateProductBrandRequest,
  CreateProductCategoriesRequest,
  CreateProductVariantsRequest,
  CreateProductCharacteristicRequest,
  GetAllProductsRequest,
  GetOneProductRequest,
  DeleteProductRequest,
  UpdateProductRequest,
  GetProductDetails,
} from 'build/proto/product';
import { BaseService }                                    from 'src/base.service';
import { Brand, BrandModel }                              from 'src/schemas/brand.schema';
import { Category, CategoryModel }                        from 'src/schemas/category.schema';
import { Characteristic, CharacteristicModel }            from 'src/schemas/characteristic.schema';
import { Product, ProductModel, ProductStatus }           from 'src/schemas/product.schema';
import { Variant, VariantModel }                          from 'src/schemas/variant.schema';
import { getField, jsonToStructProto, structProtoToJson } from '../../shared/utils';
import { VariantField, VariantFieldModel }                from '../schemas/variantFields.schema';
import { paginate }                                       from '../../shared/helper';
import { VariantGroup, VariantGroupModel }                from 'src/schemas/variantGroup.schema';
import { HookService }                                    from 'src/hooks/hooks.service';
import { ObjectId } from 'mongodb';
import grpc from "grpc";
import { lastValueFrom } from 'rxjs';
import { CompanyControllerInterface } from '../interfaces/company.interface';
import { GRPC_COMPANY_PACKAGE, GRPC_ORDER_PACKAGE, sizesValues } from '../../shared/utils/constants';
import { OrderControllerInterface } from '../interfaces/cart.interface';


@Injectable()
export class ProductService extends BaseService<
  Product | Brand | Category | Variant
> {
  private productStatus = {
    0: ProductStatus.ACTIVE,
    1: ProductStatus.INACTIVE,
    2: ProductStatus.PENDING,
    3: ProductStatus.ARCHIVED,
    '-1': ProductStatus.ACTIVE,
  };
  private companyService: CompanyControllerInterface;
  private cartService: OrderControllerInterface;

  constructor(
    @InjectModel(Product.name)
    private productModel: ProductModel,
    @InjectModel(Brand.name)
    private brandModel: BrandModel,
    @InjectModel(Category.name)
    private categoryModel: CategoryModel,
    @InjectModel(Variant.name)
    private variantModel: VariantModel,
    @InjectModel(Characteristic.name)
    private characteristicModel: CharacteristicModel,
    @InjectModel(VariantField.name)
    private variantField: VariantFieldModel,
    @InjectModel(VariantGroup.name)
    private variantGroupModel: VariantGroupModel,
    private readonly hookService: HookService,
    @Inject(GRPC_COMPANY_PACKAGE) private companyClient: ClientGrpc,
    @Inject(GRPC_ORDER_PACKAGE) private cart: ClientGrpc
  ) {
    super();
  }

  onModuleInit() {
    this.companyService =
      this.companyClient.getService<CompanyControllerInterface>('CompanyService');
    this.cartService =
      this.cart.getService<OrderControllerInterface>('CartService');
  }

  async getAll(query: GetAllProductsRequest, lang: LanguageTypes = 'ru') {
    // const relations = ['brandId', 'categories', 'characteristics'];
    const relations = ['categories', 'characteristics'];
    const projection = relations
      .filter((key) => !query[key])
      .reduce((a, b) => ({ ...a, [b]: false }), {});
    const where = {
      ...query.where,
      status: this.productStatus[query?.where?.status],
    };
    if (!where.status) {
      delete where.status;
    }
    const data = await paginate(
      this.productModel.find(where, projection).populate([
        // {
        //   path: 'brandId',
        // },
        {
          path: 'categories',
        },
        {
          path: 'variants',
        },
        {
          path: 'characteristics',
        },
      ]),
      this.productModel.find(where, projection),
      query.page,
      query.pagesize,
    ).catch((e) => {
      throw new RpcException(e.message);
    });
    let t = {};
    const newData = await Promise.all(
      data?.data?.map(async (r) => {
        let variantFields = [];
        if (r.variants?.length > 0) {
          await Promise.all(
            r.variants.map(async (r) => {
              const vv = r?.variantValues;
              if (vv?.length > 0) {
                vv.map((item) => {
                  // let id = '';
                  // try {
                  //   id = item.variantField
                  //     ?.toString()
                  //     .replace(/new ObjectId\("(.*)"\)/, '$1');
                  // } catch (e) {}
                  t = {};
                  try {
                    t = item.translation[lang];
                  } catch (e) { }
                  // variantFields.push({
                  //   id,
                  //   values: vv.map((r) => {
                  //     t = {};
                  //     let ids = [];
                  //     try {
                  //       ids = getField(getField(r, '_doc'), 'variants').map(
                  //         (r) => {
                  //           return r._id
                  //             ?.toString()
                  //             .replace(/new ObjectId\("(.*)"\)/, '$1');
                  //         },
                  //       );
                  //       t = r.translation[lang];
                  //     } catch (e) {}
                  //     return {
                  //       variantIds: ids || [],
                  //       id: getField(r, 'id'),
                  //       ...t,
                  //     };
                  //   }),
                  // });
                });
              }
              delete r.categories;

              variantFields = _.uniqBy(variantFields, (r) => r.id);
              variantFields = await Promise.all(
                variantFields.map(async (r) => {
                  const asd = await this.variantField.findById(r.id);
                  t = {};
                  try {
                    t = asd.translation[lang];
                  } catch (e) { }
                  return {
                    ...getField(asd, '_doc'),
                    translation: undefined,
                    categories: undefined,
                    variantValues: undefined,
                    _id: undefined,
                    ...r,
                    ...t,
                  };
                }),
              );
              return r;
            }),
          );
        }
        t = {};
        try {
          t = r.translation[lang];
        } catch (e) { }
        return {
          ...getField(r, '_doc'),
          id: getField(r, '_id'),
          variants: undefined,
          translation: undefined,
          variantFields: jsonToStructProto(variantFields),
          ...t,
        };
      }),
    );
    return { ...data, data: newData };
  }

  async get(
    { id, ...query }: GetOneProductRequest,
    lang: LanguageTypes = 'ru',
  ) {
    try {
      const relations = ['characteristics'];
      const projection = relations
        .filter((key) => !query[key])
        .reduce((a, b) => ({ ...a, [b]: false }), {});

      const storageDocument = await this.productModel
        .findById(id, projection)
        .populate([
          { path: 'variants' },
          { path: 'characteristics' },
          { path: 'categories', select: ['id'] },
        ])
        .catch((error) => {
          throw new RpcException(error.message)
        })
      if (!storageDocument) {
        throw new RpcException('Product not found');
      }

      const product = getField(storageDocument, '_doc')

      const variants = await this.variantModel.find({ productId: id });
      const group = await this.variantGroupModel.findOne({ productId: id });

      const formattedVariants = variants.map((variant) => {
        const values = variant.values
        const defaultTranslation = { uz: [], ru: [], en: [] }

        return {
          ...getField(variant, "_doc"),
          id: variant.id,
          values: {
            ...values,
            translation: values?.translation || defaultTranslation
          }
        }
      })

      const translation = product.translation?.[lang] || null
      if (!translation) {
        throw new RpcException('Product translation does not exist');
      }

      return {
        data: {
          brandId: `${ product.brand }`,
          ...product,
          id: product?._id,
          categoryId: product?.category ? product.category?.toString() : '',
          translation: product?.translation,
          variants: formattedVariants,
          group,
          ...translation,
        },
      }
    }
    catch (e) {
      throw new RpcException({
        message: e.message,
        error: e.message,
      })
    }
  }

  async details({ id: slug }: GetOneProductRequest, lang = 'ru'): Promise<GetProductDetails> {
    let groupedVariantGroups = [];
    const variantGroup = await this.variantGroupModel.findOne({ slug })
    const product = await this.productModel.findById(variantGroup.productId).populate(['brand', 'category', 'categories']);
    let companyInfo: any = await lastValueFrom(this.companyService.GetOne({id: product?.companyId})).catch((e) => {
      throw new RpcException(e.message);
    });
    const variantGroups = await this.variantGroupModel.find({ productId: variantGroup.productId }).populate('variants');
    const images = variantGroups.map(variantGroup => (
      variantGroup.images?.map(({ image }) => ({
        url: image,
        variantGroupId: variantGroup.id,
      }))
    )).flatMap(x => x).filter(x => !!x)
    groupedVariantGroups = variantGroups.map((variantGroupItem: any) => {
      variantGroupItem.variants.forEach((item: any) => {
        item._doc.filteredValue = Number(item?.values?.translation?.ru[1].value) ? +item?.values?.translation?.ru[1].value : sizesValues[item?.values?.translation?.ru[1].value];
      })
      let newValues = variantGroupItem.variants.sort((a,b) => (a?._doc?.filteredValue - b?._doc?.filteredValue))
      return {
        field: variantGroupItem.field,
        value: variantGroupItem.value,
        variantGroupId: variantGroupItem._id,
        variantGroupSlug: variantGroupItem.slug,
        sku: variantGroupItem.sku,
        variants: newValues.map((variantItem: any) => {
          return {
            id: variantItem._id,
            groupId: variantItem.variantGroupId,
            price: variantItem.price,
            priceWithDiscount: variantGroupItem?.discountAmount > 0 ? variantItem.price - variantGroupItem?.discountAmount : null,
            quantity: variantItem.warehouses[0].quantity,
            weight: variantItem.weight,
            value: variantItem.values.translation.ru[1].value,
          }
        }),
        discountAmount: variantGroupItem?.discountAmount || 0
      }
    })

     let categories: any = product?.categories.map((item: any) => {
       return {
         ...item['_doc'],
         name: item?.translation[lang]?.name,
         id: item?._id
       }
     })
    return {
      images,
      variantGroupId: `${variantGroup['_id']}`,
      variants: groupedVariantGroups,
      product: {
        ...product['_doc'],
        id: `${product['_id']}`,
        categoryId: `${product.category['_id']}`,
        name: product.translation[lang]?.name,
        companyName: companyInfo?.company?.legalName,
        categories,
        category: {
          id: product.category['_id'],
          status: product.status,
          image: product.category.image,
          name: product.category.translation[lang]?.name,
          slug: product.category.slug,
        },
        description: product.translation[lang]?.description,
        content: product.translation[lang]?.content,
        brand: {
          id: `${product.brand['_id']}`,
          status: product.brand.status,
          image: product.brand.image,
          name: product.brand.translation[lang]?.name,
          description: product.brand.translation[lang]?.description,
          slug: product.brand.slug
        }
      }
    }
  }

  async create(data: CreateProductRequest, lang = 'ru') {
    // console.log('[ProductMicroservice]', data);
    const status = this.productStatus[data.status];
    const populate = [];
    if (data.brandId) {
      await this.connectF(
        this.brandModel,
        'products:=',
        data.brandId,
      )
      populate.push('brand');
    }
    if (Array.isArray(data.categories) && data.categories.length > 0) {
      await Promise.all(
        data.categories
          // .map(this.translationMapper.bind(this))
          .map((e) => {
            this.connectF.bind(
              e,
              this.categoryModel,
            );
          }),
      )
      populate.push('categories');
    }
    if (Array.isArray(data.variants) && data.variants.length) {
      await Promise.all(
        data.variants.map((e) => {
          this.connectF.bind(
            e,
            this.variantModel,
          );
        }),
      );
      populate.push('variants');
    }
    if (Array.isArray(data.characteristics) && data.characteristics.length) {
      await Promise.all(
        data.characteristics.map((e) => {
          this.connectF.bind(
            e,
            this.characteristicModel,
            'product:-',
          );
        }),
      );
      populate.push('characteristics');
    }
    const result = await this.productModel
      .create({
        category: data.categoryId,
        brand: data.brandId,
        ...data,
        status,
        isPublished:  data.productType === 'manual' ? true : false,
        translation: data.translation[lang]?.name ? data.translation : this.formatTranslation(data.translation),
      })
      .catch((e) => {
        throw new RpcException(e.message);
      });
    if (populate.length) {
      await result.populate(populate);
    }

    // create variant group
    // await this.variantGroupModel.create({
    //   productId: result._id,
    //   variants: result.variants || [],
    // });

    await this.sync(result);
    await this.hookService.syncProduct({ productId: `${result._id}` });
    await this.syncVariantGroup(`${result._id}`)
    const data1 = await this.serelize(this.cleanProductOne(result));
    let t = {};
    try {
      t = data1.translation[lang];
    } catch (e) { }

    return {
      data: {
        ...data1,
        id: data1._id,
        brandId: data.brandId,
        translation: data.translation,
        ...t,
      },
    };
  }

  async delete({ id }: DeleteProductRequest): Promise<any> {
    try {
      const result = await this.productModel.findById(id);
      if (result) {
        let variantsByProduct = await this.variantModel.find({productId: id})
        let variantsIds = variantsByProduct?.map((item) => item?._id);
        await lastValueFrom(this.cartService.DeleteVariantFromCard({variantsIds}))
        // we are not using model pre, post callbacks as they are anti-intitutive as to know whats the flow.
        await this.variantModel.deleteMany({
          productId: id,
        });
        await this.variantGroupModel.deleteMany({
          productId: id,
        });
        await this.productModel.findByIdAndDelete(id);
        await this.hookService.deleteProduct(id);
        await this.hookService.deleteVariantGroupByProduct(id);
        await this.hookService.deleteVariantByProduct(id);
        return { acknowledged: true, deletedCount: 1 };
      } else {
        return { acknowledged: true, deletedCount: 0 };
      }
    } catch (e) {
      console.log(e);
      return { acknowledged: false, deletedCount: 0 };
    }
  }

  async update(data: UpdateProductRequest) {
    try {
      const status = this.productStatus[data.status];
      if (data.translation) {
        data.translation = structProtoToJson(data.translation || {});
      }
      if (data.brandId) {
        await this.connectF(
          this.brandModel,
          'products:=',
          data.brandId,
        ).catch((e) => {
          throw new RpcException(e.message);
        });
      }
      if (Array.isArray(data.categories) && data.categories.length) {
        await Promise.all(
          data.categories
            // .map(this.translationMapper.bind(this))
            .map((e) => {
              this.connectF.bind(
                e,
                this.categoryModel,
              );
            }),
        ).catch((e) => {
          throw new RpcException(e.message);
        });
      }
      if (Array.isArray(data.variants) && data.variants.length) {
        await Promise.all(
          data.variants.map((e) => {
            this.connectF.bind(
              e,
              this.variantModel,
              'product:-',
            );
          }),
        ).catch((e) => {
          throw new RpcException(e.message);
        });
      }
      if (Array.isArray(data.characteristics) && data.characteristics.length) {
        await Promise.all(
          data.characteristics.map((e) => {
            this.connectF.bind(
              e,
              this.characteristicModel,
              'product:-',
            );
          }),
        ).catch((e) => {
          throw new RpcException(e.message);
        });
      }

      const updates = {
        brand: data.brandId,
        category: data.categoryId,
        ...data,
        status,
      }

      await this.productModel
        .findByIdAndUpdate(
          data.id,
          updates,
          {
            projection: {
              brand: false,
              categories: false,
              characteristics: false,
            },
          },
        )
        .catch((e) => {
          throw new RpcException(e.message);
        });

      const result = await this.productModel.findById(data.id, {
        brand: false,
        categories: false,
        characteristics: false })

      if (!result) {
        throw new RpcException(`Cannot update product, updating: "${JSON.stringify(updates)}"`);
      }
      await this.checkProductPublished(result.id);
      await this.hookService.syncProduct({ productId: `${result._id}` });
      await this.syncVariantGroup(`${result._id}`)

      return {
        data: {
          ...getField(result, '_doc'),
          id: result._id,
          translation: jsonToStructProto(result.translation),
        },
      };
    } catch (e) {
      throw new RpcException(e.message);
    }
  }

  async syncVariantGroup(productId: string) {
    const variantGroups = await this.variantGroupModel.find({ productId })
    for (const variantGroup of variantGroups) {
      await this.hookService.syncVariantGroup({ variantId: `${variantGroup?.['_id']}` })
      for (const variant of variantGroup.variants) {
        await this.hookService.syncVariant({variantId: variant['_id'].toString(), variantGroupId: variantGroup._id.toString()})
      }
    }
  }

  private getVairantFields(variantGroups, lang = 'ru') {
    const variants = variantGroups.map(variantGroup => variantGroup.variants.map(variant => {
            return { ...variant.toJSON(), variantGroupId: variantGroup._id}
          })).flatMap(x => x)

    const result: {
      [key: string]: {
        name: string
        slug: string
        ord: number
        type: string
        values: {
          value: string
          rating?: number
          variantGroupId: string
          variantIds: string[]
        }[]
      }
    } = {}

    for (const vriant of variants) {
      if (Array.isArray(vriant.values.translation[lang])) {
        for (const valueIndex in vriant.values.translation[lang]) {
          const value = vriant.values.translation[lang][valueIndex] || {}
          if (result[value.slug]) {
            const exists = result[value.slug].values.find((val) => val.value === value.value)
            if (exists) {
              exists.variantIds.push(vriant['_id'])
            } else {
              let item: any = {
                value: value.value,
                variantGroupId: vriant.variantGroupId,
                variantIds: [vriant['_id']]
              }
              if (value.slug === 'size') item.rating = vriant.rating || 0
              result[value.slug].values.push(item)
            }
          } else if (value.value) {
            result[value.slug] = {
              name: value.field,
              slug: value.slug,
              ord: Object.keys(result).length + 1,
              type: typeof value.value,
              values: [{
                value: value.value,
                rating: vriant.rating || 0,
                variantGroupId: vriant.variantGroupId,
                variantIds: [vriant['_id']]
              }]
            }
            if (value.slug !== 'size') delete result[value.slug].values[0].rating
          }
        }
      }
    }

    return Object.keys(result).map(key => result[key])
  }

  async getProductsByIds({productIds}) {
    let products;

    if (productIds) {
      products = await this.productModel.aggregate([
        {
          $match : {
            _id: {
              $in: productIds.map(v => new ObjectId(v))
            }
          }
        }])
    }

    return {products}
  }

  async getProductById({productId}) {
    let products;

    if (productId) {
      products = await this.productModel.findOne({_id: productId})
    }

    return {products}
  }

  async getProductByBillzId(billzId) {
      let product: any = await this.productModel.findOne({
        billzIds: {$in: billzId}
      })

    if (product) {
      product._doc.categories = product?._doc?.categories.map((item) => {
        return {
          id: item?._id
        }
      })
    }

      return {product}
    }

 async checkProductPublished(productId) {
    const product: any = await this.productModel.findOne({_id: new ObjectId(productId)});
    const variantGroups: any = await this.variantGroupModel.find({productId: new ObjectId(productId)});

    if (!variantGroups || variantGroups?.length === 0) {
      return false
    }
    let isPublished = [];
    let isValidCategory = !!product?._doc?.category;
   if (product?._doc?.category) {
     const category: any = await this.categoryModel.findOne({_id: new ObjectId(product?._doc?.category)});
     if (category._doc.translation['ru'].name === 'Нет категории') {
       isValidCategory = false;
     }
   }

   variantGroups.forEach((item) => {
     item?._doc?.images?.length > 0  ? isPublished.push(true) : isPublished.push(false)
   })


   if (isPublished.includes(false) || isValidCategory === false) {
      await this.productModel.updateOne({_id: variantGroups[0].productId}, {isPublished: false})
   } else if (!isPublished.includes(false) && isValidCategory === true) {
     await this.productModel.updateOne({_id: variantGroups[0].productId}, {isPublished: true})
   }
 }

 async getProductsByName(name, companyId?) {
    let filter = companyId ? {companyId} : {}
   const products = await this.productModel.find({"translation.ru.name": { $regex: `(?i)${name}` }, ...filter}).catch((error) => {
     throw new RpcException({
       code: grpc.status.NOT_FOUND,
       message: error.message,
     });
   });

   return { products };
 }
}
