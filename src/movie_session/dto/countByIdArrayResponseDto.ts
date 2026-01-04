
export class CountByIdArrayResponseDto {
    [key: string]: number;

    constructor(data: Map<string, number>) {
        Object.assign(this, data);
    }
}