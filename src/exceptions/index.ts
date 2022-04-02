import {
  HttpStatus,
  InternalServerErrorException,
  NotAcceptableException,
} from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
export class RequestNotAcceptableException extends NotAcceptableException {
  constructor() {
    super(
      {
        statusCode: HttpStatus.NOT_ACCEPTABLE,
        message: 'Not Acceptable: this request is not allowed',
      },
      'Not Acceptable',
    );
  }
  @ApiProperty({ example: HttpStatus.NOT_ACCEPTABLE })
  readonly statusCode: string;
  @ApiProperty({ example: 'Not Acceptable: this request is not allowed' })
  readonly message: string;
}
export class ConfigKeyNotFoundException extends InternalServerErrorException {
  constructor(keyPath: string) {
    super(`Config key ${keyPath} not found.`);
  }

  @ApiProperty({ example: HttpStatus.INTERNAL_SERVER_ERROR })
  readonly statusCode: string;
  @ApiProperty({ example: 'Error: Config key <name> not found.' })
  readonly message: string;
}
