using BuildingBlocks.Contracts.Auth.Contracts;
using IdentitySolution.Featuers.Login.CreateLoginRequest;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace IdentitySolution.Featuers.Login
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IMediator _mediator;
        public AuthController(IMediator mediator)
        {
            _mediator = mediator;
        }
        [HttpPost("login")]
        public async Task <ActionResult<LoginResponse>> 
            Login([FromBody]CreateLoginRequestCommand command, CancellationToken ct)
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }
    }
}
