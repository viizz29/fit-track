import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { map } from 'rxjs/operators';

// 🔧 snake_case / kebab-case → camelCase
function toCamelCase(str: string): string {
  return str.replace(/[_-](\w)/g, (_, c) => c.toUpperCase());
}

function transformDeep(data: any): any {
  if (data === null || data === undefined) return data;

  // ✅ Sequelize instance → plain object
  if (typeof data.toJSON === 'function') {
    data = data.toJSON();
  }

  // ✅ Array
  if (Array.isArray(data)) {
    return data.map(transformDeep);
  }

  // ✅ Object
  if (typeof data === 'object') {
    const result: any = {};

    if (data?.transform == false) {
      delete data.transform;
      return data;
    }

    for (const key of Object.keys(data)) {
      const value = data[key];

      const camelKey = toCamelCase(key);

      result[camelKey] = transformDeep(value);
    }

    return result;
  }

  return data;
}
@Injectable()
export class EncodeIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(map((data) => transformDeep(data)));
  }
}
