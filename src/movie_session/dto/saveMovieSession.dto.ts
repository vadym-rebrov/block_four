import { Type } from 'class-transformer';
import {
    IsDateString,
    IsInt,
    IsOptional,
    IsString,
    Min,
    ValidateNested,
    IsBoolean,
    IsMongoId,
    IsNotEmpty,
    IsNumber
} from 'class-validator';


export class TicketDto {
    @IsInt()
    @Min(1)
    rowNumber: number;

    @IsInt()
    @Min(1)
    seatNumber: number;

    @IsBoolean()
    @IsOptional()
    isBooked?: boolean;

    @IsMongoId()
    @IsOptional()
    booking_details_id?: string;
}

export class MovieDto {
    @IsNumber()
    ext_id: number;

    @IsString()
    @IsNotEmpty()
    title: string;
}

export class SaveMovieSessionDto{
    @ValidateNested()
    @Type(() => MovieDto)
    movie: MovieDto;

    @IsDateString()
    start: string;

    @IsDateString()
    end: string;

    @IsInt()
    @Min(1)
    room_number: number;

    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => TicketDto)
    tickets?: TicketDto[];
}