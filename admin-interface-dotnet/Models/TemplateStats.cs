using System.Collections.Generic;

namespace admin_interface_dotnet.Models
{
    public class TemplateStats
    {
        public int Total { get; set; }
        public Dictionary<string, int> ByCategory { get; set; } = new();
        public Dictionary<string, int> ByType { get; set; } = new();
    }

    public class CategoryStat
    {
        public string Category { get; set; } = string.Empty;
        public int Count { get; set; }
    }

    public class TypeStat
    {
        public string Tag { get; set; } = string.Empty;
        public int Count { get; set; }
    }

    public class ExtendedTemplateStats : TemplateStats
    {
        public int TotalTemplates { get; set; }
        public int CategoriesCount { get; set; }
        public List<CategoryStat> TopCategories { get; set; } = new();
        public List<TypeStat> TopTags { get; set; } = new();
    }
}
