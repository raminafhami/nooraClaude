import { Module } from '@nestjs/common';
import { <%= classify(name) %>Service } from './<%= name %>.service';
<% if (type === 'rest' || type === 'microservice'|| type === 'rest-mongo') { %>import { <%= classify(name) %>Controller } from './<%= name %>.controller';<% } %><% if (type === 'graphql-code-first' || type === 'graphql-schema-first') { %>import { <%= classify(name) %>Resolver } from './<%= name %>.resolver';<% } %><% if (type === 'ws') { %>import { <%= classify(name) %>Gateway } from './<%= name %>.gateway';<% } %>
<% if (type === 'rest-mongo') { %>import { MongooseModule } from '@nestjs/mongoose';
import { <%= classify(name) %>RepositoryImpl } from './repository/<%= name %>.repository';
import { <%= classify(name) %>, <%= classify(name) %>Schema } from './schemas/<%= name %>.schema';
<% } %>
@Module({
  <% if (type === 'rest' || type === 'microservice') { %>controllers: [<%= classify(name) %>Controller],
  providers: [<%= classify(name) %>Service],<% } else if (type === 'graphql-code-first' || type === 'graphql-schema-first') { %>providers: [<%= classify(name) %>Resolver, <%= classify(name) %>Service],<% } else if (type === 'rest-mongo') { %>imports: [
    MongooseModule.forFeature([{ name: <%= classify(name) %>.name, schema: <%= classify(name) %>Schema }]),
  ],
  controllers: [<%= classify(name) %>Controller],
  providers: [<%= classify(name) %>Service, <%= classify(name) %>RepositoryImpl],<% } else { %>providers: [<%= classify(name) %>Gateway, <%= classify(name) %>Service],<% } %>
})
export class <%= classify(name) %>Module {}
