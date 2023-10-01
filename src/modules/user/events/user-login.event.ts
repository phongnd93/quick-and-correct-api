import { User } from 'database/entities';
import { MailType } from 'src/common/enums';

export class UserAuthEvent {
  constructor(id: User, type?: MailType) {
    this.user = id;
    this.type = type;
  }

  user: User;

  type?: MailType;
}
