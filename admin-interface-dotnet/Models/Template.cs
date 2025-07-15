using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace admin_interface_dotnet.Models
{
    public class Template
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public string UserId { get; set; } = string.Empty;

        [Required]
        [StringLength(254)]
        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }

        [Required]
        public string Content { get; set; } = string.Empty;

        public List<string> Tags { get; set; } = new List<string>();

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public DateTime? DeletedAt { get; set; }
    }
}
