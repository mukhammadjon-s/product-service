import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc, ClientProxy } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { Events } from '@padishah/toolbox/hooks';
import { IsNumber } from 'class-validator';
import { ServiceNames } from 'src/config/constants';
import { Product, ProductModel } from 'src/schemas/product.schema';
import { Variant, VariantModel } from 'src/schemas/variant.schema';
import {
    VariantGroup,
    VariantGroupModel,
} from 'src/schemas/variantGroup.schema';
import { ProductEventMessage } from './events/product.event';
import { VariantEventMessage } from './events/variant.event';
import { lastValueFrom } from 'rxjs';
import { ICompanyService } from './interfaces/company.interface';
import { ObjectId } from 'mongodb';
import { VariantGroupEventMessage } from './events/variantGroup.event';

@Injectable()
export class HookService implements OnModuleInit {
    private companyService: ICompanyService;

    constructor(
        @InjectModel(Product.name)
        private productModel: ProductModel,
        @InjectModel(VariantGroup.name)
        private variantGroupModel: VariantGroupModel,
        @InjectModel(Variant.name)
        private variantModel: VariantModel,
        @Inject(ServiceNames.AMQP_SERVICE)
        private amqpService: ClientProxy,
        @Inject(ServiceNames.GRPC_COMPANY_PACKAGE)
        private clientGrpc: ClientGrpc
    ) { }

    onModuleInit() {
        this.companyService =
            this.clientGrpc.getService<ICompanyService>('CompanyService');
    }


    private async variantValues(
        { groupId, productId }: { productId?: string, groupId?: string },
        slug: string,
        lang = 'ru',
    ): Promise<string[]> {
        // We group variants by color field, so each variantGroup is a color seperately
        let groupedVariants = []
        if (productId) {
            groupedVariants = await this.variantGroupModel
                .find({ productId })
                .populate(['variants']);
        } else {
            groupedVariants = await this.variantGroupModel
                .find({ _id: groupId })
                .populate(['variants']);
        }

        if (slug === 'color') {
            const colors = groupedVariants.map((group) => {
                const variant = group.variants?.[0];
                if (variant && Array.isArray(variant?.values?.translation?.[lang])) {
                    const color = variant.values.translation[lang].find(
                        (field) => field.slug === 'color',
                    )?.value;
                    return color ? color : '';
                }
                return '';
            });
            return colors;
        }
        const values = groupedVariants
            .map((group) => {
                return group.variants.map((variant) => {
                    if (Array.isArray(variant.values?.translation?.[lang])) {
                        const value = variant.values.translation[lang].find(
                            (field) => field.slug === slug,
                        )?.value;
                        return value ? value : '';
                    }
                    return '';
                });
            })
            .flatMap((value) => value);
        return values;
    }

    async syncProduct({ productId, lang }: { productId: string; lang?: string }) {
        lang = lang ? lang : 'ru'; // Default is RU
        const product: any = await this.productModel
            .findById(productId)
            .populate(['categories', 'category', 'brand']);

        const productVariants = await this.variantModel.find({ productId }).populate(['variantGroupId']);
        const productVariantGroup = await this.variantGroupModel.find({ productId })
        const image = productVariantGroup.length > 0 && productVariantGroup[0]?.images?.length > 0 ? productVariantGroup[0]?.images[0]?.image : '';
        const categoryIds = product.categories?.map?.((category) => `${category['_id']}`);

        const colors = await this.variantValues({ productId }, 'color', lang);
        const sizes = await this.variantValues({ productId }, 'size', lang);
        const materials = await this.variantValues({ productId }, 'material', lang);
        const prices = productVariants.map((variant) => variant.price);
        const priceWithDiscount = productVariants.map((variant: any) => variant.price - variant?.variantGroupId?.discountAmount || variant.price);

        const eventMessage = new ProductEventMessage({
            product_id: productId,
            rating: product.rating,
            slug: product.slug,
            brand_id: product.brand?.['_id'] || '',
            category_id: product.category?.['_id'] || '',
            prices,
            prices_with_discount: priceWithDiscount,
            colors,
            sizes,
            status: product.status,
            materials,
            material: product.material,
            country: product.country,
            gender: product.gender,
            is_top: product.isTop,
            name: product.translation?.[lang]?.name,
            company_id: +product.companyId,
            is_published: product.isPublished !== false,
            category_ids: categoryIds,
            created_at: product?.createdAt,
            updated_at: product?.updatedAt,
            // category_slug: product.category?.slug || '',
            // category_slugs: categorySlugs || [''],
            // mini_desc: product.translation?.[lang]?.description || '',
            image,
            // category: product.category?.translation?.[lang]?.name || '',
            // brand: product.brand?.translation?.[lang]?.name || '',
            // brand_slug: product.brand?.slug || '',
        });

        this.amqpService.emit(Events.PRODUCT_SYNCED, { ru: eventMessage });
    }
    async deleteProduct(productId: string) {
        // We may do async logs when needed
        this.amqpService.emit(Events.PRODUCT_DELETED, { id: productId });
    }

    async deleteVariantByProduct(productId: string) {
        this.amqpService.emit(Events.VARIANT_ELEM_DELETED_BY_PRODUCT, { id: productId});
    }

    async deleteVariantGroupByProduct(productId: string) {
        this.amqpService.emit(Events.VARIANT_DELETED_BY_PRODUCT, { id: productId});
    }

    async syncVariant({variantId, variantGroupId, lang}: { variantId: string; variantGroupId: string; lang?: string }) {
        lang = lang ? lang : 'ru'; // Default is RU

        const variant: any = await this.variantModel.findOne({ _id: variantId });
        const variantsGroup = await this.variantGroupModel
          .aggregate([
              {
                  $match : { _id: new ObjectId(variantGroupId)},
              },
              {
                  $lookup: {
                      from: 'variants',
                      localField: '_id',
                      foreignField: 'variantGroupId',
                      as: 'variants',
                  },
              },])
        const variantGroup = variantsGroup[0];
        const product: any = await this.productModel
          .findById(variantGroup?.productId).populate(['categories', 'category', 'brand']);

        const color = variant?.values ? variant.values.translation[lang][0].value : "";
        const size = variant?.values ? variant.values.translation[lang][1].value : "";
        const prices = variantGroup?.variants?.map?.(({ price }) => price)

        const eventMessage = new VariantEventMessage({
            price: prices[0],
            product_id: product.id,
            product_name: product.translation?.[lang]?.name,
            status: product.status,
            sku: `${variantGroup.sku}`,
            variant_group_id: `${variantGroup['_id']}`,
            color,
            size,
            company_id: +product.companyId,
            images: variantGroup.images?.map(({ image }) => image),
            created_at: variant?.createdAt,
            updated_at: variant?.updatedAt,
            variant_id: variant?.id,
            warehouse_id: variant?.warehouses.length > 0 ? variant.warehouses[0].id : '',
            quantity: variant?.warehouses.length ? variant.warehouses[0].quantity : '0',
            rating: product.rating,
            discountPercentage: variant?.discountPercentage || 0
            
            // barcode: variant?.barcode || '',
            // gender: product.gender,
            // country: product.country,
            // material: product.material,
            // variant_group_slug: `${variantGroup.slug}`,
            // product_slug: product.slug,
        })
        this.amqpService.emit(Events.VARIANT_ELEM_SYNCED, { ru: eventMessage })
    }

    async syncVariantGroup({ variantId, lang }: { variantId: string; lang?: string }) {
        lang = lang ? lang : 'ru'; // Default is RU
           const variantsGroup = await this.variantGroupModel
             .aggregate([
                 {
                     $match : { _id: new ObjectId(variantId)},
                 },
                 {
                     $lookup: {
                         from: 'variants',
                         localField: '_id',
                         foreignField: 'variantGroupId',
                         as: 'variants',
                     },
                 },])
        const variantGroup = variantsGroup[0];
        const product: any = await this.productModel
            .findById(variantGroup?.productId).populate(['categories', 'category', 'brand']);
        if (product) {
            const colors = await this.variantValues({ groupId: `${variantGroup?.['_id']}` }, 'color', lang)
            const sizes = await this.variantValues({ groupId: `${variantGroup?.['_id']}` }, 'size', lang)
            const prices = variantGroup?.variants?.map?.(({ price }) => price)
            const pricesWithDiscount = variantGroup?.variants?.map?.(({ price }) => {
                return variantGroup?.discountAmount ? price - variantGroup?.discountAmount : 0;
            })
            const categoryIds = product?.categories?.map?.(({ _id }) => _id) || ['']

            const eventMessage = new VariantGroupEventMessage({
                product_id: `${variantGroup?.productId}`,
                rating: product?.rating || 0,
                brand_id: product?.brand?.['_id'],
                category_id: product?.category?.['_id'],
                category_ids: categoryIds,
                company_id: +product?.companyId,
                colors,
                sizes,
                status: product?.status,
                material: product?.material,
                country: product?.country,
                gender: product?.gender,
                is_top: product?.isTop,
                name: product?.translation?.[lang]?.name,
                in_stock: true, // We use hardcoded value as we dont have any relation
                min_price: Math.min(...prices) || -1,
                min_price_discount: Math.min(...pricesWithDiscount) || 0,
                prices: prices,
                variant_group_slug: variantGroup?.slug,
                sku: `${variantGroup?.sku}`,
                images: variantGroup?.images?.map(({ image }) => image) || [],
                popularity: variantGroup?.popularity,
                created_at: variantGroup?.createdAt,
                updated_at: variantGroup?.updatedAt,
                variant_group_id: `${variantGroup?.['_id']}`,
                variant_ids: variantGroup?.variants.map(variant => `${variant['_id']}`),
                discountAmount: +variantGroup?.discountAmount || 0,
                is_published: variantGroup?.isPublished !== false
            })

            this.amqpService.emit(Events.VARIANT_SYNCED, { ru: eventMessage })
        }
    }
    async deleteVariantGroup(variantGroupId: string) {
        // We may do async logs when needed
        this.amqpService.emit(Events.VARIANT_DELETED, { id: variantGroupId });
    }
    async deleteVariant(variantId: string) {
        this.amqpService.emit(Events.VARIANT_ELEM_DELETED, { id: variantId })
    }
}
