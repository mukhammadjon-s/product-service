import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { EnvKeys, validate } from 'src/config/env.validation';
import { CategoryService } from './category/category.service';
import { Category, CategorySchema } from './schemas/category.schema';
import { Brand, BrandSchema } from './schemas/brand.schema';
import { BrandController } from './brand/brand.controller';
import { BrandService } from './brand/brand.service';
import {
  Characteristic,
  CharacteristicSchema,
} from './schemas/characteristic.schema';
import { Product, ProductSchema } from './schemas/product.schema';
import { Variant, VariantSchema } from './schemas/variant.schema';
import { ProductController } from './product/product.controller';
import { ProductService } from './product/product.service';
import {
  VariantField,
  VariantFieldSchema,
} from './schemas/variantFields.schema';
import {
  VariantValue,
  VariantValueSchema,
} from './schemas/variantValues.schema';
import { VariantController } from './variant/variant.controller';
import { VariantService } from './variant/variant.service';
import { CategoryController } from './category/category.controller';
import { VariantFieldController } from './variantField/variantField.controller';
import { VariantFieldService } from './variantField/variantField.service';
import { CharacteristicController } from './characteristic/characteristic.controller';
import { CharacteristicService } from './characteristic/characteristic.service';
import {
  CharacteristicGroup,
  CharacteristicGroupSchema,
} from './schemas/characteristicGroup.schema';
import {
  CharacteristicValue,
  CharacteristicValueSchema,
} from './schemas/characteristicValue.schema';
import { VariantValueController } from './variantValue/variantValue.controller';
import { VariantValueService } from './variantValue/variantValue.service';
import { CharacteristicGroupController } from './characteristicGroup/characteristicGroup.controller';
import { CharacteristicGroupService } from './characteristicGroup/characteristicGroup.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ServiceNames } from './config/constants';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EventDemo } from '../shared/event/event.service';
import {
  VariantGroup,
  VariantGroupSchema,
} from './schemas/variantGroup.schema';
import { DbCleanerController } from './dbCleaner/dbCLeaner.controller';
import { HookService } from './hooks/hooks.service';
import { join } from 'path';
import {
  GRPC_COMPANY_PACKAGE,
  GRPC_HELPER_PACKAGE, GRPC_IMPORT_PACKAGE, GRPC_ORDER_PACKAGE,
  GRPC_WAREHOUSE_PACKAGE,
  helperMsUrl, importMsUrl,
  ownerMsUrl, shopMsUrl,
} from '../shared/utils/constants';
import { ExcelController } from './excel/excel.controller';
import { ExcelService } from './excel/excel.service';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const AutoIncrementFactory = require('mongoose-sequence');
@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ConfigModule.forRoot({
      cache: true,
      validate,
    }),
    ClientsModule.registerAsync([
      {
        name: ServiceNames.AMQP_SERVICE,
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>(EnvKeys.AMQP_URI)],
            queue: configService.get<string>(EnvKeys.HOOK_MS_QUEUE),
            queueOptions: {
              durable: false,
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
    ClientsModule.registerAsync([
      {
        name: ServiceNames.GRPC_COMPANY_PACKAGE,
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: 'company',
            url: configService.get<string>(EnvKeys.OWNER_MS_URI),
            protoPath: join(
              process.cwd(),
              'node_modules/@padishah/toolbox/grpc/company.proto',
            ),
            loader: {
              objects: true,
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>(EnvKeys.MONGO_DB_URI),
        useNewUrlParser: true,
        connectionFactory: (connection) => {
          const AutoIncrement = AutoIncrementFactory(connection);
          ProductSchema.plugin(AutoIncrement, {
            inc_field: 'productItemId',
          });
          VariantSchema.plugin(AutoIncrement, {
            inc_field: 'variantItemId',
          });
          return connection;
        },
      }),
      inject: [ConfigService],
    }),
    ClientsModule.register([
      {
        name: GRPC_HELPER_PACKAGE,
        transport: Transport.GRPC,
        options: {
          package: 'app',
          protoPath: join(
            process.cwd(),
            'node_modules/@padishah/toolbox/grpc/app.proto',
          ),
          url: helperMsUrl,
          loader: {
            objects: true,
          },
        },
      },
      {
        name: GRPC_COMPANY_PACKAGE,
        transport: Transport.GRPC,
        options: {
          package: 'company',
          protoPath: join(
            process.cwd(),
            'node_modules/@padishah/toolbox/grpc/company.proto',
          ),
          url: ownerMsUrl,
          loader: {
            objects: true,
          },
        },
      },
      {
        name: GRPC_WAREHOUSE_PACKAGE,
        transport: Transport.GRPC,
        options: {
          package: 'company',
          protoPath: join(process.cwd(), 'node_modules/@padishah/toolbox/grpc/company.proto'),
          url: ownerMsUrl,
          loader: {
            objects: true,
          },
        },
      },
      {
        name: GRPC_IMPORT_PACKAGE,
        transport: Transport.GRPC,
        options: {
          package: 'import',
          protoPath: join(process.cwd(), 'node_modules/@padishah/toolbox/grpc/import.proto'),
          url: importMsUrl,
          loader: {
            objects: true,
          },
        },
      },
      {
        name: GRPC_ORDER_PACKAGE,
        transport: Transport.GRPC,
        options: {
          package: 'shop',
          protoPath: join(
            process.cwd(),
            'node_modules/@padishah/toolbox/grpc/shop.proto',
          ),
          url: shopMsUrl,
          loader: {
            objects: true,
          },
        },
      },
    ]),
    // MongooseModule.forFeatureAsync({
    //   name: Variant.name,
    //   inject: [getModelToken(Product.name)],
    //   import: [MongooseModule.forFeature(Product.name)],
    //   useFactory: (userModel) => {
    //     VariantSchema.pre('save', () => {
    //       // Use other model for query
    //       // For Examole
    //       userModel.findOne({});
    //       console.log('Hello from pre save');
    //     });
    //     return VariantSchema;
    //   },
    // }),
    MongooseModule.forFeature([
      { name: Brand.name, schema: BrandSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Product.name, schema: ProductSchema },
      { name: Variant.name, schema: VariantSchema },
      { name: VariantField.name, schema: VariantFieldSchema },
      { name: VariantValue.name, schema: VariantValueSchema },
      { name: Characteristic.name, schema: CharacteristicSchema },
      { name: CharacteristicGroup.name, schema: CharacteristicGroupSchema },
      { name: CharacteristicValue.name, schema: CharacteristicValueSchema },
      { name: VariantGroup.name, schema: VariantGroupSchema },
    ]),
  ],
  controllers: [
    CategoryController,
    BrandController,
    ProductController,
    VariantController,
    VariantFieldController,
    CharacteristicController,
    VariantValueController,
    CharacteristicGroupController,
    DbCleanerController,
    ExcelController,
  ],
  providers: [
    HookService,
    ConfigService,
    CategoryService,
    BrandService,
    ProductService,
    VariantService,
    VariantFieldService,
    CharacteristicService,
    VariantValueService,
    CharacteristicGroupService,
    EventDemo,
    ExcelService,
  ],
})
export class AppModule { }
