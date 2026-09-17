import { Injectable, Scope } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BaseRepositoryImpl } from 'src/shared/crud/repositories/base-repository.impl';
import { PersonnelRequestDocument } from '../schemas/personnel-request.schema';

@Injectable()
export class PersonnelRequestRepositoryImpl extends BaseRepositoryImpl<PersonnelRequestDocument> {
    constructor(
        @InjectModel("PersonnelRequest")
        protected PersonnelRequestModel: Model<PersonnelRequestDocument>,
    ) {
        super(PersonnelRequestModel);
    }
}
