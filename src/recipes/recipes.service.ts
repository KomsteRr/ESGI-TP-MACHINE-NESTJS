import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RecipesService {
  constructor(private prisma: PrismaService) { }

  create(createRecipeDto: CreateRecipeDto, authorId: number) {
    return this.prisma.recipe.create({
      data: {
        ...createRecipeDto,
        authorId,
      },
    });
  }

  findAllPublic() {
    return this.prisma.recipe.findMany({
      where: { isPublic: true },
    });
  }

  findAllByUser(userId: number) {
    return this.prisma.recipe.findMany({
      where: { authorId: userId },
    });
  }

  async findOne(id: number, userId?: number) {
    const recipe = await this.prisma.recipe.findUnique({ where: { id } });
    if (!recipe) throw new NotFoundException('Recipe not found');

    if (!recipe.isPublic && (!userId || recipe.authorId !== userId)) {
      // If user is admin? I should pass isAdmin too or just handle it in controller/guard?
      // For simplicity: if strict rules, check here.
      // But if I want to allow Admin, I should pass `isAdmin` too or rely on the caller validation.
      // Let's assume this method is strict: Only author or public.
      // Admin override can be handled by a separate method or passed arg.
      throw new ForbiddenException('Private recipe');
    }
    return recipe;
  }

  async update(id: number, updateRecipeDto: UpdateRecipeDto, userId: number, isAdmin: boolean) {
    const recipe = await this.findOne(id);
    if (recipe.authorId !== userId && !isAdmin) {
      throw new ForbiddenException('You cannot update this recipe');
    }
    return this.prisma.recipe.update({
      where: { id },
      data: updateRecipeDto,
    });
  }

  async remove(id: number, userId: number, isAdmin: boolean) {
    const recipe = await this.findOne(id);
    if (recipe.authorId !== userId && !isAdmin) {
      throw new ForbiddenException('You cannot delete this recipe');
    }
    return this.prisma.recipe.delete({ where: { id } });
  }
}
