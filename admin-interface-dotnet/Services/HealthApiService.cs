using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;

namespace admin_interface_dotnet.Services
{
    public class HealthApiService
    {
        private readonly HttpClient _httpClient;
        private readonly string _healthUrl;

        public HealthApiService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _healthUrl = configuration["TemplateApi:HealthUrl"] ?? "http://localhost:3001/api/v1/health";
        }

        public async Task<(bool isHealthy, string details)> CheckHealthAsync()
        {
            try
            {
                var response = await _httpClient.GetAsync(_healthUrl);
                var content = await response.Content.ReadAsStringAsync();
                if (response.IsSuccessStatusCode)
                {
                    return (true, content);
                }
                else
                {
                    return (false, $"Status: {response.StatusCode}\nResponse: {content}");
                }
            }
            catch (HttpRequestException ex)
            {
                return (false, $"Request error: {ex.Message}");
            }
            catch (System.Exception ex)
            {
                return (false, $"Unexpected error: {ex.Message}");
            }
        }
    }
}
