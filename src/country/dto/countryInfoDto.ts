import { Expose } from 'class-transformer';

export class CountryInfoDto {
    @Expose()
    id: number;

    @Expose()
    name: string;

    constructor(partial: Partial<CountryInfoDto>) {
        Object.assign(this, partial);
    }
}