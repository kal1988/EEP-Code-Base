namespace BuildingBlocks.Repository
{
    public interface IGenericRepository<TEntity>  where TEntity : class 
    {
        Task<TEntity?> GetByIdAsync(Guid id, CancellationToken ct);
        Task<IEnumerable<TEntity>> GetAllAsync(CancellationToken ct);
        Task AddAsync(TEntity entity, CancellationToken ct);
        void UpdateAsync(TEntity entity);
        void DeleteAsync(TEntity entity);
    }
}
