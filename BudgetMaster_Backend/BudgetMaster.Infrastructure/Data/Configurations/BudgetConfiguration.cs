using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using BudgetMaster.Domain.Entities;

namespace BudgetMaster.Infrastructure.Data.Configurations
{
    public class BudgetConfiguration : IEntityTypeConfiguration<Budget>
    {
        public void Configure(EntityTypeBuilder<Budget> builder)
        {
            builder.ToTable("Budgets");

            builder.HasKey(b => b.Id);

            builder.Property(b => b.UserId)
                .IsRequired();

            builder.Property(b => b.ExpenseTypeId)
                .IsRequired();

            builder.Property(b => b.Month)
                .IsRequired();

            builder.Property(b => b.Year)
                .IsRequired();

            builder.Property(b => b.Amount)
                .IsRequired()
                .HasColumnType("decimal(18,2)");

            builder.Property(b => b.Description)
                .HasMaxLength(500);

            builder.Property(b => b.StartDate)
                .IsRequired();

            builder.Property(b => b.EndDate)
                .IsRequired();

            // Relaciones
            builder.HasOne(b => b.User)
                .WithMany()
                .HasForeignKey(b => b.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(b => b.ExpenseType)
                .WithMany()
                .HasForeignKey(b => b.ExpenseTypeId)
                .OnDelete(DeleteBehavior.Restrict);

            // Índices
            builder.HasIndex(b => new { b.UserId, b.ExpenseTypeId, b.Month, b.Year })
                .IsUnique()
                .HasDatabaseName("IX_Budgets_UserExpenseTypeMonthYear");
        }
    }
}
