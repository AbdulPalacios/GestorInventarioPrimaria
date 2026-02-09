using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GestorInventarioPrimaria.Migrations
{
    /// <inheritdoc />
    public partial class AgregandoCamposEnMaterial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EstaDisponible",
                table: "Materiales");

            migrationBuilder.DropColumn(
                name: "EstadoFisico",
                table: "Materiales");

            migrationBuilder.AddColumn<string>(
                name: "Editorial",
                table: "Materiales",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "StockDisponible",
                table: "Materiales",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "StockTotal",
                table: "Materiales",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Editorial",
                table: "Materiales");

            migrationBuilder.DropColumn(
                name: "StockDisponible",
                table: "Materiales");

            migrationBuilder.DropColumn(
                name: "StockTotal",
                table: "Materiales");

            migrationBuilder.AddColumn<bool>(
                name: "EstaDisponible",
                table: "Materiales",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "EstadoFisico",
                table: "Materiales",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");
        }
    }
}
