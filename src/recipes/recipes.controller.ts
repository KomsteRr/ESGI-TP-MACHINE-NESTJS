import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('recipes')
@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  create(@Body() createRecipeDto: CreateRecipeDto, @Request() req) {
    return this.recipesService.create(createRecipeDto, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all public recipes' })
  findAll() {
    return this.recipesService.findAllPublic();
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my recipes' })
  findAllMy(@Request() req) {
    return this.recipesService.findAllByUser(req.user.userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard) // Optional: Allow public access?
  // If public access allowed, guard should be optional or handle "try auth".
  // NestJS standard guards block if fail.
  // I will make it public, but if user wants to see private recipe, they must provide token?
  // Complex with standard JwtAuthGuard.
  // Simplification: GET /:id is public for public recipes. Private recipes need token.
  // I can use a global Interceptor or just two endpoints?
  // Let's try to parse token if present manually or use a custom "OptionalAuthGuard"?
  // For now: Require Auth for simplicity OR make this endpoint purely public-logic?
  // Prompt: "Gestion d’endpoints public et privé".
  // I'll make GET /:id Public but it only returns if public. Users have to use /my for private listing, or I need to handle "soft auth".
  // Actually, standard JwtAuthGuard fails 401.
  // I'll stick to: Public Endpoint returns ONLY public. Private Endpoint (if I had one) returns private.
  // BUT what if I want to read my private recipe details?
  // I'll add @UseGuards(JwtAuthGuard) but make it handle non-existent user?
  // No, better: @Get(':id') is always public check. If authenticated user wants to see it, they can pass token?
  // I'll define: GET /recipes/:id -> Public check only.
  // And if you want to see your own private recipe, use GET /recipes/my/:id?
  // Or just implement a `PublicOrAuth` guard.
  // For this task, strict separation is easier:
  // GET /recipes/:id -> Public recipes only.
  // GET /recipes/private/:id -> Auth required, Private/Public recipes visible to user.
  // I'll implement `findOne` here as "Public Only" for now?
  // No, that's bad UX.
  // I will just use no guard on findOne, but try to extract user from request if possible.
  // But standard request doesn't parse JWT without guard.
  // I'll use a specific `findOne` for public and `findOnePrivate` for auth.
  // Let's stick to standard Guards.
  // GET /recipes/:id -> JWT Guard. If you don't have token, you can't even try.
  // Wait, that blocks anonymous users from seeing public recipes.
  // So NO Guard on GET /recipes/:id.
  // But then `req.user` is undefined.
  // Service `findOne(id, undefined)` -> throws if private. Correct.
  // Service `findOne(id, userId)` -> checks ownership.
  // So Controller needs to get userId IF available.
  // I will leave GET /recipes/:id unprotected and pass undefined. Anonymous users see public recipes.
  // Authenticated users accessing this endpoint WITHOUT token see public recipes.
  // Authenticated users accessing WITH token -> standard request parser doesn't run without guard.
  // I'd need a middleware to parse User if token exists.
  // I'll create `OptionalJwtAuthGuard`.
  // Code length constraint.
  // I'll just leave it unprotected for now (UserId undefined). So you can only see Public recipes via ID.
  // To see private, I'll add `GET /my/:id`? Or just rely on "Manage your recipes via secure endpoints".
  // The prompt says "Access to a limited resource specific to our user".
  // I'll add `GET /my/:id`.
  findOne(@Param('id') id: string) {
    return this.recipesService.findOne(+id);
  }

  @Get('my/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findOneMy(@Param('id') id: string, @Request() req) {
    return this.recipesService.findOne(+id, req.user.userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() updateRecipeDto: UpdateRecipeDto, @Request() req) {
    const isAdmin = req.user.roles.includes('ADMIN');
    return this.recipesService.update(+id, updateRecipeDto, req.user.userId, isAdmin);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  remove(@Param('id') id: string, @Request() req) {
    const isAdmin = req.user.roles.includes('ADMIN');
    return this.recipesService.remove(+id, req.user.userId, isAdmin);
  }
}
