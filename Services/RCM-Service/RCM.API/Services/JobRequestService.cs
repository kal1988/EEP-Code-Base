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

        public async Task<List<Guid>> CreateRequest(CreateRequestForJobPostCommand command , string requesterId, string requesterOrg,CancellationToken ct)
        {
            // Validate positions from SAP
            var valid = await ValidatePositionsFromSap(command.RequestedPosition, ct);
            if (!valid)
                throw new Exception("One or more PositionIds are not vacant in SAP");
            // Validate postions request exists
            var exists = await PositionAlreadyRequested(command.RequestedPosition, ct);
            if (exists)
                throw new Exception("One or more PositionIds is already requested for");

            // Generate shared Request ID

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
        public async Task<bool> ValidatePositionsFromSap(List<string> PositionIds, CancellationToken ct)
        {
            var sapPositions = await _sapService.GetVacantPositions();

            if(sapPositions is null || !sapPositions.Any())
            {
                throw new ArgumentNullException("No Vacant Positions Found");
            }
            var sapPositionIds = sapPositions.Select(p=>p.PositionId).ToHashSet();

            var allPositionsValid = PositionIds.All(p => sapPositionIds.Contains(p));

            return allPositionsValid;
        }

        public async Task<bool> PositionAlreadyRequested(List<string> RequestedPosition, CancellationToken ct)
        {
            var postions = await _uow.JobRequests.GetAllAsync(ct);

            var existingPositionIds = postions
                .Select(postions => postions.RequestedPosition)
                .ToHashSet();
            var allExist = RequestedPosition.Any(p => existingPositionIds.Contains(p));

            return allExist;

        }
    }
}
