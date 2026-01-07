import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async create(createUserDto: CreateUserDto) {
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        return this.prisma.user.create({
            data: {
                email: createUserDto.email,
                password: hashedPassword,
                roles: 'USER', // Default role
                isEmailConfirmed: false,
            },
        });
    }

    async findOne(email: string) {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }

    async findById(id: number) {
        return this.prisma.user.findUnique({
            where: { id },
        });
    }

    async markEmailAsConfirmed(email: string) {
        return this.prisma.user.update({
            where: { email },
            data: { isEmailConfirmed: true },
        });
    }
}
