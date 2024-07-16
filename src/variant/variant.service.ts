import { Inject, Injectable } from '@nestjs/common';
import { ClientGrpc, RpcException } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import {
  AddVPReq,
  GetAllVariantReq,
  GetAllVariantsReq,
  GetProductByVariantIdReq,
  GetProductVariantReq, GetVariantGroupByIdRequest,
  GetVariantGroupRequest,
  GetVGReq,
  UpdateVPReq,
  VariantCreate,
  VariantGroupsSetImageRequest,
  VariantValuesWithMultipleSizes,
  variantValues
} from 'build/proto/product';
import { BaseService } from 'src/base.service';
import { Product, ProductModel } from 'src/schemas/product.schema';
import { VariantValue, VariantValueModel } from 'src/schemas/variantValues.schema';
import { Variant, VariantModel, VariantStatus } from '../schemas/variant.schema';
import { VariantField, VariantFieldModel } from '../schemas/variantFields.schema';
import { getField } from '../../shared/utils';
import { makeId, paginate } from '../../shared/helper';
import { VariantGroup, VariantGroupModel } from '../schemas/variantGroup.schema';
import { HookService } from 'src/hooks/hooks.service';
import { ObjectId } from 'mongodb';
import { DistrictControllerInterface } from '../district/interfaces/district.interfaces';
import { GRPC_HELPER_PACKAGE, GRPC_ORDER_PACKAGE, sizes } from '../../shared/utils/constants';
import { lastValueFrom } from 'rxjs';
import { PvzControllerInterface } from '../pvz/interfaces/pvz.interface';
import { DeliveryType } from '../../shared/utils/enum';
import { ProductService } from '../product/product.service';
import { Category, CategoryModel } from '../schemas/category.schema';
import { OrderControllerInterface } from '../interfaces/cart.interface';
import { PublishDto } from './interfaces/variant.interface';
import { setTimeout } from "timers/promises";

@Injectable()
export class VariantService extends BaseService<
  Variant | Product | VariantValue
  > {
  private variantStatus = {
    0: VariantStatus.ACTIVE,
    1: VariantStatus.INACTIVE,
    '-1': VariantStatus.ACTIVE,
  };
  private districtService: DistrictControllerInterface;
  private pvzService: PvzControllerInterface;
  private cartService: OrderControllerInterface;

  constructor(
    @InjectModel(Product.name)
    private productModel: ProductModel,
    @InjectModel(Variant.name)
    private variantModel: VariantModel,
    @InjectModel(VariantField.name)
    private variantFieldModel: VariantFieldModel,
    @InjectModel(VariantValue.name)
    private variantValueModel: VariantValueModel,
    @InjectModel(VariantGroup.name)
    private variantGroupModel: VariantGroupModel,
    @InjectModel(Category.name)
    private categoryModel: CategoryModel,
    private readonly hookService: HookService,
    private readonly productService: ProductService,
    @Inject(GRPC_HELPER_PACKAGE) private helper: ClientGrpc,
    @Inject(GRPC_ORDER_PACKAGE) private cart: ClientGrpc
  ) {
    super();
  }

  onModuleInit() {
    this.districtService =
      this.helper.getService<DistrictControllerInterface>('DistrictController');
    this.pvzService =
      this.helper.getService<PvzControllerInterface>('PvzController');
    this.cartService =
      this.cart.getService<OrderControllerInterface>('CartService');
  }

  // Example usage: Admin frontEnd > CreateProduct > LastStep
  // Returns all grouped variants for the product
  async getVariantGroups({ productId }: GetVGReq) {
    // Groups are collection of variants by 'color' field
    const groups = await this.variantGroupModel
      .aggregate([
        {
          $match : { productId: new ObjectId(productId)},
        },
        {
          $lookup: {
            from: 'variants',
            localField: '_id',
            foreignField: 'variantGroupId',
            as: 'variants',
          },
        },])

    if (Array.isArray(groups)) {
      // TODO: Handle multilanguage
      // We use ru as default
      const data = groups.map((group) => ({
        id: group._id,
        color:
          group.variants[0]?.values?.translation?.['ru']?.find(
            ({ field }) => field === 'color',
          )?.['value'] || '',
        sku: group.sku,
        sizes: group.variants
          .map(({ values }) =>
            values.translation['ru']?.map?.(({ field, value }) =>
              field === 'size' ? value : '',
            ),
          )
          .flatMap((a) => a)
          .filter((a) => !!a),
        photos: group.images?.map?.(({ image }) => image) || [],
      }));
      return { data };
    }
    return [];
  }

  // We can delete and update images of the group
  async setVariantGroupImages({
                                photos,
                                sku,
                                groupId,
                              }: VariantGroupsSetImageRequest) {
    const group: any = await this.variantGroupModel.findById(groupId);
    if (group) {
      if (Array.isArray(photos)) {
        group.images = photos.map((image, index) => ({
          image,
          id: `${Date.now() * (index + 1)}`,
        }));
        if (photos?.length === 1 && photos[0] === "") {
          group.images = [];
        }
      }
      const parsedSku = Number.parseInt(sku);
      if (sku && !Number.isNaN(parsedSku)) {
        group.sku = parsedSku;
      }
      await group.save();
      await this.hookService.syncVariantGroup({variantId: groupId})
      for (const item of group.variants) {
        await this.hookService.syncVariant({variantId: item._id.toString(), variantGroupId: group._id.toString()})
      }
      await this.hookService.syncProduct({ productId: `${group.productId}` });
      return this.getVariantGroups({ productId: `${group.productId}` });
    }
    throw new RpcException(`No variant group found with id: ${groupId}`);
  }

  async getVariantGroupByProductId(data: GetVGReq) {
    const variant: any = await this.variantGroupModel
      .find({
        productId: data.productId,
      })
    return { data: variant };
  }

  async getVariantGroupsByProductIds({productIds}) {
    let variantGroups;

    if (productIds) {
       variantGroups = await this.variantGroupModel
        .aggregate([
          {
            $match : {
              productId: {
                $in: productIds.map(v => new ObjectId(v))
              }
            }
          }])
    }

    return {variantGroups}
  }

  async getVariantGroupBySlug(data: GetVariantGroupRequest) {
    const variant: any = await this.variantGroupModel
      .findOne({
        slug: data.slug,
      }).populate(["variants","productId","productId.categories"])
    return { data: variant };
  }

  async getVariantGroupById(data: GetVariantGroupByIdRequest) {
    const variant: any = await this.variantGroupModel
      .findOne({
        _id: data.id,
      }).populate(["variants","productId","productId.categories"])
    return { data: variant };
  }

  async getVariantGroupByProduct(data: GetVGReq) {
    const variant: any = await this.variantGroupModel
      .find({
        productId: data.productId,
      })
    return { data: variant };
  }

  async addImage(data: AddVPReq) {
    const variant: any = await this.variantGroupModel.findById(data.productId);
    let photos: any[] = variant?.images || [];
    photos = [...photos, {id:makeId(),image:data.image}];
    variant.images = photos;
    await variant.save();
    return { data: variant };
  }

  async updateImage(data: UpdateVPReq) {
    const variant: any = await this.variantGroupModel.findById(data.productId);

    variant.images=data.images;
    if (data.sku) {
      variant.sku=data.sku;
    }
    await variant.save()
    return { data: variant };
  }

  // async removeImage(data: DelVPReq) {
  //   const variant: any = await this.variantModel.findById(data.productId);
  //   let photos: any[] = variant?.variantPhotos || [];
  //   photos = photos.filter((r) => {
  //     return r.id !== data.id;
  //   });
  //   const data1 = await this.variantModel.findByIdAndUpdate(
  //     data.productId,
  //     {
  //       variantPhotos: photos,
  //     },
  //     { new: true },
  //   );
  //   return { data: data1 };
  // }

  async getProduct({ id }: GetProductByVariantIdReq) {
    try {
      const variant: any = await this.variantModel
        .findById(id)
        .catch((error) => {
          throw new RpcException(error.message);
        });
      const data1 = await Promise.all([
        await this.variantModel.find({ productId: variant.productId }),
        await this.productModel.findById(variant.productId),
      ]).catch((error) => {
        throw new RpcException(error.message);
      });
      const product = getField(data1[1], '_doc');
      return {
        data: {
          ...product,
          id: product._id,
          variants: data1[0],
        },
      };
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  async variantCreate(data) {
    const status = this.variantStatus[data.status];
    let values = data?.values;
    const defaultValues = { translation: { uz: [], ru: [], en: [] } }
    let sizeName = data?.values?.translation?.ru.length > 1 ? data?.values?.translation?.ru[1].value : '';
    if (values?.translation?.ru) values.translation.ru[1].value = sizes[sizeName.toLowerCase()] || data?.values?.translation?.ru[1].value?.toUpperCase();
    let variant = await this.variantModel.create({
      ...data,
      status,
      values: values || defaultValues,
    })
    // We check if color value exists, if so, we will create or append to the group
    const fields = values['translation']?.['ru'];
    if (Array.isArray(fields)) {
      const colorField = fields.find((field) => field.slug === 'color');
      if (colorField && colorField.value) {
        const newVariantGroupId = await this.syncVariantGroup(variant, 'color', colorField?.value?.toLowerCase(), null, data?.importId, data?.sku);
        variant = await this.variantModel.findByIdAndUpdate(
          variant['_id'],
          { ...variant['_doc'], variantGroupId: newVariantGroupId },
          { new: true }).populate(['variantGroupId']);
        await this.hookService.syncVariant({ variantId: variant._id.toString(), variantGroupId: newVariantGroupId.toString() })
        await this.hookService.syncProduct({ productId: `${variant.productId}` });
        await this.hookService.syncVariantGroup({ variantId: newVariantGroupId.toString() })
      }
    }
    return { data: { id: variant.id, ...getField(variant, '_doc'), oldValues: values } };
  }

  async insertVariantBulk(data: VariantCreate & VariantValuesWithMultipleSizes) {
    return await Promise.all(data.values.map((value: variantValues) => {
      const variant = { ...data };
      delete variant.values;
      const quantity = +value.translation?.ru?.find((field: { slug: string }) =>field.slug === 'quantity').value;

      return this.variantCreate({ ...variant, values: value, quantity });
    }));
  }

  async getProductVariant(query: GetProductVariantReq) {
    const relations = ['product'];
    const projection = relations
      .filter((key) => !query[key])
      .reduce((a, b) => ({ ...a, [b]: false }), {});
    const where = {
      ...query.where,
      status: this.variantStatus[query?.where?.status],
    };
    if (!where.status) {
      delete where.status;
    }
    const data = await this.variantModel.findTranslated(
      { product: query.productId },
      projection,
      {},
    );
    return { data };
  }

  //Deprecated
  async getAll(query: GetAllVariantReq, lang?: string) {
    const relations = [];
    const projection = relations
      .filter((key) => !query[key])
      .reduce((a, b) => ({ ...a, [b]: false }), {});

    const where = {
      ...query.where,
      status: this.variantStatus[query?.where?.status],
    };

    if (!where.status) {
      delete where.status;
    }
    const data = await paginate(
      this.variantModel.find(where, projection),
      this.variantModel.find(where),
      query.page,
      query.pagesize,
    );
    const newData = data?.data?.map((e) => {
      let product = {},
        translation: any = {};
      try {
        product = getField(e, '_doc').product?._doc;
        translation = getField(product, 'translation')[lang];
      } catch (e) { }
      return {
        ...getField(e, '_doc'),
        id: e._id,
        product: {
          id: e.product?.id,
          ...product,
          ...translation,
          variants: undefined,
          translation: undefined,
        },
        values: {
          ...e.values,
          translation: e.values?.translation,
        },
      };
    });
    return { ...data, data: newData };
  }

  async getAllVariants(include: GetAllVariantsReq, lang?: string) {
    const page: number = include?.pagination.page || 0;
    const pagesize: number = include?.pagination.pagesize || 20;
    delete include?.pagination.page;
    delete include?.pagination.pagesize;

    const {productId, warehouseId} = include.filters;
    const {product, brand, categories} = include.fieldsToLoad;

    let where = {
      ...(productId ? {productId : new ObjectId(productId)} : {}),
      ...(warehouseId ? {warehouses: {
          $elemMatch: {
            id: warehouseId
          }
        }} : {}),
    };

    const lookup = [];
    if (product) {
      lookup.push({
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'product',
        },
      })
    }

    if (brand) {
      lookup.push({
        $lookup: {
          from: 'brands',
          localField: 'product.brand',
          foreignField: '_id',
          as: 'brands',
        },
      });
    }

    if (categories) {
      lookup.push({
        $lookup: {
          from: 'categories',
          localField: 'product.category',
          foreignField: '_id',
          as: 'categories',
        },
      });
    }


    const data: any = await this.variantModel.aggregate([
      {
        $match: {
          ...where,
        },

      },
      ...lookup,
      {
        $lookup: {
          from: 'variantgroups',
          localField: '_id',
          foreignField: 'variants',
          as: 'variantGroupsImages',
        },
      },
      {$limit: pagesize * page },
      {$skip: pagesize * (page - 1)},

    ])

    const total = await this.variantModel.count(where)

    return {data, total};
  }

  async get(id: string) {
    const data = await this.variantModel.findById(id, undefined, {
      populate: [
        { path: 'product', strictPopulate: false },
        { path: 'variantValues', strictPopulate: false },
      ],
    });
    //todo should be fixed. Just fast fix, until synchronization with prod db
    return { data: {price: data['_doc'].price, values: data['_doc'].values} };
  }

  async getOne(id: string) {
    const variant = await this.variantModel.findById(id);

    if (!variant) throw new RpcException('variant does not exist')

    return { variant }
  }

  async addNew(data) {
    const status = this.variantStatus[data.status];
    let product = undefined;
    let variantValues = undefined;
    const populate = [];
    if (data.product) {
      product = await this.connect(
        this.productModel,
        'variants:=',
        this.translationMapper(data.product),
      );
      populate.push('product');
    }
    if (Array.isArray(data.variantValues) && data.variantValues.length) {
      variantValues = await Promise.all(
        data.variantValues
          .map(this.translationMapper.bind(this))
          .map(
            this.connect.bind(
              this,
              this.variantValueModel,
              'variants:=',
            ),
          ),
      );
      populate.push('variantValues');
    }
    const result = await this.variantModel.create({
      ...data,
      product,
      variantValues,
      status,
    });
    if (populate.length) {
      await result.populate(populate);
    }
    await this.sync(result);
    return { data: this.serelize(result) };
  }

  async update(variant: any) {
    const result = [];
    if (variant?.variants) {
      for (let item of variant.variants) {
        const isValidStatus = Boolean(
          !item?.status ||
          item?.status === VariantStatus.INACTIVE ||
          item?.status === VariantStatus.ACTIVE,
        );
        if (!isValidStatus) {
          throw new RpcException('Invalid status to update');
        }

        const variantBeforeUpdate = await this.variantModel.findOne({ _id: item.id });

        let data;
        if (item.values?.translation) {
          // !Any field's slug must be same for any language
          // We group only by 'color', for now
          const colorField = item.values.translation['ru'].find?.((field) => (field.slug === 'color') || (field.field === 'color'));
          const oldColorField = variantBeforeUpdate.values.translation['ru'].find?.((field) => (field.slug === 'color') || (field.field === 'color'));
          if (colorField) {
            let values = item?.values;
            const newVariantGroupId = await this.syncVariantGroup(variantBeforeUpdate, 'color', colorField.value?.toLowerCase(), oldColorField.value);
            let sizeName = item?.values?.translation?.ru.length > 1 ? item?.values?.translation?.ru[1].value : '';
            if (values?.translation?.ru) values.translation.ru[1].value = sizes[sizeName.toLowerCase()] || item?.values?.translation?.ru[1].value?.toUpperCase();
            if (values?.translation?.ru && values?.translation?.ru?.length > 1) values.translation.ru[0].value = values.translation.ru[0].value.toLowerCase()
            data = await this.variantModel.findByIdAndUpdate(
              item.id,
              { ...item, variantGroupId: newVariantGroupId, values },
              { new: true },
            ).populate(['variantGroupId']);

            await this.hookService.syncVariant({ variantId: item.id, variantGroupId: newVariantGroupId ? newVariantGroupId.toString() : variantBeforeUpdate['_doc'].variantGroupId.toString() })
            await this.hookService.syncVariantGroup({ variantId: newVariantGroupId ? newVariantGroupId.toString() : variantBeforeUpdate['_doc'].variantGroupId.toString() })
          }
        }

        await this.hookService.syncProduct({ productId: `${data.productId}` });

        result.push(data['_doc']);
      }
    }

    return { result }
  }

  async updateQuantity(data) {
    const variant: any = await this.variantModel.findOne({ _id: data.id });
    let result: any;

    if (variant) {
      let warehouse: any = variant['_doc'].warehouses[0];
      warehouse.quantity = data.quantity;
      await this.variantModel.findByIdAndUpdate(
        variant._id,
        { warehouses: warehouse }
      )
      result = await this.variantModel.findOne({ _id: data.id });

      await this.hookService.syncVariant({ variantId: variant._id.toString(), variantGroupId: variant['_doc'].variantGroupId.toString() })
    }

    return {
      id: result?._doc?._id || null,
      warehouse: result?._doc?.warehouses[0] || null
    };
  }

  async updateStatus(id: string, status?: string) {
    if (status === VariantStatus.INACTIVE || status === VariantStatus.ACTIVE) {
      const data = await this.variantModel
        .findByIdAndUpdate(id, { status }, { new: true })
        .catch((error) => {
          throw new RpcException(error.message);
        });
      return { data };
    }
    throw new RpcException('status not correct');
  }

  async delete(id: string) {
    const data = await this.variantModel
      .findByIdAndDelete(id)
      .catch((error) => {
        throw new RpcException(error.message);
      });
    await this.hookService.deleteVariant(id);
    await lastValueFrom(this.cartService.DeleteVariantFromCard({variantsIds: [id]}))
    // removes the vraint id from the variantGroup document.
    await this.variantGroupModel.updateOne(
      { productId: data.productId },
      {
        $pullAll: {
          variants: [data.id],
        },
      },
    );

    const countOfVariantGroupUsages = await this.variantModel.count({variantGroupId: data.variantGroupId});

    if (countOfVariantGroupUsages === 0) {
      await this.variantGroupModel.deleteOne({ _id: data.variantGroupId });
      await this.hookService.deleteVariantGroup(data.variantGroupId as any);
    }

    await this.hookService.syncProduct({ productId: `${data.productId}` });
    return { data };
  }

  // We group by a single field, not by multiple fields
  private async syncVariantGroup(
    variant: Variant,
    field: string, newValue: string, oldValue: string,
    importId?: string, sku?: string
  ) {

    if (newValue === oldValue) {
      return;
    }

    let newGroup = await this.variantGroupModel.findOne({ field, value: newValue, productId: variant.productId});

    // We have already a newGroup, so we just append our variantId
    if (!newGroup) {
      // As we dont have any variantGroup, we create it
      let skuValue = sku ? {sku} : {}
      newGroup = await this.variantGroupModel.create({
        productId: variant.productId,
        variants: [variant['_id']],
        value: newValue,
        field,
        importId,
        isPublished: false,
        ...skuValue
      });
    } else if (newGroup['_id'] !== (variant.variantGroupId as any)) {
      let variantGroupById = await this.variantGroupModel.findById(newGroup['_id']);
      if (!variantGroupById?.variants.includes(variant['_id'])) {
        await this.variantGroupModel.findByIdAndUpdate(newGroup['_id'], {
          $push: {
            variants: variant['_id'],
          },
        }, { new: true });
      }
    }

    const oldGroup = await this.variantGroupModel.findOne({ field, value: oldValue, productId: variant.productId });

    if (oldGroup) {
      const amountLinkedVariants = await this.variantModel.count({ variantGroupId: oldGroup['_id'] });
      if (amountLinkedVariants <= 1) {
        await this.variantGroupModel.deleteOne({ _id: oldGroup['_id'] });

        await this.hookService.deleteVariantGroup(oldGroup['_id'].toString())
      } else {
        await this.variantGroupModel.findByIdAndUpdate(oldGroup['_id'], {
          $pull: {
            variants: variant['_id'],
          },
        }, { new: true });

        await this.hookService.syncVariantGroup({variantId: oldGroup['_id'].toString()} )
      }
    }

    return newGroup._id;

  }

  async loadCompanyFromVariant(variantsIds) {
    try {
      const companyVariants = await this.variantModel
        .aggregate([
          {
            $match: {
              _id: {
                $in: variantsIds.map(v => new ObjectId(v))
              }
            }
          },
          {
            $lookup: {
              from: 'products',
              localField: 'productId',
              foreignField: '_id',
              as: 'product',
            },
          },
          {
            $lookup: {
              from: 'variantgroups',
              localField: '_id',
              foreignField: 'variants',
              as: 'variantGroupsImages',
            },
          },
        ])
      return { companyVariants }
    } catch (e) {
      throw Error(e.message)
    }
  }

  async calculateDeliveryPrice(data) {
    const {selectedVariantsData, districtId, pvzId, deliveryType} = data;

    const variantsIds = selectedVariantsData.map((item) => item.variantId);

    const district = districtId ? await lastValueFrom(this.districtService.findById({ id: districtId })) : {price: 22400}
    const pvz = pvzId ? await lastValueFrom(this.pvzService.GetOneById({id: pvzId})) : {result: {price: 44800}}

    let deliveryPriceForCurrentDeliveryGroup = pvzId ? pvz.result.price : district.price;

    if (deliveryType === DeliveryType.EXPRESS) {
      deliveryPriceForCurrentDeliveryGroup = 33600;
    }

    if (deliveryType === DeliveryType.DOOR_OFFICE && !pvzId) {
      deliveryPriceForCurrentDeliveryGroup = 44800
    }

    const companyVariants = await this.variantModel
      .aggregate([
        {
          $match: {
            _id: {
              $in: variantsIds.map(v => new ObjectId(v)),
            },
          },
        },
        {
          $lookup: {
            from: 'products',
            localField: 'productId',
            foreignField: '_id',
            as: 'product',
          },
        },
      ]);

    let deliveryPrice = 0;

    const result = companyVariants.reduce((accum, currentValue) => {
      const key = currentValue.warehouses[0].id + '_' + currentValue.product[0].companyId;
      if (!accum[key]) {
        accum[key] = [currentValue];
      } else {
        accum[key].push(currentValue);
      }
      return accum;

    }, {});

    let keys = Object.keys(result);
    let detailed = {};
    for (let i = 0; i < keys.length; i++) {
      let deliveryPricePerCompany = 0;
      let deliveryPriceForVariants = 0;
      let companyKey = keys[i].split('_')[1] || 'No id';
      result[keys[i]].forEach((item, index) => {
        const selectedVariant = selectedVariantsData.find(({ variantId }) => variantId === item._id.toString());
        if (index === 0) {
          const quantity = selectedVariant.quantity === 1 ? 0 : selectedVariant.quantity - 1;
          deliveryPriceForVariants += quantity * 5000;
        } else {
          deliveryPriceForVariants += selectedVariant.quantity * 5000;
        }
      });
      deliveryPricePerCompany = deliveryPriceForCurrentDeliveryGroup + deliveryPriceForVariants;
      deliveryPrice += deliveryPricePerCompany;
      // detailed = {...detailed, [companyKey]: deliveryPricePerCompany }
      detailed = {...detailed, [companyKey]: 0 }
    }

    return {
      // total: deliveryPrice,
      total: 0,
      detailed: JSON.stringify(detailed)
    };
  }

  async setDiscountPercentageForVariant(data) {
    const variant = await this.variantModel.findOneAndUpdate({_id: data.variantId}, {discountPercentage: data.discountPercentage});
    const updatedVariant = await this.variantModel.findById({_id: data.variantId})

    if (!variant) throw new RpcException('variant does not exist')
    await this.hookService.syncVariant({variantId: data.variantId, variantGroupId: variant?.variantGroupId.toString()})

    return {variant: updatedVariant}
  }

  async setDiscountPercentageForVariantGroup(data) {
    const variantGroup = await this.variantGroupModel.findOneAndUpdate({_id: data.variantGroupId}, {discountAmount: data.discountAmount});
    const updatedVariantGroup = await this.variantGroupModel.findById({_id: data.variantGroupId})
    if (!variantGroup) throw new RpcException('variant does not exist')
    await this.hookService.syncVariantGroup({variantId: data.variantGroupId})

    return {variantGroup: updatedVariantGroup}
  }

  async getValueByImportId(importId, lang?: string) {
    let defaultLang = lang || 'ru';
    const variantGroup = await this.variantGroupModel
      .aggregate([
        {
          $match : {importId},
        },
        {
          $lookup: {
            from: 'products',
            localField: 'productId',
            foreignField: '_id',
            as: 'products',
          },
        },
        {
          $lookup: {
            from: 'variants',
            localField: 'variants',
            foreignField: '_id',
            as: 'variants',
          },
        },

      ])

    if (!variantGroup) throw new RpcException('importId does not exist')

    variantGroup.forEach((item) => {
      let sizes = [];
      item.variants.forEach((el) => {
        sizes.push(el.values.translation[defaultLang][1].value);
      })
      item.variantsSizes = sizes;
    })

    return {variantGroup}
  }

  async getVariantByBillzId(billzId) {
    const variant = await this.variantModel.findOne({billzId})

    return {variant}
  }

  async publishVariantGroup(variantGroupId) {
    try {
      let success = false;
      let result = 'Successfully';
      let isValid = true;

      const variantGroup: any = await this.variantGroupModel
        .findOne({
          _id: new ObjectId(variantGroupId)
        })
        .populate(['productId', 'variants'])

      if (!variantGroup?.productId?.category) {
        result = 'Need to add a category'
      } else {
        const category: any = await this.categoryModel.findOne({_id: new ObjectId(variantGroup?.productId?.category?.toString())});
        if (category._doc.translation['ru'].name === 'Нет категории') {
            isValid = false;
            result = 'Need to add a category'
        }
      }
      if (!variantGroup?.images || variantGroup?.images?.length <= 0) {
        isValid = false;
        result = 'Need to add a photo'
      }


      if (variantGroup?.productId?.category && variantGroup?.images?.length > 0 && isValid) {
        let variantGroupById = await this.variantGroupModel.findById(variantGroupId);
        let uniqVariants = new Set();
        let variantsArray: any  = [];
        for (let variant of variantGroupById?.variants) {
          uniqVariants.add(variant.toString());
        }

        for (let item of uniqVariants) {
          variantsArray.push(new ObjectId(`${item}`));
        }

        await this.variantGroupModel.updateOne({
          _id: new ObjectId(variantGroupId)
        }, {
          isPublished: true,
          variants: variantsArray
        }).catch((error) => {
          throw new RpcException(error.message);
        });
        await this.productService.checkProductPublished(variantGroup?.productId);
        await this.hookService.syncVariantGroup({ variantId: variantGroup._id.toString()})
        await this.hookService.syncProduct({ productId: variantGroup?.productId?._doc?._id.toString() });
        for (const item of variantGroup.variants) {
          await this.hookService.syncVariant({variantId: item._id.toString(), variantGroupId: variantGroup._id.toString()})
        }

        success = true;
      }

      return {
        result,
        success
      }
    } catch (e) {
      throw new RpcException({
        message: 'Element not found'
      });
    }
  }

  async unpublishedGroups(data, languageValue?: string) {
    let lang = languageValue || 'ru';
    const {companyId, query, pagesize = 10, page = 1} = data;
    let filter = companyId ? {companyId} : {};
    let products;
    let valueForSearch = false;

    if (query) {
      let productInfo = await this.productService.getProductsByName(query, companyId);
      products = productInfo?.products;
    }
    if (!query || products?.length === 0){
      valueForSearch = true;
      products = await this.productModel.aggregate([
        {
          $match : filter
        }])
    }
    const productsIds = products.map((item) => item._id);
    let matchValue = {
      $or: [{ sku: { $regex: `(?i)${query}` } }, { value: { $regex: `(?i)${query}` } }],
      productId: {
        $in: productsIds
      },
      isPublished: false,
    }

    if (!valueForSearch || !query) delete matchValue.$or;
    const variantGroups = await this.variantGroupModel.aggregate([
      {
        $match: matchValue
      },
      {
        $lookup: {
                from: 'products',
                localField: 'productId',
                foreignField: '_id',
                as: 'product',
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'product.category',
          foreignField: '_id',
          as: 'category',
        },
      },
      {
        $lookup: {
          from: 'variants',
          localField: '_id',
          foreignField: 'variantGroupId',
          as: 'variants',
        },
      },
      {$sort: {sku: 1}},
      {$limit: pagesize * page },
      {$skip: pagesize * (page - 1)},

    ]);
    let totalValue = await this.variantGroupModel.count(matchValue);
    let result = variantGroups.map((el) => {
      let sizes = el?.variants.map((size) => size.values.translation?.[lang][1].value);
      let prices = el?.variants.map((variant) => variant.price);
      const pricesWithDiscount = el?.variants?.map?.(({ price }) => {
        return el?.discountAmount ? price - el?.discountAmount : 0;
      })
      let categories = el.product[0].categories.map((item) => {
        return {
          id: item
        }
      })
      let productValue = {...el.product[0], id: el.product[0]._id, name: el.product[0].translation?.[lang]?.name,
        content: el.product[0].translation?.[lang]?.content, categories};
      let categoryValue = {...el.category[0], id: el.category[0]._id, name: el?.category[0].translation?.[lang]?.name};
      delete productValue.translation
      delete categoryValue.translation
      let minPrice = Math.min(...prices) || -1;
      let minPriceWithDiscount = Math.min(...pricesWithDiscount) || 0;
      delete el.variants;
     return { ...el, category: categoryValue, product: productValue, sizes, minPrice, minPriceWithDiscount
     }})

    return { page, total: totalValue || 0, result};
  }

  async decreaseQuantity(data: any) {
    let {variantId, quantity} = data;
    let status = true;
    let variant: any = await this.variantModel.findById(variantId).catch((error) => {
      throw new RpcException(error.message);
    });

    if (variant) {
      if (variant.warehouses[0].quantity === 0) return {status: false};

      if (variant.warehouses[0].quantity === 0 - quantity < 0) quantity = variant.warehouses[0].quantity;

      variant.warehouses[0].quantity -= quantity;
      await this.variantModel.findByIdAndUpdate(variantId, {...variant})
      await this.hookService.syncVariant({variantId: variant._id.toString(), variantGroupId: variant.variantGroupId.toString()})
    }

    return {status}
  }

  async increaseQuantity(data: any) {
    const { variants } = data;

    if (variants?.length > 0) {
      for (let item of variants) {
        let variant = await this.variantModel.findById(item?.variantId).catch((error) => {
          throw new RpcException(error.message);
        });
        variant.warehouses[0].quantity = variant.warehouses[0].quantity + item.quantity;
        await this.variantModel.findByIdAndUpdate(item.variantId, {...variant})
        await this.hookService.syncVariant({variantId: variant._id.toString(), variantGroupId: variant.variantGroupId.toString()})
      }
    }
  }

  async updateVariantGroupByCategories(categoryId) {
    let productsWithVariantGroups = await this.productModel.find({categories: new ObjectId(categoryId)});
    let productsIds = productsWithVariantGroups?.map((item) => item?._id);

    let variantGroups = await this.variantGroupModel.aggregate([
      {
        $match: {
          productId: {
            $in: productsIds
          }
        }
      }
    ])


    for (let productId of productsIds) {
      await this.hookService.syncProduct({productId: productId.toString()})
    }

    for (let variantGroup of variantGroups) {
      await this.hookService.syncVariantGroup({variantId: variantGroup._id.toString()})
    }
  }

  async updateVariantGroupByBrand(brandId) {
    let productsWithVariantGroups = await this.productModel.find({brand: new ObjectId(brandId)});
    let productsIds = productsWithVariantGroups?.map((item) => item?._id);

    let variantGroups = await this.variantGroupModel.aggregate([
      {
        $match: {
          productId: {
            $in: productsIds
          }
        }
      }
    ])


    for (let productId of productsIds) {
      await this.hookService.syncProduct({productId: productId.toString()})
    }
    for (let variantGroup of variantGroups) {
      await this.hookService.syncVariantGroup({variantId: variantGroup._id.toString()})

    }
  }

  async updateVariantGroupByCompany(companyId) {
    let productsWithVariantGroups = await this.productModel.find({companyId: companyId});
    let productsIds = productsWithVariantGroups?.map((item) => item?._id);

    let variantGroups = await this.variantGroupModel.aggregate([
      {
        $match: {
          productId: {
            $in: productsIds
          }
        }
      }
    ])

    for (let productId of productsIds) {
      await this.hookService.syncProduct({productId: productId.toString()})
    }

    for (let variantGroup of variantGroups) {
      await this.hookService.syncVariantGroup({variantId: variantGroup._id.toString()})
    }
  }

  async publish(data: PublishDto) {
    const {variantGroupId, images, product} = data
    const variantGroup: any = await this.variantGroupModel.findById(variantGroupId).populate(['productId']);

    if (!variantGroup) throw new RpcException('Variant group not found');

    let contentStructure = product?.content
      ?
      {
        translation: {
          fields: {
            uz: {
              structValue: {
                fields: {
                  name: {
                    stringValue: ""
                  },
                  content: {
                    stringValue: ""
                  }
                }
              }
            },
            ru: {
              structValue: {
                fields: {
                  name: {
                    stringValue: variantGroup?.productId?.translation?.ru?.name
                  },
                  content: {
                    stringValue: product.content
                  }
                }
              }
            },
            en: {
              structValue: {
                fields: {
                  name: {
                    stringValue: ""
                  },
                  content: {
                    stringValue: ""
                  }
                }
              }
            }
          }
        }
      }
        :
      {}

    await this.productService.update({
      id: variantGroup.productId._id,
      ...product, ...contentStructure
    })

    await this.setVariantGroupImages({photos: images,sku: undefined, groupId: variantGroupId})

    let publishedInfo = await this.publishVariantGroup(variantGroupId);

    return {success: publishedInfo?.success, result: publishedInfo?.result}
  }

  async syncAllVariantGroup() {
    const variantGroups = await this.variantGroupModel.find();

    for (let variantGroup of variantGroups) {
      console.log(`BEFORE SYNC ${variantGroup._id.toString()}`)
      await this.hookService.syncVariantGroup({variantId: variantGroup._id.toString()})
      console.log(`AFTER SYNC ${variantGroup._id.toString()}`)
      await setTimeout(1000)
    }
    console.log('SUCCESS')
  }

  async getVariantGroupSku(sku: string) {
    let variantGroup: any = await this.variantGroupModel.findOne({
      sku
    }).populate(['productId'])

    if (variantGroup) {
      variantGroup.product = variantGroup.productId;
    }
    return {variantGroup}
  }
}
