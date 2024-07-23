import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  displayName: string;

  @IsString(null)
  @IsOptional()
  bookmark?: string[] | null;

  @IsString(null)
  @IsOptional()
  profile?: string;

  @IsString()
  @IsOptional()
  phone?: string;
}
