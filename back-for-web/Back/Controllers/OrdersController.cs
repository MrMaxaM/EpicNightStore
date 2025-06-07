using BackLab.Model;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Security.Claims;

namespace BackLab.Controllers
{
    [ApiController]
    [Authorize]
    [Route("[action]")]
    public class OrdersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public OrdersController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<ActionResult<Order>> CreateOrder([FromBody] CreateOrderRequest request)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            var userId = int.Parse(userIdClaim);

            var order = new Order
            {
                UserId = userId,
                OrderDate = DateTime.UtcNow,
                Status = "Pending",
                OrderItems = request.GameIds.Select(gameId => new OrderItem
                {
                    GameId = gameId,
                    Price = _context.Games.Find(gameId).Price
                }).ToList()
            };

            order.TotalAmount = order.OrderItems.Sum(item => item.Price);

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            return Ok(order.OrderId);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Order>> GetOrder(int id)
        {
            var order = await _context.Orders.FirstOrDefaultAsync(o => o.OrderId == id);
            if (order == null)
            {
                return NotFound();
            }
            return order;
        }

        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] string status)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null)
            {
                return NotFound();
            }
            order.Status = status;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOrder(int id)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null)
            {
                return NotFound();
            }
            _context.Orders.Remove(order);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPost("{id}/confirm")]
        public async Task<IActionResult> ConfirmOrder(int id)
        {
            var order = await _context.Orders.Include(o => o.OrderItems).FirstOrDefaultAsync(o => o.OrderId == id);
            if (order == null)
            {
                return NotFound();
            }

            order.Status = "Paid";
            await _context.SaveChangesAsync();

            // Зачисление купленных игр в библиотеку игрока
            foreach (var item in order.OrderItems)
            {
                var userGame = new UserGame
                {
                    UserId = order.UserId,
                    GameId = item.GameId,
                    PurchasedAt = DateTime.UtcNow
                };
                _context.UserGames.Add(userGame);
            }
            await _context.SaveChangesAsync();

            return NoContent();
        }
        public class CreateOrderRequest
        {
            public List<int> GameIds { get; set; }
        }
    }
}