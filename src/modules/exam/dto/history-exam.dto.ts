import { IsInt, IsNotEmpty, IsObject, Min } from 'class-validator';

export class CreateHistoryExamDto {
  @IsObject()
  @IsNotEmpty()
  content: { [key: string | number]: number };

  @IsInt()
  @Min(-1)
  time: number;

  @IsInt()
  @Min(-1)
  correct_listen: number;

  @IsInt()
  @Min(-1)
  correct_read: number;

  @IsInt()
  @Min(-1)
  score: number;
}