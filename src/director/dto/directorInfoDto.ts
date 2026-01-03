import { Expose, Type } from 'class-transformer';
import {CountryInfoDto} from "../../country/dto/countryInfoDto";

export class DirectorInfoDto {
    @Expose()
    id: number;

    @Expose()
    fullName: string;

    @Expose()
    @Type(() => CountryInfoDto)
    country: CountryInfoDto;

    @Expose()
    @Type(() => Date)
    birthday: Date;

    constructor(partial: Partial<DirectorInfoDto>) {
        Object.assign(this, partial);
    }
}