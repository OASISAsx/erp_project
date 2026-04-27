import { Transform, Type } from "class-transformer";
import { IsBoolean, IsEmail, IsInt, IsNumber, IsOptional, IsString, Min, MinLength } from "class-validator";

const trim = ({ value }: { value: unknown }) => (typeof value === "string" ? value.trim() : value);
const emptyToNull = ({ value }: { value: unknown }) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
};

export class CreateCustomerDto {
  @Transform(trim)
  @IsString()
  @MinLength(2)
  code!: string;

  @Transform(trim)
  @IsString()
  @MinLength(2)
  name!: string;

  @Transform(emptyToNull)
  @IsOptional()
  @IsEmail()
  email?: string | null;

  @Transform(emptyToNull)
  @IsOptional()
  @IsString()
  phone?: string | null;

  @Transform(emptyToNull)
  @IsOptional()
  @IsString()
  address?: string | null;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateCustomerDto {
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MinLength(2)
  code?: string;

  @Transform(trim)
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @Transform(emptyToNull)
  @IsOptional()
  @IsEmail()
  email?: string | null;

  @Transform(emptyToNull)
  @IsOptional()
  @IsString()
  phone?: string | null;

  @Transform(emptyToNull)
  @IsOptional()
  @IsString()
  address?: string | null;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateProductDto {
  @Transform(trim)
  @IsString()
  @MinLength(2)
  sku!: string;

  @Transform(trim)
  @IsString()
  @MinLength(2)
  name!: string;

  @Transform(emptyToNull)
  @IsOptional()
  @IsString()
  description?: string | null;

  @Transform(trim)
  @IsOptional()
  @IsString()
  unit?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price!: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  stock!: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateProductDto {
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MinLength(2)
  sku?: string;

  @Transform(trim)
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @Transform(emptyToNull)
  @IsOptional()
  @IsString()
  description?: string | null;

  @Transform(trim)
  @IsOptional()
  @IsString()
  unit?: string;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
