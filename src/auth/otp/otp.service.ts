import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Otp } from './entities/otp.entity';

@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(Otp)
    private readonly otpRepo: Repository<Otp>,
  ) {}

  private readonly OTP_EXPIRY_MINUTES = 60;
  private readonly OTP_LIMIT_PER_HOUR = 5;

  async generate(
    phoneNumber: string,
    purpose: 'register' | 'reset',
  ): Promise<string> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const recentOtps = await this.otpRepo.count({
      where: {
        phoneNumber,
        createdAt: MoreThan(oneHourAgo),
      },
    });

    if (recentOtps >= this.OTP_LIMIT_PER_HOUR) {
      throw new HttpException(
        'Too Many Requests',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const otp = this.otpRepo.create({ phoneNumber, code, purpose });
    await this.otpRepo.save(otp);

    console.log(
      `Your verification code is ${code} for this number ${phoneNumber}`,
    );
    return code;
  }

  async verify(
    phoneNumber: string,
    code: string,
    purpose: 'register' | 'reset',
  ): Promise<boolean> {
    const expiryTime = new Date(
      Date.now() - this.OTP_EXPIRY_MINUTES * 60 * 1000,
    );

    const otp = await this.otpRepo.findOne({
      where: {
        phoneNumber,
        code,
        isUsed: false,
        purpose,
        createdAt: MoreThan(expiryTime),
      },
      order: { createdAt: 'DESC' },
    });

    if (!otp) return false;

    otp.isUsed = true;
    await this.otpRepo.save(otp);
    return true;
  }
}
