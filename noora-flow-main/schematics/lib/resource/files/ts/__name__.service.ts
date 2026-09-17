import { Injectable } from '@nestjs/common';<% if (crud && type === 'graphql-code-first' && type === 'graphql-schema-first') { %>
import { Create<%= singular(classify(name)) %>Input } from './dto/create-<%= singular(name) %>.input';
import { Update<%= singular(classify(name)) %>Input } from './dto/update-<%= singular(name) %>.input';<% } %>
<% if (crud && type === 'rest-mongo') { %>import { CrudService } from 'src/shared/crud/service/crud.service';
import { <%= classify(name) %>Document } from './schemas/<%= name %>.schema';
import { <%= classify(name) %>RepositoryImpl } from './repository/<%= name %>.repository';
<% } %><% if (type === 'rest-mongo') { %>
@Injectable()
export class <%= classify(name) %>Service extends CrudService<<%= classify(name) %>Document> {
  constructor(<%= lowercased(name)%>RepositoryImpl: <%= classify(name) %>RepositoryImpl) {
    super(<%= lowercased(name)%>RepositoryImpl);
  }
}<% } else { %>@Injectable()
export class <%= classify(name) %>Service {<% if (crud) { %>
  create(<% if (type !== 'graphql-code-first' && type !== 'graphql-schema-first') { %>create<%= singular(classify(name)) %>Dto: Create<%= singular(classify(name)) %>Dto<% } else { %>create<%= singular(classify(name)) %>Input: Create<%= singular(classify(name)) %>Input<% } %>) {
    return 'This action adds a new <%= lowercased(singular(classify(name))) %>';
  }

  findAll() {
    return `This action returns all <%= lowercased(classify(name)) %>`;
  }

  findOne(id: number) {
    return `This action returns a #${id} <%= lowercased(singular(classify(name))) %>`;
  }

  update(id: number, <% if (type !== 'graphql-code-first' && type !== 'graphql-schema-first') { %>update<%= singular(classify(name)) %>Dto: Update<%= singular(classify(name)) %>Dto<% } else { %>update<%= singular(classify(name)) %>Input: Update<%= singular(classify(name)) %>Input<% } %>) {
    return `This action updates a #${id} <%= lowercased(singular(classify(name))) %>`;
  }

  remove(id: number) {
    return `This action removes a #${id} <%= lowercased(singular(classify(name))) %>`;
  }
<% } %>}<% } %>
