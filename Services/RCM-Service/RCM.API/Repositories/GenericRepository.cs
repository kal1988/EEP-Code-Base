using BuildingBlocks.Repository;
using Microsoft.EntityFrameworkCore;
using RCM.API.Featuers.RequestForJobPost;
using RCM.API.Infrastucture.Persistance;

namespace RCM.API.Repositories
{
    public class GenericRepository<T> : IGenericRepository<T> where T : class
    {
        private readonly DbContext _context;
        private readonly DbSet<T> _dbSet;  
        public GenericRepository(DbContext context)
        {
            _context = context;
            _dbSet = context.Set<T>();
        }
        public async Task<IEnumerable<T>> GetAllAsync(CancellationToken ct) => await _dbSet.ToListAsync(ct);
        public async Task<T?> GetByIdAsync(Guid id, CancellationToken ct) => await _dbSet.FindAsync(id, ct);
        public async Task AddAsync(T entity, CancellationToken ct) => await _dbSet.AddAsync(entity, ct);
        public void UpdateAsync(T entity) => _dbSet.Update(entity);
        public void DeleteAsync(T entity) => _dbSet.Remove(entity);
    }
}
