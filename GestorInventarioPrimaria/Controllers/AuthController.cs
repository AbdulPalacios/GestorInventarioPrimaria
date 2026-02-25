using GestorInventarioPrimaria.Data;
using GestorInventarioPrimaria.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GestorInventarioPrimaria.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly string _codigoAutorizacion = "PRIMARIA2026"; // El código de la Directora

        public AuthController(AppDbContext context)
        {
            _context = context;
        }

        // POST: api/Auth/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var usuario = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.Username == request.Username && u.Rol == "Admin");

            if (usuario == null || usuario.PasswordHash != request.Password)
            {
                return Unauthorized(new { mensaje = "Usuario o contraseña incorrectos." });
            }

            return Ok(new
            {
                nombre = usuario.Nombre,
                username = usuario.Username,
                rol = usuario.Rol
            });
        }

        // POST: api/Auth/registrar
        [HttpPost("registrar")]
        public async Task<IActionResult> Registrar([FromBody] RegistroRequest request)
        {
            if (request.CodigoMaestro != _codigoAutorizacion)
            {
                return BadRequest(new { mensaje = "Código de autorización de la directora incorrecto." });
            }

            if (await _context.Usuarios.AnyAsync(u => u.Username == request.Username))
            {
                return BadRequest(new { mensaje = "El nombre de usuario ya existe." });
            }

            var nuevoAdmin = new Usuario
            {
                Nombre = request.Nombre,
                Username = request.Username,
                PasswordHash = request.Password, 
                Rol = "Admin",
                Matricula = "DOC-" + Guid.NewGuid().ToString().Substring(0, 4).ToUpper()
            };

            _context.Usuarios.Add(nuevoAdmin);
            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Administrador registrado con éxito." });
        }
    }

    // DTOs para las peticiones
    public class LoginRequest { public required string Username { get; set; } public required string Password { get; set; } }
    public class RegistroRequest
    {
        public required string Nombre { get; set; }
        public required string Username { get; set; }
        public required string Password { get; set; }
        public required string CodigoMaestro { get; set; }
    }
}