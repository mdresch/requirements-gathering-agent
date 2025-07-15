using System.Collections.Generic;

namespace admin_interface_dotnet.Models.DTOs
{
    public class UpdateTemplateDto
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? Content { get; set; }
        public List<string>? Tags { get; set; }
    }
}
