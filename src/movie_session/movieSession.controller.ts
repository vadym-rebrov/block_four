import {Body, Controller, Get, HttpCode, Post, Query, UseGuards} from '@nestjs/common';
import {MovieSessionService} from './movieSession.service';
import {SaveMovieSessionDto} from './dto/saveMovieSession.dto';
import {MovieSessionQueryDto} from './dto/movieSessionQueryDto';
import {CountByIdArrayDto} from './dto/countByIdArrayDto';
import {MovieSessionQueryResponseDto} from './dto/movieSessionQueryResponseDto';
import {CountByIdArrayResponseDto} from './dto/countByIdArrayResponseDto';
import {AuthGuard} from "@nestjs/passport";

@Controller('movie-session')
export class MovieSessionController{
    constructor(private readonly movieSessionService: MovieSessionService) {}

    @Post()
    @UseGuards(AuthGuard('jwt'))
    async create(@Body() saveDto : SaveMovieSessionDto):Promise<string>{
        return this.movieSessionService.create(saveDto);
    }

    @Get()
    @UseGuards(AuthGuard('jwt'))
    async getAllByMovieId(@Query() query: MovieSessionQueryDto ):Promise<MovieSessionQueryResponseDto>{
        return this.movieSessionService.findByQuery(query);
    }

    @Post('_counts')
    @HttpCode(200)
    @UseGuards(AuthGuard('jwt'))
    async countByMovieId(@Body() array : CountByIdArrayDto):Promise<CountByIdArrayResponseDto>{
        return this.movieSessionService.countByMovieId(array);
    }
}