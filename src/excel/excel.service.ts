import { BadRequestException, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Workbook, Worksheet, Cell } from 'exceljs';
import * as tmp from 'tmp';
import { ClientGrpc, RpcException } from '@nestjs/microservices';
import { Buffer } from 'buffer';
import { BrandService } from '../brand/brand.service';
import { CategoryService } from '../category/category.service';
import { VariantService } from '../variant/variant.service';
import { GRPC_COMPANY_PACKAGE, GRPC_WAREHOUSE_PACKAGE } from '../../shared/utils/constants';
import { CompanyControllerInterface } from '../company/interfaces/company.interface';
import { lastValueFrom } from 'rxjs';
import { ProductService } from '../product/product.service';
import { CreateProductRequest_ProductStatusEnum } from '@padishah/toolbox/grpc/ts/product';
import { WarehouseInterface } from '../warehouse/interfaces/warehouse.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ExcelService implements OnModuleInit {
  private companyService: CompanyControllerInterface;
  private warehouseService: WarehouseInterface;

  constructor(private readonly brandService: BrandService,
              private readonly categoryService: CategoryService,
              private readonly variantService: VariantService,
              private readonly productService: ProductService,
              @Inject(GRPC_COMPANY_PACKAGE) private clientCompany: ClientGrpc,
              @Inject(GRPC_WAREHOUSE_PACKAGE) private clientWarehouse: ClientGrpc) {}

  onModuleInit() {
    this.companyService =
      this.clientCompany.getService<CompanyControllerInterface>('CompanyService');
    this.warehouseService =
      this.clientWarehouse.getService<WarehouseInterface>('WarehouseService');
  }

  async downloadExcel() {
    let data = [
      {
        name: 'user1',
        email: 'user1@gmail.com',
      },
      {
        name: 'user2',
        email: 'user2@gmail.com',
      },
      {
        name: 'user3',
        email: 'user3@gmail.com',
      },
    ];

    let rows = [];

    data.forEach((item) => {
      rows.push(Object.values(item));
      // console.log(Object.values(item));
    });

    let workbook = new Workbook();

    let sheet = workbook.addWorksheet('sheet1');
    rows.unshift(Object.keys(data[0]));

    // sheet.addRows(rows);
    var rowValues = [];
    rowValues[1] = 4;
    rowValues[5] = 'Kyle';
    rowValues[9] = new Date();

    // insert new row and return as row object
    sheet.insertRow(1, rowValues);
    sheet.insertRow(2, rowValues);

    let File = await new Promise((resolve, reject) => {
      tmp.file(
        {
          discardDescriptor: true,
          prefix: 'MyExcel',
          postfix: '.xlsx',
          mode: parseInt('0600', 8),
        },
        async (err, file) => {
          if (err) {
            throw new BadRequestException(err);
          }
          workbook.xlsx
            .writeFile(file)
            .then((_) => {
              resolve(file);
            })
            .catch((err) => {
              throw new BadRequestException(err);
            });
        },
      );
    });

    return File;
  }

  async readFileExcel(file: any) {
    // read from a file
    const buff = Buffer.from(file.buffer, 'base64');
    const workbook = new Workbook();
    try {
      await workbook.xlsx.load(buff);

    } catch (e) {
      throw new Error(e.message);
    }
    // ... use workbook
    let worksheet = workbook.getWorksheet('Pattern');
    const resultData = [];
    const errorRows = [];
    worksheet.eachRow({ includeEmpty: false }, async function (row, rowNumber) {
      if (rowNumber !== 1) {
        let item = {
          warehouseName: row.values[1],
          barcode: row.values[2],
          productName: row.values[3],
          productSku: row.values[4],
          sku: row.values[5],
          brandName: row.values[6],
          category: row.values[7],
          productDescription: row.values[8],
          material: row.values[9],
          country: row.values[10],
          gender: row.values[11],
          weight: row.values[12],
          width: row.values[13],
          height: row.values[14],
          color: row.values[15],
          size: row.values[16],
          quantity: row.values[17],
          price: row.values[18],
          discountPercentage: row.values[19],
          companyName: row.values[20]
        }
        resultData.push(item);
        if(!row.values[3] || !row.values[5] ||
          !row.values[7] || !row.values[11] ||
          !row.values[15] || !row.values[16] ||
          !row.values[17] || !row.values[18]) {
          errorRows.push(rowNumber);
        }
      }
    });

     if (errorRows.length > 0) {
       let errorText = errorRows.join(',');
       throw new RpcException(`required fields are not filled on line ${errorText}`)
     }

    const groupedResultBySku = resultData.reduce((accum, currentValue) => {
      accum[currentValue.productSku || currentValue.sku] = accum[currentValue.productSku || currentValue.sku] || [];
      accum[currentValue.productSku || currentValue.sku].push(currentValue);
      return accum;
    }, {});

    const keys = Object.keys(groupedResultBySku);

    let importId = uuidv4();
    for (let i = 0; i < keys.length; i++) {
      const itemForProduct = groupedResultBySku[keys[i]][0];
        const companyInfo = await lastValueFrom(this.companyService.GetOneByName({legalName: itemForProduct.companyName}));
        const brandInfo = await this.brandService.getOneByName(itemForProduct.brandName);
        const categoryInfo = await this.categoryService.getOneByName(itemForProduct.category);

        const productData = {
          status: CreateProductRequest_ProductStatusEnum.ACTIVE,
          variants: [],
          characteristics: [],
          isSale: true,
          isTop: false,
          isPreorder: false,
          image: '',
          minAge: 12,
          length: '',
          companyId: companyInfo.result.id,
          brandId: brandInfo.data._id.toString(),
          categoryId: categoryInfo.data._id.toString(),
          categories: [categoryInfo.data._id.toString()],
          material: itemForProduct.material,
          country: itemForProduct.country,
          gender: itemForProduct.gender,
          weight: itemForProduct.weight,
          height: itemForProduct.height,
          width: itemForProduct.width,
          rating: 0,
          translation: {
            uz: {name: '', content: ''},
            ru: {name: itemForProduct.productName, content: itemForProduct.productDescription},
            en: {name: '', content: ''}
          },
        }
        const product = await this.productService.create(productData);

        for(let item of groupedResultBySku[keys[i]]) {
            const warehouseInfo = await lastValueFrom(this.warehouseService.GetOneByName({name: item.warehouseName}))
            const variantInfo = {
              price: item.price,
              productId: product.data._id,
              barcode: item.barcode,
              values: {
                translation: {
                  en: [{
                      field: 'color',
                      slug: 'color',
                      value: item.color.trim()
                    },
                    {
                      field: 'size',
                      slug: 'size',
                      value: item.size.toString()
                    }
                  ],
                  ru: [{
                      field: 'color',
                      slug: 'color',
                      value: item.color.trim()
                    },
                    {
                      field: 'size',
                      slug: 'size',
                      value: item.size.toString()
                    }
                  ],
                  uz: [{
                      field: 'color',
                      slug: 'color',
                      value: item.color.trim()
                    },
                    {
                      field: 'size',
                      slug: 'size',
                      value: item.size.toString()
                    }
                  ]
                }
              },
              warehouses: {
                id: warehouseInfo.result.id.toString(),
                quantity: item.quantity
              },
              importId
            }
            await this.variantService.variantCreate(variantInfo).catch((error) => {
              throw new RpcException(error.message);
            });
        }
    }
    return {importId}
  }

  private getCellByName(worksheet: Worksheet, name: string): Cell {
    let match;
    worksheet.eachRow((row) =>
      row.eachCell((cell) => {
        if (cell.names.find((n) => n === name)) {
          match = cell;
        }
      }),
    );
    return match;
  }
}
