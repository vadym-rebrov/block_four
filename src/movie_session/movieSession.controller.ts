import {Body, Controller, Get, Injectable, Post} from "@nestjs/common";
import {StudentService} from "../student/student.service";
import {MovieSessionService} from "./movieSession.service";
import {SaveMovieSessionDto} from "./dto/saveMovieSession.dto";

@Controller('movie-session')
export class MovieSessionController{
    constructor(private readonly movieSessionService: MovieSessionService) {}

    @Post()
    async create(@Body() saveDto : SaveMovieSessionDto){
        return this.movieSessionService.create(saveDto);
    }
}