using GestorInventarioPrimaria.Data;
using GestorInventarioPrimaria.DTOs;
using GestorInventarioPrimaria.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GestorInventarioPrimaria.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PrestamosController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PrestamosController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("registrar")]
        public async Task<IActionResult> RegistrarPrestamo([FromBody] PrestamoDto datos)
        {
            // VALIDAR ALUMNO
            var alumno = await _context.Usuarios
                                .FirstOrDefaultAsync(u => u.Matricula == datos.MatriculaAlumno);

            if (alumno == null)
            {
                return BadRequest("❌ No existe ningún alumno con esa matrícula.");
            }

            // VALIDAR MATERIAL (Libro o Salón)
            var material = await _context.Materiales.FindAsync(datos.MaterialId);

            if (material == null)
            {
                return NotFound("❌ El material no existe.");
            }

            // Validamos Stock solo si es un objeto físico o instalación única
            if (material.StockDisponible <= 0)
            {
                return BadRequest($"❌ No hay disponibilidad de '{material.Titulo}'.");
            }

            // 3. CREAR LA RESERVA
            var nuevaReserva = new Reserva
            {
                UsuarioId = alumno.Id,
                MaterialId = material.Id,

                // USAMOS LOS NUEVOS NOMBRES:
                FechaInicio = DateTime.Now,

                FechaFinEsperada = material.Categoria == "Libro"
                                   ? DateTime.Now.AddDays(7)
                                   : DateTime.Now.AddHours(2),

                Motivo = "Préstamo escolar",
                Estatus = "Activo"
            };

            // ACTUALIZAR STOCK
            material.StockDisponible -= 1;

            // GUARDAR
            _context.Reservas.Add(nuevaReserva);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                mensaje = "✅ Préstamo exitoso",
                alumno = alumno.Nombre,
                material = material.Titulo,
                fechaTermino = nuevaReserva.FechaFinEsperada.ToString("g")
            });
        }

        // Sirve para ver qué cosas tiene prestadas un alumno específico
        [HttpGet("pendientes/{matricula}")]
        public async Task<ActionResult<IEnumerable<object>>> GetPendientes(string matricula)
        {
            var alumno = await _context.Usuarios
                                .FirstOrDefaultAsync(u => u.Matricula == matricula);

            if (alumno == null) return NotFound("Alumno no encontrado");

            var prestamos = await _context.Reservas
                                  .Include(r => r.Material) 
                                  .Where(r => r.UsuarioId == alumno.Id && r.Estatus == "Activo")
                                  .Select(r => new
                                  {
                                      IdReserva = r.Id,
                                      Material = r.Material.Titulo,
                                      FechaInicio = r.FechaInicio.ToShortDateString(),
                                      FechaFin = r.FechaFinEsperada.ToShortDateString()
                                  })
                                  .ToListAsync();

            return Ok(prestamos);
        }

        [HttpPut("devolver/{idReserva}")]
        public async Task<IActionResult> DevolverMaterial(int idReserva)
        {
            // Buscamos la reserva (y cargamos el material relacionado)
            var reserva = await _context.Reservas
                                .Include(r => r.Material)
                                .FirstOrDefaultAsync(r => r.Id == idReserva);

            if (reserva == null) return NotFound("Reserva no encontrada");

            if (reserva.Estatus == "Devuelto") return BadRequest("Este material ya fue devuelto.");

            // Actualizamos la Reserva
            reserva.Estatus = "Devuelto";
            reserva.FechaDevolucionReal = DateTime.Now;

            // Actualizamos el Stock (Sumamos 1)
            if (reserva.Material != null)
            {
                reserva.Material.StockDisponible += 1;
            }

            // Guardamos cambios
            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "✅ Devolución exitosa. Stock actualizado." });
        }

        // GET: api/prestamos/historial?pagina=1&cantidad=10
        [HttpGet("historial")]
        public async Task<ActionResult<IEnumerable<object>>> GetHistorial(int pagina = 1, int cantidad = 10)
        {
            if (pagina <= 0) pagina = 1;
            if (cantidad <= 0) cantidad = 10;

            return await _context.Reservas
                .Include(r => r.Usuario)
                .Include(r => r.Material)
                .OrderByDescending(r => r.FechaInicio) 
                .Skip((pagina - 1) * cantidad)       
                .Take(cantidad)                      
                .Select(r => new {
                    IdReserva = r.Id,
                    Alumno = r.Usuario.Nombre,
                    Material = r.Material.Titulo,
                    Fecha = r.FechaInicio.ToString("dd/MM/yyyy HH:mm"),
                    Estado = r.Estatus
                })
                .ToListAsync();
        }
    }
}