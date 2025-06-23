import { IsString, IsInt, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateNotebookWordDto {
  @IsString()
  @IsNotEmpty()
  word: string;

  @IsString()
  @IsOptional()
  pronounce?: string;

  @IsString()
  @IsOptional()
  kind?: string;

  @IsString()
  @IsNotEmpty()
  mean: string;

  @IsString()
  @IsOptional()
  note?: string;
}

export class UpdateNotebookWordDto {
  @IsString()
  @IsOptional()
  word?: string;

  @IsString()
  @IsOptional()
  pronounce?: string;

  @IsString()
  @IsOptional()
  kind?: string;

  @IsString()
  @IsOptional()
  mean?: string;

  @IsString()
  @IsOptional()
  note?: string;
}