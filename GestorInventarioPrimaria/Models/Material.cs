using System.ComponentModel.DataAnnotations;

namespace GestorInventarioPrimaria.Models
{
    public class Material
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Titulo { get; set; } = string.Empty;

        [MaxLength(100)]
        public string Autor { get; set; } = "Desconocido";

        [MaxLength(100)]
        public string Editorial { get; set; } = "Sin Editorial";

        public int StockTotal { get; set; } = 1;

        public int StockDisponible { get; set; } = 1;
    }
}