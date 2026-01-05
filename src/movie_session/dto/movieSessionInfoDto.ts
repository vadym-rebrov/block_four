import { Expose, Transform, Type } from 'class-transformer';

export class TicketInfoDto {
    @Expose()
    rowNumber: number;

    @Expose()
    seatNumber: number;

    @Expose()
    isBooked: boolean;

    @Expose()
    @Transform(({ value }) => value?.toString())
    booking_details_id?: string;
}

export class MovieShortInfoDto {
    @Expose()
    ext_id: number;

    @Expose()
    title: string;
}

export class MovieSessionInfoDto {
    @Expose()
    @Transform(({ obj }) => obj._id?.toString())
    id: string;

    @Expose()
    @Type(() => MovieShortInfoDto)
    movie: MovieShortInfoDto;

    @Expose()
    @Type(() => Date)
    start: Date;

    @Expose()
    @Type(() => Date)
    end: Date;

    @Expose()
    roomNumber: number;

    @Expose()
    @Type(() => TicketInfoDto)
    tickets: TicketInfoDto[];
}