import Joi from "joi";
import passwordComplexity from "joi-password-complexity";

export const loginSchema = Joi.object({
  email: Joi.string().email().required().label("email"),
  password: Joi.string().min(8).required().label("password"),
});
