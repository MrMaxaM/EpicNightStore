using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace BackLab.Model
{
    public class UserGame
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int UserGameId { get; set; }
        [Required]
        public int UserId { get; set; }
        [Required]
        public int GameId { get; set; }
        public DateTime PurchasedAt { get; set; } = DateTime.UtcNow;

        public User User { get; set; }
        public Game Game { get; set; }
    }
}