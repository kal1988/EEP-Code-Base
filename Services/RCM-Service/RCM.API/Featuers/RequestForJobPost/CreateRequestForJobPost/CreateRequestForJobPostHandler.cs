using BuildingBlocks.CQRS;
using MediatR;
using RCM.API.Services;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Windows.Input;

namespace RCM.API.Featuers.RequestForJobPost.CreateRequestForJobPost
{
    public record CreateRequestForJobPostCommand(List<string> RequestedPosition) : ICommand<CreateRequestForJobPostResponse>;
    public record CreateRequestForJobPostResponse(List<Guid> Id);
    internal class CreateRequestForJobPostHandler : ICommandHandler<CreateRequestForJobPostCommand, CreateRequestForJobPostResponse>
    {
        private readonly JobRequestService _jobRequestService;
        private readonly IHttpContextAccessor _httpContextAccessor;
        public CreateRequestForJobPostHandler(JobRequestService jobRequestService, IHttpContextAccessor httpContextAccessor)
        {
            _jobRequestService = jobRequestService;
            _httpContextAccessor = httpContextAccessor;
        }
        async Task<CreateRequestForJobPostResponse> IRequestHandler<CreateRequestForJobPostCommand, CreateRequestForJobPostResponse>
        .Handle(CreateRequestForJobPostCommand request, CancellationToken ct)
        {
            //Get Logged in User dynamically from JWT claims
            var user = _httpContextAccessor.HttpContext?.User ?? throw new Exception("User Not Found");

            var requesterId = user.FindFirst(ClaimTypes.Name)?.Value ?? throw new Exception("User Not Found");
            var requesterOrg = user.FindFirst("org")?.Value ?? "DefualtOrg";

            var entityIds = await _jobRequestService.CreateRequest(request, requesterId, requesterOrg, ct);
            
            return new CreateRequestForJobPostResponse(entityIds);
        }
    }
}
