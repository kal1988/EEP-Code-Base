using BuildingBlocks.Contracts.Auth.Contracts;
using BuildingBlocks.CQRS;
using IdentitySolution.Services.Auth;
using System.Windows.Input;

namespace IdentitySolution.Featuers.Login.CreateLoginRequest
{
    public record CreateLoginRequestCommand(string Username, string Password) : ICommand<LoginResponse>;
    public class CreateLoginRequestHandler : ICommandHandler<CreateLoginRequestCommand, LoginResponse>
    {
        private AuthLoginService _authLoginService;
        public CreateLoginRequestHandler(AuthLoginService authLoginService, IHttpContextAccessor httpContextAccessor)
        {
            _authLoginService = authLoginService;

        }
        public async Task<LoginResponse> Handle(CreateLoginRequestCommand request, CancellationToken cancellationToken)
        {

            var token =  await _authLoginService.LoginAsync(request.Username, request.Password);
            return new LoginResponse(token);
        }
    }
}
