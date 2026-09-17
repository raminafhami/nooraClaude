import { Controller, Get, Param, Query } from '@nestjs/common';
import { RasmioService } from './rasmio.service';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SearchRasmioDto } from './dto/search.dto';

@Controller('rasmio')
@ApiBearerAuth('token')
@ApiTags('Rasmio')
export class RasmioController {
  constructor(private readonly rasmioService: RasmioService) {}

  @ApiQuery({
    name: 'projection',
    type: 'string',
    required: false,
  })
  @Get('company/:companyId')
  async getCompanyInfo(
    @Param('companyId') companyId: string,
    @Query() query: any,
  ) {
    return await this.rasmioService.getCompanyInfo(companyId, query);
  }

  @ApiQuery({
    name: 'projection',
    type: 'string',
    required: false,
  })
  @Get('person/:personId')
  async getPersonInfo(
    @Param('personId') personId: string,
    @Query() query: any,
  ) {
    return await this.rasmioService.getPersonInfo(personId, query);
  }

  @Get('search')
  async searchTerm(@Query() query: SearchRasmioDto) {
    return await this.rasmioService.searchTerm(query);
  }
}
