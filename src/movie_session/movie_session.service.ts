import {Injectable} from "@nestjs/common";
import {MovieSessionRepository} from "./movie_session.repository";
import {StudentRepository} from "../student/student.repository";
import {GroupService} from "../group/group.service";
import {SaveMovieSessionDto} from "./dto/saveMovieSession.dto";

@Injectable()
class MovieSessionService {
    constructor(
        private readonly movieSessionRepository: MovieSessionRepository
    ) {}

    public create(saveDto : SaveMovieSessionDto){
        return this.movieSessionRepository.create(saveDto);
    }
}