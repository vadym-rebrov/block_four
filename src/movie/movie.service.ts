import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import {MovieInfoDto} from "./dto/movieInfoDto";
import {ConfigService} from "@nestjs/config";

@Injectable()
export class MovieService {

    private apiUrl;

    constructor(private readonly httpService: HttpService,
                private readonly configService : ConfigService) {
        this.apiUrl = configService.get<string>('MOVIE_SERVICE_URL');
    }



    async getById(id: number): Promise<MovieInfoDto> {
        const { data } = await firstValueFrom(
            this.httpService.get<MovieInfoDto>(this.apiUrl+'/'+id),
        );
        return data;
    }


}