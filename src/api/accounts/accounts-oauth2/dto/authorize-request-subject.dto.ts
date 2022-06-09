import { AuthorizeRequestParam } from '../../types';

export class AuthorizeRequestSubjectDto {
  redirectUrl: string;
  param: AuthorizeRequestParam;
}
