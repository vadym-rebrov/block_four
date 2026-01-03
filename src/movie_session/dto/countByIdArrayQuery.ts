import {IsNumber} from "class-validator";

export class CountByIdArrayQuery {
    @IsNumber({ each: true })
    @IsArray()
    @IsOptional()
    movieIds: number[];
}