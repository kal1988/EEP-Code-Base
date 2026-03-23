using AutoMapper;
using BuildingBlocks.SAPIntegrations.DTOs;
using BuildingBlocks.SAPIntegrations.SapService;
using RCM.API.Featuers.RequestForJobPost;
using RCM.API.Featuers.RequestForJobPost.CreateRequestForJobPost;
using RCM.API.UoW;

namespace RCM.API.Services
{
    public class JobRequestService
    {
        private readonly IUnitOfWork _uow;
        private readonly IMapper _mapper;
        private readonly SapService _sapService;
        public JobRequestService(IUnitOfWork uow, IMapper mapper, SapService sapService)
        {
            _uow = uow;
            _mapper = mapper;
            _sapService = sapService;
        }
        public async Task<HashSet<string>> GetAllPositionsFromSap(CancellationToken ct)
        {
            var sapPositions = await _sapService.GetVacantPositions();
            return sapPositions.Select(x=>x.PositionId).ToHashSet();
        }
        public async Task<HashSet<string>> GetDuplicateRequests(List<string> RequestedPositions, CancellationToken ct)
        {
            var existingPositions = await _uow.JobRequests.GetAllAsync(ct);
            var existingSet = existingPositions.Select(x=>x.RequestedPosition).ToHashSet();

            return RequestedPositions.Where(x=>existingSet.Contains(x)).ToHashSet();
        }
        public async Task<bool> ValidateRequests(List<string> RequestedPositions, CancellationToken ct)
        {
            var allVacantPositions = await GetAllPositionsFromSap(ct);
            var invalid = RequestedPositions.Where(x => 
            !allVacantPositions.Contains(x)).ToList();

            if (invalid.Any()) throw new Exception($"The following positions ({string.Join(",", invalid)}) are not vacant positions");

            var duplicatePositions = await GetDuplicateRequests(RequestedPositions, ct);

            if (duplicatePositions.Any()) throw new Exception($"The following positions ({string.Join(",",duplicatePositions)}) already have been requested");

            return true;
        }
        public async Task<List<Guid>> CreateRequest(CreateRequestForJobPostCommand command , string requesterId, string requesterOrg,CancellationToken ct)
        {
            await ValidateRequests(command.RequestedPosition, ct);

            var createdIds = new List<Guid>();
            var currentTime = DateTime.UtcNow;

            // Loop through PositionIds, map and save each row
            foreach (var positionId in command.RequestedPosition)
            {
                var entity = _mapper.Map<JobRequestEntity>(command);
                var requestId = Guid.NewGuid();
                entity.Id = requestId;
                entity.RequestedPosition = positionId;
                entity.RequesterId = requesterId; //get this from current logged in user
                entity.RequesterOrg = requesterOrg; //Get this from sap 
                entity.ChangedById = requesterId; 
                entity.ChangedAt = currentTime;
                await _uow.JobRequests.AddAsync(entity, ct);

                createdIds.Add(requestId); // add the created id to the list for response
            }

            //  Commit all at once
            await _uow.CommitAsync(ct);

            return createdIds;

        }
    }
}
