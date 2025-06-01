using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using BudgetMaster.Domain.Entities;

namespace BudgetMaster.Infrastructure.Data.Configurations
{
    public class ExpenseRecordConfiguration : IEntityTypeConfiguration<ExpenseRecord>
    {
        public void Configure(EntityTypeBuilder<ExpenseRecord> builder)
        {
            builder.ToTable("ExpenseRecords");

            builder.HasKey(er => er.Id);

            builder.Property(er => er.Date)
                .IsRequired();

            builder.Property(er => er.MonetaryFundId)
                .IsRequired();

            builder.Property(er => er.ExpenseTypeId)
                .IsRequired();

            builder.Property(er => er.Amount)
                .IsRequired()
                .HasColumnType("decimal(18,2)");

            builder.Property(er => er.TotalAmount)
                .IsRequired()
                .HasColumnType("decimal(18,2)");

            builder.Property(er => er.Description)
                .HasMaxLength(500);

            builder.Property(er => er.Observations)
                .HasMaxLength(500);

            builder.Property(er => er.StoreName)
                .HasMaxLength(200);

            builder.Property(er => er.DocumentType)
                .IsRequired()
                .HasConversion<int>();            // Relaciones
            builder.HasOne(er => er.User)
                .WithMany(u => u.ExpenseRecords)
                .HasForeignKey(er => er.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(er => er.MonetaryFund)
                .WithMany()
                .HasForeignKey(er => er.MonetaryFundId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(er => er.ExpenseType)
                .WithMany()
                .HasForeignKey(er => er.ExpenseTypeId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(er => er.ExpenseDetails)
                .WithOne(ed => ed.ExpenseRecord)
                .HasForeignKey(ed => ed.ExpenseRecordId)
                .OnDelete(DeleteBehavior.Cascade);            // Índices
            builder.HasIndex(er => er.UserId)
                .HasDatabaseName("IX_ExpenseRecords_UserId");

            builder.HasIndex(er => er.Date)
                .HasDatabaseName("IX_ExpenseRecords_Date");

            builder.HasIndex(er => er.MonetaryFundId)
                .HasDatabaseName("IX_ExpenseRecords_MonetaryFundId");

            builder.HasIndex(er => er.ExpenseTypeId)
                .HasDatabaseName("IX_ExpenseRecords_ExpenseTypeId");
        }
    }
}
