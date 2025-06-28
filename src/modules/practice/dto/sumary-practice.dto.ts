import { IsArray, IsInt, IsNumber, IsObject, IsOptional } from "class-validator";
import { ObjectKey } from "src/interfaces/common";

export class SumaryPracticeDto {
  @IsObject()
  @IsOptional()
  done_questions?: ObjectKey<number[]>;

  @IsObject()
  @IsOptional()
  false_questions?: ObjectKey<number[]>;
}