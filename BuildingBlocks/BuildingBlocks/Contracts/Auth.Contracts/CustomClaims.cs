using System.Security.Claims;

namespace BuildingBlocks.Contracts.Auth.Contracts
{
    public class CustomClaims
    {
        public const string UserId = "UserId";
        public const string UserName = ClaimTypes.Name;
        public const string Role = ClaimTypes.Role;
    }
}
