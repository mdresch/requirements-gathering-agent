using Microsoft.AspNetCore.Mvc;
using admin_interface_dotnet.Services;
using System.Threading.Tasks;

namespace admin_interface_dotnet.Controllers
{
    public class HealthController : Controller
    {
        private readonly HealthApiService _healthApiService;

        public HealthController(HealthApiService healthApiService)
        {
            _healthApiService = healthApiService;
        }

        public async Task<IActionResult> Index()
        {
            var (isHealthy, details) = await _healthApiService.CheckHealthAsync();
            ViewData["IsHealthy"] = isHealthy;
            ViewData["Details"] = details;
            return View();
        }
    }
}
