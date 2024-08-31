import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsEnum,
} from 'class-validator';

export class UpdatePostDto {
  @IsArray()
  @IsOptional()
  prevImage?: string; // 이미지 URL 배열, 선택적

  @IsArray()
  @IsOptional()
  updateImage?: any[]; // 이미지 URL 배열, 선택적

  @IsString()
  @IsOptional()
  title?: string; // 제목, 선택적

  @IsString()
  @IsOptional()
  amount?: string; // 수량, 선택적

  @IsString()
  @IsOptional()
  date?: string; // 날짜, 선택적

  @IsString()
  @IsOptional()
  height?: string; // 높이, 선택적

  @IsArray()
  @IsOptional()
  bookmark?: string[]; // 좋아요 리스트, 선택적

  @IsString()
  @IsOptional()
  phone?: string; // 전화번호, 선택적

  @IsString()
  @IsOptional()
  place?: string; // 장소, 선택적

  @IsString()
  @IsOptional()
  price?: string; // 가격, 선택적

  @IsEnum(['sale', 'sold-out', 'reservation'])
  @IsOptional()
  status?: 'sale' | 'sold-out' | 'reservation'; // 상태, 선택적

  @IsString()
  @IsOptional()
  variant?: string; // 변형, 선택적

  @IsNumber()
  @IsOptional()
  views?: number; // 조회수, 선택적

  @IsString()
  @IsOptional()
  width?: string; // 너비, 선택적

  @IsString()
  @IsOptional()
  contents?: string; // 내용, 선택적
}
