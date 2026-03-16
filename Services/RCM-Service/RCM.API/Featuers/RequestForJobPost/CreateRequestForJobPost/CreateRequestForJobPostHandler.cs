using BuildingBlocks.CQRS;
using MediatR;
using RCM.API.Services;
using System.Windows.Input;

namespace RCM.API.Featuers.RequestForJobPost.CreateRequestForJobPost
{
    public record CreateRequestForJobPostCommand(List<string> PositionIds, int VacantPostionCount) : ICommand<CreateRequestForJobPostResponse>;
    public record CreateRequestForJobPostResponse(Guid id);
    internal class CreateRequestForJobPostHandler : ICommandHandler<CreateRequestForJobPostCommand, CreateRequestForJobPostResponse>
    {
        private readonly JobRequestService _jobRequestService;
        public CreateRequestForJobPostHandler(JobRequestService jobRequestService)
        {
            _jobRequestService = jobRequestService;
        }
        async Task<CreateRequestForJobPostResponse> IRequestHandler<CreateRequestForJobPostCommand, CreateRequestForJobPostResponse>
        .Handle(CreateRequestForJobPostCommand request, CancellationToken ct)
        {
            var entityId = await _jobRequestService.CreateRequest(new CreateRequestForJobPostCommand(request.PositionIds, request.VacantPostionCount), ct);
            
            return new CreateRequestForJobPostResponse(entityId);
        }
    }
}
