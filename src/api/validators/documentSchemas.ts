import Joi from 'joi';

// Common schemas
export const uuidSchema = Joi.string().uuid().required();
export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sort: Joi.string().valid('created', 'updated', 'name', 'status').default('created'),
  order: Joi.string().valid('asc', 'desc').default('desc')
});

// Document conversion schemas
export const documentConversionSchema = {
  body: Joi.object({
    content: Joi.string().min(1).required(),
    inputFormat: Joi.string().valid('markdown', 'html', 'docx', 'txt', 'rtf').required(),
    outputFormat: Joi.string().valid('pdf', 'docx', 'html').required(),
    templateId: Joi.string().uuid().optional(),
    metadata: Joi.object().optional(),
    options: Joi.object({
      includeMetadata: Joi.boolean().default(true),
      watermark: Joi.string(),
      password: Joi.string(),
      compression: Joi.string().valid('none', 'low', 'medium', 'high').default('medium')
    }).optional()
  }),
  params: Joi.object({}),
  query: Joi.object({})
};

export const documentBatchSchema = {
  body: Joi.object({
    jobs: Joi.array().items(
      Joi.object({
        templateId: Joi.string().uuid().required(),
        data: Joi.object().required(),
        outputFormat: Joi.string().valid('docx', 'pdf', 'html').default('docx'),
        filename: Joi.string().optional()
      })
    ).min(1).max(50).required(),
    options: Joi.object({
      parallel: Joi.boolean().default(true),
      notifyOnComplete: Joi.boolean().default(false),
      webhookUrl: Joi.string().uri().optional()
    }).optional()
  })
};

export const documentStatusSchema = {
  params: Joi.object({
    jobId: uuidSchema
  })
};

export const documentDownloadSchema = {
  params: Joi.object({
    jobId: uuidSchema
  }),
  query: Joi.object({
    format: Joi.string().valid('attachment', 'inline').default('attachment')
  })
};

// Document listing schemas
export const documentListSchema = {
  query: paginationSchema.keys({
    status: Joi.string().valid('pending', 'processing', 'completed', 'failed').optional(),
    templateId: Joi.string().uuid().optional(),
    createdAfter: Joi.date().iso().optional(),
    createdBefore: Joi.date().iso().optional()
  })
};
