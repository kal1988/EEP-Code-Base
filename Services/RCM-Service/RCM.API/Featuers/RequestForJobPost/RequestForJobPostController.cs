using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using RCM.API.Featuers.RequestForJobPost.CreateRequestForJobPost;

namespace RCM.API.Featuers.RequestForJobPost
{
    [Route("api/[controller]")]
    [ApiController]
    public class RequestForJobPostController : ControllerBase
    {
        private readonly IMediator _mediator;
        public RequestForJobPostController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost]
        public async Task<ActionResult<CreateRequestForJobPostResponse>> 
        CreateRequest([FromBody] CreateRequestForJobPostCommand command, CancellationToken ct)
        {
            var result = await _mediator.Send(command,ct);
            return Ok(result);
        }
    }
}
