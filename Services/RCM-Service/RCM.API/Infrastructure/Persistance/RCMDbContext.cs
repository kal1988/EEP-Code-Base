using Microsoft.EntityFrameworkCore;
using RCM.API.Featuers.JobPost;
using RCM.API.Featuers.RequestForJobPost;

namespace RCM.API.Infrastucture.Persistance
{
    public class RCMDbContext : DbContext
    {
        public RCMDbContext(DbContextOptions<RCMDbContext> options) : base(options)
        {
        }
        public DbSet<JobRequestEntity>  JobRequest { get; set; }
        public DbSet<JobPostEntity> JobPosts { get; set; }
    }
}
