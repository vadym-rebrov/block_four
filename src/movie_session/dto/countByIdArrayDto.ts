import {IsArray, IsNotEmpty, IsNumber, IsOptional} from "class-validator";

export class CountByIdArrayDto {
    @IsArray()
    @IsNumber({}, { each: true })
    @IsNotEmpty()
    movieIds: number[];
}