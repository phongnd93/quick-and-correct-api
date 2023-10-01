export interface IAccessToken {
  accessToken: string;
}

export interface IJwtPayload {
  id: string;
  email: string;
}

export interface IRefreshToken {
  refreshToken: string;
}

export interface IForgotPasswordJwtPayload {
  email: string;
}

export interface IJwtEmailPayload {
  email: string;
}
