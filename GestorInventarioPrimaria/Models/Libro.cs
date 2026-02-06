using System.ComponentModel.DataAnnotations;

namespace GestorInventarioPrimaria.Models
{
    public class Libro
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Titulo { get; set; } = string.Empty;

        [MaxLength(100)]
        public string Autor { get; set; } = "Desconocido";

        [MaxLength(20)]
        public string EstadoFisico { get; set; } = "Bueno"; // Valores: "Bueno", "Regular", "Malo"

        public bool EstaDisponible { get; set; } = true;
    }
}