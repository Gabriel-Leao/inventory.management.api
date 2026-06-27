import { Controller, Get, HttpCode } from '@nestjs/common';
import { ExpenseService } from './expense.service';

@Controller('expenses')
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Get()
  @HttpCode(200)
  async getExpensesByCategory() {
    return this.expenseService.getExpensesBycategory();
  }
}
