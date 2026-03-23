using AutoMapper;
using Microsoft.AspNetCore.Mvc.Filters;
using RCM.API.Featuers.JobPost;
using RCM.API.Featuers.JobPost.CreateJobPost;
using RCM.API.UoW;
using System.ComponentModel;

namespace RCM.API.Services
{
    public class JobPostService
    {
        private readonly IUnitOfWork _uow;
        private readonly IMapper _mapper;

        public JobPostService(IUnitOfWork uow, IMapper mapper)
        {
            _uow = uow;
            _mapper = mapper;
        }

        public async Task<List<Guid>> CreateJobPost(CreateJobPostCommand command, string createdById, CancellationToken ct)
        {
            var validatedPostions = await ValidateRequestedPostions(command.RequestedPostions, ct);

            var createdIds = new List<Guid>();
            var currentTime = DateTime.UtcNow;

            foreach (var positionId in command.RequestedPostions)
            {
                var entity = _mapper.Map<JobPostEntity>(command);
                var postId = Guid.NewGuid();

                entity.Id = postId;
                entity.Positions = positionId;
                entity.PostingDate = command.postingDate;
                entity.CreatedBy = createdById;
                entity.UpdatedBy = createdById;
                entity.CreatedAt = currentTime;
                entity.UpdatedAt = currentTime;

                await _uow.JobPosts.AddAsync(entity, ct);

                createdIds.Add(postId);
            }
            await _uow.CommitAsync(ct);
            return createdIds;
        }
        public async Task<HashSet<string>> GetAllRequestedPositions(CancellationToken ct)
        {
            var requestedPostions = await _uow.JobRequests.GetAllAsync(ct);
            return requestedPostions.Select(x => x.RequestedPosition).ToHashSet();
        }
        public async Task<HashSet<string>> GetDuplicatePostedPostions(List<string> RequestedPostions, CancellationToken ct)
        {
            var existingPositions = await _uow.JobPosts.GetAllAsync(ct);
            var existingSet = existingPositions.Select(x => x.Positions).ToHashSet();
            
            return RequestedPostions.Where(x => existingSet.Contains(x)).ToHashSet();
        }
        public async Task<bool> ValidateRequestedPostions(List<string> RequestedPositions, CancellationToken ct)
        {
            var allPositions = await GetAllRequestedPositions(ct);
            var invalid =  RequestedPositions.Where(x=> !allPositions.Contains(x)); // no request

            if (invalid.Any()) throw new Exception($"The following positions {string.Join(",", invalid)} are not requested for");

            var duplicatePositions = await GetDuplicatePostedPostions(RequestedPositions, ct);

            if (duplicatePositions.Any()) throw new Exception($"Posting for the following positions {string.Join(",", duplicatePositions)} already exists");

            return true;
        }

    }
}
