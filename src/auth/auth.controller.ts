import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Public } from './decorators/public.decorator';
import { Request } from 'express';
import { ApiBearerAuth } from '@nestjs/swagger';
import { REQUEST_USER_KEY } from 'src/common/constants';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() body: LoginDto) {
    return await this.authService.login(body);
  }

  @Public()
  @Post('register')
  async register(@Body() body: RegisterDto) {
    return await this.authService.register(body);
  }

  @ApiBearerAuth()
  @Get('self')
  getProfile(@Req() req: Request) {
    console.log(req[REQUEST_USER_KEY]);
    return {
      message: 'hi',
    };
  }
}
