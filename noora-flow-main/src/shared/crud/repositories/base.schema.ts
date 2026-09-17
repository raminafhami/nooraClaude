import { Schema } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BaseDocument = Event & Document;

@Schema({
  toJSON: {
    virtuals: true,
    transform(doc: any, ret: any) {
      delete ret._id;
      return ret;
    },
  },
  toObject: {
    virtuals: true,
    transform(doc: any, ret: any) {
      delete ret._id;
      return ret;
    },
  },
})
export class BaseSchema {}
