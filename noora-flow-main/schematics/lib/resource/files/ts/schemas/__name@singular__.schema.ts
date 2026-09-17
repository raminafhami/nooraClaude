<% if (type === 'graphql-code-first') { %>import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class <%= singular(classify(name)) %> {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}<% } else if (type === 'rest-mongo' ) { %>import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as SchemaTypes } from 'mongoose';

@Schema({
  versionKey: false,
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
export class <%= classify(name) %> extends Document {
  @Prop({
    type: String,
    required: true,
  })
  field: string;
}
export type <%= classify(name) %>Document = <%= classify(name) %> & Document;
export const <%= classify(name) %>Schema = SchemaFactory.createForClass(<%= classify(name) %>);<% } else { %>export class <%= singular(classify(name)) %> {}<% } %>
