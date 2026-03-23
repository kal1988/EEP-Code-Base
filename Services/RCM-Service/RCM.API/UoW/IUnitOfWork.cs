using BuildingBlocks.Repository;
using RCM.API.Featuers.JobPost;
using RCM.API.Featuers.RequestForJobPost;

namespace RCM.API.UoW
{
    public interface IUnitOfWork : IDisposable
    {
        IGenericRepository<JobRequestEntity> JobRequests { get; }
        IGenericRepository<JobPostEntity> JobPosts {  get; }
        Task<int> CommitAsync(CancellationToken ct);
    }
}
