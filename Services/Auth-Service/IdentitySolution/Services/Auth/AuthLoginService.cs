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

            var permissions = new List<string> { "canview","cancreate" };
            
            //var permissions = await _dbContext.UserPermissions
            //.Where(x => x.UserId == user.Id)
            //.Select(x => x.Permission.Name)
            //.ToListAsync();

            //Accept All for now
            var token = _tokenService.GenerateToken(username,permissions);
            return token;
        }
    }
}
