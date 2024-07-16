import { plainToClass } from 'class-transformer';
import { IsEnum, IsNumber, IsString, validateSync } from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
  Provision = 'provision',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;
  @IsNumber()
  PORT: number;
  @IsString()
  HOST: string;
  @IsString()
  MONGO_DB_URI: string;
  @IsString()
  DEFAULT_LANG: string;
  @IsString()
  AMQP_URI: string;
  @IsString()
  HOOK_MS_QUEUE: string;
  @IsString()
  OWNER_MS_URI: string;
}

export enum EnvKeys {
  NODE_ENV = 'NODE_ENV',
  PORT = 'PORT',
  HOST = 'HOST',
  MONGO_DB_URI = 'MONGO_DB_URI',
  DEFAULT_LANG = 'DEFAULT_LANG',
  AMQP_URI = 'AMQP_URI',
  HOOK_MS_QUEUE = 'HOOK_MS_QUEUE',
  OWNER_MS_URI = 'OWNER_MS_URI',
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToClass(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });
  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
