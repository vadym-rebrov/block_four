import {Injectable} from "@nestjs/common";
import {MovieSessionRepository} from "./movieSession.repository";

import {SaveMovieSessionDto} from "./dto/saveMovieSession.dto";
import {MovieSessionQueryDto} from "./dto/movieSessionQueryDto";
import {CountByIdArrayQuery} from "./dto/countByIdArrayQuery";

@Injectable()
export class MovieSessionService {
    constructor(
        private readonly movieSessionRepository: MovieSessionRepository
    ) {}

    public create(saveDto : SaveMovieSessionDto){
        return this.movieSessionRepository.create(saveDto);
    }

    public findByQuery(query: MovieSessionQueryDto){
        return this.movieSessionRepository.findByQuery(query);
    }

    public countByMovieId(array: CountByIdArrayQuery) {
        return this.movieSessionRepository.
    }
}