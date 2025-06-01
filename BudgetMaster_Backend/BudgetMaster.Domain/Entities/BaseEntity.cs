using System;

namespace BudgetMaster.Domain.Entities
{
    public abstract class BaseEntity
    {
        public int Id { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime? ModifiedDate { get; set; }
        public bool IsActive { get; set; } = true;

        // Propiedades alias para compatibilidad con servicios
        public DateTime CreatedAt
        {
            get => CreatedDate;
            set => CreatedDate = value;
        }

        public DateTime? UpdatedAt
        {
            get => ModifiedDate;
            set => ModifiedDate = value;
        }
    }
}
