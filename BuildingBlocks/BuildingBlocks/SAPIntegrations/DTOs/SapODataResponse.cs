namespace BuildingBlocks.SAPIntegrations.DTOs
{
    public class SapODataResponse<T>
    {
        public SapData<T> d { get; set; }
    }
    public class SapData<T>
    {
        public List<T> results { get; set; }
    }
}
