using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GestorInventarioPrimaria.Models
{
    public class Reserva
    {
        [Key]
        public int Id { get; set; }

        [ForeignKey("Usuario")]
        public int UsuarioId { get; set; }
        public virtual Usuario? Usuario { get; set; }

        [ForeignKey("Material")]
        public int MaterialId { get; set; }
        public virtual Material? Material { get; set; }

        // FECHAS
        public DateTime FechaInicio { get; set; } = DateTime.Now;

        public DateTime FechaFinEsperada { get; set; }

        public DateTime? FechaDevolucionReal { get; set; }

        // DATOS EXTRA
        [MaxLength(200)]
        public string Motivo { get; set; } = "Préstamo escolar"; // Ej: "Clase de Computación 4A"

        [MaxLength(20)]
        public string Estatus { get; set; } = "Activo"; // "Activo", "Finalizado", "Cancelado"
    }
}