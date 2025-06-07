using BackLab.Model;
using Microsoft.OpenApi.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Serilog;
using Serilog.Events;
using Microsoft.Extensions.FileProviders;
using Microsoft.AspNetCore.Http;

namespace BackLab
{
    public class Program
    {
        public static void Main(string[] args)
        {
            // Создает WebApplicationBuilder, который используется для настройки приложения
            var builder = WebApplication.CreateBuilder(args);

            builder.Configuration
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true) //Дефолтный файл конфигурации json
                .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true, reloadOnChange: true) //Конфигурация для определённой стадии
                .AddEnvironmentVariables(); //Переменные среды

            builder.Logging.ClearProviders(); // Очистка стандартных провайдеров
            builder.Logging.AddDebug();       // Логи в Debug-окно (Visual Studio)

            // Настройка Serilog для логирования в консоль и файл
            Log.Logger = new LoggerConfiguration()

            // Логирование в консоль
            .WriteTo.Console( 
                outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj}{NewLine}{Exception}") // Шаблон вывода

            // Логирование в файл
            .WriteTo.File("logs/log.txt", rollingInterval: RollingInterval.Day, 
                            outputTemplate: "[{Timestamp:yyyy-MM-dd HH:mm:ss} {Level}] {Message}{NewLine}{Exception}")

            // Логирование в базу данных
            .WriteTo.PostgreSQL(connectionString: builder.Configuration.GetConnectionString("DefaultConnection"), //База данных
                                tableName: "Logs", //Таблица
                                restrictedToMinimumLevel: LogEventLevel.Information, //Минимальный уровнь информации
                                needAutoCreateTable: true) //Автосоздание таблицы
            .CreateLogger();

            builder.Host.UseSerilog(); //Включаем Serilog

            // Добавление сервисов
            builder.Services.AddControllers();
            builder.Services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo { Title = "Your API Title", Version = "v1" });
            });

            //Добавление сервиса аутентификации
            builder.Services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme; // Использование дефолтных схем для
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;    // аутентификации и проверки прав
            })
            .AddJwtBearer(options =>
            {
               options.TokenValidationParameters = new TokenValidationParameters //Условия проверки валидации токена
               {
                   ValidateIssuer = true,
                   ValidateAudience = true,
                   ValidateLifetime = true,
                   ValidateIssuerSigningKey = true,
                   ValidIssuer = builder.Configuration["JwtSettings:Issuer"],
                   ValidAudience = builder.Configuration["JwtSettings:Audience"],
                   IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["JwtSettings:SecretKey"]))
               };
            });
            // DbContext
            builder.Services.AddDbContext<AppDbContext>();

            builder.Services.AddHttpClient();

            //Добавляем CORS
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowReactApp",
                    policy =>
                    {
                        policy.WithOrigins("http://localhost:3000")
                               .AllowAnyMethod()
                               .AllowAnyHeader()
                               .AllowCredentials();
                    });
            });

            builder.Services.AddMemoryCache();
            builder.Services.AddDistributedMemoryCache();
            builder.Services.AddScoped<UserService>();
            builder.Services.AddSession(options =>
            {
                options.IdleTimeout = TimeSpan.FromMinutes(30); // Время ожидания сессии
                options.Cookie.HttpOnly = true;
                options.Cookie.IsEssential = true;
                options.Cookie.SameSite = SameSiteMode.None;
                options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
            });

            var app = builder.Build();

            if (!app.Environment.IsDevelopment())
            {
                app.UseExceptionHandler("/Error");
                app.UseHsts();
            }

            app.UseHttpsRedirection();
            app.UseStaticFiles();

            app.UseRouting();

            app.UseCors("AllowReactApp"); // Включаем CORS

            app.UseAuthentication(); // Включаем Аутентификацию
            app.UseAuthorization(); // Включаем Авторизацию

            app.UseStaticFiles(new StaticFileOptions
            {
                RequestPath = "/staticfiles"
            });

            app.UseSession();

            app.MapControllers();

            app.MapGet("/", () =>
            {
                return $"Environment: {app.Configuration["EnvironmentName"]}, \n" +
                $"Database Connection: {app.Configuration["ConnectionStrings:DefaultConnection"]}, \n" +
                $"Secret Key: {app.Configuration["JwtSettings:SecretKey"]}";
            });

            app.UseSwagger();
            app.UseSwaggerUI(c =>
            {
                c.SwaggerEndpoint("/swagger/v1/swagger.json", "Your API Title v1");
                c.RoutePrefix = "swagger";
            });

            // Запуск приложения.
            app.Run();
        }
    }
}
