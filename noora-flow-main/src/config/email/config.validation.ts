import * as Joi from 'joi';

export default Joi.object({
  EMAIL_HOST: Joi.string(),
  EMAIL_PORT: Joi.number().port().default(25),
  EMAIL_USERNAME: Joi.string(),
  EMAIL_PASSWORD: Joi.string(),
  EMAIL_SECURE: Joi.boolean(),
});
