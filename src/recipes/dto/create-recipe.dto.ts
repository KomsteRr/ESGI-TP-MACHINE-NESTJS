import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRecipeDto {
    @ApiProperty({ example: 'My Delicious Cake' })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({ example: 'Mix ingredients and bake...' })
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty({ example: 'Flour, Sugar, Eggs' })
    @IsString()
    @IsNotEmpty()
    ingredients: string;

    @ApiProperty({ example: false, required: false })
    @IsBoolean()
    @IsOptional()
    isPublic?: boolean;
}
