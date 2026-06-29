import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';


import { LoginDto } from './dto/login.dto';

import { JwtAuthGuard } from './guards/jwt-auth.guard';

import { CurrentUser } from './decorators/current-user.decorator';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Post('login')
  login(
    @Body() dto: LoginDto,
  ) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  profile(
    @CurrentUser() user: any,
  ) {
    return user;
  }

  @Post('register')
register(
  @Body()
  dto: RegisterDto,
) {

  return this.authService.register(dto);

}
}