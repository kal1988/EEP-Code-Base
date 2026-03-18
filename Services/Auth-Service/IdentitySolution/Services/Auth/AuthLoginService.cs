using IdentitySolution.Infrastructure.Security;

namespace IdentitySolution.Services.Auth
{
    public class AuthLoginService
    {
        private readonly ITokenService _tokenService;
        public AuthLoginService(ITokenService tokenService)
        {
            _tokenService = tokenService;
        }
        public async Task<string> LoginAsync(string username, string password)
        {
            //TODO: Replace with AD check
            if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
                throw new Exception("Invalid Creds");

            //Accept All for now
            var token = _tokenService.GenerateToken(username);
            return token;
        }
    }
}
