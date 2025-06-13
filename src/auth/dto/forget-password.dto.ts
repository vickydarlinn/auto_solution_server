import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({ example: '9876543210' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[6-9]\d{9}$/, {
    message:
      'Phone number must be a valid Indian mobile number with 10 digits starting from 6-9',
  })
  phoneNumber: string;
}
