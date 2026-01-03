import { Expose } from 'class-transformer';

export class GenreInfoDto {
    @Expose()
    id: number;

    @Expose()
    name: string;
}