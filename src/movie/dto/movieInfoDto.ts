import {Expose, Type} from "class-transformer";
import {DirectorInfoDto} from "../../director/dto/directorInfoDto";
import {GenreInfoDto} from "../../genre/dto/genreInfoDto";

export class MovieInfoDto{
    @Expose()
    id: number;

    @Expose()
    title: string;

    @Expose()
    @Type(() => Date)
    released: Date;

    @Expose()
    genres: GenreInfoDto[];

    @Expose()
    rating: number;

    @Expose()
    @Type(() => DirectorInfoDto)
    director: DirectorInfoDto;

    @Expose()
    awards: string[];
}