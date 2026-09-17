import * as Joi from 'joi';

export default Joi.object({
  REDIS_HOST: Joi.string().hostname().required(),
  REDIS_PORT: Joi.number().port().default(6379),
  REDIS_DB_INDEX: Joi.number().min(0).max(12).default(0),
});
