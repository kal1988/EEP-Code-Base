using BuildingBlocks.Repository;
using BuildingBlocks.SAPIntegrations.SapService;
using BuildingBlocks.Security;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using RCM.API.Infrastucture.Persistance;
using RCM.API.Mapping;
using RCM.API.Repositories;
using RCM.API.Services;
using RCM.API.UoW;
using System.Net.Http.Headers;
using System.Text;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddHttpContextAccessor();
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
builder.Services.AddScoped<JobPostService>();

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

var jwtSettings = builder.Configuration.GetSection("JWT");
var secretKey = jwtSettings["SecretKey"];

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,

        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(secretKey!))
    };
});
builder.Services.AddSingleton<IAuthorizationHandler, PermissionHandler>();
builder.Services.AddSingleton<IAuthorizationPolicyProvider, PermissionPolicyProvider>();
builder.Services.AddAuthorization();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
