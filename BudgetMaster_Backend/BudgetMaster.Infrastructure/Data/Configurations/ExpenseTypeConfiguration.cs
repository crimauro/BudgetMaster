using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using BudgetMaster.Domain.Entities;

namespace BudgetMaster.Infrastructure.Data.Configurations
{
    public class ExpenseTypeConfiguration : IEntityTypeConfiguration<ExpenseType>
    {
        public void Configure(EntityTypeBuilder<ExpenseType> builder)
        {
            builder.ToTable("ExpenseTypes");

            builder.HasKey(et => et.Id);

            builder.Property(et => et.Name)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(et => et.Description)
                .HasMaxLength(500);

            // Índice único para el nombre
            builder.HasIndex(et => et.Name)
                .IsUnique()
                .HasDatabaseName("IX_ExpenseTypes_Name");
        }
    }
}
