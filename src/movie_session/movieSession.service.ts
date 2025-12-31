import {Injectable} from "@nestjs/common";
import {MovieSessionRepository} from "./movieSession.repository";

import {SaveMovieSessionDto} from "./dto/saveMovieSession.dto";

@Injectable()
export class MovieSessionService {
    constructor(
        private readonly movieSessionRepository: MovieSessionRepository
    ) {}

    public create(saveDto : SaveMovieSessionDto){
        return this.movieSessionRepository.create(saveDto);
    }
}