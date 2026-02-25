using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GestorInventarioPrimaria.Data;
using GestorInventarioPrimaria.Models;

namespace GestorInventarioPrimaria.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsuariosController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UsuariosController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("alumnos")]
        public async Task<ActionResult<IEnumerable<Usuario>>> GetAlumnos()
        {
            return await _context.Usuarios
                                 .Where(u => u.Rol == "Alumno")
                                 .OrderBy(u => u.Matricula)
                                 .ToListAsync();
        }

        // GET: api/usuarios/buscar?termino=juan
        [HttpGet("buscar")]
        public async Task<ActionResult<IEnumerable<Usuario>>> BuscarUsuarios([FromQuery] string termino)
        {
            if (string.IsNullOrWhiteSpace(termino)) return Ok(new List<Usuario>());

            return await _context.Usuarios
                .Where(u => u.Nombre.Contains(termino) || u.Matricula.Contains(termino))
                .Take(5) 
                .ToListAsync();
        }

        [HttpPost("crear")]
        public async Task<IActionResult> CrearAlumno([FromBody] Usuario nuevoAlumno)
        {
            // Evitar nombres repetidos
            bool existe = await _context.Usuarios
                .AnyAsync(u => u.Nombre.ToLower() == nuevoAlumno.Nombre.ToLower());

            if (existe) return BadRequest("❌ Ya existe un alumno con ese nombre.");

            // Generar Matrícula Automática (Ej: 2026-001)
            string anioActual = DateTime.Now.Year.ToString();
            var ultimoUsuario = await _context.Usuarios
                .Where(u => u.Matricula.StartsWith(anioActual))
                .OrderByDescending(u => u.Id)
                .FirstOrDefaultAsync();

            int consecutivo = 1;
            if (ultimoUsuario != null && ultimoUsuario.Matricula.Contains("-"))
            {
                string[] partes = ultimoUsuario.Matricula.Split('-');
                if (partes.Length > 1 && int.TryParse(partes[1], out int num))
                {
                    consecutivo = num + 1;
                }
            }

            // Asignar datos al modelo
            nuevoAlumno.Matricula = $"{anioActual}-{consecutivo:D3}";
            nuevoAlumno.Rol = "Alumno";
            nuevoAlumno.PasswordHash = "1234";

            _context.Usuarios.Add(nuevoAlumno);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                mensaje = "✅ Alumno registrado con éxito",
                matricula = nuevoAlumno.Matricula
            });
        }

        // DELETE: api/Usuarios/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUsuario(int id)
        {
            var usuario = await _context.Usuarios.FindAsync(id);
            if (usuario == null)
            {
                return NotFound("El alumno no existe.");
            }

            // Validación extra: No borrar si debe materiales
            var tienePrestamosPendientes = await _context.Reservas
                .AnyAsync(r => r.UsuarioId == id && r.Estatus == "Activo");

            if (tienePrestamosPendientes)
            {
                return BadRequest("No se puede eliminar al alumno porque tiene préstamos activos pendientes.");
            }

            _context.Usuarios.Remove(usuario);
            await _context.SaveChangesAsync();

            return Ok("Alumno eliminado correctamente.");
        }

        // GET: api/Usuarios/personal
        [HttpGet("personal")]
        public async Task<ActionResult<IEnumerable<Usuario>>> GetPersonalAdministrativo()
        {
            // Filtramos solo los que tengan rol Admin o docente
            return await _context.Usuarios
                .Where(u => u.Rol == "Admin")
                .ToListAsync();
        }

        // DELETE: api/Usuarios/eliminar-personal/5
        [HttpDelete("eliminar-personal/{id}")]
        public async Task<IActionResult> EliminarPersonal(int id)
        {
            var admin = await _context.Usuarios.FindAsync(id);
            if (admin == null) return NotFound("El usuario no existe.");

            // Evitar que un admin se borre a sí mismo
            if (admin.Rol != "Admin") return BadRequest("Solo se puede eliminar personal administrativo desde aquí.");

            _context.Usuarios.Remove(admin);
            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "✅ Personal eliminado correctamente." });
        }
    }
}