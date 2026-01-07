import { Injectable, ConflictException } from '@nestjs/common';
import { CreateRatingDto } from './dto/create-rating.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RatingsService {
  constructor(private prisma: PrismaService) { }

  async create(createRatingDto: CreateRatingDto, userId: number) {
    const existing = await this.prisma.rating.findUnique({
      where: {
        userId_recipeId: {
          userId,
          recipeId: createRatingDto.recipeId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('You have already rated this recipe');
    }

    return this.prisma.rating.create({
      data: {
        value: createRatingDto.value,
        recipeId: createRatingDto.recipeId,
        userId,
      },
    });
  }

  findAll() {
    return this.prisma.rating.findMany();
  }
}
