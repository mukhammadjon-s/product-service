import {
  DelReq,
  AddNewVariantReq,
  GetOneVariantReq,
  GetProductVariantReq,
  UpdateVariantReq,
  UpdateStatusVariantReq,
  VariantCreate,
  AddVPReq,
  UpdateVPReq,
  GetAllVariantReq,
  GetProductByVariantIdReq,
  GetVGReq,
  VariantGroupsSetImageRequest,
  GetVariantGroupRequest,
  GetAllVariantsReq, UpdateVariantsReq, GetVariantGroupByIdRequest,
  VariantValuesWithMultipleSizes
} from 'build/proto/product';
import { Controller, HttpException, HttpStatus } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { VariantService } from './variant.service';
import { Metadata } from '@grpc/grpc-js';
import { getLang } from '../../shared/utils';
import { CatchExceptions } from '../../shared/utils/error-decorator';
import { PublishDto } from './interfaces/variant.interface';

@Controller()
export class VariantController {
  constructor(private readonly service: VariantService) {}

  @GrpcMethod('VariantService', 'AddImage')
  @CatchExceptions()
  async AddImage(data: AddVPReq) {
    return this.service.addImage(data);
  }

  @GrpcMethod('VariantService', 'UpdateImage')
  @CatchExceptions()
  async UpdateImage(data: UpdateVPReq) {
    return this.service.updateImage(data);
  }

  @GrpcMethod('VariantService', 'GetProductVariant')
  @CatchExceptions()
  async GetProductVariant(query: GetProductVariantReq) {
    return this.service.getProductVariant(query);
  }

  @GrpcMethod('VariantService', 'GetAll')
  @CatchExceptions()
  async GetAll(query: GetAllVariantReq, meta: Metadata) {
    return this.service.getAll(query, getLang(meta));
  }

  @GrpcMethod('VariantService', 'GetOneVariant')
  async GetOneVariant({ id }) {
    return this.service.getOne(id);
  }

  @GrpcMethod('VariantService', 'getAllVariants')
  @CatchExceptions()
  async GetAllVariants(body: GetAllVariantsReq, meta: Metadata) {
    return this.service.getAllVariants(body, getLang(meta));
  }

  @GrpcMethod('VariantService', 'GetOne')
  @CatchExceptions()
  async getOne({ id }: GetOneVariantReq) {
    return this.service.get(id);
  }

  @GrpcMethod('VariantService', 'GetProductByVariantId')
  @CatchExceptions()
  async getProductByVariantId(data: GetProductByVariantIdReq) {
    return this.service.getProduct(data);
  }

  @GrpcMethod('VariantService', 'GetVariantGroupByProductId')
  @CatchExceptions()
  async getVariantGroupByProductId(data: GetVGReq) {
    return this.service.getVariantGroupByProductId(data);
  }

  @GrpcMethod('VariantService', 'GetVariantGroupsByProductIds')
  @CatchExceptions()
  async getVariantGroupsByProductIds(data: any) {
    return this.service.getVariantGroupsByProductIds(data);
  }

  @GrpcMethod('VariantService', 'GetVariantGroups')
  @CatchExceptions()
  async getVariantGroups(data: GetVGReq) {
    return this.service.getVariantGroups(data);
  }

  @GrpcMethod('VariantService', 'GetVariantGroup')
  @CatchExceptions()
  async getVariantGroupBySlug(data: GetVariantGroupRequest) {
    return this.service.getVariantGroupBySlug(data);
  }

  @GrpcMethod('VariantService', 'GetVariantGroupById')
  @CatchExceptions()
  async getVariantGroupById(data: GetVariantGroupByIdRequest) {
    return this.service.getVariantGroupById(data);
  }

  @GrpcMethod('VariantService', 'SetVariantGroupImages')
  @CatchExceptions()
  async setVariantGroupImages(data: VariantGroupsSetImageRequest) {
    return this.service.setVariantGroupImages(data);
  }

  @GrpcMethod('VariantService', 'VariantAdd')
  @CatchExceptions()
  async variantCreate(data: VariantCreate) {
    return this.service.variantCreate(data);
  }

  @GrpcMethod('VariantService', 'VariantBulkAdd')
  @CatchExceptions()
  async insertVariantBulk(data: VariantCreate & VariantValuesWithMultipleSizes) {
    return this.service.insertVariantBulk(data);
  }

  @GrpcMethod('VariantService', 'AddNew')
  @CatchExceptions()
  async addNew(data: AddNewVariantReq) {
    return this.service.addNew(data);
  }

  @GrpcMethod('VariantService', 'Update')
  @CatchExceptions()
  async update(data: UpdateVariantsReq) {
    return this.service.update(data);
  }

  @GrpcMethod('VariantService', 'UpdateQuantity')
  @CatchExceptions()
  async updateQuantity(data) {
    return this.service.updateQuantity(data);
  }

  @GrpcMethod('VariantService', 'UpdateStatus')
  @CatchExceptions()
  async updateStatus({ id, status }: UpdateStatusVariantReq) {
    return this.service.updateStatus(id, status);
  }

  @GrpcMethod('VariantService', 'Delete')
  @CatchExceptions()
  async delete({ id }: DelReq) {
    return this.service.delete(id);
  }

  //todo need change name to more logical
  @GrpcMethod('VariantService', 'LoadCompanyFromVariant')
  @CatchExceptions()
  async loadCompanyFromVariant(data) {
    return await this.service.loadCompanyFromVariant(data.variantsIds);
  }

  @GrpcMethod('VariantService', 'CalculateDeliveryPrice')
  @CatchExceptions()
  async calculateDeliveryPrice(data) {
    return await this.service.calculateDeliveryPrice(data);
  }

  @GrpcMethod('VariantService', 'SetDiscountPercentageForVariant')
  @CatchExceptions()
  async setDiscountPercentageForVariant(data) {
    return await this.service.setDiscountPercentageForVariant(data);
  }

  @GrpcMethod('VariantService', 'SetDiscountPercentageForVariantGroup')
  @CatchExceptions()
  async setDiscountPercentageForVariantGroup(data) {
    return await this.service.setDiscountPercentageForVariantGroup(data);
  }

  @GrpcMethod('VariantService', 'GetValueByImportId')
  @CatchExceptions()
  async getValueByImportId(data) {
    return await this.service.getValueByImportId(data.importId);
  }

  @GrpcMethod('VariantService', 'GetVariantByBillzId')
  @CatchExceptions()
  async getVariantByBillzId(data) {
    return await this.service.getVariantByBillzId(data.billzId);
  }


  @GrpcMethod('VariantService', 'PublishVariantGroup')
  @CatchExceptions()
  async publishVariantGroup(data: any) {
    return await this.service.publishVariantGroup(data.variantGroupId);
  }

  @GrpcMethod('VariantService', 'Publish')
  @CatchExceptions()
  async publish(data: PublishDto) {
    return await this.service.publish(data);
  }

  @GrpcMethod('VariantService', 'UnpublishedGroups')
  @CatchExceptions()
  async unpublishedGroups(data: any, meta: Metadata) {
    return await this.service.unpublishedGroups(data, getLang(meta));
  }

  @GrpcMethod('VariantService', 'DecreaseQuantity')
  @CatchExceptions()
  async decreaseQuantity(data: any) {
    return await this.service.decreaseQuantity(data);
  }

  @GrpcMethod('VariantService', 'IncreaseQuantity')
  @CatchExceptions()
  async increaseQuantity(data: any) {
    return await this.service.increaseQuantity(data);
  }

  @GrpcMethod('VariantService', 'UpdateVariantGroupByCompany')
  @CatchExceptions()
  async updateVariantGroupByCompany(data: any) {
    return await this.service.updateVariantGroupByCompany(data.companyId);
  }

  @GrpcMethod('VariantService', 'SyncAllVariantGroup')
  @CatchExceptions()
  async syncAllVariantGroup() {
    return this.service.syncAllVariantGroup();
  }

  @GrpcMethod('VariantService', 'GetVariantGroupBySku')
  @CatchExceptions()
  async getVariantGroupBySku(data: {sku: string}) {
    return this.service.getVariantGroupSku(data.sku);
  }
}
