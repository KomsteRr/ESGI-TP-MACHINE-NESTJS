import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private mailService: MailService,
        private prisma: PrismaService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.usersService.findOne(email);
        if (user && (await bcrypt.compare(pass, user.password))) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        if (!user.isEmailConfirmed) {
            throw new UnauthorizedException('Email not confirmed');
        }

        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = new Date();
        expiry.setMinutes(expiry.getMinutes() + 10); // 10 minutes

        await this.prisma.token.create({
            data: {
                token: code,
                type: 'TWO_FACTOR',
                expiry,
                userId: user.id,
            },
        });

        await this.mailService.send2FACode(user.email, code);

        return {
            message: '2FA code sent to email',
            email: user.email,
        };
    }

    async verify2FA(email: string, code: string) {
        const user = await this.usersService.findOne(email);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const tokenData = await this.prisma.token.findFirst({
            where: {
                token: code,
                userId: user.id,
                type: 'TWO_FACTOR',
            },
        });

        if (!tokenData || tokenData.expiry < new Date()) {
            throw new UnauthorizedException('Invalid or expired 2FA code');
        }

        // Clean up used token
        await this.prisma.token.delete({ where: { id: tokenData.id } });

        const payload = { email: user.email, sub: user.id, roles: user.roles };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }

    async register(createUserDto: CreateUserDto) {
        const user = await this.usersService.create(createUserDto);
        const token = Math.random().toString(36).substring(7); // Simple random string
        const expiry = new Date();
        expiry.setHours(expiry.getHours() + 100); // 100 hours

        await this.prisma.token.create({
            data: {
                token,
                type: 'VALIDATION',
                expiry,
                userId: user.id,
            },
        });

        await this.mailService.sendUserConfirmation(user.email, token);
        return user;
    }

    async confirmEmail(token: string) {
        const tokenData = await this.prisma.token.findUnique({
            where: { token },
            include: { user: true },
        });

        if (!tokenData || tokenData.expiry < new Date() || tokenData.type !== 'VALIDATION') {
            throw new UnauthorizedException('Invalid or expired token');
        }

        await this.usersService.markEmailAsConfirmed(tokenData.user.email);
        await this.prisma.token.delete({ where: { id: tokenData.id } });
        return { message: 'Email confirmed successfully' };
    }
}
