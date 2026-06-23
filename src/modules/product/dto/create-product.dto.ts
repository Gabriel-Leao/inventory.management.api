import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @IsString({ message: 'Product name should be a text' })
  @Length(3, 120, {
    message: 'Product name should have a length between 3 and 120 characters',
  })
  name: string;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    {
      message:
        'Product price must be a valid number with at most 2 decimal places',
    },
  )
  @Min(0, { message: 'Product price should be greater than or equal to 0' })
  price: number;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    {
      message:
        'Product rating must be a valid number with at most 2 decimal places',
    },
  )
  @Min(1, {
    message: 'Product rating should be more than or equal to 1',
  })
  @Max(5, { message: 'Product rating should be less than or equal to 5' })
  @IsOptional()
  rating?: number;

  @IsInt({ message: 'Product stock quantity should be an integer number' })
  @Min(0, {
    message: 'Product stock quantity should be greater than or equal to 0',
  })
  stockQuantity: number;
}
