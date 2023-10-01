import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsString } from 'class-validator';
import { EventType } from 'database/enums/event-type';

export class IAPCreateRequest {
  @ApiProperty({ example: 'abc-xxx' })
  @IsString()
  iapPackage: string;

  @ApiProperty({ example: 'IAP_CONSUMABLE,IAP_NONCONSUMABLE' })
  @IsEnum(EventType)
  type: EventType;

  @ApiProperty({ example: '10' })
  @IsNumber()
  ruby: number;

  @ApiProperty({ example: '10' })
  @IsNumber()
  save: number;

  @ApiProperty({ example: '10' })
  @IsNumber()
  help: number;
}
