import * as Joi from 'joi';

export default Joi.object({
  MONGO_URI: Joi.string()
    .uri({
      scheme: ['mongodb', 'mongodb+srv'],
    })
    .required(),
  MONGO_DBNAME: Joi.string().required(),
  MONGO_USER: Joi.string(),
  MONGO_PASS: Joi.string(),
});
