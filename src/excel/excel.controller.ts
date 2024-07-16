import { Controller, Get, Header, Post, Res } from '@nestjs/common';
import { UploadedFile, UseInterceptors } from '@nestjs/common/decorators';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ExcelService } from './excel.service';
import { GrpcMethod } from '@nestjs/microservices';
import { CatchExceptions } from '../../shared/utils/error-decorator';

@Controller('excel')
export class ExcelController {
  constructor(private excelService: ExcelService) {}

  @Get('/download')
  @Header('Content-type', 'text/xlsx')
  async downloadReport(@Res() res: Response) {
    let result = await this.excelService.downloadExcel();
    res.download(`${result}`);
  }

  @GrpcMethod('ProductService', 'UploadExcel')
  @CatchExceptions()
  async uploadFile(file: any) {
    return await this.excelService.readFileExcel(file);
  }
}
