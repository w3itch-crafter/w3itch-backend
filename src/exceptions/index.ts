import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  GatewayTimeoutException,
  HttpStatus,
  InternalServerErrorException,
  NotAcceptableException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { ValidationError } from 'class-validator';

export class JWTException extends ForbiddenException {
  constructor(message: string) {
    super(
      {
        statusCode: HttpStatus.FORBIDDEN,
        message: `Forbidden: JWTException: ${message}`,
      },
      'Forbidden',
    );
  }
  @ApiProperty({ example: HttpStatus.FORBIDDEN })
  readonly statusCode: string;
  @ApiProperty({ example: 'Forbidden: JWTException' })
  readonly message: string;
}

export class JWTAudNotMatchException extends UnauthorizedException {
  constructor() {
    super(
      {
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Unauthorized: jwt audience not match',
      },
      'Unauthorized',
    );
  }
  @ApiProperty({ example: HttpStatus.UNAUTHORIZED })
  readonly statusCode: string;
  @ApiProperty({ example: 'Unauthorized: jwt audience not match' })
  readonly message: string;
}

export class JWTExpiredException extends UnauthorizedException {
  constructor() {
    super(
      {
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Unauthorized: jwt expired',
      },
      'Unauthorized',
    );
  }
  @ApiProperty({ example: HttpStatus.UNAUTHORIZED })
  readonly statusCode: string;
  @ApiProperty({ example: 'Unauthorized: jwt expired' })
  readonly message: string;
}

export class RequirdHttpHeadersNotFoundException extends BadRequestException {
  constructor() {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Bad Request: required http headers not found',
      },
      'Bad Request',
    );
  }
  @ApiProperty({ example: HttpStatus.BAD_REQUEST })
  readonly statusCode: string;
  @ApiProperty({ example: 'Bad Request: required http headers not found' })
  readonly message: string;
}

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

export class AccessDeniedException extends ForbiddenException {
  constructor(msg = 'access denied') {
    super(
      {
        statusCode: HttpStatus.FORBIDDEN,
        message: `Forbidden: ${msg}`,
      },
      'Forbidden',
    );
  }
  @ApiProperty({ example: HttpStatus.FORBIDDEN })
  readonly statusCode: string;
  @ApiProperty({ example: 'Forbidden: access denied' })
  readonly message: string;
}

export class ValidationException extends BadRequestException {
  constructor(msg = 'validation error') {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Bad Request: ${msg}`,
      },
      'Bad Request',
    );
  }
  @ApiProperty({ example: HttpStatus.BAD_REQUEST })
  readonly statusCode: string;
  @ApiProperty({ example: 'Bad Request: validation error' })
  readonly message: string;
}

export class DataNotFoundException extends NotFoundException {
  constructor(msg = 'data not found') {
    super(
      {
        statusCode: HttpStatus.NOT_FOUND,
        message: `Not Found: ${msg}`,
      },
      'Not Found',
    );
  }
  @ApiProperty({ example: HttpStatus.NOT_FOUND })
  readonly statusCode: string;
  @ApiProperty({ example: 'Not Found: data not found' })
  readonly message: string;
}

export class RelationNotFoundException extends NotFoundException {
  constructor(msg = 'relation not found') {
    super(
      {
        statusCode: HttpStatus.NOT_FOUND,
        message: `Not Found: ${msg}`,
      },
      'Not Found',
    );
  }
  @ApiProperty({ example: HttpStatus.NOT_FOUND })
  readonly statusCode: string;
  @ApiProperty({ example: 'Not Found: relation not found' })
  readonly message: string;
}

export class ResourceIsInUseException extends ConflictException {
  constructor(msg = 'the requested resource is in use') {
    super(
      {
        statusCode: HttpStatus.CONFLICT,
        message: `Conflict: ${msg}`,
      },
      'Conflict',
    );
  }
  @ApiProperty({ example: HttpStatus.CONFLICT })
  readonly statusCode: string;
  @ApiProperty({ example: 'Conflict: the requested resource is in use' })
  readonly message: string;
}

export class DataAlreadyExistsException extends ConflictException {
  constructor(msg = 'data already exists') {
    super(
      {
        statusCode: HttpStatus.CONFLICT,
        message: `Conflict: ${msg}`,
      },
      'Conflict',
    );
  }
  @ApiProperty({ example: HttpStatus.CONFLICT })
  readonly statusCode: string;
  @ApiProperty({ example: 'Conflict: data already exists' })
  readonly message: string;
}

export class InvalidStatusException extends ConflictException {
  constructor(msg = 'invalid status') {
    super(
      {
        statusCode: HttpStatus.CONFLICT,
        message: `Conflict: ${msg}`,
      },
      'Conflict',
    );
  }
  @ApiProperty({ example: HttpStatus.CONFLICT })
  readonly statusCode: string;
  @ApiProperty({ example: 'Conflict: data already exists' })
  readonly message: string;
}

export const validationErrorToBadRequestException = (
  errors: unknown[],
): BadRequestException => {
  if (errors && errors[0] instanceof ValidationError) {
    const error = errors[0];
    return new ValidationException(Object.values(error.constraints)[0]);
  }
  if (errors instanceof Error) {
    throw errors;
  }
};

export class EmptyAccessTokenException extends AccessDeniedException {
  constructor() {
    super('Empty access token');
  }

  @ApiProperty({ example: 'Forbidden: Empty access token' })
  readonly message: string;
}

export class PostSyncingException extends ConflictException {
  constructor() {
    super('Conflict: Still syncing');
  }

  @ApiProperty({ example: HttpStatus.CONFLICT })
  readonly statusCode: string;
  @ApiProperty({ example: 'Conflict: Still syncing' })
  readonly message: string;
}

export class InvalidPlatformException extends BadRequestException {
  constructor() {
    super('BadRequest: invalid platform');
  }

  @ApiProperty({ example: HttpStatus.BAD_REQUEST })
  readonly statusCode: string;
  @ApiProperty({ example: 'BadRequest: invalid platform' })
  readonly message: string;
}

export class IpfsGatewayTimeoutException extends GatewayTimeoutException {
  constructor(msg = 'IPFS gateway timeout') {
    super(
      {
        statusCode: HttpStatus.GATEWAY_TIMEOUT,
        message: `Gateway Timeout: ${msg}`,
      },
      'Gateway Timeout',
    );
  }
  @ApiProperty({ example: HttpStatus.CONFLICT })
  readonly statusCode: string;
  @ApiProperty({ example: 'Gateway Timeout: IPFS gateway timeout' })
  readonly message: string;
}

export class PublishFailedException extends InternalServerErrorException {
  constructor() {
    super('Error: publish failed');
  }

  @ApiProperty({ example: HttpStatus.INTERNAL_SERVER_ERROR })
  readonly statusCode: string;
  @ApiProperty({ example: 'Error: publish failed' })
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
