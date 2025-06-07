using BackLab.Model;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;
using BackLab.Model;
using Microsoft.AspNetCore.Mvc;
using BackLab.Model;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;

namespace BackLab.Controllers
{
    [ApiController]
    [Route("[action]")]
    public class GamesController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _environment;

        public GamesController(AppDbContext context, IWebHostEnvironment environment)
        {
            _context = context;
            _environment = environment;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Game>>> GetAllGames()
        {
            return await _context.Games.ToListAsync();
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Game>> AddGame([FromBody] GameDto model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest("Invalid game data.");
            }

            var game = new Game
            {
                Title = model.Title,
                Description = model.Description,
                ReleaseDate = model.ReleaseDate,
                Developer = model.Developer,
                Publisher = model.Publisher,
                Price = model.Price,
                CreatedAt = DateTime.UtcNow,
                ImageURL = model.ImageURL  
            };
            _context.Games.Add(game);
            await _context.SaveChangesAsync();

            return Ok();
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Game>>> GetUserGames()
        {
            // Получаем email пользователя из сессии
            var email = HttpContext.Session.GetString("Email");

            if (string.IsNullOrEmpty(email))
            {
                return Unauthorized("User is not authenticated.");
            }

            // Находим пользователя по email
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);

            if (user == null)
            {
                return NotFound("User not found.");
            }

            // Получаем все игры, связанные с этим пользователем
            var games = await _context.UserGames
                .Where(ug => ug.UserId == user.UserId)
                .Select(ug => ug.Game)
                .ToListAsync();

            if (games == null)
            {
                return NotFound("У данного пользователя нет игр.");
            }

            return Ok(games);
        }

        public class GameDto
        {
            [Required]
            [MaxLength(100)]
            public string Title { get; set; }

            public string Description { get; set; }

            public DateTime? ReleaseDate { get; set; }

            [MaxLength(100)]
            public string Developer { get; set; }

            [MaxLength(100)]
            public string Publisher { get; set; }

            [Required]
            [Column(TypeName = "decimal(10, 2)")]
            public decimal Price { get; set; }
            public string ImageURL { get; set; } = "https://a.allegroimg.com/original/111499/f81ad65147f69cda8eeda020a343";
        }
    }
}