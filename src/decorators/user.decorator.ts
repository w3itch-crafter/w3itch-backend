import { createParamDecorator } from '@nestjs/common';

import { UserJWTPayload } from '../types';

interface RequestWithUser extends Request {
  user: UserJWTPayload;
}

type UserParamDecoratorReturnType = UserJWTPayload;

export const CurrentUser = createParamDecorator<UserParamDecoratorReturnType>(
  (data, ctx) => {
    const req: RequestWithUser = ctx.switchToHttp().getRequest();
    return req.user;
  },
);
