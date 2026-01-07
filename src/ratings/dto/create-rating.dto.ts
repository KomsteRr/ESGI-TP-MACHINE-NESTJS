import { IsInt, IsNotEmpty, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRatingDto {
    @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
    @IsInt()
    @Min(1)
    @Max(5)
    value: number;

    @ApiProperty({ example: 1 })
    @IsInt()
    @IsNotEmpty()
    recipeId: number;
}
