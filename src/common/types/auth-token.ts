import { IAccessToken } from 'src/modules/auth/dtos';

export type AuthToken = {
  accessToken: IAccessToken['accessToken'];
};
