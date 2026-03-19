using BuildingBlocks.SAPIntegrations.DTOs;
using System.Text.Json;

namespace BuildingBlocks.SAPIntegrations.SapService
{
    public class SapService
    {
        private readonly HttpClient _httpClient;
        public SapService(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }
        public async Task<List<PositionDto>> GetVacantPositions()
        {
            var cdsView = "ZI_POSITION_DEFINITIONS_CDS/ZI_Position_Definitions?$format=json";
            var response = await _httpClient.GetAsync(cdsView);
            response.EnsureSuccessStatusCode();
            var json = await response.Content.ReadAsStringAsync();
            var data = JsonSerializer.Deserialize<SapODataResponse<PositionDto>>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            return data?.d?.results ?? new List<PositionDto>();

        }

    }
}
