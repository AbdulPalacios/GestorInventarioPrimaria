using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GestorInventarioPrimaria.Data;
using GestorInventarioPrimaria.Models;

namespace GestorInventarioPrimaria.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        // Inyección de Dependencias (El puente a la BD)
        private readonly AppDbContext _context;

        public AuthController(AppDbContext context)
        {
            _context = context;
        }

        // Endpoint de Login conectado a SQL Server
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] string username)
        {
            var usuarioEncontrado = await _context.Usuarios
                                    .FirstOrDefaultAsync(u => u.Username == username);

            if (usuarioEncontrado == null)
            {
                return Unauthorized(new { mensaje = "Usuario no encontrado en la Base de Datos." });
            }

            return Ok(new
            {
                Id = usuarioEncontrado.Id,
                Nombre = usuarioEncontrado.NombreCompleto,
                Rol = usuarioEncontrado.Rol
            });
        }


        // crear admin
        [HttpPost("crear-admin")]
        public async Task<IActionResult> CrearAdmin()
        {
            if(await _context.Usuarios.AnyAsync(u => u.Username == "admin"))
            {
                return BadRequest("El admin ya existe");
            }

            var nuevoAdmin = new Usuario
            {
                NombreCompleto = "Director General",
                Username = "admin",
                PasswordHash = "12345",
                Rol = "Admin",
                Estatus = true
            };

            _context.Usuarios.Add(nuevoAdmin);
            await _context.SaveChangesAsync();

            return Ok("Usuario creado con exito");
        }
    }
}