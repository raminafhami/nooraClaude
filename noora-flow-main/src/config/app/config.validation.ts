import * as Joi from 'joi';

export default Joi.object({
  APP_NAME: Joi.string().default('noora'),
  APP_ENV: Joi.string()
    .valid('development', 'production', 'test', 'provision')
    .default('development'),
  APP_PORT: Joi.number().port().default(3000),
  SEPIDAR: Joi.string(),
  SMS_API_KEY: Joi.string(),
  SMS_URI: Joi.string(),
  APP_ENCRYPTION_SECRET: Joi.string(),
  COMPANY_DISPATCHER_TYPE: Joi.string().valid('5', '14', '22').default('14'),
});
