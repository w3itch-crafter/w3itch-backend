import { IsNotEmpty } from 'class-validator';

export class VerificationCodeDto {
  @IsNotEmpty()
  key: string;
}
