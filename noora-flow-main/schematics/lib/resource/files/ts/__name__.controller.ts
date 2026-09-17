<% if (crud && (type === 'rest' || type === 'rest-mongo')) { %>import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException, Query, Put } from '@nestjs/common';<%
} else if (crud && type === 'microservice') { %>import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';<%
} else { %>import { Controller } from '@nestjs/common';<% } %>
import { <%= classify(name) %>Service } from './<%= name %>.service';<% if (crud) { %>
import { Create<%= singular(classify(name)) %>Dto } from './dto/create-<%= singular(name) %>.dto';
import { Update<%= singular(classify(name)) %>Dto } from './dto/update-<%= singular(name) %>.dto';<% } %>
<% if (type === 'rest-mongo') { %>import { GetQueryDto } from 'src/shared/crud/dto/get-query.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';<% } %>

<% if (type === 'rest-mongo') { %>@ApiTags('<%= dasherize(name) %>')
@Controller('<%= dasherize(name) %>')
export class <%= classify(name) %>Controller {
  constructor(
    private readonly <%= lowercased(name)%>Service: <%= classify(name) %>Service,
  ) {}

  @Post()
  async create(@Body() create<%= singular(classify(name)) %>Dto: Create<%= singular(classify(name)) %>Dto) {
    const <%= lowercased(name)%> = await this.<%= lowercased(name)%>Service.create(
      create<%= singular(classify(name)) %>Dto,
    );
    return <%= lowercased(name)%>;
  }

  @Get()
  async findAll(@Query() queryDto: GetQueryDto) {
    const data = await this.<%= lowercased(name)%>Service.findAll(queryDto);
    return data;
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const <%= lowercased(name)%> = await this.<%= lowercased(name)%>Service.findById(id);
    if (!<%= lowercased(name)%>) {
      throw new NotFoundException('<%= dasherize(name) %> not exist');
    }
    return <%= lowercased(name)%>;
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() update<%= singular(classify(name)) %>Dto: Update<%= singular(classify(name)) %>Dto,
  ) {
    const new<%= classify(name) %> =
      await this.<%= lowercased(name)%>Service.findByIdAndUpdate(
        id,
        update<%= singular(classify(name)) %>Dto,
      );
    if (!new<%= classify(name) %>) {
      throw new NotFoundException('<%= dasherize(name) %> not exist');
    }
    return new<%= classify(name) %>;
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const checkDeleted = await this.<%= lowercased(name)%>Service.deleteById(id);
    if (!checkDeleted) {
      throw new NotFoundException('<%= dasherize(name) %> not exist');
    }
  }
}<% } else { %><% if (type === 'rest') { %>@Controller('<%= dasherize(name) %>')<% } else { %>@Controller()<% } %>
export class <%= classify(name) %>Controller {
  constructor(private readonly <%= lowercased(name) %>Service: <%= classify(name) %>Service) {}<% if (type === 'rest' && crud) { %>

  @Post()
  create(@Body() create<%= singular(classify(name)) %>Dto: Create<%= singular(classify(name)) %>Dto) {
    return this.<%= lowercased(name) %>Service.create(create<%= singular(classify(name)) %>Dto);
  }

  @Get()
  findAll() {
    return this.<%= lowercased(name) %>Service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.<%= lowercased(name) %>Service.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() update<%= singular(classify(name)) %>Dto: Update<%= singular(classify(name)) %>Dto) {
    return this.<%= lowercased(name) %>Service.update(+id, update<%= singular(classify(name)) %>Dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.<%= lowercased(name) %>Service.remove(+id);
  }<% } else if (type === 'microservice' && crud) { %>

  @MessagePattern('create<%= singular(classify(name)) %>')
  create(@Payload() create<%= singular(classify(name)) %>Dto: Create<%= singular(classify(name)) %>Dto) {
    return this.<%= lowercased(name) %>Service.create(create<%= singular(classify(name)) %>Dto);
  }

  @MessagePattern('findAll<%= classify(name) %>')
  findAll() {
    return this.<%= lowercased(name) %>Service.findAll();
  }

  @MessagePattern('findOne<%= singular(classify(name)) %>')
  findOne(@Payload() id: number) {
    return this.<%= lowercased(name) %>Service.findOne(id);
  }

  @MessagePattern('update<%= singular(classify(name)) %>')
  update(@Payload() update<%= singular(classify(name)) %>Dto: Update<%= singular(classify(name)) %>Dto) {
    return this.<%= lowercased(name) %>Service.update(update<%= singular(classify(name)) %>Dto.id, update<%= singular(classify(name)) %>Dto);
  }

  @MessagePattern('remove<%= singular(classify(name)) %>')
  remove(@Payload() id: number) {
    return this.<%= lowercased(name) %>Service.remove(id);
  }<% } %>
}<% } %>
