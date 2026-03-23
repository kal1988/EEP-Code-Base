using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace IdentitySolution.Infrastructure.Security
{
    public class TokenService : ITokenService
    {
        private readonly string _secretKey;
        private readonly string _issuer;
        private readonly string _audience;
        private readonly int _expiryMinutes;
        public TokenService(IConfiguration configuration)
        {
            _secretKey = configuration["Jwt:SecretKey"];
            _issuer = configuration["Jwt:Issuer"];
            _audience = configuration["Jwt:Audience"];
            _expiryMinutes = int.Parse(configuration["Jwt:ExpiryMinutes"] ?? "60");

        }
        public string GenerateToken(string username, List<string> permissions)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, username),
            };
            claims.AddRange(permissions.Select(p => new Claim("permission", p)));

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secretKey));
            var creds = new SigningCredentials(key,SecurityAlgorithms.HmacSha256);

            var token_created = new JwtSecurityToken(
                issuer:_issuer,
                audience: _audience,
                claims:claims,
                expires:DateTime.UtcNow.AddMinutes(_expiryMinutes),
                signingCredentials: creds)
                ;
            return new JwtSecurityTokenHandler().WriteToken(token_created);
        }
    }
}
