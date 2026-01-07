import { Controller, Post, Get, Body, Query, UnauthorizedException, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Verify2FADto } from './dto/verify-2fa.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    @ApiOperation({ summary: 'Register a new user' })
    create(@Body() createUserDto: CreateUserDto) {
        return this.authService.register(createUserDto);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Login user' })
    @ApiResponse({ status: 200, description: 'Return JWT access token' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async login(@Body() loginDto: LoginDto) {
        const user = await this.authService.validateUser(
            loginDto.email,
            loginDto.password,
        );
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        return this.authService.login(user);
    }

    @Post('verify-2fa')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Verify 2FA code and get token' })
    @ApiResponse({ status: 200, description: 'Return JWT access token' })
    verify2FA(@Body() verify2FADto: Verify2FADto) {
        return this.authService.verify2FA(verify2FADto.email, verify2FADto.code);
    }

    @Get('confirm')
    @ApiOperation({ summary: 'Confirm email address' })
    confirm(@Query('token') token: string) {
        return this.authService.confirmEmail(token);
    }
}
