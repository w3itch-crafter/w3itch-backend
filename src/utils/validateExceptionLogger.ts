import { BadRequestException, Logger, ValidationError } from '@nestjs/common';

export const validateExceptionLogger = (logger: Logger) => {
  return (errors: ValidationError[]) => {
    const error = errors[0];
    const errorMessages = error.children
      .map((err) => Object.values(err.constraints))
      .flat();
    logger.verbose(
      'Validation failed on input object: ' +
        JSON.stringify(error.value, null, 2),
      'ValidationPipe',
    );
    logger.verbose(
      'The excepted object is: ' + error.value.constructor.name,
      'ValidationPipe',
    );
    logger.verbose(
      'Problems are: ' + JSON.stringify(errorMessages, null, 2),
      'ValidationPipe',
    );
    return new BadRequestException(errorMessages);
  };
};
