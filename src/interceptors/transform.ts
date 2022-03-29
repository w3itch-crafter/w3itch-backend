import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { TransformResponse } from '../types';

@Injectable()
export class TransformResponseInterceptor<T>
  implements NestInterceptor<T, TransformResponse<T>>
{
  intercept(
    ctx: ExecutionContext,
    next: CallHandler,
  ): Observable<TransformResponse<T>> {
    const res: Response = ctx.switchToHttp().getResponse();
    return next.handle().pipe(
      map((data) => ({
        data,
        statusCode: res.statusCode,
        message: res.statusMessage || 'Ok',
      })),
    );
  }
}
