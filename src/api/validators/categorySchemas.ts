import Joi from 'joi';

export const categoryCreateSchema = {
  body: Joi.object({
    name: Joi.string()
      .min(1)
      .max(50)
      .required()
      .messages({
        'string.empty': 'Category name is required',
        'string.min': 'Category name must be at least 1 character long',
        'string.max': 'Category name cannot exceed 50 characters'
      }),
    description: Joi.string()
      .min(1)
      .max(200)
      .required()
      .messages({
        'string.empty': 'Category description is required',
        'string.min': 'Category description must be at least 1 character long',
        'string.max': 'Category description cannot exceed 200 characters'
      }),
    color: Joi.string()
      .pattern(/^#[0-9A-F]{6}$/i)
      .optional()
      .messages({
        'string.pattern.base': 'Color must be a valid hex color (e.g., #3B82F6)'
      }),
    icon: Joi.string()
      .max(10)
      .optional()
      .messages({
        'string.max': 'Icon cannot exceed 10 characters'
      }),
    isActive: Joi.boolean()
      .optional()
      .default(true)
  })
};

export const categoryUpdateSchema = {
  body: Joi.object({
    name: Joi.string()
      .min(1)
      .max(50)
      .optional()
      .messages({
        'string.min': 'Category name must be at least 1 character long',
        'string.max': 'Category name cannot exceed 50 characters'
      }),
    description: Joi.string()
      .min(1)
      .max(200)
      .optional()
      .messages({
        'string.min': 'Category description must be at least 1 character long',
        'string.max': 'Category description cannot exceed 200 characters'
      }),
    color: Joi.string()
      .pattern(/^#[0-9A-F]{6}$/i)
      .optional()
      .messages({
        'string.pattern.base': 'Color must be a valid hex color (e.g., #3B82F6)'
      }),
    icon: Joi.string()
      .max(10)
      .optional()
      .messages({
        'string.max': 'Icon cannot exceed 10 characters'
      }),
    isActive: Joi.boolean()
      .optional()
  })
};

export const validateCategory = (req: any, res: any, next: any) => {
  const schema = req.method === 'POST' ? categoryCreateSchema : categoryUpdateSchema;
  const { error } = schema.body.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: error.details.map(detail => detail.message)
      },
      timestamp: new Date().toISOString()
    });
  }
  
  next();
};
