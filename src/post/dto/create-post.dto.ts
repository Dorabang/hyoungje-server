import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsEnum,
  IsNotEmpty,
} from 'class-validator';

export class CreatePostDto {
  @IsArray()
  @IsOptional()
  image?: string[];

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  amount?: string;

  @IsString()
  @IsOptional()
  date?: string;

  @IsString()
  @IsOptional()
  height?: string;

  @IsString()
  @IsOptional()
  width?: string; // 너비, 선택적

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  place?: string;

  @IsString()
  @IsOptional()
  price?: string;

  @IsEnum(['sale', 'sold-out', 'reservation'])
  @IsOptional()
  status?: 'sale' | 'sold-out' | 'reservation';

  @IsString()
  @IsOptional()
  variant?: string; // 변형, 선택적

  @IsString()
  @IsNotEmpty()
  contents: string; // 내용, 선택적
}
