import { BadRequestException, Logger, ValidationError } from '@nestjs/common';

const parseConstraints = (errors: ValidationError[]) => {
  let messages = [];
  errors.map((error) => {
    if (error.constraints) {
      messages = [...messages, Object.values(error.constraints)];
    } else if (error.children) {
      messages = [...messages, parseConstraints(error.children)];
    }
  });
  return messages.flat();
};

export const validateExceptionLogger = (logger: Logger) => {
  return (errors: ValidationError[]) => {
    // we take the first error as a sample to get its name and the input object
    const error = errors[0];
    const errorMessages = parseConstraints(errors);
    if (error.value) {
      logger.verbose(
        'Validation failed on input object: ' +
          JSON.stringify(error.value, null, 2),
        'ValidationPipe',
      );
    } else {
      logger.verbose('Validation failed', 'ValidationPipe');
    }
    if (error.value?.constructor?.name) {
      logger.verbose(
        'The excepted object is: ' + error.value.constructor.name,
        'ValidationPipe',
      );
    }
    logger.verbose(
      'Problems are: ' + JSON.stringify(errorMessages, null, 2),
      'ValidationPipe',
    );
    return new BadRequestException(errorMessages);
  };
};
