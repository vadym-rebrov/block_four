import {MovieSessionInfoDto} from "./movieSessionInfoDto";

export class MovieSessionQueryResponseDto{
    list : MovieSessionInfoDto[];
    totalElements : number;

    constructor(list : MovieSessionInfoDto[], totalElements : number){
        this.list = list;
        this.totalElements = totalElements;

    }
}