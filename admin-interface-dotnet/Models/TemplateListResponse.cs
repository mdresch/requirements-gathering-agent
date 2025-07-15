using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace admin_interface_dotnet.Models
{
    public class TemplateListResponse
    {
        [JsonPropertyName("results")]
        public List<Template> Results { get; set; } = new();
        // Add other properties if needed (e.g., ResultCount, Pagination, etc.)
    }
}
