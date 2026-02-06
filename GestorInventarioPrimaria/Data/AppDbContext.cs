using Microsoft.EntityFrameworkCore;
using GestorInventarioPrimaria.Models;

namespace GestorInventarioPrimaria.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }
        public DbSet<Usuario> Usuarios { get; set; }
        public DbSet<Libro> Libros { get; set; }
    }
}
