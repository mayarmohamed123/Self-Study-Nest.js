import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CURRENT_USER_KEY } from '../../utils/constants.js';
import { jwtPayload } from '../../utils/types.js';

export const CurrentUser = createParamDecorator(
  (data, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const user: jwtPayload = request[CURRENT_USER_KEY];
    return user;
  },
);
