import { IsInt, IsNotEmpty, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class MovieSessionQueryDto {
    @IsNotEmpty()
    @Type(() => Number)
    @IsInt()
    movieId: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    size?: number = 10;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    from?: number = 0;
}