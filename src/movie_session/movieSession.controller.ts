import {Body, Controller, Get, Post, Query} from "@nestjs/common";
import {MovieSessionService} from "./movieSession.service";
import {SaveMovieSessionDto} from "./dto/saveMovieSession.dto";
import {MovieSessionQueryDto} from "./dto/movieSessionQueryDto";
import {CountByIdArrayDto} from "./dto/countByIdArrayDto";
import {MovieSessionQueryResponseDto} from "./dto/movieSessionQueryResponseDto";
import {CountByIdArrayResponseDto} from "./dto/countByIdArrayResponseDto";

@Controller('movie-session')
export class MovieSessionController{
    constructor(private readonly movieSessionService: MovieSessionService) {}

    @Post()
    async create(@Body() saveDto : SaveMovieSessionDto):Promise<string>{
        return this.movieSessionService.create(saveDto);
    }

    @Get()
    async getAllByMovieId(@Query() query: MovieSessionQueryDto ):Promise<MovieSessionQueryResponseDto>{
        return this.movieSessionService.findByQuery(query);
    }

    @Post('_counts')
    async countByMovieId(@Body() array : CountByIdArrayDto):Promise<CountByIdArrayResponseDto>{
        return this.movieSessionService.countByMovieId(array);
    }
}