using BackLab.Model;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;

public class UserService
{
    private readonly AppDbContext _db;
    private readonly IMemoryCache _memoryCache;
    private readonly string? _diskCacheFilePath;
    private readonly ILogger<UserService> _logger;

    public UserService(AppDbContext context, IMemoryCache memoryCache, ILogger<UserService> logger)
    {
        _db = context;
        _memoryCache = memoryCache;
        _logger = logger;
    }

    public async Task<List<User>> GetAllUsers()
    {
        string cacheKey = "AllUsers";

        // Попробуем получить данные из in-memory кэша
        if (_memoryCache.TryGetValue(cacheKey, out List<User> users))
        {
            _logger.LogInformation(" -> Пользователи получены из memory cashe");
            return users;
        }

        // Попробуем получить данные из disk cache
        if (_diskCacheFilePath != null && File.Exists(_diskCacheFilePath))
        {
            var jsonData = await File.ReadAllTextAsync(_diskCacheFilePath);
            users = JsonConvert.DeserializeObject<List<User>>(jsonData);

            // Сохраняем данные в in-memory кэш
            var cacheEntryOptions = new MemoryCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(2)
            };
            _memoryCache.Set(cacheKey, users, cacheEntryOptions);

            _logger.LogInformation(" -> Пользователи получены из disk cashe");
            return users;
        }

        // Получаем данные из базы данных
        users = await _db.Users.ToListAsync();

        // Сохраняем данные в оба вида кэша
        var cacheOptions = new MemoryCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(2)
        };
        _memoryCache.Set(cacheKey, users, cacheOptions);

        if (_diskCacheFilePath != null)
        {
            var json = JsonConvert.SerializeObject(users);
            await File.WriteAllTextAsync(_diskCacheFilePath, json);
        }

        _logger.LogInformation(" -> Пользователи получены из базы данных");
        return users;
    }

    public async Task UpdateCash()
    {
        // Удаляем записи из кэша
        _memoryCache.Remove("AllUsers");
        if (File.Exists(_diskCacheFilePath))
        {
            File.Delete(_diskCacheFilePath);
        }
        _logger.LogInformation(" -> Кеш очищен");
    }
}