import { User } from 'database/entities';
import { Request } from 'express';

export type IRequest = Request & {
  user: User;
};
