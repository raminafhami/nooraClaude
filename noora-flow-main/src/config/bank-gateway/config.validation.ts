import * as Joi from 'joi';

export default Joi.object({
  IKC_PUBLIC_KEY: Joi.string().required(),
  TERMINAL_ID: Joi.string().required(),
  ACCEPTOR_ID: Joi.string().required(),
  PASS_PHRASE: Joi.string().required(),
  REVERT_URI: Joi.string().required(),
});
