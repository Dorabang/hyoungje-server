import { IsString, IsOptional } from 'class-validator';

export class UpdateUserDto {
  @IsString(null)
  @IsOptional()
  bookmark?: string[] | null;

  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  displayName?: string;

  @IsString()
  @IsOptional()
  profile?: string;

  @IsString(null)
  @IsOptional()
  phone?: string;
}