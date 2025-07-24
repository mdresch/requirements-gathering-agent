import { TemplateModel, ITemplate } from '../db/models/Template';

export class MongoTemplateRepository {
  async createTemplate(data: Partial<ITemplate>): Promise<ITemplate> {
    const doc = new TemplateModel(data);
    return await doc.save();
  }

  async getTemplateById(id: string): Promise<ITemplate | null> {
    return TemplateModel.findById(id).exec();
  }

  async updateTemplate(id: string, updates: Partial<ITemplate>): Promise<ITemplate | null> {
    return TemplateModel.findByIdAndUpdate(id, updates, { new: true }).exec();
  }

  async deleteTemplate(id: string): Promise<ITemplate | null> {
    return TemplateModel.findByIdAndDelete(id).exec();
  }

  async listTemplates(query: any = {}, options: any = {}): Promise<{ templates: ITemplate[]; total: number }> {
    const { page = 1, limit = 20, ...filters } = options;
    const skip = (page - 1) * limit;
    const mongoQuery: any = { ...filters };
    if (filters.category) mongoQuery.category = filters.category;
    if (filters.isActive !== undefined) mongoQuery.isActive = filters.isActive;
    if (filters.search) {
      mongoQuery.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } }
      ];
    }
    const templates = await TemplateModel.find(mongoQuery).skip(skip).limit(limit).exec();
    const total = await TemplateModel.countDocuments(mongoQuery).exec();
    return { templates, total };
  }
}
