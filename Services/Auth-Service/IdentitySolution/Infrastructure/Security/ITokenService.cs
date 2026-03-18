namespace IdentitySolution.Infrastructure.Security
{
    public interface ITokenService
    {
        string GenerateToken(string username);
    }
}
