using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GestorInventarioPrimaria.Data;

namespace GestorInventarioPrimaria.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DashboardController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DashboardController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("resumen")]
        public async Task<IActionResult> ObtenerResumen()
        {
            var totalAlumnos = await _context.Usuarios
                                     .CountAsync(u => u.Rol == "Alumno");

            var totalTitulos = await _context.Materiales.CountAsync();

            var totalEjemplares = await _context.Materiales
                                        .SumAsync(m => m.StockTotal);

            var prestamosActivos = 0;

            return Ok(new
            {
                Alumnos = totalAlumnos,
                Titulos = totalTitulos,
                Ejemplares = totalEjemplares,
                Prestamos = prestamosActivos
            });
        }
    }
}
