using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BackLab.Model
{
    public class Game
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int GameId { get; set; }

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

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string ImageURL { get; set; } = "https://a.allegroimg.com/original/111499/f81ad65147f69cda8eeda020a343";
        
        public ICollection<OrderItem> OrderItems { get; set; }
        public ICollection<UserGame> UserGames { get; set; }
    }
}
