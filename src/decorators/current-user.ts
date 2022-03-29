import { createParamDecorator } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data, req) => req.args.find((e) => 'user' in e).user,
);
