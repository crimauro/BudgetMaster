using BudgetMaster.Domain.Interfaces;
using BudgetMaster.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace BudgetMaster.Infrastructure.Repositories
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly ApplicationDbContext _context;
        private IUserRepository? _userRepository;
        private IExpenseTypeRepository? _expenseTypeRepository;
        private IMonetaryFundRepository? _monetaryFundRepository;
        private IBudgetRepository? _budgetRepository;
        private IExpenseRecordRepository? _expenseRecordRepository;
        private IDepositRepository? _depositRepository;
        private IDbContextTransaction? _transaction;

        public UnitOfWork(ApplicationDbContext context)
        {
            _context = context;
        }

        public IUserRepository Users =>
            _userRepository ??= new UserRepository(_context);

        public IExpenseTypeRepository ExpenseTypes =>
            _expenseTypeRepository ??= new ExpenseTypeRepository(_context);

        public IMonetaryFundRepository MonetaryFunds =>
            _monetaryFundRepository ??= new MonetaryFundRepository(_context);

        public IBudgetRepository Budgets =>
            _budgetRepository ??= new BudgetRepository(_context);

        public IExpenseRecordRepository ExpenseRecords =>
            _expenseRecordRepository ??= new ExpenseRecordRepository(_context);

        public IDepositRepository Deposits =>
            _depositRepository ??= new DepositRepository(_context);

        public async Task<int> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync();
        }

        public async Task<int> CompleteAsync()
        {
            try
            {
                return await SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                // Capturar y registrar la excepción detallada
                var innerException = ex.InnerException != null ? ex.InnerException.Message : "No inner exception";
                throw new Exception($"Error al guardar cambios: {ex.Message}. Inner: {innerException}", ex);
            }
        }

        public async Task BeginTransactionAsync()
        {
            _transaction = await _context.Database.BeginTransactionAsync();
        }

        public async Task CommitTransactionAsync()
        {
            if (_transaction != null)
            {
                await _transaction.CommitAsync();
                await _transaction.DisposeAsync();
                _transaction = null;
            }
        }

        public async Task RollbackTransactionAsync()
        {
            if (_transaction != null)
            {
                await _transaction.RollbackAsync();
                await _transaction.DisposeAsync();
                _transaction = null;
            }
        }

        public void Dispose()
        {
            _transaction?.Dispose();
            _context.Dispose();
        }

        public async ValueTask DisposeAsync()
        {
            if (_transaction != null)
            {
                await _transaction.DisposeAsync();
            }
            await _context.DisposeAsync();
        }
    }
}
