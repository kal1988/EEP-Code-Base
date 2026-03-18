namespace BuildingBlocks.Contracts.Auth.Contracts
{
    public record LoginRequest(string Username, string Password);
    public record LoginResponse(string token);
}
