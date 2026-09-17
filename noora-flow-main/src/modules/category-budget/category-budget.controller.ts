import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CheckPermissions } from '../iam/authentication/decorators/permissions.decorator';
import { PermissionAction, Subjects } from '../iam/authentication/enums';
import { GetQueryDto } from '../process-instances/dtos';
import { CategoryBudgetService } from './category-budget.service';
import { CreateCategoryBudgetDto } from './dto/create-category-budget.dto';
import { UpdateCategoryBudgetDto } from './dto/update-category-budget.dto';

@ApiTags('category-budget')
@ApiBearerAuth('token')
@Controller('category-budget')
export class CategoryBudgetController {
  constructor(private readonly categoryBudgetService: CategoryBudgetService) {}

  @CheckPermissions({
    action: PermissionAction.CREATE,
    subject: Subjects.CATEGORY_BUDGET,
  })
  @Post()
  async create(@Body() createCategoryBudgetDto: CreateCategoryBudgetDto) {
    return await this.categoryBudgetService.createCategoryBudget(
      createCategoryBudgetDto,
    );
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.CATEGORY_BUDGET,
  })
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCategoryBudgetDto: UpdateCategoryBudgetDto,
  ) {
    return await this.categoryBudgetService.updateCategoryBudget(
      id,
      updateCategoryBudgetDto,
    );
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.CATEGORY_BUDGET,
  })
  @Get()
  async getCategoryBudget(@Query() queryDto: GetQueryDto) {
    return await this.categoryBudgetService.getCategoryBudgets(queryDto);
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.CATEGORY_BUDGET,
  })
  @Patch('status/:id')
  async updateStatusCategoryBudget(
    @Param('id') id: string,
    @Query('active') active: boolean,
  ) {
    return await this.categoryBudgetService.updateById(id, {
      isActive: active,
    });
  }
}
