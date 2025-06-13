import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { UsersService } from 'src/users/users.service';
import { RegisterDto } from './dto/register.dto';
import { HashingService } from './hashing/hashing.service';
import { JwtService } from '@nestjs/jwt';
import { OtpService } from './otp/otp.service';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly hashingService: HashingService,
    private readonly jwtService: JwtService,
    private readonly otpService: OtpService,
  ) {}

  async login(userData: LoginDto) {
    const user = await this.usersService.findByPhoneNumber(
      userData.phoneNumber,
    );
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const isPasswordValid = await this.hashingService.compare(
      userData.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException();
    }
    const payload = { sub: user.id };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async register(user: RegisterDto) {
    const existing = await this.usersService.findByPhoneNumber(
      user.phoneNumber,
    );
    if (existing) {
      throw new HttpException('User Already Exist', HttpStatus.FORBIDDEN);
    }

    const isOtpValid = await this.otpService.verify(
      user.phoneNumber,
      user.otpCode,
      'register',
    );
    if (!isOtpValid) {
      throw new HttpException(
        'Invalid or expired OTP',
        HttpStatus.REQUEST_TIMEOUT,
      );
    }
    const hashedPassword = await this.hashingService.hash(user.password);
    const newUser = await this.usersService.create({
      ...user,
      password: hashedPassword,
    });
    const payload = { sub: newUser.id };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async resetPassword(data: ResetPasswordDto) {
    const { phoneNumber, otpCode, newPassword } = data;

    const isOtpValid = await this.otpService.verify(
      phoneNumber,
      otpCode,
      'reset',
    );
    if (!isOtpValid) {
      throw new HttpException(
        'Invalid or expired OTP',
        HttpStatus.REQUEST_TIMEOUT,
      );
    }

    const user = await this.usersService.findByPhoneNumber(phoneNumber);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const hashedPassword = await this.hashingService.hash(newPassword);
    await this.usersService.update(user.id, { password: hashedPassword });

    return { message: 'Password reset successfully' };
  }

  async sendOtp(phoneNumber: string) {
    const user = await this.usersService.findByPhoneNumber(phoneNumber);
    if (user) {
      throw new HttpException(
        'User already exists with this phone number',
        HttpStatus.FORBIDDEN,
      );
    }
    await this.otpService.generate(phoneNumber, 'register');
    return { message: 'OTP sent successfully' };
  }

  async sendForgotPasswordOtp(phoneNumber: string) {
    const user = await this.usersService.findByPhoneNumber(phoneNumber);
    if (!user) {
      throw new HttpException(
        'User not found with this phone number',
        HttpStatus.NOT_FOUND,
      );
    }
    await this.otpService.generate(phoneNumber, 'reset');
    return { message: 'OTP sent for forgetting password' };
  }
}
