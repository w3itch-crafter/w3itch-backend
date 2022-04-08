import { applyDecorators, Type } from '@nestjs/common';
import { ApiResponse, getSchemaPath } from '@nestjs/swagger';

import { PaginationLinks, PaginationMeta } from '../utils/responseClass';

export const ApiGeneralPaginationResponse = <TModel extends Type>(
  model: TModel,
  description?: string,
  status?: number,
) => {
  const data = {
    type: 'array',
    items: {},
  } as Record<string, any>;
  if (
    model.name === 'Boolean' ||
    model.name === 'String' ||
    model.name === 'Number'
  ) {
    data.items.type = model.name.toLowerCase();
  } else {
    data.items = { $ref: getSchemaPath(model) };
  }
  return applyDecorators(
    ApiResponse({
      status,
      description,
      schema: {
        properties: {
          items: data,
          meta: {
            $ref: getSchemaPath(PaginationMeta),
          },
          links: {
            $ref: getSchemaPath(PaginationLinks),
          },
        },
      },
    }),
  );
};
