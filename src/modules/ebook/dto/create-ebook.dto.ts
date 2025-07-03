import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateEbookDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsString()
  pdf: string;
  @IsNotEmpty()
  @IsString()
  thumbnail: string;

  @IsOptional()
  @IsString()
  author?: string;
}
