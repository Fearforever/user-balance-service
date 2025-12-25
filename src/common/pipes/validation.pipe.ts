import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
  ValidationPipeOptions
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  private readonly options: ValidationPipeOptions;

  constructor(options: ValidationPipeOptions = {}) {
    this.options = options;
  }

  async transform(value: any, metadata: ArgumentMetadata) {
    const { metatype } = metadata;

    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToInstance(metatype, value, {
      enableImplicitConversion: this.options.transformOptions?.enableImplicitConversion,
    });

    const errors = await validate(object, this.options);

    if (errors.length > 0) {
      const errorMessages = errors
        .map(e => Object.values(e.constraints ?? {}))
        .flat()
        .join(', ');

      throw new BadRequestException(`Validation failed: ${errorMessages || 'Unknown error'}`);
    }

    if (this.options.whitelist) {
      const dtoKeys = Reflect.getMetadataKeys(object).filter(key => key.startsWith('class-validator:'));
      for (const key in object) {
        if (!dtoKeys.some(dk => dk.includes(key))) {
          delete object[key];
        }
      }
    }

    return object;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}