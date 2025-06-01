namespace BudgetMaster.Domain.Interfaces
{
    public interface IUnitOfWork : IDisposable
    {
        IUserRepository Users { get; }
        IExpenseTypeRepository ExpenseTypes { get; }
        IMonetaryFundRepository MonetaryFunds { get; }
        IBudgetRepository Budgets { get; }
        IExpenseRecordRepository ExpenseRecords { get; }
        IDepositRepository Deposits { get; }
          Task<int> SaveChangesAsync();
        Task<int> CompleteAsync();
        Task BeginTransactionAsync();
        Task CommitTransactionAsync();
        Task RollbackTransactionAsync();
    }
}
