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

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly hashingService: HashingService,
    private readonly jwtService: JwtService,
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
}
