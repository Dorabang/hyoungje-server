import {
  IsString,
  IsOptional,
  IsArray,
  IsEnum,
  IsNotEmpty,
} from 'class-validator';

export class PrevPostDto {
  @IsEnum(['sale', 'sold-out', 'reservation'])
  @IsOptional()
  status?: 'sale' | 'sold-out' | 'reservation';

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  createdAt: number;

  @IsString()
  @IsNotEmpty()
  displayName: string;

  @IsString()
  @IsNotEmpty()
  views: string;

  @IsString()
  @IsOptional()
  variant?: string; // 변형, 선택적

  @IsString()
  @IsOptional()
  place?: string;

  @IsString()
  @IsOptional()
  price?: string;

  @IsString()
  @IsOptional()
  date?: string;

  @IsString()
  @IsOptional()
  width?: string; // 너비, 선택적

  @IsString()
  @IsOptional()
  height?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  amount?: string;

  @IsArray()
  @IsOptional()
  image?: string[];

  @IsString()
  @IsNotEmpty()
  contents: string; // 내용, 필수
}
