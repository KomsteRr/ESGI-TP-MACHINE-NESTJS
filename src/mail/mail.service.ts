import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
    private transporter: nodemailer.Transporter;

    constructor(private configService: ConfigService) {
        this.transporter = nodemailer.createTransport({
            host: this.configService.get<string>('MAIL_HOST') || 'localhost',
            port: Number(this.configService.get<number>('MAIL_PORT')) || 1025,
            secure: false,
            auth: {
                user: this.configService.get<string>('MAIL_USER') || 'user',
                pass: this.configService.get<string>('MAIL_PASS') || 'pass',
            },
        });
    }

    async sendUserConfirmation(email: string, token: string) {
        const url = `http://localhost:3500/auth/confirm?token=${token}`;

        await this.transporter.sendMail({
            from: '"No Reply" <noreply@example.com>',
            to: email,
            subject: 'Welcome to Recipe App! Confirm your Email',
            html: `
        <p>Hey,</p>
        <p>Please click below to confirm your email</p>
        <p>
            <a href="${url}">Confirm</a>
        </p>
        <p>If you did not request this email you can safely ignore it.</p>
        `,
        });
    }

    async send2FACode(email: string, code: string) {
        await this.transporter.sendMail({
            from: '"No Reply" <noreply@example.com>',
            to: email,
            subject: 'Your 2FA Code',
            html: `
        <p>Your login code is: <strong>${code}</strong></p>
        <p>It expires in 10 minutes.</p>
        `,
        });
    }
}
