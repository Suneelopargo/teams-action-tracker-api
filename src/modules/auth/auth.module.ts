import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import type { StringValue } from 'ms';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
    imports: [
        UserModule,
        JwtModule.register({
            secret: process.env.JWT_ACCESS_SECRET,

            signOptions: {
                expiresIn:
                    (process.env.JWT_ACCESS_EXPIRES || '15m') as StringValue,
            },
        }),
    ],

    controllers: [AuthController],

    providers: [AuthService,JwtStrategy],

    exports: [AuthService,JwtStrategy],
})
export class AuthModule { }