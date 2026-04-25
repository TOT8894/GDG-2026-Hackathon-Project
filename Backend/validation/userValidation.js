import Joi from "joi";

const roleSchema = Joi.string().trim().lowercase().valid("buyer", "seller", "admin");

const baseUserSchema = {
  fullName: Joi.string().trim().min(3).max(50).messages({
    "string.empty": "full name is required",
    "string.min": "full name must be at least 3 characters",
    "string.max": "full name must be at most 50 characters",
  }),
  email: Joi.string().trim().lowercase().email().min(5).messages({
    "string.empty": "email is required",
    "string.email": "email is invalid",
    "string.min": "email must be at least 5 characters",
  }),
  password: Joi.string().trim().min(8).messages({
    "string.empty": "password is required",
    "string.min": "password must be at least 8 characters",
  }),
  role: roleSchema.default("buyer"),
  phone: Joi.string().trim().allow(""),
  avatar: Joi.string().trim().uri().allow(""),
  location: Joi.object({
    latitude: Joi.number(),
    longitude: Joi.number(),
  }),
};

export const userValidationSchema = Joi.object({
  ...baseUserSchema,
  fullName: baseUserSchema.fullName.required(),
  email: baseUserSchema.email.required(),
  password: baseUserSchema.password.required(),
});

export const userUpdateValidationSchema = Joi.object({
  ...baseUserSchema,
}).min(1);

export default userValidationSchema;
