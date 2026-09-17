import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BaseRepositoryImpl } from 'src/shared/crud/repositories/base-repository.impl';
import { <%= classify(name) %>, <%= classify(name) %>Document } from '../schemas/<%= name %>.schema';

@Injectable()
export class <%= classify(name) %>RepositoryImpl extends BaseRepositoryImpl<<%= classify(name) %>Document> {
  constructor(
    @InjectModel(<%= classify(name) %>.name)
    protected <%= lowercased(name)%>Model: Model<<%= classify(name) %>Document>,
  ) {
    super(<%= lowercased(name)%>Model);
  }
}
