import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class DispatcherCategory extends Document {
  @Prop({ required: true, trim: true, type: String })
  domainCode: string;

  @Prop({ required: true, trim: true, type: String })
  inspectionDomain: string;

  @Prop({ required: true })
  type: string;

  @Prop({ type: [String], required: true })
  include: string[];

  @Prop({ type: [String], default: [] })
  exclude: string[];
}

export type DispatcherCategoryDocument = DispatcherCategory & Document;

export const DispatcherCategorySchema =
  SchemaFactory.createForClass(DispatcherCategory);

DispatcherCategorySchema.index({ include: 1 });
DispatcherCategorySchema.index({ exclude: 1 });
