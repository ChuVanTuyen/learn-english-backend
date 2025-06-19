import { IsArray, IsInt, IsNumber, IsObject, IsOptional } from "class-validator";
import { ObjectKey } from "src/interfaces/common";

export class SumaryPracticeDto {
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  done_question_ids?: number[];

  @IsObject()
  @IsOptional()
  false_question_ids?: ObjectKey<number[]>;
}