using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace RCM.API.Infrastucture.Persistance
{
    public class RCMDbContextFactory : IDesignTimeDbContextFactory<RCMDbContext>
    {
        public RCMDbContext CreateDbContext(string[] args)
        {
            // Load configuration
            var configuration = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json")
                .Build();

            // Configure DbContextOptions
            var optionsBuilder = new DbContextOptionsBuilder<RCMDbContext>();
            var connectionString = configuration.GetConnectionString("RCMDbConnection");

            optionsBuilder.UseSqlServer(connectionString);

            return new RCMDbContext(optionsBuilder.Options);
        }
    }
}
