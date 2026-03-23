using AutoMapper;
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
        //Get all postions from db
        public async Task<HashSet<string>> GetRequestedPositionsfromDb(CancellationToken ct)
        {
           var requestedPostions =  await _uow.JobRequests.GetAllAsync(ct);
           return requestedPostions.Select(x=>x.RequestedPosition).ToHashSet();
        }
        public async Task<bool> ValidateRequestedPostions(List<string> RequestedPositions, CancellationToken ct)
        {
            var validatedIds = await GetRequestedPositionsfromDb(ct);
            // if any of the requested postions are inside the db than that is valid
            return RequestedPositions.Any(x=>validatedIds.Contains(x));
        }
        //Create a job post for requested position
        public async Task<List<Guid>> CreateJobPost(CreateJobPostCommand command, string createdById, CancellationToken ct)
        {
            var validatedPostions = await ValidateRequestedPostions(command.RequestedPostions,ct);
            if (!validatedPostions) throw new Exception("One or more postions are not requested for");

            var createdIds = new List<Guid>();
            var currentTime = DateTime.UtcNow;

            foreach(var positionId in command.RequestedPostions)
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
    }
}
