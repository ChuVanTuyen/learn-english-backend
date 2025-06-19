import { Type } from "class-transformer";
import { ArrayMinSize, ArrayNotEmpty, IsArray, IsNumber } from "class-validator";

export class QuestionByIdsDto {
    @IsArray()
    @ArrayNotEmpty()
    @ArrayMinSize(1)
    @Type(() => Number)
    @IsNumber({}, { each: true }) // mỗi phần tử trong mảng phải là số
    ids: number[];
}