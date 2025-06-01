using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using BudgetMaster.Domain.Entities;

namespace BudgetMaster.Infrastructure.Data.Configurations
{
    public class ExpenseDetailConfiguration : IEntityTypeConfiguration<ExpenseDetail>
    {
        public void Configure(EntityTypeBuilder<ExpenseDetail> builder)
        {
            builder.ToTable("ExpenseDetails");

            builder.HasKey(ed => ed.Id);

            builder.Property(ed => ed.ExpenseRecordId)
                .IsRequired();

            builder.Property(ed => ed.ExpenseTypeId)
                .IsRequired();

            builder.Property(ed => ed.ItemName)
                .IsRequired()
                .HasMaxLength(200);

            builder.Property(ed => ed.Quantity)
                .IsRequired()
                .HasColumnType("decimal(18,2)");

            builder.Property(ed => ed.UnitPrice)
                .IsRequired()
                .HasColumnType("decimal(18,2)");

            builder.Property(ed => ed.Amount)
                .IsRequired()
                .HasColumnType("decimal(18,2)");

            builder.Property(ed => ed.Description)
                .HasMaxLength(200);

            // Relaciones
            builder.HasOne(ed => ed.ExpenseRecord)
                .WithMany(er => er.ExpenseDetails)
                .HasForeignKey(ed => ed.ExpenseRecordId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(ed => ed.ExpenseType)
                .WithMany()
                .HasForeignKey(ed => ed.ExpenseTypeId)
                .OnDelete(DeleteBehavior.Restrict);

            // Índices
            builder.HasIndex(ed => ed.ExpenseRecordId)
                .HasDatabaseName("IX_ExpenseDetails_ExpenseRecordId");

            builder.HasIndex(ed => ed.ExpenseTypeId)
                .HasDatabaseName("IX_ExpenseDetails_ExpenseTypeId");
        }
    }
}
