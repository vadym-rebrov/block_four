import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import {MovieInfoDto} from "./dto/movieInfoDto";

@Injectable()
export class MovieService {

    constructor(private readonly httpService: HttpService) {}

    private apiUrl = 'http://localhost:8080/api/movie'

    async getById(id: number): Promise<MovieInfoDto> {
        const { data } = await firstValueFrom(
            this.httpService.get<MovieInfoDto>(this.apiUrl+'/'+id),
        );
        console.log(data);
        return data;
    }


}