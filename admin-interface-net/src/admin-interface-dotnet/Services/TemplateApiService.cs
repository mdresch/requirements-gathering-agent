using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;
using admin_interface_dotnet.Models;
using admin_interface_dotnet.Models.DTOs;
using Microsoft.Extensions.Configuration;
using System.Text.Json;
using System.Text;

namespace admin_interface_dotnet.Services
{
    public class TemplateApiService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiBaseUrl;
        private readonly string _apiKey;

        public TemplateApiService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _apiBaseUrl = configuration["TemplateApi:BaseUrl"] ?? "http://localhost:3001/api/v1/templates";
            _apiKey = configuration["TemplateApi:ApiKey"] ?? string.Empty;
        }

        private void AddApiKeyHeader(HttpRequestMessage request)
        {
            if (!string.IsNullOrEmpty(_apiKey))
            {
                request.Headers.Remove("X-API-Key");
                request.Headers.Add("X-API-Key", _apiKey);
            }
        }

        public async Task<List<Template>> GetTemplatesAsync()
        {
            var request = new HttpRequestMessage(HttpMethod.Get, _apiBaseUrl);
            AddApiKeyHeader(request);
            var response = await _httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();
            var wrapper = await response.Content.ReadFromJsonAsync<TemplateListResponse>();
            return wrapper?.Results ?? new List<Template>();
        }

        public async Task<Template?> GetTemplateAsync(string id)
        {
            var request = new HttpRequestMessage(HttpMethod.Get, $"{_apiBaseUrl}/{id}");
            AddApiKeyHeader(request);
            var response = await _httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();
            return await response.Content.ReadFromJsonAsync<Template>();
        }

        public async Task<bool> CreateTemplateAsync(Template template)
        {
            var request = new HttpRequestMessage(HttpMethod.Post, _apiBaseUrl)
            {
                Content = JsonContent.Create(template)
            };
            AddApiKeyHeader(request);
            var response = await _httpClient.SendAsync(request);
            return response.IsSuccessStatusCode;
        }

        public async Task<bool> UpdateTemplateAsync(string id, Template template)
        {
            var request = new HttpRequestMessage(HttpMethod.Put, $"{_apiBaseUrl}/{id}")
            {
                Content = JsonContent.Create(template)
            };
            AddApiKeyHeader(request);
            var response = await _httpClient.SendAsync(request);
            return response.IsSuccessStatusCode;
        }

        public async Task<bool> DeleteTemplateAsync(string id)
        {
            var request = new HttpRequestMessage(HttpMethod.Delete, $"{_apiBaseUrl}/{id}");
            AddApiKeyHeader(request);
            var response = await _httpClient.SendAsync(request);
            return response.IsSuccessStatusCode;
        }

        public async Task<ExtendedTemplateStats?> GetTemplateStatsAsync()
        {
            var request = new HttpRequestMessage(HttpMethod.Get, _apiBaseUrl + "/stats");
            AddApiKeyHeader(request);
            var response = await _httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();
            var basicStats = await response.Content.ReadFromJsonAsync<TemplateStats>();
            if (basicStats == null) return null;
            var extendedStats = new ExtendedTemplateStats
            {
                Total = basicStats.Total,
                ByCategory = basicStats.ByCategory,
                ByType = basicStats.ByType,
                TotalTemplates = basicStats.Total,
                CategoriesCount = basicStats.ByCategory?.Count ?? 0,
                TopCategories = basicStats.ByCategory != null
                    ? basicStats.ByCategory
                        .OrderByDescending(x => x.Value)
                        .Select(x => new CategoryStat { Category = x.Key, Count = x.Value })
                        .ToList()
                    : new List<CategoryStat>(),
                TopTags = basicStats.ByType != null
                    ? basicStats.ByType
                        .OrderByDescending(x => x.Value)
                        .Select(x => new TypeStat { Tag = x.Key, Count = x.Value })
                        .ToList()
                    : new List<TypeStat>()
            };
            return extendedStats;
        }

        // PATCH: Update an existing template (partial update)
        public async Task<TemplateDto?> PatchTemplateAsync(Guid id, UpdateTemplateDto updates, string userId)
        {
            var url = $"{_apiBaseUrl}/{id}";
            var request = new HttpRequestMessage(HttpMethod.Patch, url)
            {
                Content = new StringContent(JsonSerializer.Serialize(updates), Encoding.UTF8, "application/json")
            };
            AddApiKeyHeader(request);
            request.Headers.Add("X-User-Id", userId);
            var response = await _httpClient.SendAsync(request);
            if (!response.IsSuccessStatusCode)
                return null;
            return await response.Content.ReadFromJsonAsync<TemplateDto>();
        }

        // Soft delete a template
        public async Task<bool> SoftDeleteTemplateAsync(Guid id, string userId)
        {
            var url = $"{_apiBaseUrl}/{id}/soft-delete";
            var request = new HttpRequestMessage(HttpMethod.Post, url);
            AddApiKeyHeader(request);
            request.Headers.Add("X-User-Id", userId);
            var response = await _httpClient.SendAsync(request);
            return response.IsSuccessStatusCode;
        }

        // Restore a soft-deleted template
        public async Task<TemplateDto?> RestoreTemplateAsync(Guid id, string userId)
        {
            var url = $"{_apiBaseUrl}/{id}/restore";
            var request = new HttpRequestMessage(HttpMethod.Post, url);
            AddApiKeyHeader(request);
            request.Headers.Add("X-User-Id", userId);
            var response = await _httpClient.SendAsync(request);
            if (!response.IsSuccessStatusCode)
                return null;
            return await response.Content.ReadFromJsonAsync<TemplateDto>();
        }
    }
}
