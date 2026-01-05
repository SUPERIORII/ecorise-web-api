import Joi from "joi";
import passwordComplexity from "joi-password-complexity";

export const loginSchema = Joi.object({
  email: Joi.string().email().required().label("email"),
  password: passwordComplexity().required().label("password"),
});
