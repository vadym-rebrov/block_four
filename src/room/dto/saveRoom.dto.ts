import { Type } from 'class-transformer';
import {
    IsInt,
    IsOptional,
    IsString,
    Min,
    ValidateNested,
    IsNotEmpty
} from 'class-validator';

export class SeatTemplateDto {
    @IsInt()
    @Min(1)
    rowNumber: number;

    @IsInt()
    @Min(1)
    seatNumber: number;
}

export class SaveRoomDto {
    @IsInt()
    @Min(1)
    roomNumber: number;

    @IsOptional()
    @IsInt()
    @Min(0)
    capacity?: number;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    type?: string;

    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => SeatTemplateDto)
    seatsTemplate?: SeatTemplateDto[];
}