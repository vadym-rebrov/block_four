import {Body, Controller, Get, Injectable, Param, Post, Query} from "@nestjs/common";
import {StudentService} from "../student/student.service";
import {MovieSessionService} from "./movieSession.service";
import {SaveMovieSessionDto} from "./dto/saveMovieSession.dto";
import {MovieSessionQueryDto} from "./dto/movieSessionQueryDto";
import {CountByIdArrayQuery} from "./dto/countByIdArrayQuery";

@Controller('movie-session')
export class MovieSessionController{
    constructor(private readonly movieSessionService: MovieSessionService) {}

    @Post()
    async create(@Body() saveDto : SaveMovieSessionDto){
        return this.movieSessionService.create(saveDto);
    }

    @Get()
    async getAllByMovieId(@Query() query: MovieSessionQueryDto ){
        return this.movieSessionService.findByQuery(query);
    }

    @Post('_counts')
    async countByMovieId(array : CountByIdArrayQuery){
        return this.movieSessionService.countByMovieId(array);
    }
}