import { IsInt, IsNotEmpty, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class MovieSessionQueryDto {
    @IsNotEmpty()
    @Type(() => Number)
    @IsInt()
    movieId: number;

    @Type(() => Number)
    @IsInt()
    @Min(1)
    @IsOptional()
    size: number = 10;

    @Type(() => Number)
    @IsInt()
    @Min(0)
    @IsOptional()
    from: number = 0;
}