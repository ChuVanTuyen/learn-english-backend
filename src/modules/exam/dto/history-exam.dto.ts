import { IsInt, IsNotEmpty, IsObject, Min } from 'class-validator';

export class CreateHistoryExamDto {
  @IsObject()
  @IsNotEmpty()
  content: { [key: string | number]: number };

  @IsInt()
  @Min(0)
  time: number;

  @IsInt()
  @Min(0)
  correct_listent: number;

  @IsInt()
  @Min(0)
  correct_read: number;

  @IsInt()
  @IsNotEmpty()
  exam_id: number;
}