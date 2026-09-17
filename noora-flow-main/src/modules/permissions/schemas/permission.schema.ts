import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as SchemaTypes } from 'mongoose';
@Schema({
  versionKey: false,
  toJSON: {
    getters: true,
    virtuals: true,
    transform(doc: any, ret: any) {
      delete ret._id;
      ret.conditions = JSON.parse(ret.conditions);
      return ret;
    },
  },
  toObject: {
    virtuals: true,
    transform(doc: any, ret: any) {
      delete ret._id;
      ret.conditions = JSON.parse(ret.conditions);
      return ret;
    },
  },
})
export class Permission extends Document {
  @Prop({
    type: [String],
    trim: true,
    required: true,
  })
  public actions: string[];

  @Prop({
    type: String,
    trim: true,
    required: true,
    default: '{}',
  })
  public conditions: string;

  @Prop({
    type: String,
    required: true,
  })
  public subject: string;

  @Prop({
    type: String,
    required: false,
  })
  public description: string;

  public static parseCondition(
    condition: PermissionCondition,
    variables: Record<string, any>,
  ): PermissionCondition {
    if (!condition) return null;

    const parsedCondition = {};
    for (const [key, rawValue] of Object.entries(condition)) {
      if (rawValue !== null && Array.isArray(rawValue)) {
        parsedCondition[key] = rawValue;
        continue;
      }

      if (rawValue !== null && typeof rawValue === 'object') {
        const value = this.parseCondition(rawValue, variables);
        parsedCondition[key] = value;
        continue;
      }

      if (typeof rawValue !== 'string') {
        parsedCondition[key] = rawValue;
        continue;
      }

      // find placeholder "$[]"
      const matches = /\$\[(.*?)\]\$?/.exec(rawValue);
      if (!matches) {
        parsedCondition[key] = rawValue;
        continue;
      }
      const value = variables[matches[1]];
      if (typeof value === 'undefined') {
        throw new ReferenceError(`Variable ${name} is not defined`);
      }
      parsedCondition[key] = value;
    }
    return parsedCondition;
  }
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);

export type PermissionDocument = Permission & Document;
export interface PermissionCondition {} /* eslint-disable-line */
