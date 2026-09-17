import { BadRequestException } from '@nestjs/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { IndustryTypes } from 'src/common/const/enums';

// Define the schema class with decorators
@Schema({
  toJSON: {
    virtuals: true,
    versionKey: false,
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
  versionKey: false,
})
export class Industry extends Document {
  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  public name: string;

  @Prop({
    type: String,
    enum: IndustryTypes,
    required: true,
    trim: true,
  })
  public type: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Industry',
    required: false,
  })
  public parentId?: MongooseSchema.Types.ObjectId;
}

export const IndustrySchema = SchemaFactory.createForClass(Industry);

IndustrySchema.pre('validate', function (next) {
  if (this.type === IndustryTypes.SUB && !this.parentId) {
    throw next(
      new BadRequestException('parentId must be provided if type is "sub".'),
    );
  }

  if (this.type === IndustryTypes.MAIN && this.parentId) {
    throw next(
      new BadRequestException(
        'parentId must not be provided if type is "main".',
      ),
    );
  }

  next();
});

export type IndustryDocument = Industry & Document;
