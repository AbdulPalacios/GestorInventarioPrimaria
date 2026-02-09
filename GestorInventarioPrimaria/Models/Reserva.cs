using System.ComponentModel.DataAnnotations;

namespace GestorInventarioPrimaria.Models
{
    public class Reserva
    {
        [Key]
        public int IdReserva { get; set; }

        public DateTime FechaReserva { get; set; } = DateTime.Now;
        public DateTime? HoraInicio { get; set; }
        public DateTime? HoraFin { get; set; }

        [MaxLength(200)]
        public string Motivo { get; set; } = string.Empty;

        public int IdUsuario { get; set; }
        public Usuario? Usuario { get; set; } // Navegación
    }
}