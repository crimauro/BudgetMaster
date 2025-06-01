using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using BudgetMaster.Domain.Entities;

namespace BudgetMaster.Infrastructure.Data.Configurations
{
    public class MonetaryFundConfiguration : IEntityTypeConfiguration<MonetaryFund>
    {
        public void Configure(EntityTypeBuilder<MonetaryFund> builder)
        {
            builder.ToTable("MonetaryFunds");

            builder.HasKey(mf => mf.Id);

            builder.Property(mf => mf.Name)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(mf => mf.Description)
                .HasMaxLength(500);

            builder.Property(mf => mf.InitialBalance)
                .IsRequired()
                .HasColumnType("decimal(18,2)");            // Índice único para el nombre
            builder.HasIndex(mf => mf.Name)
                .IsUnique()
                .HasDatabaseName("IX_MonetaryFunds_Name");

            // Configurar relación con User
            builder.HasOne(mf => mf.User)
                .WithMany(u => u.MonetaryFunds)
                .HasForeignKey(mf => mf.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
