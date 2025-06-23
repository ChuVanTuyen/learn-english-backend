import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateNotebookDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}


export class UpdateNotebookDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsString()
  @IsNotEmpty()
  name: string;
}