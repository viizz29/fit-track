import { Injectable, PipeTransform, ArgumentMetadata } from '@nestjs/common';

// 🔁 recursive transform
function transformDeep(data: any): any {
  if (data === null || data === undefined) return data;

  // Array
  if (Array.isArray(data)) {
    return data.map(transformDeep);
  }

  // Object
  if (typeof data === 'object') {
    const result: any = {};

    for (const key of Object.keys(data)) {
      const value = data[key];

      result[key] = transformDeep(value);
    }

    return result;
  }

  return data;
}

@Injectable()
export class FieldNmaeTransformerPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    // Only process incoming request data
    // console.log({ metadata, value });
    if (
      metadata.type === 'query' ||
      metadata.type === 'body'
      // || metadata.type === 'param'
    ) {
      const newValue = transformDeep(value);

      // console.log(newValue);

      return newValue;
    }
    // else if (metadata.type == 'param') {
    //   const newValue = isIdField(metadata.data as string)
    //     ? decodeValue(value)
    //     : value;

    //   console.log({ newValue });
    //   return newValue;
    // }

    // console.log({ value });

    return value;
  }
}
