import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  Length,
  Matches,
  MinLength,
} from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ example: '9876543210' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[6-9]\d{9}$/, {
    message:
      'Phone number must be a valid Indian mobile number with 10 digits starting from 6-9',
  })
  phoneNumber: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @IsNotEmpty()
  @Length(6)
  otpCode: string;

  @ApiProperty({ example: 'newpassword' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;
}
