using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using RCM.API.Featuers.JobPost.CreateJobPost;

namespace RCM.API.Featuers.JobPost
{
    [Route("api/[controller]")]
    [ApiController]
    public class JobPostController : ControllerBase
    {
        private readonly IMediator _mediator;
        public JobPostController(IMediator mediator)
        {
            _mediator = mediator;
        }
        [HttpPost]
        public async Task<ActionResult<CreateJobPostResponse>> 
        CreatePost ([FromBody] CreateJobPostCommand command, CancellationToken ct)
        {
            var result = await _mediator.Send(command,ct);
            return Ok(result);
        }
    }
}
