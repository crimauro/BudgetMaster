using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using BudgetMaster.Domain.Entities;

namespace BudgetMaster.Infrastructure.Data.Configurations
{
    public class DepositConfiguration : IEntityTypeConfiguration<Deposit>
    {
        public void Configure(EntityTypeBuilder<Deposit> builder)
        {
            builder.ToTable("Deposits");

            builder.HasKey(d => d.Id);

            builder.Property(d => d.MonetaryFundId)
                .IsRequired();

            builder.Property(d => d.Amount)
                .IsRequired()
                .HasColumnType("decimal(18,2)");

            builder.Property(d => d.Date)
                .IsRequired();

            builder.Property(d => d.Description)
                .HasMaxLength(500);            // Relaciones
            builder.HasOne(d => d.User)
                .WithMany(u => u.Deposits)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(d => d.MonetaryFund)
                .WithMany()
                .HasForeignKey(d => d.MonetaryFundId)
                .OnDelete(DeleteBehavior.Restrict);

            // Índices
            builder.HasIndex(d => d.UserId)
                .HasDatabaseName("IX_Deposits_UserId");

            builder.HasIndex(d => d.Date)
                .HasDatabaseName("IX_Deposits_Date");

            builder.HasIndex(d => d.MonetaryFundId)
                .HasDatabaseName("IX_Deposits_MonetaryFundId");
        }
    }
}
