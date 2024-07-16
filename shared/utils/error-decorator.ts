import { RpcException } from '@nestjs/microservices';

export function CatchExceptions() {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    descriptor.value = function (...args: any[]) {
      const result = originalMethod.apply(this, args);
      if (result && typeof result.then === 'function' && typeof result.catch === 'function') {
        return result.catch((err) => {
          throw new RpcException({
            stack: err.stack,
            message: err.message,
          });
        });
      }
      return result;
    };
    return descriptor;
  };
}
