import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { BranchService } from './branch.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { GetQueryDto } from 'src/shared/crud/dto/get-query.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CheckPermissions } from '../iam/authentication/decorators/permissions.decorator';
import { PermissionAction, Subjects } from '../iam/authentication/enums';

@ApiTags('branch')
@ApiBearerAuth('token')
@Controller('branch')
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  @CheckPermissions({
    action: PermissionAction.CREATE,
    subject: Subjects.BRANCH,
  })
  @Post()
  async create(@Body() createBranchDto: CreateBranchDto) {
    const branch = await this.branchService.create(createBranchDto);
    return branch;
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.BRANCH,
  })
  @Get()
  async findAll(@Query() queryDto: GetQueryDto) {
    const data = await this.branchService.findAll(queryDto);
    return data;
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.BRANCH,
  })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const branch = await this.branchService.findById(id);
    if (!branch) throw new NotFoundException('Branch not found');
    return branch;
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.BRANCH,
  })
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateBranchDto: UpdateBranchDto,
  ) {
    const updatedBranch = await this.branchService.findByIdAndUpdate(
      id,
      updateBranchDto,
    );
    if (!updatedBranch) throw new NotFoundException('Branch not found');
    return updatedBranch;
  }

  @CheckPermissions({
    action: PermissionAction.DELETE,
    subject: Subjects.BRANCH,
  })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.branchService.deleteById(id);
    if (!result) throw new NotFoundException('Branch not found');
  }
}
