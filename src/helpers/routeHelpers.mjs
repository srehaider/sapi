import joi from '@hapi/joi';

function validateBody(schema) {
  return function(req, res, next) {
    const result = schema.validate(req.body);
    if (result.error) {
      const error = result.error.details.map(error => error.message).join(', ');
      return res.status(400).json({ success: false, error: error });
    }
    next();
  };
}

const schemas = {
  authSchema: joi.object().keys({
    username: joi.string().required(),
    password: joi.string().required(),
  }),
};

export { validateBody, schemas };
