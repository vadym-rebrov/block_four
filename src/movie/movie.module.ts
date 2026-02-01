import { Module } from '@nestjs/common';
import {MovieService} from './movie.service';
import {HttpModule} from '@nestjs/axios';

@Module({

    imports: [HttpModule],
    providers: [MovieService],
    exports: [MovieService]
})

export class MovieModule {}