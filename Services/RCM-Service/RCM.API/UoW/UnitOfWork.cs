using BuildingBlocks.Repository;
using RCM.API.Featuers.JobPost;
using RCM.API.Featuers.RequestForJobPost;
using RCM.API.Infrastucture.Persistance;
using RCM.API.Repositories;

namespace RCM.API.UoW
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly RCMDbContext _context;
        private IGenericRepository<JobRequestEntity> _jobRequests;
        private IGenericRepository<JobPostEntity> _jobPosts;

        public UnitOfWork(RCMDbContext context)
        {
            _context = context;
        }
        //Lazy loding
        public IGenericRepository<JobRequestEntity> JobRequests => _jobRequests ??= new GenericRepository<JobRequestEntity>(_context);
        public IGenericRepository<JobPostEntity> JobPosts => _jobPosts ??= new GenericRepository<JobPostEntity>(_context);
        public async Task<int> CommitAsync(CancellationToken ct)=> await _context.SaveChangesAsync(ct);
        public void Dispose() => _context.Dispose();
    }
}
