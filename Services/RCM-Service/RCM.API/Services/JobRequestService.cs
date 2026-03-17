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

        public async Task<Guid> CreateRequest(CreateRequestForJobPostCommand command , CancellationToken ct)
        {
            // Validate positions from SAP
            var valid = await ValidatePositionsFromSap(command.PositionIds, ct);
            if (!valid)
                throw new Exception("One or more PositionIds are not vacant in SAP");
            // Validate postions request exists
            var exists = await PositionAlreadyRequested(command.PositionIds, ct);
            if (exists)
                throw new Exception("One or more PositionIds is already requested for");

            // Generate shared Request ID
            var requestId = Guid.NewGuid();

            // Loop through PositionIds, map and save each row
            foreach (var positionId in command.PositionIds)
            {
                var entity = _mapper.Map<JobRequestEntity>(command);  // VacantPostionCount = 1 automatically
                entity.Id = requestId;                                 // shared request ID
                entity.PositionId = positionId;                        // set current position

                await _uow.JobRequests.AddAsync(entity, ct);
            }

            //  Commit all at once
            await _uow.CommitAsync(ct);

            return requestId;

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

        public async Task<bool> PositionAlreadyRequested(List<string> PositionIds, CancellationToken ct)
        {
            var postions = await _uow.JobRequests.GetAllAsync(ct);

            var existingPositionIds = postions
                .Select(postions => postions.PositionId)
                .ToHashSet();
            var allExist = PositionIds.All(p=>existingPositionIds.Contains(p));

            return allExist;

        }
    }
}
