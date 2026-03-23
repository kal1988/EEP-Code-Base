using BuildingBlocks.CQRS;
using RCM.API.Services;
using System.Security.Claims;
using System.Windows.Input;

namespace RCM.API.Featuers.JobPost.CreateJobPost
{
    public record CreateJobPostCommand(List<string> RequestedPostions,DateTime postingDate) : ICommand<CreateJobPostResponse>;
    public record CreateJobPostResponse(List<Guid> Ids);
    internal class CreateJobPostHandler : ICommandHandler<CreateJobPostCommand, CreateJobPostResponse>
    {
        private readonly JobPostService _jobPostService;
        private readonly IHttpContextAccessor _httpContextAccessor;
        public CreateJobPostHandler(JobPostService jobPostService, IHttpContextAccessor httpContextAccessor)
        {
            _jobPostService = jobPostService;
            _httpContextAccessor = httpContextAccessor;
        }
        public async Task<CreateJobPostResponse> Handle(CreateJobPostCommand request, CancellationToken ct)
        {
            //Get Logged in user
            var user = _httpContextAccessor.HttpContext?.User ?? throw new Exception("User Not Found");

            var loggedIn = user.FindFirst(ClaimTypes.Name)?.Value ?? throw new Exception("User Not Found");

            var entityIds = await _jobPostService.CreateJobPost(request, loggedIn, ct);

            return new CreateJobPostResponse(entityIds);
        }
    }
}
