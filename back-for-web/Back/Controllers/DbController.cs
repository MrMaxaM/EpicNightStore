using Microsoft.AspNetCore.Mvc;
using BackLab.Model;
using System.Security.Claims;
using System.Text;
using System.IdentityModel.Tokens.Jwt;
using System.ComponentModel.DataAnnotations;
using Microsoft.IdentityModel.Tokens;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Linq;
using Microsoft.AspNetCore.StaticFiles;

namespace BackLab.Controllers
{
    [ApiController]
    [Route("[action]")]
    public class DbController : Controller
    {
        private readonly AppDbContext _db;
        private readonly IConfiguration _conf;
        private readonly ILogger<DbController> _logger;
        private readonly UserService _userService;

        public DbController(AppDbContext context, IConfiguration configuration, ILogger<DbController> logger, UserService userService)
        {
            _db = context;
            _conf = configuration;
            _logger = logger;
            _userService = userService;
        }

        [HttpPost]
        public async Task<IActionResult> Register([FromBody] RegisterDto model) //Регистрация
        {
            if (!ModelState.IsValid) //Проверка на валидность переданной формы
            {

                _logger.LogError("Ошибка при регистрации нового пользователя: Неверная модель регистрации");
                return BadRequest(ModelState);
            }

            var users = await _userService.GetAllUsers();

            // Проверяем, существует ли пользователь с таким email или логином
            if (users.Any(u => u.Email == model.Email || u.Username == model.Username))
            {

                _logger.LogError("Ошибка при регистрации нового пользователя: Пользователь с таким email или логином уже существует");
                return BadRequest(new { Message = "Пользователь с таким email или логином уже существует" });
            }

            // Хешируем пароль
            string passwordHash = BCrypt.Net.BCrypt.HashPassword(model.Password);

            var user = new User
            {
                Username = model.Username,
                Email = model.Email,
                PasswordHash = passwordHash,
                Role = "User"
            };

            //Сохраняем нового пользователя
            _db.Users.Add(user);
            _db.SaveChanges();
            _userService.UpdateCash();

            _logger.LogInformation($"Зарегистрирован новый пользователь: {user}");

            return Ok(new { Message = "Пользователь успешно зарегистрирован" });
        }

        [HttpPost]
        public async Task<IActionResult> Login([FromBody] LoginDto model) //Вход в систему
        {
            if (!ModelState.IsValid) //Проверка на валидность переданной формы
            {
                _logger.LogError("Ошибка при аутентификации пользователя: Неверная модель аутентификации");
                return BadRequest(ModelState);
            }

            var users = await _userService.GetAllUsers();
            var user = users.FirstOrDefault(u => u.Email == model.Email); //Ищем пользователя

            if (user == null) //При отсутствии возвращаем ошибку
            {
                _logger.LogError("Ошибка при аутентификации пользователя: Неверный логин");
                return Unauthorized(new { Message = "Неверный логин" });
            }

            // Проверяем пароль
            if (!BCrypt.Net.BCrypt.Verify(model.Password, user.PasswordHash))
            {
                _logger.LogError("Ошибка при аутентификации пользователя: Неверный пароль");
                return Unauthorized(new { Message = "Неверный пароль" });
            }

            HttpContext.Session.SetString("Username", user.Username);
            HttpContext.Session.SetString("Email", user.Email);
            HttpContext.Session.SetString("CreatedAt", user.CreatedAt.ToString());
            HttpContext.Session.SetString("Role", user.Role);

            // Генерируем JWT токен
            var token = GenerateJwtToken(user);
            _logger.LogDebug($"Сгенерирован токен: {token}");

            return Ok(new { Token = token });
        }

        [HttpGet]
        [Authorize(Roles = "Admin")] //Проверка доступа: только с ролью "Админ"
        public async Task<IActionResult> GetAllUsers() // Получение списка пользователей
        {
            // Чтение и передача данных
            _logger.LogWarning("Предупреждение: Кто-то получил доступ к списку всех пользователей");
            return Ok(await _db.Users.ToListAsync());
        }

        private string GenerateJwtToken(User user) //Генерация JWT токена
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_conf["JwtSettings:SecretKey"])); //Добавляем секретный ключ
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256); //Подпись

            var claims = new[] { //Тело
                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var token = new JwtSecurityToken(
                issuer: _conf["JwtSettings:Issuer"],
                audience: _conf["JwtSettings:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(1),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        [HttpGet]
        public IActionResult GetUserProfile()
        {
            var username = HttpContext.Session.GetString("Username");
            var email = HttpContext.Session.GetString("Email");
            var createdAt = HttpContext.Session.GetString("CreatedAt");
            var role = HttpContext.Session.GetString("Role");

            if (username == null || email == null || createdAt == null)
            {
                return NotFound(new { message = "User data not found" });
            }

            var userProfile = new
            {
                Username = username,
                Email = email,
                CreatedAt = createdAt,
                Role = role
            };

            return Ok(userProfile);
        }
    }

    public class RegisterDto //Модель формы регистрации
    {
        [Required]
        public string Username { get; set; }
        [Required]
        [EmailAddress]
        public string Email { get; set; }
        [Required]
        public string Password { get; set; }
    }

    public class LoginDto //Модель формы авторизации
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }
        [Required]
        public string Password { get; set; }
    }
}
