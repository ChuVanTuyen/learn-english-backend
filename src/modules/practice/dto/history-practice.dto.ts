import { IsInt, IsNotEmpty, IsObject, Min } from 'class-validator';

// create-history-practice.dto.ts
export class CreateHistoryPracticeDto {
  @IsObject()
  @IsNotEmpty()
  content: { [key: string | number]: number };

  @IsInt()
  @Min(0)
  time: number;

  @IsInt()
  @Min(0)
  correct: number;

  @IsInt()
  @Min(0)
  total: number;

  @IsInt()
  @IsNotEmpty()
  part_id: number;
}