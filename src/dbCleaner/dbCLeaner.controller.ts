import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Controller()
export class DbCleanerController {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  @GrpcMethod('DbCleanerService', 'DbClean')
  async dbClean() {
    try {
      const collections = await this.connection.db.collections();
      for (let i = 0; i < collections.length; i++) {
        await collections[i].drop();
      }
      return { result: 'OK' };
    } catch (error) {
      console.log(error);
      return { errors: ["Error: Couldn't clean DB"] };
    }
  }
}
