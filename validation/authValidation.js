const Ajv = require('ajv');
const addFormats = require('ajv-formats');

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

const signupSchema = {
    type: 'object',
    required: ['email', 'username', 'password', 'confirmPassword'],
    properties: {
        email: { type: 'string', format: 'email' },
        username: { type: 'string', minLength: 3, maxLength: 30 },
        password: { type: 'string', minLength: 6 },
        confirmPassword: { type: 'string', minLength: 6 }
    },
    additionalProperties: false
};

const validateSignup = ajv.compile(signupSchema);

exports.validateSignup = (req, res, next) => {
    const valid = validateSignup(req.body);
    if (!valid) {
        return res.status(400).json({
            message: 'Validation failed',
            errors: validateSignup.errors.map(err => ({
                field: err.instancePath.replace('/', '') || err.params.missingProperty,
                message: err.message
            }))
        });
    }
    next();
};