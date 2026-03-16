using BuildingBlocks.Repository;
using BuildingBlocks.SAPIntegrations.SapService;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using RCM.API.Featuers.RequestForJobPost.CreateRequestForJobPost;
using RCM.API.Infrastucture.Persistance;
using RCM.API.Mapping;
using RCM.API.Repositories;
using RCM.API.Services;
using RCM.API.UoW;
using System.Net.Http.Headers;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

//SAP Configurations
builder.Services.Configure<SapSettings>(builder.Configuration.GetSection("SapConf"));

//Registe SAP HttpClient

builder.Services.AddHttpClient<SapService>((serviceProvider, client) =>
{
    var settings = serviceProvider
        .GetRequiredService<IOptions<SapSettings>>().Value;

    client.BaseAddress = new Uri(settings.BaseUrl + settings.BasePath);

    var credentials = Convert.ToBase64String(
        Encoding.ASCII.GetBytes($"{settings.Username}:{settings.Password}")
    );

    client.DefaultRequestHeaders.Authorization =
        new AuthenticationHeaderValue("Basic", credentials);

    client.DefaultRequestHeaders.Accept.Add(
        new MediaTypeWithQualityHeaderValue("application/json"));
});

//Service Injection
builder.Services.AddScoped<JobRequestService>();

//Registe MediatR handler
builder.Services.AddMediatR(cfg=>cfg.RegisterServicesFromAssembly(typeof(Program).Assembly));

//DB Injection

var conf = builder.Configuration.GetConnectionString("RCMDbConnection"); 
builder.Services.AddDbContext<RCMDbContext>(opts=> 
    opts.UseSqlServer(conf)
);


//Repo Injection
builder.Services.AddScoped(typeof(IGenericRepository<>),typeof(GenericRepository<>));

// Automapper
builder.Services.AddAutoMapper(cfg => { }, typeof(MappingProfiles).Assembly);

//UOW
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();


var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
