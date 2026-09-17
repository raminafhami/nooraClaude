import * as Joi from 'joi';

export default Joi.object({
  ELASTIC_NODE: Joi.string().required(),
  ELASTIC_USERNAME: Joi.string().required(),
  ELASTIC_PASSWORD: Joi.string().required(),
});
