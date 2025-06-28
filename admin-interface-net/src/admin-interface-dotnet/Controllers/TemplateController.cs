using Microsoft.AspNetCore.Mvc;
using admin_interface_dotnet.Models;
using admin_interface_dotnet.Models.DTOs;
using admin_interface_dotnet.Services;
using admin_interface_dotnet.Services.Exceptions;
using Microsoft.Extensions.Logging;
using System;
using System.Threading.Tasks;

namespace admin_interface_dotnet.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TemplateController : ControllerBase
    {
        private readonly TemplateApiService _templateService;
        private readonly ILogger<TemplateController> _logger;

        public TemplateController(TemplateApiService templateService, ILogger<TemplateController> logger)
        {
            _templateService = templateService;
            _logger = logger;
        }

        private string GetCurrentUserId()
        {
            // Replace with real user logic as needed
            return "user-123";
        }

        [HttpPatch("{id:guid}")]
        [ProducesResponseType(typeof(TemplateDto), 200)]
        [ProducesResponseType(404)]
        [ProducesResponseType(typeof(ProblemDetails), 409)]
        public async Task<IActionResult> UpdateTemplate(Guid id, [FromBody] UpdateTemplateDto updateDto)
        {
            var userId = GetCurrentUserId();
            try
            {
                var updatedTemplate = await _templateService.PatchTemplateAsync(id, updateDto, userId);
                if (updatedTemplate == null) return NotFound();
                _logger.LogInformation("User {UserId} updated template {TemplateId}", userId, updatedTemplate.Id);
                return Ok(updatedTemplate);
            }
            catch (DuplicateNameException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        [HttpDelete("{id:guid}")]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> DeleteTemplate(Guid id)
        {
            var userId = GetCurrentUserId();
            var success = await _templateService.SoftDeleteTemplateAsync(id, userId);
            if (!success) return NotFound();
            _logger.LogInformation("User {UserId} soft-deleted template {TemplateId}", userId, id);
            return NoContent();
        }

        [HttpPost("{id:guid}/restore")]
        [ProducesResponseType(typeof(TemplateDto), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> RestoreTemplate(Guid id)
        {
            var userId = GetCurrentUserId();
            var restoredTemplate = await _templateService.RestoreTemplateAsync(id, userId);
            if (restoredTemplate == null) return NotFound();
            _logger.LogInformation("User {UserId} restored template {TemplateId}", userId, id);
            return Ok(restoredTemplate);
        }
    }
}
